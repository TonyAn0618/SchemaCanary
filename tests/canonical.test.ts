import { describe, expect, test } from "vitest";

import { canonicalizeAndHash } from "../src/core/canonical.js";
import { parseStrictJson } from "../src/core/strict-json.js";

describe("canonicalizeAndHash", () => {
  test("matches the RFC 8785 serialization example", () => {
    const input = String.raw`{"numbers":[333333333.33333329,1E30,4.50,2e-3,0.000000000000000000000000001],"string":"€$\u000f\nA'B\"\\\\\"/","literals":[null,true,false]}`;
    const expected =
      '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\\\\\"/"}';

    expect(canonicalizeAndHash(parseStrictJson(input)).text).toBe(expected);
  });

  test("ignores object key order and whitespace", () => {
    const first = canonicalizeAndHash(parseStrictJson('{"b":2,"a":1}'));
    const second = canonicalizeAndHash(parseStrictJson('{\n  "a": 1,\n  "b": 2\n}'));

    expect(first.text).toBe('{"a":1,"b":2}');
    expect(first.digest).toBe(second.digest);
  });

  test("preserves array order", () => {
    const first = canonicalizeAndHash(parseStrictJson("[1,2]"));
    const second = canonicalizeAndHash(parseStrictJson("[2,1]"));

    expect(first.digest).not.toBe(second.digest);
  });

  test("rejects non-finite numbers and unpaired surrogates from direct API callers", () => {
    expect(() => canonicalizeAndHash(Number.NaN)).toThrow(/non-finite/);
    expect(() => canonicalizeAndHash("\uD800")).toThrow(/unpaired high surrogate/);
  });
});
