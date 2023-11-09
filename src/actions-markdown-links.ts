import { getSelectedRange, getSelectedText } from "./helpers-get-text";
import { setCursorPosition, setSelectedText } from "./helpers-set-text";
import { getUrlFromClipboard } from "./helpers-utils";

class MarkdownLink {
  constructor(
    public selectedText: string,
    public selectionStartIndex: number,
    public selectionLength: number,
    public url: string,
    public prefix: string
  ) {}

  insertEmptyLink(): void {
    setSelectedText(`${this.prefix}[]()`);
    // add 1 for opening square bracket
    setCursorPosition(this.selectionStartIndex + 1);
  }

  insertTextLink(): void {
    setSelectedText(`${this.prefix}[${this.selectedText}]()`);
    // add 3 for square brackets and opening parentheses
    setCursorPosition(this.selectionStartIndex + this.selectionLength + 3);
  }

  insertUrlLink(): void {
    setSelectedText(`${this.prefix}[](${this.url})`);
    // add 1 for opening square bracket
    setCursorPosition(this.selectionStartIndex + 1);
  }

  insertFullLink(): void {
    setSelectedText(`${this.prefix}[${this.selectedText}](${this.url})`);
    // add 4 for squre brackets and parentheses
    setCursorPosition(
      this.selectionStartIndex + this.selectionLength + this.url.length + 4
    );
  }
}

const insertMarkdownLinkWithPrefix = (prefix: string): void => {
  const url = getUrlFromClipboard();
  const selectedText = getSelectedText();
  const [selectionStartIndex, selectionLength] = getSelectedRange();

  const markdownLink = new MarkdownLink(
    selectedText,
    selectionStartIndex,
    selectionLength,
    url,
    prefix
  );

  // case 1: no url in clipboard and no selected text -> insert [`cursor`]()
  if (url.length == 0 && selectionLength == 0) {
    markdownLink.insertEmptyLink();
    return;
  }

  // case 2: no url in clipboard but selected text -> insert [selectedText](`cursor`)
  if (url.length == 0) {
    markdownLink.insertTextLink();
    return;
  }

  // case 3: url in clipboard and no selected text -> insert [`cursor`](url)
  if (selectionLength == 0) {
    markdownLink.insertUrlLink();
    return;
  }

  // case 4: url in clipboard and selected text -> insert [selectedText](url)
  markdownLink.insertFullLink();
};

/**
 * Inserts a Markdown link using the URL from the clipboard and the selected text.
 */
export const insertMarkdownLink = (): void => {
  insertMarkdownLinkWithPrefix("");
};

/**
 * Inserts a Markdown image using the URL from the clipboard and the selected text.
 */
export const insertMarkdownImage = (): void => {
  insertMarkdownLinkWithPrefix("!");
};
