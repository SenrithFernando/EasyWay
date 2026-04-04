import HttpError from './httpError.js';
import fs from 'fs';

export default function errorHandler(error, _req, res, _next) {
  if (error.name === 'ValidationError') {
    const errors = Object.entries(error.errors).reduce((accumulator, [field, detail]) => {
      accumulator[field] = detail.message;
      return accumulator;
    }, {});

    console.error('VALIDATION_ERROR:', errors);
    try {
      const logPath = 'c:/Users/Dumini/Desktop/SLIIT/Year 3/ITPM/Feedback Management/EasyWay/backend/error_log.txt';
      fs.appendFileSync(logPath, `\n\n[${new Date().toISOString()}] VALIDATION_ERROR: ${JSON.stringify(errors)}\n`);
    } catch (err) {
      console.error('Failed to write to error_log.txt:', err);
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate feedback is not allowed for the same order.',
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
  }

  console.error('\n\n>>> BACKEND_ERROR_START >>>');
  console.error(error);
  console.error('>>> BACKEND_ERROR_END >>>\n\n');

  try {
    const logPath = './error_log.txt';
    fs.appendFileSync(logPath, `\n\n[${new Date().toISOString()}] ${error.message}\n${error.stack}\n`);
  } catch (err) {
    console.error('Failed to write to error_log.txt:', err);
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
}
