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

/**
 * Provides methods to add or remove syntax highlighting from selected text in Markdown format.
 */
class SyntaxHighlighter {
  public selectionStartIndex: number;
  public selectionLength: number;
  public selectionEndIndex: number;
  public selectedText: string;

  /**
   * Constructs a new SyntaxHighlighter instance and initializes selection details.
   */
  constructor() {
    [this.selectionStartIndex, this.selectionLength] = getSelectedRange();
    this.selectionEndIndex = getSelectionEndIndex(
      this.selectionStartIndex,
      this.selectionLength
    );
    this.selectedText = getSelectedText();
  }

  /**
   * Determines if text has been selected.
   * @returns {boolean} True if the selection length is greater than zero.
   */
  textIsSelected = (): boolean => {
    return this.selectionLength > 0;
  };

  innerTextIsHighlighted = (
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

  outerTextIsHighlighted = (
    highlightPrefix: string,
    highlightSuffix: string
  ): boolean => {
    return (
      this.selectedText.startsWith(highlightPrefix) &&
      this.selectedText.endsWith(highlightSuffix)
    );
  };

  /**
   * Checks if the selected text is highlighted asymmetrically, using different prefix
   * and suffix. Return true either if the text in between prefix and suffix is selected
   * or if the text including prefix and suffix is selected.
   * @param {string} highlightPrefix - The prefix used for highlighting.
   * @param {string} highlightSuffix - The suffix used for highlighting.
   * @returns {boolean} True if the text is highlighted asymmetrically.
   */
  textIsHighlightedAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): boolean => {
    return (
      this.innerTextIsHighlighted(highlightPrefix, highlightSuffix) ||
      this.outerTextIsHighlighted(highlightPrefix, highlightSuffix)
    );
  };

  /**
   * Checks if the selected text is highlighted symmetrically, using the same character for prefix and suffix.
   * @param {string} highlightChar - The character used for highlighting.
   * @returns {boolean} True if the text is highlighted symmetrically.
   */
  textIsHighlightedSymmetric = (highlightChar: string): boolean => {
    return this.textIsHighlightedAsymmetric(highlightChar, highlightChar);
  };

  /**
   * Adds asymmetric highlighting around the selected text.
   * @param {string} highlightPrefix - The prefix used for highlighting.
   * @param {string} highlightSuffix - The suffix used for highlighting.
   */
  addHighlightAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): void => {
    setSelectedText(highlightPrefix + this.selectedText + highlightSuffix);
    // set cursor position after suffix
    setCursorPosition(
      this.selectionEndIndex + highlightPrefix.length + highlightSuffix.length
    );
  };

  /**
   * Adds symmetric highlighting around the selected text.
   * @param {string} highlightChar - The character used for highlighting.
   */
  addHighlightSymmetric = (highlightChar: string): void => {
    this.addHighlightAsymmetric(highlightChar, highlightChar);
  };

  /**
   * Removes asymmetric highlighting from the selected text. Works if only the text in
   * between prefix and suffix is selected or if the text including prefix and suffix is
   * selected.
   * @param {string} highlightPrefix - The prefix used for highlighting.
   * @param {string} highlightSuffix - The suffix used for highlighting.
   */
  removeHighlightAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): void => {
    if (this.outerTextIsHighlighted(highlightPrefix, highlightSuffix)) {
      setSelectedText(
        this.selectedText.slice(highlightPrefix.length, -highlightSuffix.length)
      );
      return;
    }

    // only inner text is selected
    setSelectionStartEnd(
      this.selectionStartIndex - highlightPrefix.length,
      this.selectionEndIndex + highlightSuffix.length
    );
    setSelectedText(this.selectedText);
  };

  /**
   * Removes symmetric highlighting from the selected text.
   * @param {string} highlightChar - The character used for highlighting.
   */
  removeHighlightSymmetric = (highlightChar: string): void => {
    this.removeHighlightAsymmetric(highlightChar, highlightChar);
  };

  /**
   * Toggles opening or closing of symmetric highlighting based on the cursor position.
   * @param {string} highlightChar - The character used for highlighting.
   */
  insertOpeningOrClosingCharacter = (highlightChar: string): void => {
    setSelectedText(highlightChar);
    setCursorPosition(this.selectionStartIndex + highlightChar.length);
  };

  /**
   * Adds or removes symmetric highlighting to or from the selected text.
   * @param {string} highlightChar - The character used for highlighting.
   */
  addOrRemoveHighlightSymmetric = (highlightChar: string): void => {
    if (!this.textIsSelected()) {
      this.insertOpeningOrClosingCharacter(highlightChar);
      return;
    }

    if (this.textIsHighlightedSymmetric(highlightChar)) {
      this.removeHighlightSymmetric(highlightChar);
      return;
    }

    this.addHighlightSymmetric(highlightChar);
  };

  /**
   * Adds or removes asymmetric highlighting to or from the selected text.
   * @param {string} highlightPrefix - The prefix used for highlighting.
   * @param {string} highlightSuffix - The suffix used for highlighting.
   */
  addOrRemoveHighlightAsymmetric = (
    highlightPrefix: string,
    highlightSuffix: string
  ): void => {
    if (!this.textIsSelected()) {
      const textBeforeCursor = getTextBefore(this.selectionStartIndex);
      const lastPrefixIndex = textBeforeCursor.lastIndexOf(highlightPrefix);
      const lastSuffixIndex = textBeforeCursor.lastIndexOf(highlightSuffix);

      if (lastPrefixIndex > lastSuffixIndex) {
        this.insertOpeningOrClosingCharacter(highlightSuffix);
      } else {
        this.insertOpeningOrClosingCharacter(highlightPrefix);
      }
      return;
    }

    if (this.textIsHighlightedAsymmetric(highlightPrefix, highlightSuffix)) {
      this.removeHighlightAsymmetric(highlightPrefix, highlightSuffix);
      return;
    }
    this.addHighlightAsymmetric(highlightPrefix, highlightSuffix);
  };
}

/**
 * Toggles bold highlighting on the selected text.
 */
export const highlightBold = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightSymmetric("**");
};

/**
 * Toggles italic highlighting on the selected text.
 */
export const highlightItalic = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightSymmetric("*");
};

/**
 * Toggles code highlighting on the selected text.
 */
export const highlightCode = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightSymmetric("`");
};

/**
 * Toggles code block highlighting on the selected text.
 */
export const highlightCodeBlock = (): void => {
  const syntaxHighlighter = new SyntaxHighlighter();
  syntaxHighlighter.addOrRemoveHighlightAsymmetric("```\n", "\n```");
};
