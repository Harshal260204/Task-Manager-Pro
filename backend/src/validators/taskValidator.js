import { body, query, validationResult } from 'express-validator'

/**
 * Validation rules for creating a task
 */
export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),

  body('priority')
    .optional()
    .isIn(['low', 'med', 'high'])
    .withMessage('Priority must be one of: low, med, high'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
]

/**
 * Validation rules for updating a task
 */
export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),

  body('priority')
    .optional()
    .isIn(['low', 'med', 'high'])
    .withMessage('Priority must be one of: low, med, high'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
]

/**
 * Validation rules for task query parameters
 */
export const taskQueryValidator = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),

  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),

  query('priority')
    .optional()
    .isIn(['low', 'med', 'high'])
    .withMessage('Priority must be one of: low, med, high'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'dueDate', 'title', 'priority', 'status'])
    .withMessage(
      'SortBy must be one of: createdAt, dueDate, title, priority, status'
    ),
]

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
      })),
    })
  }

  next()
}

