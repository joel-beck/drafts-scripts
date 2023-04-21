import { getSelectedText } from "./helpers-get-text";

export const getClipboard = (): string => {
  // @ts-ignore
  return app.getClipboard();
};

export const copyToClipboard = (text: string): void => {
  // @ts-ignore
  app.setClipboard(text);
};

export const copySelectedTextToClipboard = (): void => {
  const selectedText = getSelectedText();
  copyToClipboard(selectedText);
};

export const isUrl = (s: string): boolean => {
  const urlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return urlRegex.test(s);
};

export const getUrlFromClipboard = (): string => {
  const clipboard = getClipboard();
  return isUrl(clipboard) ? clipboard : "";
};
