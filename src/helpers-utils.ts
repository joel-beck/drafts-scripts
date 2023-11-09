import { getSelectedText } from "./helpers-get-text";

/**
 * Retrieves the current content of the system clipboard.
 * @returns {string} The text content of the clipboard.
 */
export const getClipboard = (): string => {
  // @ts-ignore
  return app.getClipboard();
};

/**
 * Copies the given text to the system clipboard.
 * @param {string} text - The text to be copied to the clipboard.
 */
export const copyToClipboard = (text: string): void => {
  // @ts-ignore
  app.setClipboard(text);
};

/**
 * Copies the currently selected text to the system clipboard.
 */
export const copySelectedTextToClipboard = (): void => {
  const selectedText = getSelectedText();
  copyToClipboard(selectedText);
};

/**
 * Determines whether the provided string is a valid URL.
 * @param {string} s - The string to be tested against the URL pattern.
 * @returns {boolean} True if the string is a valid URL, otherwise false.
 */
export const isUrl = (s: string): boolean => {
  const urlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return urlRegex.test(s);
};

/**
 * Retrieves a URL from the system clipboard if it contains a valid URL.
 * @returns {string} The URL from the clipboard or an empty string if no valid URL is found.
 */
export const getUrlFromClipboard = (): string => {
  const clipboard = getClipboard();
  return isUrl(clipboard) ? clipboard : "";
};
