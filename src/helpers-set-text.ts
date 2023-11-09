import {
  getDraftContent,
  getSelectedText,
  getTextFromStartEnd,
  getTextfromRange,
  isLastLine,
} from "./helpers-get-text";

/**
 * Sets the entire content of the draft.
 * @param {string} text - The text to set as the draft content.
 */
export const setDraftContent = (text: string): void => {
  // @ts-ignore
  editor.setText(text);
};

/**
 * Sets the selected text within the draft.
 * @param {string} text - The text to replace the current selection.
 */
export const setSelectedText = (text: string): void => {
  // @ts-ignore
  editor.setSelectedText(text);
};

/**
 * Replaces the text in a given range with the specified text.
 * @param {string} text - The text to insert.
 * @param {number} startIndex - The start index of the range to replace.
 * @param {number} length - The length of the range to replace.
 */
export const setTextinRange = (
  text: string,
  startIndex: number,
  length: number
) => {
  // @ts-ignore
  editor.setTextInRange(startIndex, length, text);
};

/**
 * Replaces the text between the start and end indices with the specified text.
 * @param {string} text - The text to insert.
 * @param {number} startIndex - The start index of the text range to replace.
 * @param {number} endIndex - The end index of the text range to replace.
 */
export const setTextFromStartEnd = (
  text: string,
  startIndex: number,
  endIndex: number
) => {
  setTextinRange(text, startIndex, endIndex - startIndex);
};

/**
 * Sets the selection range in the draft.
 * @param {number} selectionStartIndex - The start index of the selection.
 * @param {number} selectionLength - The length of the selection.
 */
export const setSelectionRange = (
  selectionStartIndex: number,
  selectionLength: number
) => {
  // @ts-ignore
  editor.setSelectedRange(selectionStartIndex, selectionLength);
};

/**
 * Sets the selection range using start and end indices.
 * @param {number} selectionStartIndex - The start index of the selection.
 * @param {number} selectionEndIndex - The end index of the selection.
 */
export const setSelectionStartEnd = (
  selectionStartIndex: number,
  selectionEndIndex: number
) => {
  setSelectionRange(
    selectionStartIndex,
    selectionEndIndex - selectionStartIndex
  );
};

/**
 * Sets the selection range, excluding the newline character if present at the end.
 * @param {number} selectionStartIndex - The start index of the selection.
 * @param {number} selectionLength - The length of the selection.
 */
export const setSelectionRangeKeepNewline = (
  selectionStartIndex: number,
  selectionLength: number
) => {
  const selectedText = getTextfromRange(selectionStartIndex, selectionLength);
  if (isLastLine(selectedText)) {
    setSelectionRange(selectionStartIndex, selectionLength);
  } else {
    setSelectionRange(selectionStartIndex, selectionLength - 1);
  }
};

/**
 * Sets the cursor position in the draft.
 * @param {number} newCursorPosition - The index to place the cursor.
 */
export const setCursorPosition = (newCursorPosition: number): void => {
  setSelectionRange(newCursorPosition, 0);
};

/**
 * Trims the selected text and returns the new start and end indices.
 * @param {number} selectionStartIndex - The start index of the selection.
 * @param {number} selectionEndIndex - The end index of the selection.
 * @returns {[number, number]} The new start and end indices after trimming.
 */
export const trimSelectedText = (
  selectionStartIndex: number,
  selectionEndIndex: number
): [number, number] => {
  const selectedText = getTextFromStartEnd(
    selectionStartIndex,
    selectionEndIndex
  );
  const trimmedText = selectedText.trim();
  const trimmedTextStart =
    selectionStartIndex + selectedText.indexOf(trimmedText);
  const trimmedTextEnd = trimmedTextStart + trimmedText.length;
  return [trimmedTextStart, trimmedTextEnd];
};

/**
 * Inserts text at the selection start index and sets the cursor position after the inserted text.
 * @param {string} text - The text to insert.
 * @param {number} selectionStartIndex - The index where the text will be inserted.
 */
export const insertTextAndSetCursor = (
  text: string,
  selectionStartIndex: number
): void => {
  setSelectedText(text);
  setCursorPosition(selectionStartIndex + text.length);
};

/**
 * Transforms the selected text using a transformation function.
 * @param {(text: string) => string} transformationFunction - The function to apply to the selected text.
 * @returns {string} The transformed text.
 */
export const transformSelectedText = (
  transformationFunction: (text: string) => string
): string => {
  const selectedText = getSelectedText();
  return transformationFunction(selectedText);
};

/**
 * Applies a transformation function to the selected text and replaces the selection with the transformed text.
 * @param {(text: string) => string} transformationFunction - The function to apply to the selected text.
 */
export const transformAndReplaceSelectedText = (
  transformationFunction: (text: string) => string
) => {
  const transformedText = transformSelectedText(transformationFunction);
  setSelectedText(transformedText);
};

/**
 * Prints debugging information at the end of the draft content. It takes multiple inputs
 * and prints each variable name and its value on a separate line.
 * @param {...(string | number)[]} inputs - A list of inputs to print for debugging.
 */
export const print = (...inputs: (string | number)[]): void => {
  const debugPrefix = "\n---\nDebugging Output:\n";
  const joinedInputs = inputs.join("\n");
  const debugText = debugPrefix + joinedInputs;
  const draftContent = getDraftContent();
  const output = draftContent + debugText;
  setDraftContent(output);
};
