/**
 * Wraps async route handlers so rejected promises are forwarded to Express error middleware.
 */

/**
 * @template {import('express').Request} Req
 * @template {import('express').Response} Res
 * @param {(req: Req, res: Res, next: import('express').NextFunction) => Promise<unknown>} fn
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
