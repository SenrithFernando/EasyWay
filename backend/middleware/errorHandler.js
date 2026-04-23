import HttpError from './httpError.js';
import fs from 'fs';

/**
 * Global error-handling middleware.
 * Catches all errors forwarded via next(error).
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log to console for debugging
  console.error('\n\n>>> BACKEND_ERROR_START >>>');
  console.error(err);
  console.error('>>> BACKEND_ERROR_END >>>\n\n');

  // Log to file
  try {
    const logPath = './error_log.txt';
    fs.appendFileSync(logPath, `\n\n[${new Date().toISOString()}] ${err.message}\n${err.stack}\n`);
  } catch (logErr) {
    console.error('Failed to write to error_log.txt:', logErr);
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const detailedErrors = Object.entries(err.errors).reduce((acc, [field, detail]) => {
      acc[field] = detail.message;
      return acc;
    }, {});
    
    err.statusCode = 400;
    err.message = 'Validation failed.';
    
    return res.status(400).json({
      success: false,
      status: 'error',
      message: err.message,
      errors: detailedErrors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    err.statusCode = 409;
    if (err.keyValue) {
      err.message = `Duplicate value for field(s): ${Object.keys(err.keyValue).join(', ')}. Please use a different value.`;
    } else {
      err.message = 'Duplicate entry discovered.';
    }
  }

  // HttpError check (custom error class used in feedback module)
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      status: 'error',
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Final response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.statusCode === 500 ? 'Internal server error.' : err.message,
  });
};

export default errorHandler;
