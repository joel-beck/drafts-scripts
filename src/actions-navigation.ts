import {
  getCursorPosition,
  getNextOccurrenceIndex,
  getPreviousOccurrenceIndex,
  getSelectionStartIndex,
} from "./helpers-get-text";

import { setCursorPosition, setSelectionRange } from "./helpers-set-text";

/**
 * Moves the cursor one character to the left, if it is not at the beginning of the document.
 */
export const moveCursorLeft = (): void => {
  const selectionStartIndex = getSelectionStartIndex();
  if (selectionStartIndex > 0) {
    setSelectionRange(selectionStartIndex - 1, 0);
  }
};

/**
 * Moves the cursor one character to the right.
 */
export const moveCursorRight = (): void => {
  const selectionStartIndex = getSelectionStartIndex();
  setSelectionRange(selectionStartIndex + 1, 0);
};

/**
 * Jumps the cursor to the previous Markdown header in the text.
 */
export const jumpToPreviousHeader = (): void => {
  const cursorPosition = getCursorPosition();
  const previousHeaderPosition =
    getPreviousOccurrenceIndex("\n#", cursorPosition) + 1;

  if (previousHeaderPosition === 1) {
    setCursorPosition(0);
  } else {
    setCursorPosition(previousHeaderPosition);
  }
};

/**
 * Jumps the cursor to the next Markdown header in the text.
 */
export const jumpToNextHeader = (): void => {
  const cursorPosition = getCursorPosition();
  const nextHeaderPosition = getNextOccurrenceIndex("\n#", cursorPosition) + 1;
  setCursorPosition(nextHeaderPosition);
};
