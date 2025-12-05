import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'med', 'high'],
      default: 'med',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
)

// Text index on title and description for search functionality
taskSchema.index({ title: 'text', description: 'text' })

// Index on owner for faster queries
taskSchema.index({ owner: 1 })

// Index on status for filtering
taskSchema.index({ status: 1 })

// Index on priority for sorting/filtering
taskSchema.index({ priority: 1 })

// Compound index for owner and status (common query pattern)
taskSchema.index({ owner: 1, status: 1 })

const Task = mongoose.model('Task', taskSchema)

export default Task

