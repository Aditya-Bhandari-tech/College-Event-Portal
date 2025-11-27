// middleware/errorHandler.js
import { sendError } from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);

  // If response already sent, just end
  if (res.headersSent) {
    return next(err);
  }

  // Known custom fields (optional if you add them later)
  const statusCode = err.statusCode || 500;
  const message =
    err.message || "Something went wrong. Please try again later.";

  return sendError(res, message, statusCode);
};

export default errorHandler;
