import { action } from 'mobx';
import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
const ROOT_ID = 'bb-reply-extension-root';

const App = () => {
  console.log('hello world', document, document.cookie);

  useEffect(() => {
    chrome.runtime.sendMessage({
      source: 'content',
      action: 'ready',
      cookie: document.cookie,
    });

    console.log('[dodo] ', 'chrome.runtime', chrome);

    const listener = (data) => {
      const { source, action, url, obj } = data || {};
      console.log('[dodo] ', 'data', data);

      if (source === 'background') {
        if (action === 'bbReply') {
          console.log('[dodo] ', 'url, obj', url, obj);
          fetch('http://localhost:7020/api/proxy', {
            body: obj.body,
            // headers: { ...obj.headers },
            credentials: 'include', // 确保请求中包含 Cookie
            method: obj.method,
          })
            .then((res) => res.json())
            .then((res) => {
              console.log('[dodo] ', 'bbReply res', res);
            });
        }
      }
      return false;
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return <div />;
};

let bbReplyRoot = document.getElementById(ROOT_ID);

if (!bbReplyRoot) {
  bbReplyRoot = document.createElement('div');
  bbReplyRoot.id = ROOT_ID;
  document.body.append(bbReplyRoot);
}

const root = createRoot(bbReplyRoot);
root.render(
  // @ts-ignore
  <StrictMode>
    <App />
  </StrictMode>
);
