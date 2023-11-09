import { transformAndReplaceSelectedText } from "./helpers-set-text";

// do not use as separate action since it takes an input parameter, use
// `trimWhitespace()` instead
export const removeExtraWhitespace = (s: string): string => {
  return s.trim().replace(/\s+/g, " ");
};

/**
 * Removes extra whitespaces from the selected text and replaces it without any whitespace.
 */
export const removeWhitespace = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).replace(/\s/g, "");
  });
};

/**
 * Trims leading and trailing whitespaces from the selected text.
 */
export const trimWhitespace = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).trim();
  });
};

/**
 * Converts the selected text to lower case after removing extra whitespaces.
 */
export const toLowerCaseCustom = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).toLowerCase();
  });
};

/**
 * Converts the selected text to upper case after removing extra whitespaces.
 */
export const toUpperCaseCustom = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).toUpperCase();
  });
};

const _toTitleCaseWord = (str: string): string => {
  // input could be empty string
  if (!str) {
    return "";
  }

  const firstLetter = str[0];
  return str.length == 1
    ? firstLetter
    : firstLetter.toUpperCase() + str.slice(1);
};

const _toTitleCase = (str: string): string => {
  return removeExtraWhitespace(str).split(" ").map(_toTitleCaseWord).join(" ");
};

/**
 * Converts the selected text to title case.
 */
export const toTitleCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return _toTitleCase(selectedText);
  });
};

/**
 * Capitalizes the first letter of the selected text.
 */
export const capitalize = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    const noExtraWhitespace = removeExtraWhitespace(selectedText);
    return (
      noExtraWhitespace[0].toUpperCase() +
      noExtraWhitespace.slice(1).toLowerCase()
    );
  });
};

const _toMemeCaseWord = (str: string): string => {
  let transformed_chars = [];

  for (let [i, char] of str.split("").entries()) {
    // characters with even indices lowercase -> start with lowercase
    if (i % 2 == 0) {
      transformed_chars.push(char.toLowerCase());
    } else {
      transformed_chars.push(char.toUpperCase());
    }
  }
  return transformed_chars.join("");
};

/**
 * Converts the selected text to meme case, where every other character is capitalized.
 */
export const toMemeCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText)
      .split(" ")
      .map(_toMemeCaseWord)
      .join(" ");
  });
};

/**
 * Replaces all whitespaces in the selected text with a specified replacement character.
 */
export const replaceWhitespace = (str: string, replacement: string): string => {
  return removeExtraWhitespace(str).replace(/\s/g, replacement);
};

/**
 * Converts the selected text to snake case.
 */
export const toSnakeCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return replaceWhitespace(selectedText, "_");
  });
};

/**
 * Converts the selected text to hyphen case.
 */
export const toHyphenCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return replaceWhitespace(selectedText, "-");
  });
};

/**
 * Converts the selected text to Pascal case.
 */
export const toPascalCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    const noExtraWhitespace = removeExtraWhitespace(selectedText);
    const titleCase = _toTitleCase(noExtraWhitespace);
    return titleCase.replace(/\s/g, "");
  });
};

/**
 * Converts the selected text to camel case.
 */
export const toCamelCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    const noExtraWhitespace = removeExtraWhitespace(selectedText);
    const titleCase = _toTitleCase(noExtraWhitespace);
    return titleCase[0].toLowerCase() + titleCase.slice(1).replace(/\s/g, "");
  });
};

/**
 * Sorts the lines in the selected text alphabetically.
 */
export const sortLines = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return selectedText
      .split("\n")
      .sort((a, b) => a.localeCompare(b))
      .join("\n");
  });
};
