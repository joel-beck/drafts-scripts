import {
  getSelectedRange,
  getSelectedText,
  getSelectionEndIndex,
  getTextAfter,
  getTextBefore,
} from "./helpers-get-text";

import {
  setCursorPosition,
  setSelectedText,
  setSelectionStartEnd,
} from "./helpers-set-text";

class SyntaxHighlighter {
  public selectionStartIndex: number;
  public selectionLength: number;
  public selectionEndIndex: number;
  public selectedText: string;

  constructor() {
    [this.selectionStartIndex, this.selectionLength] = getSelectedRange();
    this.selectionEndIndex = getSelectionEndIndex(
      this.selectionStartIndex,
      this.selectionLength
    );
    this.selectedText = getSelectedText();
  }

  textIsSelected = (): boolean => {
    return this.selectionLength > 0;
  };

  // check if characters before selection start and after selection end are highlight
  // characters
  textIsHighlightedAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): boolean => {
    const textBeforeSelection = getTextBefore(this.selectionStartIndex);
    const textAfterSelection = getTextAfter(this.selectionEndIndex);

    return (
      textBeforeSelection.endsWith(highlightPrefix) &&
      textAfterSelection.startsWith(highlightSuffix)
    );
  };

  textIsHighlightedSymmetric = (highlightChar: string): boolean => {
    return this.textIsHighlightedAsymmetric(highlightChar, highlightChar);
  };

  // add highlight characters around selected text
  addHighlightAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): void => {
    // replaces original selection
    setSelectedText(highlightPrefix + this.selectedText + highlightSuffix);

    setCursorPosition(
      this.selectionEndIndex + highlightPrefix.length + highlightSuffix.length
    );
  };

  addHighlightSymmetric = (highlightChar: string): void => {
    this.addHighlightAsymmetric(highlightChar, highlightChar);
  };

  removeHighlightAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): void => {
    setSelectionStartEnd(
      this.selectionStartIndex - highlightPrefix.length,
      this.selectionEndIndex + highlightSuffix.length
    );
    setSelectedText(this.selectedText);
  };

  // remove highlight characters around selected text
  removeHighlightSymmetric = (highlightChar: string): void => {
    this.removeHighlightAsymmetric(highlightChar, highlightChar);
  };

  openOrClose = (highlightChar: string): void => {
    setSelectedText(highlightChar);
    // sets cursor after highlighting character
    setCursorPosition(this.selectionStartIndex + highlightChar.length);
  };

  addOrRemoveHighlightSymmetric = (highlightChar: string): void => {
    // case 1: no selection => add open or closing highlight character
    if (!this.textIsSelected()) {
      this.openOrClose(highlightChar);
      return;
    }

    // case 2: text is selected and already highlighted => remove highlight
    if (this.textIsHighlightedSymmetric(highlightChar)) {
      this.removeHighlightSymmetric(highlightChar);
      return;
    }

    // case 3: text is selected but not highlighted => add highlight
    this.addHighlightSymmetric(highlightChar);
  };

  addOrRemoveHighlightAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): void => {
    // case 1: no selection => add open or closing highlight character
    if (!this.textIsSelected()) {
      // check if last highlight character before cursor is prefix or suffix
      const textBeforeCursor = getTextBefore(this.selectionStartIndex);

      const lastPrefixIndex = textBeforeCursor.lastIndexOf(highlightPrefix);
      const lastSuffixIndex = textBeforeCursor.lastIndexOf(highlightSuffix);

      if (lastPrefixIndex > lastSuffixIndex) {
        // last highlight character before cursor is prefix
        this.openOrClose(highlightSuffix);
      } else {
        // last highlight character before cursor is suffix
        this.openOrClose(highlightPrefix);
      }
      return;
    }

    // case 2: text is selected and already highlighted => remove highlight
    if (this.textIsHighlightedAsymmetric(highlightPrefix, highlightSuffix)) {
      this.removeHighlightAsymmetric(highlightPrefix, highlightSuffix);
      return;
    }

    // case 3: text is selected but not highlighted => add highlight
    this.addHighlightAsymmetric(highlightPrefix, highlightSuffix);
  };
}

export const highlightBold = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightSymmetric("**");
};

export const highlightItalic = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightSymmetric("*");
};

export const highlightCode = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightSymmetric("`");
};

export const highlightCodeBlock = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightAsymmetric("```\n", "\n```");
};
