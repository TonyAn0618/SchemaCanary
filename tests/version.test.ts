import { readFile } from "node:fs/promises";

import { expect, test } from "vitest";

import { TOOL_VERSION } from "../src/version.js";

test("the CLI version matches package.json", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ) as { version: string };

  expect(TOOL_VERSION).toBe(packageJson.version);
});
