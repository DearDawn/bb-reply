import { BB_REPLY_EXT_ACTION, BB_REPLY_EXT_NAME } from "./constant";
import { version, buildTime } from '../../package.json';

export const isDev = () => {
  return process.env.NODE_ENV === 'development';
};

export const waitTime = async (timeout = 0) => {
  return new Promise(resolve => setTimeout(() => resolve(true), timeout));
};

export const bbReplyLog = (message?: any, ...optionalParams: any[]) => {
  console.log('[🔸BB_REPLY🔸]', message, ...optionalParams);
};

export const bbReplyError = (message?: any, ...optionalParams: any[]) => {
  console.error('[🔸BB_REPLY🔸]', message, ...optionalParams);
};

export const bbReplyVersion = () => {
  console.log(`[🔸BB_REPLY🔸] 插件版本%c v${version} at ${buildTime}`, 'color: orange;');
};
