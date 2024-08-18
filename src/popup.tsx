import React, { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const ROOT_ID = 'ltv-extension-popup';
let ltvRoot = document.getElementById(ROOT_ID);

if (!ltvRoot) {
  ltvRoot = document.createElement('div');
  ltvRoot.id = ROOT_ID;
  document.body.append(ltvRoot);
}

const App: React.FC = (): JSX.Element => {
  console.log('[dodo] ', 'popup mount');
  const [success, setSuccess] = useState(false);

  const handleReply = useCallback(() => {
    setSuccess(false);
    chrome.runtime.sendMessage({ source: 'popup', action: 'bbReply' });
  }, []);

  useEffect(() => {
    const listener = (data) => {
      console.log('[dodo] ', 'popup get data', data);
      const { source, action } = data || {};

      if (source === 'background') {
        if (action === 'replyDone') {
          setSuccess(true);
        }
      }

      return false;
    };

    chrome.runtime.sendMessage({ source: 'popup', action: 'ready' });

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div style={{ width: '200px' }}>
      <button onClick={handleReply}>自动回复</button>
      {success && '回复成功'}
    </div>
  );
};

const root = createRoot(ltvRoot);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
