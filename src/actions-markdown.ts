import {
  getCurrentLineEndIndex,
  getCurrentLineStartIndex,
  getSelectedRange,
  getSelectedText,
  getSelectionEndIndex,
  getSelectionOrCurrentLineLength,
  getSelectionOrCurrentLineStartIndex,
  getTextAfter,
  getTextBefore,
  getTextFromStartEnd,
  getTextfromRange,
} from "./helpers-get-text";

import {
  print,
  setCursorPosition,
  setSelectedText,
  setSelectionRange,
  setSelectionStartEnd,
  setTextFromStartEnd,
  setTextinRange,
} from "./helpers-set-text";

import { getUrlFromClipboard } from "./helpers-utils";

// SUBSECTION: Syntax Highlighting
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

// SUBSECTION: Markdown Links
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

export const insertMarkdownLink = (): void => {
  insertMarkdownLinkWithPrefix("");
};

export const insertMarkdownImage = (): void => {
  insertMarkdownLinkWithPrefix("!");
};

// SUBSECTION: Markdown Tasks and Checkboxes
class ToggleMarkdown {
  public taskState: {
    readonly uncheckedBox: string;
    readonly checkedBox: string;
    readonly uncheckedTask: string;
    readonly checkedTask: string;
  };
  public taskPatterns: string[];
  public CheckboxPatterns: string[];

  constructor() {
    this.taskState = {
      uncheckedBox: "[ ]",
      checkedBox: "[x]",
      uncheckedTask: "- [ ]",
      checkedTask: "- [x]",
    } as const;

    this.taskPatterns = [
      this.taskState.uncheckedTask,
      this.taskState.checkedTask,
    ];

    this.CheckboxPatterns = Object.values(this.taskState);
  }

  lineHasPattern(line: string, patterns: string[]): boolean {
    const trimmedLine = line.trim();
    return patterns.some((pattern) => trimmedLine.startsWith(pattern));
  }

  selectionHasItem(
    selectedLines: string[],
    checkFunction: (line: string) => boolean
  ): boolean {
    return selectedLines.some((line) => checkFunction(line));
  }

  toggleMarkdown = (toggleFunction: (selection: string) => string): void => {
    const selectionStartIndex = getSelectionOrCurrentLineStartIndex();
    const selectionLength = getSelectionOrCurrentLineLength();

    const selection = getTextfromRange(selectionStartIndex, selectionLength);
    const toggledSelection = toggleFunction(selection);

    setSelectionRange(selectionStartIndex, selectionLength);
    setSelectedText(toggledSelection);

    const toggledSelectionEndIndex = getSelectionEndIndex(
      selectionStartIndex,
      toggledSelection.length
    );
    setCursorPosition(toggledSelectionEndIndex);
  };

  // SUBSECTION: Markdown Tasks
  lineHasTask(line: string): boolean {
    return this.lineHasPattern(line, this.taskPatterns);
  }

  removeTaskMarkerIfRequired(line: string): string {
    for (let taskPattern of this.taskPatterns) {
      // trim to remove leading whitespace
      line = line.replace(taskPattern, "").trim();
    }
    return line;
  }

  addTaskMarkerIfRequired(line: string): string {
    // is line is already a task or if line is empty, leave it unchanged
    if (this.lineHasTask(line) || line.trim() === "") {
      return line;
    }

    // if line starts with `-`, replace it (only the first dash) with task marker
    if (line.trim().startsWith("-")) {
      return `${this.taskState.uncheckedTask} ${line.replace("-", "")}`;
    }

    return `${this.taskState.uncheckedTask} ${line}`;
  }

  selectionHasTask(selectedLines: string[]): boolean {
    return this.selectionHasItem(selectedLines, (line) =>
      this.lineHasTask(line)
    );
  }

  toggleTasksSelection = (selection: string): string => {
    const selectedLines = selection.split("\n");

    if (this.selectionHasTask(selectedLines)) {
      return selectedLines
        .map((line) => this.removeTaskMarkerIfRequired(line))
        .join("\n");
    }

    return selectedLines
      .map((line) => this.addTaskMarkerIfRequired(line))
      .join("\n");
  };

