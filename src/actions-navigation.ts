import {
  getCursorPosition,
  getNextOccurrenceIndex,
  getPreviousOccurrenceIndex,
  getSelectionStartIndex,
} from "./helpers-get-text";

import { setCursorPosition, setSelectionRange } from "./helpers-set-text";

export const moveCursorLeft = (): void => {
  const selectionStartIndex = getSelectionStartIndex();
  // if cursor is not at the beginning of the line, else do nothing
  if (selectionStartIndex > 0) {
    setSelectionRange(selectionStartIndex - 1, 0);
  }
};

export const moveCursorRight = (): void => {
  const selectionStartIndex = getSelectionStartIndex();
  // cursor can always be shifted to the right, do not need an if statement
  setSelectionRange(selectionStartIndex + 1, 0);
};

export const jumpToPreviousHeader = (): void => {
  const cursorPosition = getCursorPosition();
  const previousHeaderPosition =
    getPreviousOccurrenceIndex("\n#", cursorPosition) + 1;

  // if header is at the beginning of the draft, set cursor to draft start and do not add 1
  if (previousHeaderPosition === 1) {
    setCursorPosition(0);
  } else {
    setCursorPosition(previousHeaderPosition);
  }
};

export const jumpToNextHeader = (): void => {
  const cursorPosition = getCursorPosition();
  const nextHeaderPosition = getNextOccurrenceIndex("\n#", cursorPosition) + 1;
  setCursorPosition(nextHeaderPosition);
};
