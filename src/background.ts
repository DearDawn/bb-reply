let timer = null;
let tabID = null;

class Robot {
  messageApi = 'https://api.bilibili.com/x/msgfeed/reply';
  cookie = '';
  cookieMap = {};
  messageList = [];
  count = 0;
  cursor: { is_end?: boolean; id?: number, time?: number; } = {
    is_end: false,
    id: undefined,
    time: undefined,
  };
  constructor () {
  }

  async init () {
    const cookieList = await chrome.cookies.getAll({});
    console.log('[dodo] ', 'cookieList', cookieList);
    this.cookieMap = cookieList.reduce((acc, cur) => {
      acc[cur.name] = cur.value;
      return acc;
    }, {});
    let cookieString = cookieList.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    this.cookie = cookieString;
    this.getMessageList();
  }

  getMessageUrl () {
    const params = new URLSearchParams({
      platform: 'web',
      build: '0',
      mobi_app: 'web',
    });

    if (this.cursor.id && this.cursor.time) {
      params.append('cursor', this.cursor.id.toString());
      params.append('time', this.cursor.time.toString());
    }

    console.log('[dodo] ', '`${this.messageApi}?${params.toString()}`', `${this.messageApi}?${params.toString()}`);
    return `${this.messageApi}?${params.toString()}`;
  }

  async getMessageList () {

    const res = await fetch(this.getMessageUrl(), {
      headers: { 'Cookie': this.cookie }
    });
    const data = await res.json();
    console.log('[dodo] ', 'data', data);
    if (data.code === 0) {
      this.messageList = data.data.items;
      this.cursor = data.data.cursor;
    }
  }

  async sendReply () {
    const latestItem = this.messageList[0];
    console.log('[dodo] ', 'latestItem', latestItem);
    const { item, user } = latestItem || {};
    const { nickname } = user || {};
    const { subject_id, root_id, source_id } = item || {};
    const csrfToken = this.cookieMap['bili_jct'];

    // fetch('http://localhost:7020/api/proxy', {
    fetch('https://www.dododawn.com:7020/api/proxy', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        url: 'https://api.bilibili.com/x/v2/reply/add',
        init: {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json, text/plain, */*',
            'Cookie': this.cookie,
            'Origin': 'https://message.bilibili.com',
            'Referer': 'https://message.bilibili.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
          },
          body: new URLSearchParams({
            oid: subject_id,
            type: '1',
            message: `回复 @${nickname} :回复一下看看, ${Date.now().toLocaleString()}`,
            root: root_id,
            parent: source_id,
            jsonp: 'jsonp',
            scene: 'msg',
            plat: '1',
            from: 'im-reply',
            build: '0',
            mobi_app: 'web',
            csrf: csrfToken,
            csrf_token: csrfToken
          }).toString()
        }
      })
    }).then(res => res.json())
      .then(res => {
        console.log('[dodo] ', 'reply res', res);
        chrome.runtime.sendMessage({ source: 'background', action: 'replyDone', res: { code: 0 } });
      });

    // if (this.count < 2) {
    //   this.count += 1;
    //   setTimeout(() => {
    //     this.sendReply();
    //   }, Math.random() * 3000 + 2000);
    // }
    // chrome.tabs.sendMessage(tabID, {
    //   source: 'background', action: 'bbReply', url: 'https://api.bilibili.com/x/v2/reply/add', obj: {
    //     method: 'POST',
    //     headers: {
    //       'content-type': 'application/x-www-form-urlencoded',
    //       'Accept': 'application/json, text/plain, */*',
    //       'Cookie': this.cookie,
    //       'Origin': 'https://message.bilibili.com',
    //       'Referer': 'https://message.bilibili.com/',
    //     },
    //     body: new URLSearchParams({
    //       oid: subject_id,
    //       type: '1',
    //       message: `回复 @${nickname} :回复一下看看, ${Date.now().toLocaleString()}`,
    //       root: root_id,
    //       parent: source_id,
    //       jsonp: 'jsonp',
    //       scene: 'msg',
    //       plat: '1',
    //       from: 'im-reply',
    //       build: '0',
    //       mobi_app: 'web',
    //       csrf: csrfToken,
    //       csrf_token: csrfToken
    //     }).toString()
    //   }
    // });
  }
}

const robot = new Robot();

const injectedHelper = (tabId: number) => {
  // 注入 tabId 参数
  chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: (...args) => {
      const BB_REPLY_EXT_NAME = 'bb_reply_chrome_extension';
      window[BB_REPLY_EXT_NAME] = window[BB_REPLY_EXT_NAME] || {};
      window[BB_REPLY_EXT_NAME].args = args || [];
    },
    args: [tabId]
  }).then(() => {
    // 执行脚本
    chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      files: ['./script.js']
    });
  });
};

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.url) {
//     clearTimeout(timer);

//     timer = setTimeout(() => {
//       injectedHelper(tabId);
//     }, 100);
//   }
// });

chrome.tabs.onActivated.addListener(function (activeInfo) {
  tabID = activeInfo.tabId;
  console.log('Activated Tab ID:', tabID);
});

chrome.runtime.onMessage.addListener((request: { source: string, action: string; }) => {
  const { source, action } = request || {};
  console.log('[dodo] ', 'content ready', source, action);

  if (source === 'content') {
    if (action === 'ready') {
      robot.init();
    }
  } else if (source === 'popup') {
    if (action === 'ready') {
      console.log('[dodo] ', 'popup ready');
      chrome.runtime.sendMessage({ source: 'background', action: 'ready', cookie: robot.cookie });
    } else if (action === 'bbReply') {
      robot.sendReply();
    }
  }

  return false;
});
