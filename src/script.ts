import { BB_REPLY_EXT_ACTION, BB_REPLY_EXT_NAME } from "./utils/constant";
import { bbReplyVersion } from "./utils";
import { shotDom } from "./utils/dom";

class Helper {
  tabId: number;
  constructor (tabId?: number) {
    bbReplyVersion();
    this.tabId = tabId || 0;
  }

  clearEvent = () => { };

  init = async () => {
    this.clearEvent();
    this.initUtils();
  };

  initUtils () {
    const messageHandler = async (event: MessageEvent<any>) => {
      if (event?.data?.source !== BB_REPLY_EXT_NAME) return;

      const { action } = event.data || {};

      this.utilsActionMap[action]?.();
    };

    this.clearEvent = () => {
      window.removeEventListener('message', messageHandler);
      window.removeEventListener('beforeunload', this.clearEvent);
    };

    window.addEventListener('message', messageHandler);
    window.addEventListener('beforeunload', this.clearEvent);
  }

  get utilsActionMap () {
    return {
      /** 给 DOM 截图，保留透明色 */
      [BB_REPLY_EXT_ACTION.bbReply]: shotDom,
    };
  }
}

const BB_REPLY_HELPER_KEY = 'bb_reply_ext_helper';
if (window[BB_REPLY_HELPER_KEY]) {
  window[BB_REPLY_HELPER_KEY].init();
} else {
  const helper = new Helper(...(window[BB_REPLY_EXT_NAME]?.args || []));
  window[BB_REPLY_HELPER_KEY] = helper;
  helper.init();
}
