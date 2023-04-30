const getDraftLength = () => {
    // @ts-ignore
    return draft.content.length;
};
const getSelectedText = () => {
    // @ts-ignore
    return editor.getSelectedText();
};
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
    // if current line does not end with newline (i.e. is the last line of the draft) keep
    // the current line length, else subtract one to exclude the newline character
    const currentLineText = getTextfromRange(currentLineStartIndex, currentLineLength);
    if (isLastLine(currentLineText)) {
        return [currentLineStartIndex, currentLineLength];
    }
    return [currentLineStartIndex, currentLineLength - 1];
};
const getCurrentLineStartIndex = () => {
    return getCurrentLineRange()[0];
};
const getCurrentLineLength = () => {
    return getCurrentLineRange()[1];
};
const getCurrentLineEndIndex = () => {
    return getCurrentLineStartIndex() + getCurrentLineLength();
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
const setTextFromStartEnd = (text, startIndex, endIndex) => {
    setTextinRange(text, startIndex, endIndex - startIndex);
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

class CopyCutDelete {
    lineStartIndex;
    lineLength;
    text;
    cursorPosition;
    constructor() {
        [this.lineStartIndex, this.lineLength] = getCurrentLineRange();
        this.text = getTextfromRange(this.lineStartIndex, this.lineLength);
        this.cursorPosition = getCursorPosition();
    }
    addNewlineIfEndOfDraft = () => {
        // if original line is last line in draft, add newline as separator between the lines,
        // i.e. after the new text
        return isLastLine(this.text) ? "\n" : "";
    };
    copyLineUp = () => {
        // copy line up
        setTextinRange(this.text + this.addNewlineIfEndOfDraft(), this.lineStartIndex, 0);
        // keep cursor at the same position
        setCursorPosition(this.cursorPosition);
    };
    copyLineDown = () => {
        const newlineIfEndOfDraft = this.addNewlineIfEndOfDraft();
        // copy line down
        setTextinRange(newlineIfEndOfDraft + this.text, this.lineStartIndex + this.lineLength, 0);
        // set cursor at the same position, just one line below
        setCursorPosition(this.cursorPosition + this.lineLength + newlineIfEndOfDraft.length);
    };
    copyLineToClipboard = () => {
        const selectedText = getSelectedTextOrCurrentLine();
        copyToClipboard(selectedText);
    };
    cutLine = () => {
        const selectedRange = getSelectionOrCurrentLineRange();
        const selectedText = getTextfromRange(...selectedRange);
        copyToClipboard(selectedText);
        setSelectionRangeKeepNewline(...selectedRange);
        setSelectedText("");
    };
    deleteLine = () => {
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
    };
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

class SyntaxHighlighter {
    selectionStartIndex;
    selectionLength;
    selectionEndIndex;
    selectedText;
    constructor() {
        [this.selectionStartIndex, this.selectionLength] = getSelectedRange();
        this.selectionEndIndex = getSelectionEndIndex(this.selectionStartIndex, this.selectionLength);
        this.selectedText = getSelectedText();
    }
    textIsSelected = () => {
        return this.selectionLength > 0;
    };
    // check if characters before selection start and after selection end are highlight
    // characters
    textIsHighlightedAsymmetric = (highlightPrefix, highlightSuffix) => {
        const textBeforeSelection = getTextBefore(this.selectionStartIndex);
        const textAfterSelection = getTextAfter(this.selectionEndIndex);
        return (textBeforeSelection.endsWith(highlightPrefix) &&
            textAfterSelection.startsWith(highlightSuffix));
    };
    textIsHighlightedSymmetric = (highlightChar) => {
        return this.textIsHighlightedAsymmetric(highlightChar, highlightChar);
    };
    // add highlight characters around selected text
    addHighlightAsymmetric = (highlightPrefix, highlightSuffix) => {
        // replaces original selection
        setSelectedText(highlightPrefix + this.selectedText + highlightSuffix);
        setCursorPosition(this.selectionEndIndex + highlightPrefix.length + highlightSuffix.length);
    };
    addHighlightSymmetric = (highlightChar) => {
        this.addHighlightAsymmetric(highlightChar, highlightChar);
    };
    removeHighlightAsymmetric = (highlightPrefix, highlightSuffix) => {
        setSelectionStartEnd(this.selectionStartIndex - highlightPrefix.length, this.selectionEndIndex + highlightSuffix.length);
        setSelectedText(this.selectedText);
    };
    // remove highlight characters around selected text
    removeHighlightSymmetric = (highlightChar) => {
        this.removeHighlightAsymmetric(highlightChar, highlightChar);
    };
    openOrClose = (highlightChar) => {
        setSelectedText(highlightChar);
        // sets cursor after highlighting character
        setCursorPosition(this.selectionStartIndex + highlightChar.length);
    };
    addOrRemoveHighlightSymmetric = (highlightChar) => {
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
    addOrRemoveHighlightAsymmetric = (highlightPrefix, highlightSuffix) => {
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
    };
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

class MarkdownLink {
    selectedText;
    selectionStartIndex;
    selectionLength;
    url;
    prefix;
    constructor(selectedText, selectionStartIndex, selectionLength, url, prefix) {
        this.selectedText = selectedText;
        this.selectionStartIndex = selectionStartIndex;
        this.selectionLength = selectionLength;
        this.url = url;
        this.prefix = prefix;
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

/**
Shift+Enter within a list should jump to the next line
- without adding a new list marker
- keeping the indentation of the current line
*/
const linebreakWithinList = () => {
    // this is the absolute index within the draft
    const currentLineStartIndex = getCurrentLineStartIndex();
    const currentLineEndIndex = getCurrentLineEndIndex();
    const currentLineText = getTextFromStartEnd(currentLineStartIndex, currentLineEndIndex);
    const hasListMarker = currentLineText.match("^\\s*[-]");
    // 2 for the list marker itself and the following whitespace
    const extraListMarkerLength = hasListMarker ? 2 : 0;
    const extraListMarkerWhitespace = " ".repeat(extraListMarkerLength);
    // only whitespace at the beginning of the line
    // if line does not start with whitespace, set to empty string
    const currentLineWhitespace = currentLineText.match("^\\s*")?.[0] ?? "";
    // add whitespace characters until reaching the indentation length within the next line
    const whitespaceIndentation = "\n" + currentLineWhitespace + extraListMarkerWhitespace;
    const newCursorPosition = currentLineEndIndex + whitespaceIndentation.length;
    setTextFromStartEnd(whitespaceIndentation, currentLineEndIndex, newCursorPosition);
    setCursorPosition(newCursorPosition);
};

class ToggleMarkdown {
    taskState;
    taskPatterns;
    CheckboxPatterns;
    constructor() {
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
    toggleMarkdown = (toggleFunction) => {
        const selectionStartIndex = getSelectionOrCurrentLineStartIndex();
        const selectionLength = getSelectionOrCurrentLineLength();
        const selection = getTextfromRange(selectionStartIndex, selectionLength);
        const toggledSelection = toggleFunction(selection);
        setSelectionRange(selectionStartIndex, selectionLength);
        setSelectedText(toggledSelection);
        const toggledSelectionEndIndex = getSelectionEndIndex(selectionStartIndex, toggledSelection.length);
        setCursorPosition(toggledSelectionEndIndex);
    };
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
    toggleTasksSelection = (selection) => {
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
    toggleMarkdownTasks = () => {
        this.toggleMarkdown(this.toggleTasksSelection);
    };
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
    toggleCheckboxesSelection = (selection) => {
        const selectedLines = selection.split("\n");
        // at least one line contains checked checkbox
        if (this.selectionIsChecked(selectedLines)) {
            return selectedLines.map((line) => this.uncheckBox(line)).join("\n");
        }
        return selectedLines.map((line) => this.checkBox(line)).join("\n");
    };
    toggleMarkdownCheckboxes = () => {
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

class MathEvaluator {
    selectedText;
    constructor() {
        this.selectedText = getSelectedText().trim();
    }
    evaluate() {
        return eval(this.selectedText);
    }
    // precedence order: newline > comma > space
    findSeparator() {
        if (this.selectedText.includes("\n")) {
            return "\n";
        }
        if (this.selectedText.includes(",")) {
            return ",";
        }
        return " ";
    }
    splitBySeparator() {
        const separator = this.findSeparator();
        return this.selectedText.split(separator).map((n) => Number(n));
    }
    sumToInt() {
        const numbers = this.splitBySeparator();
        return numbers.reduce((a, b) => a + b, 0);
    }
    sum() {
        return this.sumToInt().toString();
    }
    product() {
        const numbers = this.splitBySeparator();
        return numbers.reduce((a, b) => a * b, 1).toString();
    }
    max() {
        const numbers = this.splitBySeparator();
        return Math.max(...numbers).toString();
    }
    min() {
        const numbers = this.splitBySeparator();
        return Math.min(...numbers).toString();
    }
    mean() {
        const numbers = this.splitBySeparator();
        return (this.sumToInt() / numbers.length).toString();
    }
}
// function to evaluate a mathematical expression in a string with javascript
const evaluate = () => {
    const mathEvaluator = new MathEvaluator();
    transformAndReplaceSelectedText(() => {
        return mathEvaluator.evaluate();
    });
};
const sum = () => {
    const mathEvaluator = new MathEvaluator();
    transformAndReplaceSelectedText(() => {
        return mathEvaluator.sum();
    });
};
const product = () => {
    const mathEvaluator = new MathEvaluator();
    transformAndReplaceSelectedText(() => {
        return mathEvaluator.product();
    });
};
const max = () => {
    const mathEvaluator = new MathEvaluator();
    transformAndReplaceSelectedText(() => {
        return mathEvaluator.max();
    });
};
const min = () => {
    const mathEvaluator = new MathEvaluator();
    transformAndReplaceSelectedText(() => {
        return mathEvaluator.min();
    });
};
const mean = () => {
    const mathEvaluator = new MathEvaluator();
    transformAndReplaceSelectedText(() => {
        return mathEvaluator.mean();
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

