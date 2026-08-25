import { describe, expect, test } from "vitest";

import { parseStrictJson, type StrictJsonError } from "../src/core/strict-json.js";

describe("parseStrictJson", () => {
  test("parses ordinary JSON and preserves special property names", () => {
    const value = parseStrictJson('{"__proto__":{"safe":true},"items":[1,null,false]}');

    expect(Object.keys(value as object)).toEqual(["__proto__", "items"]);
    expect(JSON.stringify(value)).toBe('{"__proto__":{"safe":true},"items":[1,null,false]}');
  });

  test("rejects duplicate object keys with a stable diagnostic", () => {
    expect(() => parseStrictJson('{"name":"first","name":"second"}')).toThrowError(
      expect.objectContaining<Partial<StrictJsonError>>({
        code: "JSON_DUPLICATE_KEY",
        line: 1,
        column: 17,
      }),
    );
  });

  test("rejects trailing commas", () => {
    expect(() => parseStrictJson('{"name":"Ada",}')).toThrowError(
      expect.objectContaining<Partial<StrictJsonError>>({ code: "JSON_SYNTAX_ERROR" }),
    );
  });

  test("rejects unpaired Unicode surrogates", () => {
    expect(() => parseStrictJson('{"value":"\\uD800"}')).toThrowError(
      expect.objectContaining<Partial<StrictJsonError>>({ code: "JSON_INVALID_UNICODE" }),
    );
  });

  test("rejects numbers outside finite IEEE-754 range", () => {
    expect(() => parseStrictJson('{"value":1e400}')).toThrowError(
      expect.objectContaining<Partial<StrictJsonError>>({ code: "JSON_NON_FINITE_NUMBER" }),
    );
  });
});
