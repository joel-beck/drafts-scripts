import {
  getCurrentLineEndIndex,
  getCurrentLineStartIndex,
  getTextFromStartEnd,
} from "./helpers-get-text";

import { setCursorPosition, setTextFromStartEnd } from "./helpers-set-text";

/**
 * Inserts a line break within a list item, maintaining the current indentation and list marker.
 * Designed to be used as an action when Shift+Enter is pressed inside a list item in the Drafts app.
 */
export const linebreakWithinList = (): void => {
  // this is the absolute index within the draft
  const currentLineStartIndex = getCurrentLineStartIndex();
  const currentLineEndIndex = getCurrentLineEndIndex();
  const currentLineText = getTextFromStartEnd(
    currentLineStartIndex,
    currentLineEndIndex
  );

  // Check if the current line starts with a list marker (e.g., '-', '*', etc.)
  const hasListMarker = currentLineText.match("^\\s*[-]");
  // Length to account for the list marker and the whitespace after it
  const extraListMarkerLength = hasListMarker ? 2 : 0;
  const extraListMarkerWhitespace = " ".repeat(extraListMarkerLength);

  // Capture only the whitespace at the beginning of the line
  // If the line does not start with whitespace, set to an empty string
  const currentLineWhitespace = currentLineText.match("^\\s*")?.[0] ?? "";

  // Combine the whitespace and extra indentation to form the full indentation for the new line
  const whitespaceIndentation =
    "\n" + currentLineWhitespace + extraListMarkerWhitespace;

  // Calculate the position for the cursor after the new indentation is inserted
  const newCursorPosition = currentLineEndIndex + whitespaceIndentation.length;

  // Insert the indentation at the end of the current line and update the cursor position
  setTextFromStartEnd(
    whitespaceIndentation,
    currentLineEndIndex,
    newCursorPosition
  );
  setCursorPosition(newCursorPosition);
};
