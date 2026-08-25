import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { runCli, type CliRuntime } from "../src/cli/run.js";

const temporaryDirectories: string[] = [];

function writer(target: string[]): CliRuntime["stdout"] {
  return {
    write(chunk) {
      target.push(String(chunk));
      return true;
    },
  };
}

async function setup() {
  const cwd = await mkdtemp(join(tmpdir(), "schemacanary-cli-"));
  temporaryDirectories.push(cwd);
  await writeFile(join(cwd, "valid.json"), '{"type":"object"}', "utf8");
  await writeFile(join(cwd, "invalid.json"), '{"required":"name"}', "utf8");
  return cwd;
}

function runtime(cwd: string, stdout: string[], stderr: string[]): Partial<CliRuntime> {
  return {
    cwd,
    stdout: writer(stdout),
    stderr: writer(stderr),
    now: () => new Date("2026-08-25T12:00:00.000Z"),
    toolVersion: "0.0.0-test",
    debug: false,
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("runCli", () => {
  test("writes clean JSON to stdout and exits zero for a valid schema", async () => {
    const cwd = await setup();
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runCli(
      ["inspect", "valid.json", "--format", "json"],
      runtime(cwd, stdout, stderr),
    );

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(JSON.parse(stdout.join(""))).toEqual(expect.objectContaining({ outcome: "valid" }));
  });

  test("exits one when inspection finds a schema problem", async () => {
    const cwd = await setup();
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runCli(
      ["inspect", "invalid.json", "--format", "json"],
      runtime(cwd, stdout, stderr),
    );

    expect(exitCode).toBe(1);
    expect(JSON.parse(stdout.join(""))).toEqual(
      expect.objectContaining({ outcome: "invalid_schema" }),
    );
  });

  test("does not overwrite output unless force is explicit", async () => {
    const cwd = await setup();
    const output = join(cwd, "report.json");
    await writeFile(output, "keep-me", "utf8");
    const stdout: string[] = [];
    const stderr: string[] = [];

    const refused = await runCli(
      ["inspect", "valid.json", "--format", "json", "--output", "report.json"],
      runtime(cwd, stdout, stderr),
    );
    expect(refused).toBe(2);
    expect(await readFile(output, "utf8")).toBe("keep-me");

    const replaced = await runCli(
      ["inspect", "valid.json", "--format", "json", "--output", "report.json", "--force"],
      runtime(cwd, stdout, stderr),
    );
    expect(replaced).toBe(0);
    expect(JSON.parse(await readFile(output, "utf8"))).toEqual(
      expect.objectContaining({ outcome: "valid" }),
    );
  });

  test("never allows the report to replace the input schema", async () => {
    const cwd = await setup();
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runCli(
      ["inspect", "valid.json", "--output", "valid.json", "--force"],
      runtime(cwd, stdout, stderr),
    );

    expect(exitCode).toBe(2);
    expect(await readFile(join(cwd, "valid.json"), "utf8")).toBe('{"type":"object"}');
  });

  test.skipIf(process.platform === "win32")(
    "never replaces an input schema reached through a symbolic-link alias",
    async () => {
      const cwd = await setup();
      await symlink("valid.json", join(cwd, "valid-link.json"));
      const stdout: string[] = [];
      const stderr: string[] = [];

      const exitCode = await runCli(
        ["inspect", "valid-link.json", "--output", "valid.json", "--force"],
        runtime(cwd, stdout, stderr),
      );

      expect(exitCode).toBe(2);
      expect(stderr.join("")).toContain("OUTPUT_INPUT_CONFLICT");
      expect(await readFile(join(cwd, "valid.json"), "utf8")).toBe('{"type":"object"}');
    },
  );

  test("classifies missing, invalid UTF-8, and oversized input as operation errors", async () => {
    const cwd = await setup();
    const stdout: string[] = [];
    const stderr: string[] = [];

    expect(await runCli(["inspect", "missing.json"], runtime(cwd, stdout, stderr))).toBe(2);

    await writeFile(join(cwd, "invalid-utf8.json"), Buffer.from([0xff]));
    expect(await runCli(["inspect", "invalid-utf8.json"], runtime(cwd, stdout, stderr))).toBe(2);

    await writeFile(join(cwd, "oversized.json"), Buffer.alloc(1024 * 1024 + 1, 0x20));
    expect(await runCli(["inspect", "oversized.json"], runtime(cwd, stdout, stderr))).toBe(2);

    expect(stdout).toEqual([]);
    expect(stderr.join("")).toContain("INPUT_NOT_FOUND");
    expect(stderr.join("")).toContain("INPUT_INVALID_UTF8");
    expect(stderr.join("")).toContain("INPUT_TOO_LARGE");
  });

  test("help and version do not require an input file", async () => {
    const cwd = await setup();
    const stdout: string[] = [];
    const stderr: string[] = [];

    expect(await runCli(["--help"], runtime(cwd, stdout, stderr))).toBe(0);
    expect(await runCli(["--version"], runtime(cwd, stdout, stderr))).toBe(0);
    expect(stdout.join("")).toContain("schemacanary inspect");
    expect(stdout.join("")).toContain("0.0.0-test");
  });
});
