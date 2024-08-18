import { toPng } from 'html-to-image';
import { BB_REPLY_EXT_ACTION, BB_REPLY_EXT_BG_NAME } from './constant';
import { bbReplyError, bbReplyLog } from '.';

/** 给 DOM 截图，保留透明色 */
export const shotDom = async () => {
  bbReplyLog('开始生成截图');
  const element = window['BB_REPLY_EXT_DOM'] || null;

  if (!element) {
    bbReplyError('未找到 DOM');
    return;
  }

  bbReplyLog('图像处理中...');
  await replaceImagesInDOM(element);
  bbReplyLog('开始截图...');

  toPng(element, { backgroundColor: 'transparent' }).then(imgData => {
    bbReplyLog('截图完成！🎉');
    window.postMessage({
      source: BB_REPLY_EXT_BG_NAME,
      action: BB_REPLY_EXT_ACTION.bbReply,
      payload: imgData
    }, '*');
  }).catch(console.error);
};

async function replaceImagesInDOM (domElement: HTMLDivElement) {
  // 获取所有 img 标签和包含背景图片的元素
  let imgElements = Array.from(domElement.querySelectorAll('img')).filter(element => !element.hasAttribute('data-bb-reply-replaced'));
  let bgElements = Array.from(domElement.querySelectorAll('*')).filter(element => {
    let backgroundImage = window.getComputedStyle(element).backgroundImage;
    return backgroundImage && backgroundImage !== "none" && backgroundImage.startsWith('url') && !element.hasAttribute('data-bb-reply-replaced');
  });

  // 合并并去重
  let elements = [...imgElements, ...bgElements];

  // 异步处理所有图像
  await Promise.all(elements.map(element => {
    if (element.tagName.toLowerCase() === "img") {
      return replaceImage(element, (element as HTMLImageElement)?.src);
    } else {
      let backgroundImage = window.getComputedStyle(element).backgroundImage;
      let url = backgroundImage.match(/url\("?(.+?)"?\)/)[1];
      return replaceImage(element, url);
    }
  }));
}

function replaceImage (element: any, url) {
  return new Promise((resolve, reject) => {
    let imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(imgElement, 0, 0);
      let dataURL = canvas.toDataURL("image/png");
      if (element.tagName.toLowerCase() === "img") {
        element.src = dataURL; // 替换 img 标签的 src 属性
      } else {
        element.style.backgroundImage = `url(${dataURL})`; // 替换背景图片
      }
      element.setAttribute('data-bb-reply-replaced', 'true'); // 添加标记
      resolve(true);
    };
    imgElement.onerror = reject;
    imgElement.src = url;
  });
}
