/**
 * Retrieves the entire content of the current draft.
 * @returns {string} The content of the draft.
 */
export const getDraftContent = (): string => {
  // @ts-ignore
  return draft.content;
};

/**
 * Gets the length of the current draft's content.
 * @returns {number} The length of the draft content.
 */
export const getDraftLength = (): number => {
  // @ts-ignore
  return draft.content.length;
};

/**
 * Obtains the currently selected text in the editor.
 * @returns {string} The selected text.
 */
export const getSelectedText = (): string => {
  // @ts-ignore
  return editor.getSelectedText();
};

/**
 * Fetches the start and end indices of the current selection.
 * @returns {[number, number]} A tuple containing the start index and the length of the selection.
 */
export const getSelectedRange = (): [number, number] => {
  // @ts-ignore
  return editor.getSelectedRange();
};

/**
 * Retrieves the start index of the current text selection.
 * @returns {number} The index where the selection starts.
 */
export const getSelectionStartIndex = (): number => {
  return getSelectedRange()[0];
};

/**
 * Gets the current position of the cursor in the editor.
 * @returns {number} The index of the cursor's position.
 */
export const getCursorPosition = (): number => {
  // cursor position coincides with selection start index if there is no selection
  return getSelectionStartIndex();
};

/**
 * Determines the length of the current text selection.
 * @returns {number} The length of the selection.
 */
export const getSelectionLength = (): number => {
  return getSelectedRange()[1];
};

/**
 * Checks if the provided text is the last line in the draft content.
 * @param {string} text - The text to check.
 * @returns {boolean} True if the text is the last line, otherwise false.
 */
export const isLastLine = (text: string): boolean => {
  // only last line in draft does not end with newline
  return !text.endsWith("\n");
};

/**
 * Checks if the specified index is at the end of the draft content.
 * @param {positionIndex} number - The index to check.
 * @returns {boolean} True if the index is at the end of the draft, otherwise false.
 */
export const isEndOfDraft = (positionIndex: number): boolean => {
  return positionIndex === getDraftLength();
};

/**
 * Calculates the end index of the current selection. If the selection parameters are not provided,
 * they are fetched using the getSelectedRange function.
 * @param {number} [selectionStartIndex] - The index where the selection starts.
 * @param {number} [selectionLength] - The length of the selection.
 * @returns {number} The calculated end index of the selection.
 */
export const getSelectionEndIndex = (
  selectionStartIndex?: number,
  selectionLength?: number
): number => {
  // check which inputs are provided
  if (selectionStartIndex === undefined || selectionLength === undefined) {
    [selectionStartIndex, selectionLength] = getSelectedRange();
  }
  const selectionEndIndex = selectionStartIndex + selectionLength;

  // case 1: selection spans until end of draft -> set cursor to end of draft
  if (isEndOfDraft(selectionEndIndex)) {
    return selectionEndIndex;
  }

  // case 2: selection is only followed by empty lines -> set cursor to end of last
  // nonempty line
  const textAfterSelection = getTextAfter(selectionEndIndex);

  // check if text after selection consists of whitespace only
  if (textAfterSelection.trim() === "") {
    const selectedText = getTextfromRange(selectionStartIndex, selectionLength);
    const trimmedSelectedText = selectedText.trim();
    return selectionStartIndex + trimmedSelectedText.length;
  }

  // case 3: selection is followed by nonempty lines -> set cursor to original selection
  // end
  return selectionEndIndex;
};
/**
 * Retrieves the range of the current line, taking into consideration whether it's the last line.
 * @returns {[number, number]} A tuple with the start index and length of the current line.
 */
export const getCurrentLineRange = (): [number, number] => {
  const [currentLineStartIndex, currentLineLength] =
    // @ts-ignore
    editor.getSelectedLineRange();

  const currentLineText = getTextfromRange(
    currentLineStartIndex,
    currentLineLength
  );

  // Adjust the line length if it's not the last line (to exclude the newline character)
  if (isLastLine(currentLineText)) {
    return [currentLineStartIndex, currentLineLength];
  }
  return [currentLineStartIndex, currentLineLength - 1];
};

/**
 * Gets the start index of the current line.
 * @returns {number} The start index of the current line.
 */
export const getCurrentLineStartIndex = (): number => {
  return getCurrentLineRange()[0];
};

/**
 * Gets the length of the current line.
 * @returns {number} The length of the current line.
 */
export const getCurrentLineLength = (): number => {
  return getCurrentLineRange()[1];
};

