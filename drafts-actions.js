const getSelectedRange = () => {
    // @ts-ignore
    return editor.getSelectedRange();
};
const getSelectionStartIndex = () => {
    return getSelectedRange()[0];
};
const getCursorPosition = () => {
    // cursor position conincides with selection start index if there is no selection
    return getSelectionStartIndex();
};
const isLastLine = (text) => {
    // only last line in draft does not end with newline
    return !text.endsWith("\n");
};
const getDraftLength = () => {
    // @ts-ignore
    return draft.content.length;
};
const isEndOfDraft = (positionIndex) => {
    return positionIndex === getDraftLength();
};
// either compute selection end index from selection start index and selection length or
// compute it from scratch
const getSelectionEndIndex = (selectionStartIndex, selectionLength) => {
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
const getCurrentLineRange = () => {
    const [currentLineStartIndex, currentLineLength] = 
    // @ts-ignore
    editor.getSelectedLineRange();
    // subtract one from current line length to exclude newline character
    return [currentLineStartIndex, currentLineLength - 1];
};
const getCurrentLineStartIndex = () => {
    return getCurrentLineRange()[0];
};
const getSelectedText = () => {
    // @ts-ignore
    return editor.getSelectedText();
};
const getSelectionOrCurrentLineRange = () => {
    const selectedText = getSelectedText();
    if (!selectedText) {
        return getCurrentLineRange();
    }
    else {
        return getSelectedRange();
    }
};
const getSelectionOrCurrentLineStartIndex = () => {
    return getSelectionOrCurrentLineRange()[0];
};
const getSelectionOrCurrentLineLength = () => {
    return getSelectionOrCurrentLineRange()[1];
};
const getTextfromRange = (startIndex, length) => {
    // @ts-ignore
    return editor.getTextInRange(startIndex, length);
};
const getTextFromStartEnd = (startIndex, endIndex) => {
    return getTextfromRange(startIndex, endIndex - startIndex);
};
const getCurrentLineText = () => {
    return getTextfromRange(...getCurrentLineRange());
};
const getSelectedTextOrCurrentLine = () => {
    const selectedText = getSelectedText();
    if (!selectedText) {
        return getCurrentLineText();
    }
    else {
        return selectedText;
    }
};
const getTextBefore = (positionIndex) => {
    return getTextFromStartEnd(0, positionIndex);
};
const getTextAfter = (positionIndex) => {
    const endOfDraft = getDraftLength();
    return getTextFromStartEnd(positionIndex, endOfDraft);
};
const getPreviousOccurrenceIndex = (char, cursorPosition) => {
    const textBeforeCursor = getTextBefore(cursorPosition);
    const previousOccurrenceIndex = textBeforeCursor.lastIndexOf(char);
    // if there is no previous occurrence, return start of draft
    return previousOccurrenceIndex === -1 ? 0 : previousOccurrenceIndex;
};
const getNextOccurrenceIndex = (char, cursorPosition) => {
    // @ts-ignore
    const nextOccurrenceIndex = draft.content.indexOf(char, cursorPosition + 1);
    // if there is no next occurrence, return end of draft
    return nextOccurrenceIndex === -1 ? getDraftLength() : nextOccurrenceIndex;
};

const setSelectedText = (text) => {
    // @ts-ignore
    editor.setSelectedText(text);
};
const setTextinRange = (text, startIndex, length) => {
    // @ts-ignore
    editor.setTextInRange(startIndex, length, text);
};
const setSelectionRange = (selectionStartIndex, selectionLength) => {
    // @ts-ignore
    editor.setSelectedRange(selectionStartIndex, selectionLength);
};
const setSelectionStartEnd = (selectionStartIndex, selectionEndIndex) => {
    setSelectionRange(selectionStartIndex, selectionEndIndex - selectionStartIndex);
};
const setSelectionRangeKeepNewline = (selectionStartIndex, selectionLength) => {
    const selectedText = getTextfromRange(selectionStartIndex, selectionLength);
    // draft ends with selection (does not end with newline)
    if (isLastLine(selectedText)) {
        setSelectionRange(selectionStartIndex, selectionLength);
    }
    else {
        // if selection ends with newline, do not select newline
        setSelectionRange(selectionStartIndex, selectionLength - 1);
    }
};
const setCursorPosition = (newCursorPosition) => {
    // setting cursor is equivalent to setting selection with length 0
    setSelectionRange(newCursorPosition, 0);
};
const trimSelectedText = (selectionStartIndex, selectionEndIndex) => {
    const selectedText = getTextFromStartEnd(selectionStartIndex, selectionEndIndex);
    const trimmedText = selectedText.trim();
    // find absolute index position of first non-whitespace character
    const trimmedTextStart = selectionStartIndex + selectedText.indexOf(trimmedText);
    const trimmedTextEnd = trimmedTextStart + trimmedText.length;
    return [trimmedTextStart, trimmedTextEnd];
};
const insertTextAndSetCursor = (text, selectionStartIndex) => {
    setSelectedText(text);
    setCursorPosition(selectionStartIndex + text.length);
};
const transformSelectedText = (transformationFunction) => {
    const selectedText = getSelectedText();
    return transformationFunction(selectedText);
};
const transformAndReplaceSelectedText = (transformationFunction) => {
    const transformedText = transformSelectedText(transformationFunction);
    setSelectedText(transformedText);
};

const getClipboard = () => {
    // @ts-ignore
    return app.getClipboard();
};
const copyToClipboard = (text) => {
    // @ts-ignore
    app.setClipboard(text);
};
const copySelectedTextToClipboard = () => {
    const selectedText = getSelectedText();
    copyToClipboard(selectedText);
};
const isUrl = (s) => {
    const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return urlRegex.test(s);
};
const getUrlFromClipboard = () => {
    const clipboard = getClipboard();
    return isUrl(clipboard) ? clipboard : "";
};

const insertDictation = () => {
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
const pasteClipboard = () => {
    const clipboard = getClipboard();
    const selectionStartIndex = getSelectionStartIndex();
    insertTextAndSetCursor(clipboard, selectionStartIndex);
};
// SUBSECTION: Copy, Cut, Delete
class CopyCutDelete {
    constructor() {
        Object.defineProperty(this, "lineStartIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lineLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "text", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cursorPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "addNewlineIfEndOfDraft", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                // if original line is last line in draft, add newline as separator between the lines,
                // i.e. after the new text
                return isLastLine(this.text) ? "\n" : "";
            }
        });
        Object.defineProperty(this, "copyLineUp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                // copy line up
                setTextinRange(this.text + this.addNewlineIfEndOfDraft(), this.lineStartIndex, 0);
                // keep cursor at the same position
                setCursorPosition(this.cursorPosition);
            }
        });
        Object.defineProperty(this, "copyLineDown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const newlineIfEndOfDraft = this.addNewlineIfEndOfDraft();
                // copy line down
                setTextinRange(newlineIfEndOfDraft + this.text, this.lineStartIndex + this.lineLength, 0);
                // set cursor at the same position, just one line below
                setCursorPosition(this.cursorPosition + this.lineLength + newlineIfEndOfDraft.length);
            }
        });
        Object.defineProperty(this, "copyLineToClipboard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const selectedText = getSelectedTextOrCurrentLine();
                copyToClipboard(selectedText);
            }
        });
        Object.defineProperty(this, "cutLine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const selectedRange = getSelectionOrCurrentLineRange();
                const selectedText = getTextfromRange(...selectedRange);
                copyToClipboard(selectedText);
                setSelectionRangeKeepNewline(...selectedRange);
                setSelectedText("");
            }
        });
        Object.defineProperty(this, "deleteLine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                // replace text in current line with nothing
                setTextinRange("", this.lineStartIndex, this.lineLength);
                // text from current line end to end of draft
                let remainingText = getTextfromRange(this.lineStartIndex + this.lineLength - 2, getDraftLength()).trim();
                if (remainingText) {
                    // any of the following lines contain text: set cursor to beginning of current line
                    setCursorPosition(this.lineStartIndex);
                }
                else {
                    // all following lines are empty:
                    // set cursor to end of previous line
                    setCursorPosition(this.lineStartIndex - 1);
                    // get line range of previous line
                    const previousLineStartIndex = getCurrentLineStartIndex();
                    // set cursor to beginning of previous line
                    setCursorPosition(previousLineStartIndex);
                }
                // debug(remainingText);
            }
        });
        [this.lineStartIndex, this.lineLength] = getCurrentLineRange();
        this.text = getTextfromRange(this.lineStartIndex, this.lineLength);
        this.cursorPosition = getCursorPosition();
    }
}
const copyLineUp = () => {
    const copyCutDelete = new CopyCutDelete();
    copyCutDelete.copyLineUp();
};
const copyLineDown = () => {
    const copyCutDelete = new CopyCutDelete();
    copyCutDelete.copyLineDown();
};
const copyLineToClipboard = () => {
    const copyCutDelete = new CopyCutDelete();
    copyCutDelete.copyLineToClipboard();
};
const cutLine = () => {
    const copyCutDelete = new CopyCutDelete();
    copyCutDelete.cutLine();
};
const deleteLine = () => {
    const copyCutDelete = new CopyCutDelete();
    copyCutDelete.deleteLine();
};
// SUBSECTION: Selection
const selectSection = (sectionSeparator) => {
    const cursorPosition = getCursorPosition();
    const previousSeparatorPosition = getPreviousOccurrenceIndex(sectionSeparator, cursorPosition);
    const nextSeparatorPosition = getNextOccurrenceIndex(sectionSeparator, cursorPosition);
    // do not include the section separator in the selection
    const sectionStart = previousSeparatorPosition === 0
        ? previousSeparatorPosition
        : previousSeparatorPosition + sectionSeparator.length;
    // index of next separator is at the *beginning* of the separator => section ends here
    const sectionEnd = nextSeparatorPosition;
    // remove all whitespace at the beginning and end of the selection
    const [trimmedSectionStart, trimmedSectionEnd] = trimSelectedText(sectionStart, sectionEnd);
    setSelectionRange(trimmedSectionStart, trimmedSectionEnd - trimmedSectionStart);
};
const selectLine = () => {
    selectSection("\n");
};
const selectParagraph = () => {
    selectSection("\n\n");
};
// select partial response to message in draft, individual responses are separated by "---"
// copy selected text directly to clipboard to paste message into another app
const selectResponse = () => {
    selectSection("---");
    copySelectedTextToClipboard();
};
const selectAll = () => {
    const endOfDraft = getDraftLength();
    // length in second argument equals entire draft in this case since start has index 0
    setSelectionRange(0, endOfDraft);
};

