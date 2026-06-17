export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  return res.status(status).json({
    error: error.publicMessage || "Something went wrong",
    requestId: req.headers["x-request-id"] || null
  });
}