/**
 * Gets the end index of the current line.
 * @returns {number} The end index of the current line.
 */
export const getCurrentLineEndIndex = (): number => {
  return getCurrentLineStartIndex() + getCurrentLineLength();
};

/**
 * Retrieves the range of the current selection or the current line if there's no selection.
 * @returns {[number, number]} A tuple with the start index and length of the selection or current line.
 */
export const getSelectionOrCurrentLineRange = (): [number, number] => {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return getCurrentLineRange();
  } else {
    return getSelectedRange();
  }
};

/**
 * Gets the start index of the current selection or the current line if there's no selection.
 * @returns {number} The start index of the current selection or current line.
 */
export const getSelectionOrCurrentLineStartIndex = (): number => {
  return getSelectionOrCurrentLineRange()[0];
};

/**
 * Gets the length of the current selection or the current line if there's no selection.
 * @returns {number} The length of the current selection or current line.
 */
export const getSelectionOrCurrentLineLength = (): number => {
  return getSelectionOrCurrentLineRange()[1];
};

/**
 * Gets the end index of the current selection or the current line if there's no selection.
 * @returns {number} The end index of the current selection or current line.
 */
export const getSelectionOrCurrentLineEndIndex = (): number => {
  const selectionStartIndex = getSelectionOrCurrentLineStartIndex();
  const selectionLength = getSelectionOrCurrentLineLength();
  return getSelectionEndIndex(selectionStartIndex, selectionLength);
};

/**
 * Retrieves the text from the given range.
 * @param {number} startIndex - The start index of the range.
 * @param {number} length - The length of the range.
 * @returns {string} The text within the specified range.
 */
export const getTextfromRange = (
  startIndex: number,
  length: number
): string => {
  // @ts-ignore
  return editor.getTextInRange(startIndex, length);
};

/**
 * Retrieves the text between specified start and end indices.
 * @param {number} startIndex - The start index of the range.
 * @param {number} endIndex - The end index of the range.
 * @returns {string} The text within the start and end indices.
 */
export const getTextFromStartEnd = (
  startIndex: number,
  endIndex: number
): string => {
  return getTextfromRange(startIndex, endIndex - startIndex);
};

/**
 * Retrieves the text of the current line.
 * @returns {string} The text of the current line.
 */
export const getCurrentLineText = (): string => {
  return getTextfromRange(...getCurrentLineRange());
};

/**
 * Retrieves the selected text, or if there's no selection, the text of the current line.
 * @returns {string} The selected text or the text of the current line.
 */
export const getSelectedTextOrCurrentLine = (): string => {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return getCurrentLineText();
  } else {
    return selectedText;
  }
};

/**
 * Retrieves the text before a specified index.
 * @param {number} positionIndex - The index to get the text before.
 * @returns {string} The text before the specified index.
 */
export const getTextBefore = (positionIndex: number): string => {
  return getTextFromStartEnd(0, positionIndex);
};

/**
 * Retrieves the text after a specified index until the end of the draft.
 * @param {number} positionIndex - The index to get the text after.
 * @returns {string} The text after the specified index.
 */
export const getTextAfter = (positionIndex: number): string => {
  const endOfDraft = getDraftLength();
  return getTextFromStartEnd(positionIndex, endOfDraft);
};

/**
 * Finds the index of the previous occurrence of a character before the cursor position.
 * @param {string} char - The character to search for.
 * @param {number} cursorPosition - The cursor position from where to search.
 * @returns {number} The index of the previous occurrence of the character, or 0 if not found.
 */
export const getPreviousOccurrenceIndex = (
  char: string,
  cursorPosition: number
): number => {
  const textBeforeCursor = getTextBefore(cursorPosition);
  const previousOccurrenceIndex = textBeforeCursor.lastIndexOf(char);
  return previousOccurrenceIndex === -1 ? 0 : previousOccurrenceIndex;
};

/**
 * Finds the index of the next occurrence of a character after the cursor position.
 * @param {string} char - The character to search for.
 * @param {number} cursorPosition - The cursor position from where to search.
 * @returns {number} The index of the next occurrence of the character, or the length of the draft if not found.
 */
export const getNextOccurrenceIndex = (
  char: string,
  cursorPosition: number
): number => {
  // @ts-ignore
  const nextOccurrenceIndex = draft.content.indexOf(char, cursorPosition + 1);
  return nextOccurrenceIndex === -1 ? getDraftLength() : nextOccurrenceIndex;
};
