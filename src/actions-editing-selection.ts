import {
  getCursorPosition,
  getDraftLength,
  getNextOccurrenceIndex,
  getPreviousOccurrenceIndex,
} from "./helpers-get-text";

import { setSelectionRange, trimSelectedText } from "./helpers-set-text";
import { copySelectedTextToClipboard } from "./helpers-utils";

/**
 * Selects a section of text in the draft based on the provided separator.
 *
 * @param {string} sectionSeparator - The character(s) used to determine the section boundaries.
 */
const selectSection = (sectionSeparator: string): void => {
  const cursorPosition = getCursorPosition();

  const previousSeparatorPosition = getPreviousOccurrenceIndex(
    sectionSeparator,
    cursorPosition
  );
  const nextSeparatorPosition = getNextOccurrenceIndex(
    sectionSeparator,
    cursorPosition
  );

  const sectionStart =
    previousSeparatorPosition === 0
      ? previousSeparatorPosition
      : previousSeparatorPosition + sectionSeparator.length;

  const sectionEnd = nextSeparatorPosition;

  const [trimmedSectionStart, trimmedSectionEnd] = trimSelectedText(
    sectionStart,
    sectionEnd
  );

  setSelectionRange(
    trimmedSectionStart,
    trimmedSectionEnd - trimmedSectionStart
  );
};

/**
 * Selects the current line where the cursor is located.
 */
export const selectLine = (): void => {
  selectSection("\n");
};

/**
 * Selects the current paragraph where the cursor is located.
 */
export const selectParagraph = (): void => {
  selectSection("\n\n");
};

/**
 * Selects the text of a response in a conversation or message thread, typically separated by "---",
 * and copies it to the clipboard.
 */
export const selectResponse = (): void => {
  selectSection("---");
  copySelectedTextToClipboard();
};

/**
 * Selects all text in the draft.
 */
export const selectAll = (): void => {
  const endOfDraft = getDraftLength();
  setSelectionRange(0, endOfDraft);
};
