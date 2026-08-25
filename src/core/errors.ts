export type OperationErrorCode =
  | "CLI_USAGE_ERROR"
  | "INPUT_NOT_FOUND"
  | "INPUT_NOT_FILE"
  | "INPUT_UNREADABLE"
  | "INPUT_INVALID_UTF8"
  | "INPUT_TOO_LARGE"
  | "OUTPUT_EXISTS"
  | "OUTPUT_INPUT_CONFLICT"
  | "OUTPUT_WRITE_ERROR";

export class OperationError extends Error {
  readonly code: OperationErrorCode;

  constructor(code: OperationErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OperationError";
    this.code = code;
  }
}
