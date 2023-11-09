import { getSelectedRange, getSelectionStartIndex } from "./helpers-get-text";

import {
  insertTextAndSetCursor,
  setCursorPosition,
  setTextinRange,
} from "./helpers-set-text";

import { getClipboard } from "./helpers-utils";

/**
 * Inserts the text obtained from the dictation feature at the current selection or cursor position.
 */
export const insertDictation = (): void => {
  const [selectionStartIndex, selectionLength] = getSelectedRange();

  // dictate
  // @ts-ignore
  const dictatedText = editor.dictate();
  if (dictatedText) {
    setTextinRange(dictatedText, selectionStartIndex, selectionLength);
    setCursorPosition(selectionStartIndex + dictatedText.length);
    // @ts-ignore
    editor.activate();
  }
};

/**
 * Pastes the text from the clipboard at the current selection or cursor position.
 */
export const pasteClipboard = (): void => {
  const clipboard = getClipboard();
  const selectionStartIndex = getSelectionStartIndex();

  insertTextAndSetCursor(clipboard, selectionStartIndex);
};
