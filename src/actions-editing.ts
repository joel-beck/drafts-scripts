import {
  getCurrentLineRange,
  getCurrentLineStartIndex,
  getCursorPosition,
  getDraftLength,
  getNextOccurrenceIndex,
  getPreviousOccurrenceIndex,
  getSelectedRange,
  getSelectedTextOrCurrentLine,
  getSelectionOrCurrentLineRange,
  getSelectionStartIndex,
  getTextfromRange,
  isLastLine,
} from "./helpers-get-text";

import {
  insertTextAndSetCursor,
  setCursorPosition,
  setSelectedText,
  setSelectionRange,
  setSelectionRangeKeepNewline,
  setTextinRange,
  trimSelectedText,
} from "./helpers-set-text";

import {
  copySelectedTextToClipboard,
  copyToClipboard,
  getClipboard,
} from "./helpers-utils";

export const insertDictation = (): void => {
  const [selectionStartIndex, selectionLength] = getSelectedRange();

  // dictate
  // @ts-ignore
  const dictatedText = editor.dictate();
  if (dictatedText) {
    setTextinRange(dictatedText, selectionStartIndex, selectionLength);
    setCursorPosition(selectionStartIndex + dictatedText.length);
    // @ts-ignore
    editor.activate();
  }
};

export const pasteClipboard = (): void => {
  const clipboard = getClipboard();
  const selectionStartIndex = getSelectionStartIndex();

  insertTextAndSetCursor(clipboard, selectionStartIndex);
};

// SUBSECTION: Copy, Cut, Delete
class CopyCutDelete {
  public lineStartIndex: number;
  public lineLength: number;
  public text: string;
  public cursorPosition: number;

  constructor() {
    [this.lineStartIndex, this.lineLength] = getCurrentLineRange();
    this.text = getTextfromRange(this.lineStartIndex, this.lineLength);
    this.cursorPosition = getCursorPosition();
  }

  private addNewlineIfEndOfDraft = (): string => {
    // if original line is last line in draft, add newline as separator between the lines,
    // i.e. after the new text
    return isLastLine(this.text) ? "\n" : "";
  };

  public copyLineUp = (): void => {
    // copy line up
    setTextinRange(
      this.text + this.addNewlineIfEndOfDraft(),
      this.lineStartIndex,
      0
    );

    // keep cursor at the same position
    setCursorPosition(this.cursorPosition);
  };

  public copyLineDown = (): void => {
    const newlineIfEndOfDraft = this.addNewlineIfEndOfDraft();

    // copy line down
    setTextinRange(
      newlineIfEndOfDraft + this.text,
      this.lineStartIndex + this.lineLength,
      0
    );

    // set cursor at the same position, just one line below
    setCursorPosition(
      this.cursorPosition + this.lineLength + newlineIfEndOfDraft.length
    );
  };

  public copyLineToClipboard = (): void => {
    const selectedText = getSelectedTextOrCurrentLine();
    copyToClipboard(selectedText);
  };

  public cutLine = (): void => {
    const selectedRange = getSelectionOrCurrentLineRange();
    const selectedText = getTextfromRange(...selectedRange);

    copyToClipboard(selectedText);
    setSelectionRangeKeepNewline(...selectedRange);
    setSelectedText("");
  };

  public deleteLine = (): void => {
    // replace text in current line with nothing
    setTextinRange("", this.lineStartIndex, this.lineLength);

    // text from current line end to end of draft
    let remainingText = getTextfromRange(
      this.lineStartIndex + this.lineLength - 2,
      getDraftLength()
    ).trim();

    if (remainingText) {
      // any of the following lines contain text: set cursor to beginning of current line
      setCursorPosition(this.lineStartIndex);
    } else {
      // all following lines are empty:
      // set cursor to end of previous line
      setCursorPosition(this.lineStartIndex - 1);
      // get line range of previous line
      const previousLineStartIndex = getCurrentLineStartIndex();
      // set cursor to beginning of previous line
      setCursorPosition(previousLineStartIndex);
    }
    // debug(remainingText);
  };
}

export const copyLineUp = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.copyLineUp();
};

export const copyLineDown = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.copyLineDown();
};

export const copyLineToClipboard = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.copyLineToClipboard();
};

export const cutLine = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.cutLine();
};

export const deleteLine = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.deleteLine();
};

// SUBSECTION: Selection
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
