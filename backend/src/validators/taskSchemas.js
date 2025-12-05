import Joi from 'joi'

/**
 * Joi schema for creating a task
 */
export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),

  description: Joi.string().trim().max(1000).allow('').optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),

  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .optional()
    .messages({
      'any.only': 'Status must be one of: todo, in-progress, done',
    }),

  priority: Joi.string().valid('low', 'med', 'high').optional().messages({
    'any.only': 'Priority must be one of: low, med, high',
  }),

  dueDate: Joi.date().iso().optional().messages({
    'date.format': 'Due date must be a valid ISO 8601 date',
  }),
})

/**
 * Joi schema for updating a task
 */
export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters',
  }),

  description: Joi.string().trim().max(1000).allow('').optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),

  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .optional()
    .messages({
      'any.only': 'Status must be one of: todo, in-progress, done',
    }),

  priority: Joi.string().valid('low', 'med', 'high').optional().messages({
    'any.only': 'Priority must be one of: low, med, high',
  }),

  dueDate: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Due date must be a valid ISO 8601 date',
  }),
})

/**
 * Joi schema for task query parameters
 */
export const taskQuerySchema = Joi.object({
  q: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Search query must not exceed 100 characters',
  }),

  status: Joi.string()
    .valid('todo', 'in-progress', 'done')
    .optional()
    .messages({
      'any.only': 'Status must be one of: todo, in-progress, done',
    }),

  priority: Joi.string().valid('low', 'med', 'high').optional().messages({
    'any.only': 'Priority must be one of: low, med, high',
  }),

  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),

  sortBy: Joi.string()
    .valid('createdAt', 'dueDate', 'title', 'priority', 'status')
    .optional()
    .messages({
      'any.only':
        'SortBy must be one of: createdAt, dueDate, title, priority, status',
    }),
})

