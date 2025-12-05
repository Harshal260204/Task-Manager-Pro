import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import {
  getAllTasks,
  getSingleTask,
  createNewTask,
  updateExistingTask,
  deleteExistingTask,
} from '../controllers/tasksController.js'
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/taskSchemas.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering, search, and pagination
 * @access  Private
 */
router.get('/', validate(taskQuerySchema, 'query'), getAllTasks)

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', getSingleTask)

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validate(createTaskSchema, 'body'), createNewTask)

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', validate(updateTaskSchema, 'body'), updateExistingTask)

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', deleteExistingTask)

export default router

