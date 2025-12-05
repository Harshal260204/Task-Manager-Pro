import Joi from 'joi'

/**
 * Joi schema for user registration
 */
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().email().trim().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
})

/**
 * Joi schema for user login
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
})

