import {
  getCurrentLineEndIndex,
  getCurrentLineStartIndex,
  getTextFromStartEnd,
} from "./helpers-get-text";

import { insertTextAndSetCursor } from "./helpers-set-text";

const getIndentation = (lineText: string): string => {
  const indentationRegex = /^(\s*)/;
  const indentationMatch = lineText.match(indentationRegex);

  if (!indentationMatch) {
    return "";
  }

  return indentationMatch[1];
};

const checkIfLineIsListItem = (lineText: string): boolean => {
  const listItemRegex = /^(\s*)([-*+]|\d+\.)\s/;
  const listItemMatch = lineText.match(listItemRegex);

  if (!listItemMatch) {
    return false;
  }

  return true;
};

/**
 * Inserts a line break within a list item or indented line, maintaining the current indentation
 * or increasing it by two spaces if the line is a list item.
 * Designed to be used as an action when Shift+Enter is pressed inside a list item in the Drafts app.
 */
export const linebreakKeepIndentation = (): void => {
  const currentLineStartIndex = getCurrentLineStartIndex();
  const currentLineEndIndex = getCurrentLineEndIndex();
  const currentLineText = getTextFromStartEnd(
    currentLineStartIndex,
    currentLineEndIndex
  );

  let indentation = getIndentation(currentLineText);

  const isListItem = checkIfLineIsListItem(currentLineText);
  if (isListItem) {
    indentation += "  "; // Add two spaces for the list marker
  }

  // Insert the new line with the correct indentation level
  const newLineText = `\n${indentation}`;
  insertTextAndSetCursor(newLineText, currentLineEndIndex);
};
