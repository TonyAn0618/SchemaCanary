import type { DiagnosticCode, JsonValue } from "./types.js";

const MAX_JSON_DEPTH = 128;

export class StrictJsonError extends Error {
  readonly code: DiagnosticCode;
  readonly line: number;
  readonly column: number;

  constructor(code: DiagnosticCode, message: string, line: number, column: number) {
    super(message);
    this.name = "StrictJsonError";
    this.code = code;
    this.line = line;
    this.column = column;
  }
}

class Parser {
  readonly #source: string;
  #index = 0;

  constructor(source: string) {
    this.#source = source;
  }

  parse(): JsonValue {
    this.#skipWhitespace();
    const value = this.#parseValue(0);
    this.#skipWhitespace();
    if (this.#index !== this.#source.length) {
      this.#fail("JSON_SYNTAX_ERROR", "Unexpected content after the JSON value.");
    }
    return value;
  }

  #parseValue(depth: number): JsonValue {
    if (depth > MAX_JSON_DEPTH) {
      this.#fail(
        "JSON_NESTING_TOO_DEEP",
        `JSON nesting exceeds the safety limit of ${MAX_JSON_DEPTH}.`,
      );
    }

    const character = this.#source[this.#index];
    switch (character) {
      case "{":
        return this.#parseObject(depth);
      case "[":
        return this.#parseArray(depth);
      case '"':
        return this.#parseString();
      case "t":
        return this.#parseLiteral("true", true);
      case "f":
        return this.#parseLiteral("false", false);
      case "n":
        return this.#parseLiteral("null", null);
      default:
        if (character === "-" || this.#isDigit(character)) {
          return this.#parseNumber();
        }
        this.#fail("JSON_SYNTAX_ERROR", "Expected a JSON value.");
    }
  }

  #parseObject(depth: number): { [key: string]: JsonValue } {
    const result = Object.create(null) as { [key: string]: JsonValue };
    const keys = new Set<string>();
    this.#index += 1;
    this.#skipWhitespace();

    if (this.#source[this.#index] === "}") {
      this.#index += 1;
      return result;
    }

    while (this.#index < this.#source.length) {
      if (this.#source[this.#index] !== '"') {
        this.#fail("JSON_SYNTAX_ERROR", "Expected an object property name.");
      }
      const keyIndex = this.#index;
      const key = this.#parseString();
      if (keys.has(key)) {
        this.#failAt(
          "JSON_DUPLICATE_KEY",
          `Duplicate object key ${JSON.stringify(key)}.`,
          keyIndex,
        );
      }
      keys.add(key);

      this.#skipWhitespace();
      if (this.#source[this.#index] !== ":") {
        this.#fail("JSON_SYNTAX_ERROR", "Expected ':' after the object property name.");
      }
      this.#index += 1;
      this.#skipWhitespace();
      result[key] = this.#parseValue(depth + 1);
      this.#skipWhitespace();

      const delimiter = this.#source[this.#index];
      if (delimiter === "}") {
        this.#index += 1;
        return result;
      }
      if (delimiter !== ",") {
        this.#fail("JSON_SYNTAX_ERROR", "Expected ',' or '}' in the object.");
      }
      this.#index += 1;
      this.#skipWhitespace();
    }

    this.#fail("JSON_SYNTAX_ERROR", "Unterminated object.");
  }

  #parseArray(depth: number): JsonValue[] {
    const result: JsonValue[] = [];
    this.#index += 1;
    this.#skipWhitespace();

    if (this.#source[this.#index] === "]") {
      this.#index += 1;
      return result;
    }

    while (this.#index < this.#source.length) {
      result.push(this.#parseValue(depth + 1));
      this.#skipWhitespace();

      const delimiter = this.#source[this.#index];
      if (delimiter === "]") {
        this.#index += 1;
        return result;
      }
      if (delimiter !== ",") {
        this.#fail("JSON_SYNTAX_ERROR", "Expected ',' or ']' in the array.");
      }
      this.#index += 1;
      this.#skipWhitespace();
    }

    this.#fail("JSON_SYNTAX_ERROR", "Unterminated array.");
  }

  #parseString(): string {
    const start = this.#index;
    this.#index += 1;

    while (this.#index < this.#source.length) {
      const code = this.#source.charCodeAt(this.#index);
      if (code === 0x22) {
        this.#index += 1;
        const value = JSON.parse(this.#source.slice(start, this.#index)) as string;
        this.#assertValidUnicode(value, start);
        return value;
      }
      if (code === 0x5c) {
        this.#index += 1;
        const escapeCharacter = this.#source[this.#index];
        if (escapeCharacter === "u") {
          const hex = this.#source.slice(this.#index + 1, this.#index + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            this.#fail("JSON_SYNTAX_ERROR", "Invalid Unicode escape in string.");
          }
          this.#index += 5;
          continue;
        }
        if (escapeCharacter === undefined || !'"\\/bfnrt'.includes(escapeCharacter)) {
          this.#fail("JSON_SYNTAX_ERROR", "Invalid escape sequence in string.");
        }
        this.#index += 1;
        continue;
      }
      if (code < 0x20) {
        this.#fail("JSON_SYNTAX_ERROR", "Unescaped control character in string.");
      }
      this.#index += 1;
    }

    this.#fail("JSON_SYNTAX_ERROR", "Unterminated string.");
  }

  #parseNumber(): number {
    const start = this.#index;
    if (this.#source[this.#index] === "-") {
      this.#index += 1;
    }

    if (this.#source[this.#index] === "0") {
      this.#index += 1;
      if (this.#isDigit(this.#source[this.#index])) {
        this.#fail("JSON_SYNTAX_ERROR", "Leading zeros are not allowed in JSON numbers.");
      }
    } else {
      this.#consumeDigits("Expected a digit in the JSON number.");
    }

    if (this.#source[this.#index] === ".") {
      this.#index += 1;
      this.#consumeDigits("Expected a digit after the decimal point.");
    }

    const exponent = this.#source[this.#index];
    if (exponent === "e" || exponent === "E") {
      this.#index += 1;
      const sign = this.#source[this.#index];
      if (sign === "+" || sign === "-") {
        this.#index += 1;
      }
      this.#consumeDigits("Expected a digit in the number exponent.");
    }

    const value = Number(this.#source.slice(start, this.#index));
    if (!Number.isFinite(value)) {
      this.#failAt(
        "JSON_NON_FINITE_NUMBER",
        "The JSON number cannot be represented as a finite IEEE-754 value.",
        start,
      );
    }
    return value;
  }

  #parseLiteral<T extends JsonValue>(source: string, value: T): T {
    if (this.#source.slice(this.#index, this.#index + source.length) !== source) {
      this.#fail("JSON_SYNTAX_ERROR", `Expected '${source}'.`);
    }
    this.#index += source.length;
    return value;
  }

  #consumeDigits(message: string): void {
    const start = this.#index;
    while (this.#isDigit(this.#source[this.#index])) {
      this.#index += 1;
    }
    if (this.#index === start) {
      this.#fail("JSON_SYNTAX_ERROR", message);
    }
  }

  #isDigit(character: string | undefined): boolean {
    return character !== undefined && character >= "0" && character <= "9";
  }

  #skipWhitespace(): void {
    while (true) {
      const character = this.#source[this.#index];
      if (character === " " || character === "\n" || character === "\r" || character === "\t") {
        this.#index += 1;
        continue;
      }
      return;
    }
  }

  #assertValidUnicode(value: string, sourceIndex: number): void {
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      if (code >= 0xd800 && code <= 0xdbff) {
        const next = value.charCodeAt(index + 1);
        if (Number.isNaN(next) || next < 0xdc00 || next > 0xdfff) {
          this.#failAt(
            "JSON_INVALID_UNICODE",
            "String contains an unpaired high surrogate.",
            sourceIndex,
          );
        }
        index += 1;
      } else if (code >= 0xdc00 && code <= 0xdfff) {
        this.#failAt(
          "JSON_INVALID_UNICODE",
          "String contains an unpaired low surrogate.",
          sourceIndex,
        );
      }
    }
  }

  #fail(code: DiagnosticCode, message: string): never {
    this.#failAt(code, message, this.#index);
  }

  #failAt(code: DiagnosticCode, message: string, index: number): never {
    let line = 1;
    let column = 1;
    for (let current = 0; current < index; current += 1) {
      if (this.#source[current] === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }
    }
    throw new StrictJsonError(code, message, line, column);
  }
}

export function parseStrictJson(source: string): JsonValue {
  return new Parser(source).parse();
}
