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

/**
 * Handles copying, cutting, and deleting of lines within the Drafts app.
 */
class CopyCutDelete {
  public lineStartIndex: number;
  public lineLength: number;
  public text: string;
  public cursorPosition: number;

  /**
   * Initializes a new instance of the CopyCutDelete class, capturing the current line's details.
   */
  constructor() {
    [this.lineStartIndex, this.lineLength] = getCurrentLineRange();
    this.text = getTextfromRange(this.lineStartIndex, this.lineLength);
    this.cursorPosition = getCursorPosition();
  }

  /**
   * Adds a newline character if the current line is the end of the draft.
   * @returns {string} A newline character or an empty string.
   */
  private addNewlineIfEndOfDraft = (): string => {
    return isLastLine(this.text) ? "\n" : "";
  };

  /**
   * Copies the current line above itself.
   */
  public copyLineUp = (): void => {
    setTextinRange(
      this.text + this.addNewlineIfEndOfDraft(),
      this.lineStartIndex,
      0
    );
    setCursorPosition(this.cursorPosition);
  };

  /**
   * Copies the current line below itself.
   */
  public copyLineDown = (): void => {
    const newlineIfEndOfDraft = this.addNewlineIfEndOfDraft();
    setTextinRange(
      newlineIfEndOfDraft + this.text,
      this.lineStartIndex + this.lineLength,
      0
    );
    setCursorPosition(
      this.cursorPosition + this.lineLength + newlineIfEndOfDraft.length
    );
  };

  /**
   * Copies the current line or the selected text to the clipboard.
   */
  public copyLineToClipboard = (): void => {
    const selectedText = getSelectedTextOrCurrentLine();
    copyToClipboard(selectedText);
  };

  /**
   * Cuts the current line or the selected text to the clipboard.
   */
  public cutLine = (): void => {
    const selectedRange = getSelectionOrCurrentLineRange();
    const selectedText = getTextfromRange(...selectedRange);
    copyToClipboard(selectedText);
    setSelectionRangeKeepNewline(...selectedRange);
    setSelectedText("");
  };

  /**
   * Deletes the current line or the selected text from the draft.
   */
  public deleteLine = (): void => {
    setTextinRange("", this.lineStartIndex, this.lineLength);
    let remainingText = getTextfromRange(
      this.lineStartIndex + this.lineLength - 2,
      getDraftLength()
    ).trim();
    if (remainingText) {
      setCursorPosition(this.lineStartIndex);
    } else {
      setCursorPosition(this.lineStartIndex - 1);
      const previousLineStartIndex = getCurrentLineStartIndex();
      setCursorPosition(previousLineStartIndex);
    }
  };
}

/**
 * Copies the current line above itself.
 */
export const copyLineUp = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.copyLineUp();
};

/**
 * Copies the current line below itself.
 */
export const copyLineDown = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.copyLineDown();
};

/**
 * Copies the current line or the selected text to the clipboard.
 */
export const copyLineToClipboard = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.copyLineToClipboard();
};

/**
 * Cuts the current line or the selected text to the clipboard.
 */
export const cutLine = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.cutLine();
};

/**
 * Deletes the current line or the selected text from the draft.
 */
export const deleteLine = (): void => {
  const copyCutDelete = new CopyCutDelete();
  copyCutDelete.deleteLine();
};