  toggleMarkdownTasks = (): void => {
    this.toggleMarkdown(this.toggleTasksSelection);
  };

  // SUBSECTION: Markdown Checkboxes
  lineHasCheckbox(line: string): boolean {
    return this.lineHasPattern(line, this.CheckboxPatterns);
  }

  lineIsChecked(line: string): boolean {
    return line.includes(this.taskState.checkedBox);
  }

  checkBox(line: string): string {
    if (!this.lineHasCheckbox(line)) {
      return line;
    }

    return line.replace(this.taskState.uncheckedBox, this.taskState.checkedBox);
  }

  uncheckBox(line: string): string {
    if (!this.lineHasCheckbox(line)) {
      return line;
    }

    return line.replace(this.taskState.checkedBox, this.taskState.uncheckedBox);
  }

  // TODO: Why does return this.selectionHasItem(selectedLines, this.lineHasCheckbox) not work?
  selectionIsChecked(selectedLines: string[]): boolean {
    return this.selectionHasItem(
      selectedLines,
      (line) => this.lineHasCheckbox(line) && this.lineIsChecked(line)
    );
  }

  toggleCheckboxesSelection = (selection: string): string => {
    const selectedLines = selection.split("\n");

    // at least one line contains checked checkbox
    if (this.selectionIsChecked(selectedLines)) {
      return selectedLines.map((line) => this.uncheckBox(line)).join("\n");
    }

    return selectedLines.map((line) => this.checkBox(line)).join("\n");
  };

  toggleMarkdownCheckboxes = (): void => {
    this.toggleMarkdown(this.toggleCheckboxesSelection);
  };
}

/**
     Strategy:
      - works for selection of multiple lines
      - if no text is selected, consider the current line as selection
      - if any of the selected lines is already a task, remove the task mark from all lines
      - if none of the selected lines is a task, add a task mark to all lines
  */
export const toggleMarkdownTasks = (): void => {
  const toggleMarkdown = new ToggleMarkdown();
  toggleMarkdown.toggleMarkdownTasks();
};

/**
   Strategy:
    - works for selection of multiple lines
    - if no text is selected, consider the current line as selection
    - if any of the selected tasks is already checked, uncheck all tasks
    - if none of the selected tasks is checked, check all tasks
  */
export const toggleMarkdownCheckboxes = (): void => {
  const toggleMarkdown = new ToggleMarkdown();
  toggleMarkdown.toggleMarkdownCheckboxes();
};

// SUBSECTION: Markdown Lists
/**
Shift+Enter within a list should jump to the next line
- without adding a new list marker
- keeping the indentation of the current line
*/
export const linebreakWithinList = (): void => {
  // this is the absolute index within the draft
  const currentLineStartIndex = getCurrentLineStartIndex();
  const currentLineEndIndex = getCurrentLineEndIndex();
  const currentLineText = getTextFromStartEnd(
    currentLineStartIndex,
    currentLineEndIndex
  );

  const hasListMarker = currentLineText.match("^\\s*[-]");
  // 2 for the list marker itself and the following whitespace
  const extraListMarkerLength = hasListMarker ? 2 : 0;
  const extraListMarkerWhitespace = " ".repeat(extraListMarkerLength);

  // only whitespace at the beginning of the line
  // if line does not start with whitespace, set to empty string
  const currentLineWhitespace = currentLineText.match("^\\s*")?.[0] ?? "";

  // add whitespace characters until reaching the indentation length within the next line
  const whitespaceIndentation =
    "\n" + currentLineWhitespace + extraListMarkerWhitespace;

  const newCursorPosition = currentLineEndIndex + whitespaceIndentation.length;

  setTextFromStartEnd(
    whitespaceIndentation,
    currentLineEndIndex,
    newCursorPosition
  );
  setCursorPosition(newCursorPosition);
};
