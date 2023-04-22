import {
  getCurrentLineEndIndex,
  getCurrentLineStartIndex,
  getTextFromStartEnd,
} from "./helpers-get-text";

import { setCursorPosition, setTextFromStartEnd } from "./helpers-set-text";

/**
Shift+Enter within a list should jump to the next line
- without adding a new list marker
- keeping the indentation of the current line
*/
export const linebreakWithinList = (): void => {
  // this is the absolute index within the draft
  const currentLineStartIndex = getCurrentLineStartIndex();
  const currentLineEndIndex = getCurrentLineEndIndex();
  const currentLineText = getTextFromStartEnd(
    currentLineStartIndex,
    currentLineEndIndex
  );

  const hasListMarker = currentLineText.match("^\\s*[-]");
  // 2 for the list marker itself and the following whitespace
  const extraListMarkerLength = hasListMarker ? 2 : 0;
  const extraListMarkerWhitespace = " ".repeat(extraListMarkerLength);

  // only whitespace at the beginning of the line
  // if line does not start with whitespace, set to empty string
  const currentLineWhitespace = currentLineText.match("^\\s*")?.[0] ?? "";

  // add whitespace characters until reaching the indentation length within the next line
  const whitespaceIndentation =
    "\n" + currentLineWhitespace + extraListMarkerWhitespace;

  const newCursorPosition = currentLineEndIndex + whitespaceIndentation.length;

  setTextFromStartEnd(
    whitespaceIndentation,
    currentLineEndIndex,
    newCursorPosition
  );
  setCursorPosition(newCursorPosition);
};
