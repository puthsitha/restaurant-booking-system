// Thrown anywhere in the request lifecycle to signal a specific HTTP status;
// caught and rendered by the centralized error handler in errorHandler.ts.
export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
