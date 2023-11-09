import {
  getSelectionEndIndex,
  getSelectionOrCurrentLineLength,
  getSelectionOrCurrentLineStartIndex,
  getTextfromRange,
} from "./helpers-get-text";

import {
  setCursorPosition,
  setSelectedText,
  setSelectionRange,
} from "./helpers-set-text";

/**
 * Class responsible for toggling markdown task and checkbox states within a text selection.
 */
class ToggleMarkdown {
  public taskState: {
    readonly uncheckedBox: string;
    readonly checkedBox: string;
    readonly uncheckedTask: string;
    readonly checkedTask: string;
  };
  public taskPatterns: string[];
  public CheckboxPatterns: string[];

  /**
   * Initializes the class with predefined task states and patterns.
   */
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

  /**
   * Checks if a line of text starts with any of the given markdown patterns.
   * @param {string} line - The line of text to check.
   * @param {string[]} patterns - The patterns to check against.
   * @returns {boolean} True if the line starts with one of the patterns.
   */
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

  /**
   * Toggles markdown tasks on or off for selected lines.
   */
  toggleMarkdownTasks = (): void => {
    this.toggleMarkdown(this.toggleTasksSelection);
  };

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

  /**
   * Toggles markdown checkboxes on or off for selected lines.
   */
  toggleMarkdownCheckboxes = (): void => {
    this.toggleMarkdown(this.toggleCheckboxesSelection);
  };
}

/**
 * Toggles markdown task list items within the selected text.
 * - If no text is selected, it uses the current line.
 * - If any of the selected lines is a task, it removes the task marker from all lines.
 * - If none of the selected lines is a task, it adds a task marker to all lines.
 */
export const toggleMarkdownTasks = (): void => {
  const toggleMarkdown = new ToggleMarkdown();
  toggleMarkdown.toggleMarkdownTasks();
};

/**
 * Toggles markdown checkboxes within the selected text.
 * - If no text is selected, it uses the current line.
 * - If any of the selected lines has a checked box, it unchecks all tasks.
 * - If none of the selected lines has a checked box, it checks all tasks.
 */
export const toggleMarkdownCheckboxes = (): void => {
  const toggleMarkdown = new ToggleMarkdown();
  toggleMarkdown.toggleMarkdownCheckboxes();
};
