/**
 * Global error-handling middleware.
 * Catches all errors forwarded via next(error).
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    err.statusCode = 400;
    err.message = `Validation failed: ${messages.join('. ')}`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    err.statusCode = 400;
    err.message = `Duplicate value for field(s): ${field}. Please use a different value.`;
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export default errorHandler;
