import {
  getSelectedText,
  getTextFromStartEnd,
  getTextfromRange,
  isLastLine,
} from "./helpers-get-text";

export const setSelectedText = (text: string): void => {
  // @ts-ignore
  editor.setSelectedText(text);
};

export const setTextinRange = (
  text: string,
  startIndex: number,
  length: number
) => {
  // @ts-ignore
  editor.setTextInRange(startIndex, length, text);
};

export const setTextFromStartEnd = (
  text: string,
  startIndex: number,
  endIndex: number
) => {
  setTextinRange(text, startIndex, endIndex - startIndex);
};

export const setSelectionRange = (
  selectionStartIndex: number,
  selectionLength: number
) => {
  // @ts-ignore
  editor.setSelectedRange(selectionStartIndex, selectionLength);
};

export const setSelectionStartEnd = (
  selectionStartIndex: number,
  selectionEndIndex: number
) => {
  setSelectionRange(
    selectionStartIndex,
    selectionEndIndex - selectionStartIndex
  );
};

export const setSelectionRangeKeepNewline = (
  selectionStartIndex: number,
  selectionLength: number
) => {
  const selectedText = getTextfromRange(selectionStartIndex, selectionLength);

  // draft ends with selection (does not end with newline)
  if (isLastLine(selectedText)) {
    setSelectionRange(selectionStartIndex, selectionLength);
  } else {
    // if selection ends with newline, do not select newline
    setSelectionRange(selectionStartIndex, selectionLength - 1);
  }
};

export const setCursorPosition = (newCursorPosition: number): void => {
  // setting cursor is equivalent to setting selection with length 0
  setSelectionRange(newCursorPosition, 0);
};

export const trimSelectedText = (
  selectionStartIndex: number,
  selectionEndIndex: number
): [number, number] => {
  const selectedText = getTextFromStartEnd(
    selectionStartIndex,
    selectionEndIndex
  );
  const trimmedText = selectedText.trim();

  // find absolute index position of first non-whitespace character
  const trimmedTextStart =
    selectionStartIndex + selectedText.indexOf(trimmedText);
  const trimmedTextEnd = trimmedTextStart + trimmedText.length;

  return [trimmedTextStart, trimmedTextEnd];
};

export const insertTextAndSetCursor = (
  text: string,
  selectionStartIndex: number
): void => {
  setSelectedText(text);
  setCursorPosition(selectionStartIndex + text.length);
};

export const transformSelectedText = (
  transformationFunction: (text: string) => string
): string => {
  const selectedText = getSelectedText();
  return transformationFunction(selectedText);
};

export const transformAndReplaceSelectedText = (
  transformationFunction: (text: string) => string
) => {
  const transformedText = transformSelectedText(transformationFunction);
  setSelectedText(transformedText);
};
