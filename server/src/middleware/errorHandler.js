/**
 * Central JSON error response for the API (Express 4-arg error middleware).
 */

/**
 * @param {unknown} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number"
      ? err.status
      : 500;
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Internal Server Error";
  res.status(status).json({ error: message });
}
