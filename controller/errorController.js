const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleAppError = (err, error) => {
  error.message = err.message;
};

const handleDBCastError = (err) => {
  const message = `Invalid "${err.value}" provided, for the field "${err.path}"`;

  return new AppError(message, 400);
};

const handleDBDuplicateError = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(.*)*\1/)[2];

  const message = `Duplicate Field Value : ${value}, Please use another value!!`;

  return new AppError(message, 403);
};

const handleDBValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input Data: ${errors.join('. ')}`;

  return new AppError(message, 403);
};

const handleJWTError = () =>
  new AppError(`Invalid token, Please Log in again!!`, 401);

const handleJWTExpired = () =>
  new AppError(`Token Expires, Please Log in Again!!`, 401);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming or unknown error occured
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

// global error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // separetate error for development and production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    /*
    marking mongoose error as operational
    types 1) Invalid id 2) Duplicate Key error 3) Validation
     */
    let error = JSON.parse(JSON.stringify(err));

    if (error.isOperational) handleAppError(err, error);
    if (error.name === 'CastError') error = handleDBCastError(error);
    else if (error.code === 11000) error = handleDBDuplicateError(error);
    else if (error.name === 'ValidationError')
      error = handleDBValidationError(error);
    else if (error.name === 'JsonWebTokenError') error = handleJWTError();
    else if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, res);
  }
};
