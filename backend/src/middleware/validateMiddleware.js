/**
 * Middleware to validate request data using Joi schemas
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source]

    const { error, value } = schema.validate(data, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }))

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      })
    }

    // Replace request data with validated and sanitized data
    req[source] = value
    next()
  }
}

