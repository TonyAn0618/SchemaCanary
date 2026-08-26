import { readFile, stat } from "node:fs/promises";
import type { Stats } from "node:fs";
import { basename, isAbsolute, normalize, relative, resolve } from "node:path";

import { OperationError } from "./errors.js";

export const MAX_SCHEMA_BYTES = 1024 * 1024;

export interface SchemaInput {
  displayPath: string;
  sizeBytes: number;
  text: string;
}

function displayPath(inputPath: string, resolvedPath: string, cwd: string): string {
  if (!isAbsolute(inputPath)) {
    return normalize(inputPath);
  }

  const localPath = relative(cwd, resolvedPath);
  if (localPath !== "" && !localPath.startsWith("..") && !isAbsolute(localPath)) {
    return localPath;
  }
  return basename(resolvedPath);
}

export async function readSchemaInput(
  inputPath: string,
  cwd: string,
  maxBytes = MAX_SCHEMA_BYTES,
): Promise<SchemaInput> {
  const resolvedPath = resolve(cwd, inputPath);
  let fileStats: Stats;
  try {
    fileStats = await stat(resolvedPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new OperationError("INPUT_NOT_FOUND", `Input file not found: ${inputPath}`, {
        cause: error,
      });
    }
    throw new OperationError("INPUT_UNREADABLE", `Cannot inspect input file: ${inputPath}`, {
      cause: error,
    });
  }

  if (!fileStats.isFile()) {
    throw new OperationError("INPUT_NOT_FILE", `Input path is not a regular file: ${inputPath}`);
  }
  if (fileStats.size > maxBytes) {
    throw new OperationError(
      "INPUT_TOO_LARGE",
      `Input is ${fileStats.size} bytes; the limit is ${maxBytes} bytes.`,
    );
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(resolvedPath);
  } catch (error) {
    throw new OperationError("INPUT_UNREADABLE", `Cannot read input file: ${inputPath}`, {
      cause: error,
    });
  }
  if (bytes.byteLength > maxBytes) {
    throw new OperationError(
      "INPUT_TOO_LARGE",
      `Input is ${bytes.byteLength} bytes; the limit is ${maxBytes} bytes.`,
    );
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new OperationError("INPUT_INVALID_UTF8", `Input is not valid UTF-8: ${inputPath}`, {
      cause: error,
    });
  }
  if (text.startsWith("\uFEFF")) {
    text = text.slice(1);
  }

  return {
    displayPath: displayPath(inputPath, resolvedPath, cwd),
    sizeBytes: bytes.byteLength,
    text,
  };
}
