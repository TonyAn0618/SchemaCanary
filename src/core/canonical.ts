import { createHash } from "node:crypto";

import type { JsonValue } from "./types.js";

function assertValidUnicode(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (Number.isNaN(next) || next < 0xdc00 || next > 0xdfff) {
        throw new TypeError("Canonical JSON cannot contain an unpaired high surrogate.");
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError("Canonical JSON cannot contain an unpaired low surrogate.");
    }
  }
}

function serialize(value: JsonValue): string {
  if (typeof value === "string") {
    assertValidUnicode(value);
    return JSON.stringify(value);
  }
  if (value === null || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Canonical JSON cannot contain a non-finite number.");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => serialize(item)).join(",")}]`;
  }

  const properties = Object.keys(value)
    .sort()
    .map((key) => {
      assertValidUnicode(key);
      return `${JSON.stringify(key)}:${serialize(value[key] as JsonValue)}`;
    });
  return `{${properties.join(",")}}`;
}

export interface CanonicalIdentity {
  text: string;
  digest: string;
  sizeBytes: number;
}

export function canonicalizeAndHash(value: JsonValue): CanonicalIdentity {
  const text = serialize(value);
  const bytes = Buffer.from(text, "utf8");
  return {
    text,
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    sizeBytes: bytes.byteLength,
  };
}