const moveCursorLeft = () => {
    const selectionStartIndex = getSelectionStartIndex();
    // if cursor is not at the beginning of the line, else do nothing
    if (selectionStartIndex > 0) {
        setSelectionRange(selectionStartIndex - 1, 0);
    }
};
const moveCursorRight = () => {
    const selectionStartIndex = getSelectionStartIndex();
    // cursor can always be shifted to the right, do not need an if statement
    setSelectionRange(selectionStartIndex + 1, 0);
};
const jumpToPreviousHeader = () => {
    const cursorPosition = getCursorPosition();
    const previousHeaderPosition = getPreviousOccurrenceIndex("\n#", cursorPosition) + 1;
    // if header is at the beginning of the draft, set cursor to draft start and do not add 1
    if (previousHeaderPosition === 1) {
        setCursorPosition(0);
    }
    else {
        setCursorPosition(previousHeaderPosition);
    }
};
const jumpToNextHeader = () => {
    const cursorPosition = getCursorPosition();
    const nextHeaderPosition = getNextOccurrenceIndex("\n#", cursorPosition) + 1;
    setCursorPosition(nextHeaderPosition);
};

// SUBSECTION: Syntax Highlighting
class SyntaxHighlighter {
    constructor() {
        Object.defineProperty(this, "selectionStartIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "selectionLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "selectionEndIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "selectedText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textIsSelected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                return this.selectionLength > 0;
            }
        });
        // check if characters before selection start and after selection end are highlight
        // characters
        Object.defineProperty(this, "textIsHighlightedAsymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightPrefix, highlightSuffix) => {
                const textBeforeSelection = getTextBefore(this.selectionStartIndex);
                const textAfterSelection = getTextAfter(this.selectionEndIndex);
                return (textBeforeSelection.endsWith(highlightPrefix) &&
                    textAfterSelection.startsWith(highlightSuffix));
            }
        });
        Object.defineProperty(this, "textIsHighlightedSymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightChar) => {
                return this.textIsHighlightedAsymmetric(highlightChar, highlightChar);
            }
        });
        // add highlight characters around selected text
        Object.defineProperty(this, "addHighlightAsymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightPrefix, highlightSuffix) => {
                // replaces original selection
                setSelectedText(highlightPrefix + this.selectedText + highlightSuffix);
                setCursorPosition(this.selectionEndIndex + highlightPrefix.length + highlightSuffix.length);
            }
        });
        Object.defineProperty(this, "addHighlightSymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightChar) => {
                this.addHighlightAsymmetric(highlightChar, highlightChar);
            }
        });
        Object.defineProperty(this, "removeHighlightAsymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightPrefix, highlightSuffix) => {
                setSelectionStartEnd(this.selectionStartIndex - highlightPrefix.length, this.selectionEndIndex + highlightSuffix.length);
                setSelectedText(this.selectedText);
            }
        });
        // remove highlight characters around selected text
        Object.defineProperty(this, "removeHighlightSymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightChar) => {
                this.removeHighlightAsymmetric(highlightChar, highlightChar);
            }
        });
        Object.defineProperty(this, "openOrClose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightChar) => {
                setSelectedText(highlightChar);
                // sets cursor after highlighting character
                setCursorPosition(this.selectionStartIndex + highlightChar.length);
            }
        });
        Object.defineProperty(this, "addOrRemoveHighlightSymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightChar) => {
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
            }
        });
        Object.defineProperty(this, "addOrRemoveHighlightAsymmetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (highlightPrefix, highlightSuffix) => {
                // case 1: no selection => add open or closing highlight character
                if (!this.textIsSelected()) {
                    // check if last highlight character before cursor is prefix or suffix
                    const textBeforeCursor = getTextBefore(this.selectionStartIndex);
                    const lastPrefixIndex = textBeforeCursor.lastIndexOf(highlightPrefix);
                    const lastSuffixIndex = textBeforeCursor.lastIndexOf(highlightSuffix);
                    if (lastPrefixIndex > lastSuffixIndex) {
                        // last highlight character before cursor is prefix
                        this.openOrClose(highlightSuffix);
                    }
                    else {
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
            }
        });
        [this.selectionStartIndex, this.selectionLength] = getSelectedRange();
        this.selectionEndIndex = getSelectionEndIndex(this.selectionStartIndex, this.selectionLength);
        this.selectedText = getSelectedText();
    }
}
const highlightBold = () => {
    const syntaxHighlighter = new SyntaxHighlighter();
    syntaxHighlighter.addOrRemoveHighlightSymmetric("**");
};
const highlightItalic = () => {
    const syntaxHighlighter = new SyntaxHighlighter();
    syntaxHighlighter.addOrRemoveHighlightSymmetric("*");
};
const highlightCode = () => {
    const syntaxHighlighter = new SyntaxHighlighter();
    syntaxHighlighter.addOrRemoveHighlightSymmetric("`");
};
const highlightCodeBlock = () => {
    const syntaxHighlighter = new SyntaxHighlighter();
    syntaxHighlighter.addOrRemoveHighlightAsymmetric("```\n", "\n```");
};
// SUBSECTION: Markdown Links
class MarkdownLink {
    constructor(selectedText, selectionStartIndex, selectionLength, url, prefix) {
        Object.defineProperty(this, "selectedText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: selectedText
        });
        Object.defineProperty(this, "selectionStartIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: selectionStartIndex
        });
        Object.defineProperty(this, "selectionLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: selectionLength
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: url
        });
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: prefix
        });
    }
    insertEmptyLink() {
        setSelectedText(`${this.prefix}[]()`);
        // add 1 for opening square bracket
        setCursorPosition(this.selectionStartIndex + 1);
    }
    insertTextLink() {
        setSelectedText(`${this.prefix}[${this.selectedText}]()`);
        // add 3 for square brackets and opening parentheses
        setCursorPosition(this.selectionStartIndex + this.selectionLength + 3);
    }
    insertUrlLink() {
        setSelectedText(`${this.prefix}[](${this.url})`);
        // add 1 for opening square bracket
        setCursorPosition(this.selectionStartIndex + 1);
    }
    insertFullLink() {
        setSelectedText(`${this.prefix}[${this.selectedText}](${this.url})`);
        // add 4 for squre brackets and parentheses
        setCursorPosition(this.selectionStartIndex + this.selectionLength + this.url.length + 4);
    }
}
const insertMarkdownLinkWithPrefix = (prefix) => {
    const url = getUrlFromClipboard();
    const selectedText = getSelectedText();
    const [selectionStartIndex, selectionLength] = getSelectedRange();
    const markdownLink = new MarkdownLink(selectedText, selectionStartIndex, selectionLength, url, prefix);
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
const insertMarkdownLink = () => {
    insertMarkdownLinkWithPrefix("");
};
const insertMarkdownImage = () => {
    insertMarkdownLinkWithPrefix("!");
};
// SUBSECTION: Markdown Tasks and Checkboxes
class ToggleMarkdown {
    constructor() {
        Object.defineProperty(this, "taskState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "taskPatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "CheckboxPatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "toggleMarkdown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (toggleFunction) => {
                const selectionStartIndex = getSelectionOrCurrentLineStartIndex();
                const selectionLength = getSelectionOrCurrentLineLength();
                const selection = getTextfromRange(selectionStartIndex, selectionLength);
                const toggledSelection = toggleFunction(selection);
                setSelectionRange(selectionStartIndex, selectionLength);
                setSelectedText(toggledSelection);
                const toggledSelectionEndIndex = getSelectionEndIndex(selectionStartIndex, toggledSelection.length);
                setCursorPosition(toggledSelectionEndIndex);
            }
        });
        Object.defineProperty(this, "toggleTasksSelection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (selection) => {
                const selectedLines = selection.split("\n");
                if (this.selectionHasTask(selectedLines)) {
                    return selectedLines
                        .map((line) => this.removeTaskMarkerIfRequired(line))
                        .join("\n");
                }
                return selectedLines
                    .map((line) => this.addTaskMarkerIfRequired(line))
                    .join("\n");
            }
        });
        Object.defineProperty(this, "toggleMarkdownTasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.toggleMarkdown(this.toggleTasksSelection);
            }
        });
        Object.defineProperty(this, "toggleCheckboxesSelection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (selection) => {
                const selectedLines = selection.split("\n");
                // at least one line contains checked checkbox
                if (this.selectionIsChecked(selectedLines)) {
                    return selectedLines.map((line) => this.uncheckBox(line)).join("\n");
                }
                return selectedLines.map((line) => this.checkBox(line)).join("\n");
            }
        });
        Object.defineProperty(this, "toggleMarkdownCheckboxes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.toggleMarkdown(this.toggleCheckboxesSelection);
            }
        });
        this.taskState = {
            uncheckedBox: "[ ]",
            checkedBox: "[x]",
            uncheckedTask: "- [ ]",
            checkedTask: "- [x]",
        };
        this.taskPatterns = [
            this.taskState.uncheckedTask,
            this.taskState.checkedTask,
        ];
        this.CheckboxPatterns = Object.values(this.taskState);
    }
    lineHasPattern(line, patterns) {
        const trimmedLine = line.trim();
        return patterns.some((pattern) => trimmedLine.startsWith(pattern));
    }
    selectionHasItem(selectedLines, checkFunction) {
        return selectedLines.some((line) => checkFunction(line));
    }
    // SUBSECTION: Markdown Tasks
    lineHasTask(line) {
        return this.lineHasPattern(line, this.taskPatterns);
    }
    removeTaskMarkerIfRequired(line) {
        for (let taskPattern of this.taskPatterns) {
            // trim to remove leading whitespace
            line = line.replace(taskPattern, "").trim();
        }
        return line;
    }
    addTaskMarkerIfRequired(line) {
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
    selectionHasTask(selectedLines) {
        return this.selectionHasItem(selectedLines, (line) => this.lineHasTask(line));
    }
    // SUBSECTION: Markdown Checkboxes
    lineHasCheckbox(line) {
        return this.lineHasPattern(line, this.CheckboxPatterns);
    }
    lineIsChecked(line) {
        return line.includes(this.taskState.checkedBox);
    }
    checkBox(line) {
        if (!this.lineHasCheckbox(line)) {
            return line;
        }
        return line.replace(this.taskState.uncheckedBox, this.taskState.checkedBox);
    }
    uncheckBox(line) {
        if (!this.lineHasCheckbox(line)) {
            return line;
        }
        return line.replace(this.taskState.checkedBox, this.taskState.uncheckedBox);
    }
    // TODO: Why does return this.selectionHasItem(selectedLines, this.lineHasCheckbox) not work?
    selectionIsChecked(selectedLines) {
        return this.selectionHasItem(selectedLines, (line) => this.lineHasCheckbox(line) && this.lineIsChecked(line));
    }
}
/**
     Strategy:
      - works for selection of multiple lines
      - if no text is selected, consider the current line as selection
      - if any of the selected lines is already a task, remove the task mark from all lines
      - if none of the selected lines is a task, add a task mark to all lines
  */
