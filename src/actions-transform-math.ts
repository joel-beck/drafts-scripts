import { getSelectedText } from "./helpers-get-text";
import { transformAndReplaceSelectedText } from "./helpers-set-text";

class MathEvaluator {
  public selectedText: string;
  public separator: string;
  public numbers: number[];

  constructor() {
    this.selectedText = getSelectedText().trim();
    this.separator = this.findSeparator();
    this.numbers = this.splitBySeparator();
  }

  public evaluate(): string {
    return eval(this.selectedText);
  }

  // precedence order: newline > comma > space
  private findSeparator(): string {
    if (this.selectedText.includes("\n")) {
      return "\n";
    }

    if (this.selectedText.includes(",")) {
      return ",";
    }

    return " ";
  }

  private splitBySeparator(): number[] {
    const separator = this.findSeparator();
    return this.selectedText.split(separator).map((n) => Number(n));
  }

  private sumToInt(): number {
    return this.numbers.reduce((a, b) => a + b, 0);
  }

  public sum(): string {
    return this.sumToInt().toString();
  }

  public product(): string {
    return this.numbers.reduce((a, b) => a * b, 1).toString();
  }

  public max(): string {
    return Math.max(...this.numbers).toString();
  }

  public min(): string {
    return Math.min(...this.numbers).toString();
  }

  public mean(): string {
    return (this.sumToInt() / this.numbers.length).toString();
  }
}

/**
 * Evaluates the mathematical expression from the selected text.
 */
export const evaluate = (): void => {
  const mathEvaluator = new MathEvaluator();
  transformAndReplaceSelectedText((): string => {
    return mathEvaluator.evaluate();
  });
};

/**
 * Calculates and replaces the selected text with the sum of the numbers in it.
 */
export const sum = (): void => {
  const mathEvaluator = new MathEvaluator();
  transformAndReplaceSelectedText((): string => {
    return mathEvaluator.sum();
  });
};

/**
 * Calculates and replaces the selected text with the product of the numbers in it.
 */
export const product = (): void => {
  const mathEvaluator = new MathEvaluator();
  transformAndReplaceSelectedText((): string => {
    return mathEvaluator.product();
  });
};

/**
 * Finds and replaces the selected text with the maximum number from it.
 */
export const max = (): void => {
  const mathEvaluator = new MathEvaluator();
  transformAndReplaceSelectedText((): string => {
    return mathEvaluator.max();
  });
};

/**
 * Finds and replaces the selected text with the minimum number from it.
 */
export const min = (): void => {
  const mathEvaluator = new MathEvaluator();
  transformAndReplaceSelectedText((): string => {
    return mathEvaluator.min();
  });
};

/**
 * Calculates and replaces the selected text with the mean (average) of the numbers in it.
 */
export const mean = (): void => {
  const mathEvaluator = new MathEvaluator();
  transformAndReplaceSelectedText((): string => {
    return mathEvaluator.mean();
  });
};
