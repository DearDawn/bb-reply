import 'chrome-types'
import { RootStore } from '../mobile-bg-dawn/src/biz/placeOrderForFree/store';
import { PopupStore } from '../mobile-bg-dawn/src/biz/placeOrderForFree/store/popup';
import BasePopupStore from '../mobile-bg-dawn/src/biz/common/widgets/popup/store';

declare module '*.module.css' {
  const css: any;
  export default css;
}

declare module '*.module.less' {
  const less: any;
  export default less;
}

type TPopupStore = PopupStore & BasePopupStore

export type { RootStore, TPopupStore }