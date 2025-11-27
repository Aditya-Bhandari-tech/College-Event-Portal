// utils/apiResponse.js

// For successful responses
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// For error responses
export const sendError = (
  res,
  message,
  statusCode = 400,
  errors = null // optional details (validation errors, missing fields, etc.)
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
