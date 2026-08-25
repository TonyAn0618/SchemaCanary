import { link, rename, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { OperationError } from "../core/errors.js";

export interface WriteReportOptions {
  cwd: string;
  force: boolean;
  protectedInputPath?: string;
}

async function assertOutputIsNotInput(
  resolvedOutputPath: string,
  protectedInputPath: string | undefined,
): Promise<void> {
  if (protectedInputPath === undefined) {
    return;
  }

  const resolvedInputPath = resolve(protectedInputPath);
  if (resolvedOutputPath === resolvedInputPath) {
    throw new OperationError(
      "OUTPUT_INPUT_CONFLICT",
      "The output path cannot be the same as the input schema, even with --force.",
    );
  }

  try {
    const [inputStats, outputStats] = await Promise.all([
      stat(resolvedInputPath),
      stat(resolvedOutputPath),
    ]);
    if (inputStats.dev === outputStats.dev && inputStats.ino === outputStats.ino) {
      throw new OperationError(
        "OUTPUT_INPUT_CONFLICT",
        "The output path cannot refer to the input schema, even through a file alias.",
      );
    }
  } catch (error) {
    if (error instanceof OperationError) {
      throw error;
    }
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") {
      return;
    }
    throw error;
  }
}

export async function writeReportFile(
  outputPath: string,
  content: string,
  options: WriteReportOptions,
): Promise<void> {
  const resolvedPath = resolve(options.cwd, outputPath);
  try {
    await assertOutputIsNotInput(resolvedPath, options.protectedInputPath);
    const temporaryPath = resolve(
      dirname(resolvedPath),
      `.${basename(resolvedPath)}.${process.pid}.${randomUUID()}.tmp`,
    );
    try {
      await writeFile(temporaryPath, content, { encoding: "utf8", flag: "wx", mode: 0o600 });
      // Check again immediately before publication to reduce the chance that a path alias changed
      // while the report was being prepared.
      await assertOutputIsNotInput(resolvedPath, options.protectedInputPath);
      if (options.force) {
        await rename(temporaryPath, resolvedPath);
      } else {
        try {
          await link(temporaryPath, resolvedPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "EEXIST") {
            throw new OperationError(
              "OUTPUT_EXISTS",
              `Output already exists; pass --force to replace it: ${outputPath}`,
              { cause: error },
            );
          }
          throw error;
        }
        await unlink(temporaryPath);
      }
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    if (error instanceof OperationError) {
      throw error;
    }
    throw new OperationError("OUTPUT_WRITE_ERROR", `Cannot write output file: ${outputPath}`, {
      cause: error,
    });
  }
}
