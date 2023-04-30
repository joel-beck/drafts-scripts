import { transformAndReplaceSelectedText } from "./helpers-set-text";

export const removeExtraWhitespace = (str: string): string => {
  return str.trim().replace(/\s+/g, " ");
};

export const removeWhitespace = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).replace(/\s/g, "");
  });
};
export const trimWhitespace = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).trim();
  });
};

export const toLowerCaseCustom = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText).toLowerCase();
  });
};

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

export const toTitleCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return _toTitleCase(selectedText);
  });
};

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

export const toMemeCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return removeExtraWhitespace(selectedText)
      .split(" ")
      .map(_toMemeCaseWord)
      .join(" ");
  });
};

export const replaceWhitespace = (str: string, replacement: string): string => {
  return removeExtraWhitespace(str).replace(/\s/g, replacement);
};

export const toSnakeCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return replaceWhitespace(selectedText, "_");
  });
};

export const toHyphenCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return replaceWhitespace(selectedText, "-");
  });
};

export const toPascalCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    const noExtraWhitespace = removeExtraWhitespace(selectedText);
    const titleCase = _toTitleCase(noExtraWhitespace);
    return titleCase.replace(/\s/g, "");
  });
};

export const toCamelCase = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    const noExtraWhitespace = removeExtraWhitespace(selectedText);
    const titleCase = _toTitleCase(noExtraWhitespace);
    return titleCase[0].toLowerCase() + titleCase.slice(1).replace(/\s/g, "");
  });
};

export const sortLines = (): void => {
  transformAndReplaceSelectedText((selectedText: string): string => {
    return selectedText
      .split("\n")
      .sort((a, b) => a.localeCompare(b))
      .join("\n");
  });
};
