import dotenv from 'dotenv'

dotenv.config()

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0]
  const message = `${field} already exists`
  return new AppError(message, 409)
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => ({
    field: error.path,
    message: error.message,
  }))

  return {
    status: 'error',
    message: 'Validation failed',
    errors,
  }
}

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401)
}

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401)
}

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
    error: err,
    stack: err.stack,
  })
}

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
    })
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err)

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    })
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  })

  // Handle specific error types
  if (err.name === 'CastError') {
    err = handleCastError(err)
  }

  if (err.code === 11000) {
    err = handleDuplicateKeyError(err)
  }

  if (err.name === 'ValidationError') {
    const validationError = handleValidationError(err)
    return res.status(400).json(validationError)
  }

  if (err.name === 'JsonWebTokenError') {
    err = handleJWTError()
  }

  if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError()
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else {
    sendErrorProd(err, res)
  }
}

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  })
}

