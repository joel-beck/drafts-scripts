export const getSelectedRange = (): [number, number] => {
  // @ts-ignore
  return editor.getSelectedRange();
};

export const getSelectionStartIndex = (): number => {
  return getSelectedRange()[0];
};

export const getCursorPosition = (): number => {
  // cursor position conincides with selection start index if there is no selection
  return getSelectionStartIndex();
};

export const getSelectionLength = (): number => {
  return getSelectedRange()[1];
};

export const isLastLine = (text: string): boolean => {
  // only last line in draft does not end with newline
  return !text.endsWith("\n");
};

export const getDraftLength = (): number => {
  // @ts-ignore
  return draft.content.length;
};

export const isEndOfDraft = (positionIndex: number): boolean => {
  return positionIndex === getDraftLength();
};

// either compute selection end index from selection start index and selection length or
// compute it from scratch
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

  // check is text after selection consists of whitespace only
  if (textAfterSelection.trim() === "") {
    const selectedText = getTextfromRange(selectionStartIndex, selectionLength);
    const trimmedSelectedText = selectedText.trim();
    return selectionStartIndex + trimmedSelectedText.length;
  }

  // case 3: selection is followed by nonempty lines -> set cursor to original selection
  // end
  return selectionEndIndex;
};

export const getCurrentLineRange = (): [number, number] => {
  const [currentLineStartIndex, currentLineLength] =
    // @ts-ignore
    editor.getSelectedLineRange();
  // subtract one from current line length to exclude newline character
  return [currentLineStartIndex, currentLineLength - 1];
};

export const getCurrentLineStartIndex = (): number => {
  return getCurrentLineRange()[0];
};

export const getCurrentLineLength = (): number => {
  return getCurrentLineRange()[1];
};

export const getCurrentLineEndIndex = (): number => {
  return getCurrentLineStartIndex() + getCurrentLineLength();
};

export const getSelectedText = (): string => {
  // @ts-ignore
  return editor.getSelectedText();
};

export const getSelectionOrCurrentLineRange = (): [number, number] => {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return getCurrentLineRange();
  } else {
    return getSelectedRange();
  }
};

export const getSelectionOrCurrentLineStartIndex = (): number => {
  return getSelectionOrCurrentLineRange()[0];
};

export const getSelectionOrCurrentLineLength = (): number => {
  return getSelectionOrCurrentLineRange()[1];
};

export const getSelectionOrCurrentLineEndIndex = (): number => {
  const selectionStartIndex = getSelectionOrCurrentLineStartIndex();
  const selectionLength = getSelectionOrCurrentLineLength();
  return getSelectionEndIndex(selectionStartIndex, selectionLength);
};

export const getTextfromRange = (
  startIndex: number,
  length: number
): string => {
  // @ts-ignore
  return editor.getTextInRange(startIndex, length);
};

export const getTextFromStartEnd = (
  startIndex: number,
  endIndex: number
): string => {
  return getTextfromRange(startIndex, endIndex - startIndex);
};

export const getCurrentLineText = (): string => {
  return getTextfromRange(...getCurrentLineRange());
};

export const getSelectedTextOrCurrentLine = (): string => {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return getCurrentLineText();
  } else {
    return selectedText;
  }
};

export const getTextBefore = (positionIndex: number): string => {
  return getTextFromStartEnd(0, positionIndex);
};

export const getTextAfter = (positionIndex: number): string => {
  const endOfDraft = getDraftLength();
  return getTextFromStartEnd(positionIndex, endOfDraft);
};

export const getPreviousOccurrenceIndex = (
  char: string,
  cursorPosition: number
): number => {
  const textBeforeCursor = getTextBefore(cursorPosition);
  const previousOccurrenceIndex = textBeforeCursor.lastIndexOf(char);
  // if there is no previous occurrence, return start of draft
  return previousOccurrenceIndex === -1 ? 0 : previousOccurrenceIndex;
};

export const getNextOccurrenceIndex = (
  char: string,
  cursorPosition: number
): number => {
  // @ts-ignore
  const nextOccurrenceIndex = draft.content.indexOf(char, cursorPosition + 1);
  // if there is no next occurrence, return end of draft
  return nextOccurrenceIndex === -1 ? getDraftLength() : nextOccurrenceIndex;
};
