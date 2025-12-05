import Task from '../models/taskModel.js'
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js'

/**
 * Build query filter for tasks
 * @param {Object} filters - Filter parameters
 * @param {string} ownerId - Owner ID to filter by
 * @returns {Object} MongoDB query object
 */
const buildTaskFilter = (filters, ownerId) => {
  const query = { owner: ownerId }

  // Status filter
  if (filters.status) {
    query.status = filters.status
  }

  // Priority filter
  if (filters.priority) {
    query.priority = filters.priority
  }

  // Text search (using MongoDB text index)
  if (filters.search) {
    query.$text = { $search: filters.search }
  }

  return query
}

/**
 * Build sort object
 * @param {string} sortBy - Field to sort by
 * @returns {Object} Sort object
 */
const buildSort = (sortBy) => {
  const sortOptions = {
    createdAt: { createdAt: -1 }, // Newest first
    dueDate: { dueDate: 1 }, // Earliest first
    title: { title: 1 }, // Alphabetical
    priority: { priority: -1 }, // High to low (high, med, low)
    status: { status: 1 }, // Alphabetical
  }

  return sortOptions[sortBy] || sortOptions.createdAt
}

/**
 * Get tasks with filtering, pagination, and search
 * @param {Object} filters - Filter parameters
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object>} Tasks and pagination metadata
 */
export const getTasks = async (filters, ownerId) => {
  const { page, limit, skip } = getPaginationParams(filters)
  const query = buildTaskFilter(filters, ownerId)
  const sort = buildSort(filters.sortBy)

  // Build projection to limit fields (exclude __v)
  const projection = {
    __v: 0,
  }

  // Execute query with lean for better performance
  const [tasks, total] = await Promise.all([
    Task.find(query, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Task.countDocuments(query),
  ])

  const meta = getPaginationMeta(total, page, limit)

  return {
    tasks,
    meta,
  }
}

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object|null>} Task or null if not found
 */
export const getTaskById = async (taskId, ownerId) => {
  return await Task.findOne({ _id: taskId, owner: ownerId })
    .lean()
    .exec()
}

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData, ownerId) => {
  const task = await Task.create({
    ...taskData,
    owner: ownerId,
  })

  return task.toObject()
}

/**
 * Update a task
 * @param {string} taskId - Task ID
 * @param {Object} updateData - Update data
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
export const updateTask = async (taskId, updateData, ownerId) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, owner: ownerId },
    updateData,
    {
      new: true,
      runValidators: true,
      lean: true,
    }
  )

  return task
}

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object|null>} Deleted task or null if not found
 */
export const deleteTask = async (taskId, ownerId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, owner: ownerId })
  return task ? task.toObject() : null
}

