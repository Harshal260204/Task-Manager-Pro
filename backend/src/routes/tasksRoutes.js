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
  createTaskValidator,
  updateTaskValidator,
  taskQueryValidator,
  handleValidationErrors,
} from '../validators/taskValidator.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filtering, search, and pagination
 * @access  Private
 */
router.get(
  '/',
  taskQueryValidator,
  handleValidationErrors,
  getAllTasks
)

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
router.post(
  '/',
  createTaskValidator,
  handleValidationErrors,
  createNewTask
)

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put(
  '/:id',
  updateTaskValidator,
  handleValidationErrors,
  updateExistingTask
)

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', deleteExistingTask)

export default router

