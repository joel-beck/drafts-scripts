import {
  getCurrentLineRange,
  getCurrentLineStartIndex,
  getCursorPosition,
  getDraftLength,
  getSelectedTextOrCurrentLine,
  getSelectionOrCurrentLineRange,
  getTextfromRange,
  isLastLine,
} from "./helpers-get-text";

import {
  setCursorPosition,
  setSelectedText,
  setSelectionRangeKeepNewline,
  setTextinRange,
} from "./helpers-set-text";

import { copyToClipboard } from "./helpers-utils";

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
