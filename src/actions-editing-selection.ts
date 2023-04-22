import {
  getCursorPosition,
  getDraftLength,
  getNextOccurrenceIndex,
  getPreviousOccurrenceIndex,
} from "./helpers-get-text";

import { setSelectionRange, trimSelectedText } from "./helpers-set-text";
import { copySelectedTextToClipboard } from "./helpers-utils";

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

  // do not include the section separator in the selection
  const sectionStart =
    previousSeparatorPosition === 0
      ? previousSeparatorPosition
      : previousSeparatorPosition + sectionSeparator.length;

  // index of next separator is at the *beginning* of the separator => section ends here
  const sectionEnd = nextSeparatorPosition;

  // remove all whitespace at the beginning and end of the selection
  const [trimmedSectionStart, trimmedSectionEnd] = trimSelectedText(
    sectionStart,
    sectionEnd
  );

  setSelectionRange(
    trimmedSectionStart,
    trimmedSectionEnd - trimmedSectionStart
  );
};

export const selectLine = (): void => {
  selectSection("\n");
};

export const selectParagraph = (): void => {
  selectSection("\n\n");
};

// select partial response to message in draft, individual responses are separated by "---"
// copy selected text directly to clipboard to paste message into another app
export const selectResponse = (): void => {
  selectSection("---");
  copySelectedTextToClipboard();
};

export const selectAll = (): void => {
  const endOfDraft = getDraftLength();
  // length in second argument equals entire draft in this case since start has index 0
  setSelectionRange(0, endOfDraft);
};