const toggleMarkdownTasks = () => {
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
const toggleMarkdownCheckboxes = () => {
    const toggleMarkdown = new ToggleMarkdown();
    toggleMarkdown.toggleMarkdownCheckboxes();
};

const removeExtraWhitespace = (str) => {
    return str.trim().replace(/\s+/g, " ");
};
const removeWhitespace = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return removeExtraWhitespace(selectedText).replace(/\s/g, "");
    });
};
const trimWhitespace = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return removeExtraWhitespace(selectedText).trim();
    });
};
const toLowerCaseCustom = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return removeExtraWhitespace(selectedText).toLowerCase();
    });
};
const toUpperCaseCustom = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return removeExtraWhitespace(selectedText).toUpperCase();
    });
};
const _toTitleCaseWord = (str) => {
    // input could be empty string
    if (!str) {
        return "";
    }
    const firstLetter = str[0];
    return str.length == 1
        ? firstLetter
        : firstLetter.toUpperCase() + str.slice(1);
};
const _toTitleCase = (str) => {
    return removeExtraWhitespace(str).split(" ").map(_toTitleCaseWord).join(" ");
};
const toTitleCase = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return _toTitleCase(selectedText);
    });
};
const capitalize = () => {
    transformAndReplaceSelectedText((selectedText) => {
        const noExtraWhitespace = removeExtraWhitespace(selectedText);
        return (noExtraWhitespace[0].toUpperCase() +
            noExtraWhitespace.slice(1).toLowerCase());
    });
};
const _toMemeCaseWord = (str) => {
    let transformed_chars = [];
    for (let [i, char] of str.split("").entries()) {
        // characters with even indices lowercase -> start with lowercase
        if (i % 2 == 0) {
            transformed_chars.push(char.toLowerCase());
        }
        else {
            transformed_chars.push(char.toUpperCase());
        }
    }
    return transformed_chars.join("");
};
const toMemeCase = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return removeExtraWhitespace(selectedText)
            .split(" ")
            .map(_toMemeCaseWord)
            .join(" ");
    });
};
const replaceWhitespace = (str, replacement) => {
    return removeExtraWhitespace(str).replace(/\s/g, replacement);
};
const toSnakeCase = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return replaceWhitespace(selectedText, "_");
    });
};
const toHyphenCase = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return replaceWhitespace(selectedText, "-");
    });
};
const toPascalCase = () => {
    transformAndReplaceSelectedText((selectedText) => {
        const noExtraWhitespace = removeExtraWhitespace(selectedText);
        const titleCase = _toTitleCase(noExtraWhitespace);
        return titleCase.replace(/\s/g, "");
    });
};
const toCamelCase = () => {
    transformAndReplaceSelectedText((selectedText) => {
        const noExtraWhitespace = removeExtraWhitespace(selectedText);
        const titleCase = _toTitleCase(noExtraWhitespace);
        return titleCase[0].toLowerCase() + titleCase.slice(1).replace(/\s/g, "");
    });
};
const sortLines = () => {
    transformAndReplaceSelectedText((selectedText) => {
        return selectedText
            .split("\n")
            .sort((a, b) => a.localeCompare(b))
            .join("\n");
    });
};

const copyAllTagsToClipboard = () => {
    // NOTE: Keep comment for example of syntax
    // const allDrafts = Draft.query("", "all", [], [], "modified", true, false);
    // const allTagCombinations = allDrafts.map((draft) => draft.tags);
    // // flattens array of combinations into array of individual tags
    // const allTagsArray = [].concat(...allTagCombinations);
    // const uniqueTagsArray = [...new Set(allTagsArray)];
    // @ts-ignore
    const uniqueTagsArray = Tag.query("");
    const sortedTags = uniqueTagsArray.sort().join("\n");
    copyToClipboard(sortedTags);
};

