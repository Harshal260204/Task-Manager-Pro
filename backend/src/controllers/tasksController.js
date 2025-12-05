import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/tasksService.js'
import { AppError } from '../middleware/errorMiddleware.js'

/**
 * Get all tasks with filtering, search, and pagination
 * @route GET /api/tasks
 */
export const getAllTasks = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.q,
      status: req.query.status,
      priority: req.query.priority,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
    }

    const { tasks, meta } = await getTasks(filters, req.user.id)

    res.status(200).json({
      success: true,
      data: tasks,
      meta,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single task by ID
 * @route GET /api/tasks/:id
 */
export const getSingleTask = async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id, req.user.id)

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new task
 * @route POST /api/tasks
 */
export const createNewTask = async (req, res, next) => {
  try {
    const task = await createTask(req.body, req.user.id)

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a task
 * @route PUT /api/tasks/:id
 */
export const updateExistingTask = async (req, res, next) => {
  try {
    const task = await updateTask(req.params.id, req.body, req.user.id)

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 */
export const deleteExistingTask = async (req, res, next) => {
  try {
    const task = await deleteTask(req.params.id, req.user.id)

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
    })
  } catch (error) {
    next(error)
  }
}

