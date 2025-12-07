import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material'
import Button from '../../components/ui/Button'

const TaskForm = ({ open, onClose, task, onSubmit, isSubmitting }) => {
  const isEdit = !!task
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'med',
    dueDate: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'med',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'med',
        dueDate: '',
      })
    }
    setErrors({})
  }, [task, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    // Validate title
    const trimmedTitle = formData.title.trim()
    if (!trimmedTitle) {
      newErrors.title = 'Title is required'
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters'
    }

    // Validate description
    const trimmedDescription = formData.description.trim()
    if (!trimmedDescription) {
      newErrors.description = 'Description is required'
    } else if (trimmedDescription.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters'
    }

    // Validate status
    if (!formData.status || !['todo', 'in-progress', 'done'].includes(formData.status)) {
      newErrors.status = 'Status is required and must be valid'
    }

    // Validate priority
    if (!formData.priority || !['low', 'med', 'high'].includes(formData.priority)) {
      newErrors.priority = 'Priority is required and must be valid'
    }

    // Validate due date
    if (!formData.dueDate || !formData.dueDate.trim()) {
      newErrors.dueDate = 'Due date is required'
    } else {
      // Validate that due date is not in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(formData.dueDate)
      selectedDate.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validation = validate()
    if (!validation.isValid) {
      // Errors are already displayed inline with Material-UI error states and helperText
      return
    }

    // Double-check all required fields (defensive programming)
    const trimmedTitle = formData.title.trim()
    const trimmedDescription = formData.description.trim()
    
    if (!trimmedTitle || !trimmedDescription || !formData.status || !formData.priority || !formData.dueDate) {
      // Re-validate to show inline errors
      validate()
      return
    }

    const submitData = {
      title: trimmedTitle,
      description: trimmedDescription,
      status: formData.status,
      priority: formData.priority,
      dueDate: new Date(formData.dueDate).toISOString(), // Required field, always present after validation
    }

    onSubmit(submitData)
  }

  const handleKeyDown = (e) => {
    // Allow form submission with Enter key
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      onKeyDown={handleKeyDown}
      aria-labelledby="task-form-dialog-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="task-form-dialog-title">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.title}
              helperText={errors.title}
              autoFocus
              disabled={isSubmitting}
              inputProps={{
                'aria-label': 'Task title',
              }}
            />

            <TextField
              fullWidth
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
              error={!!errors.description}
              helperText={errors.description}
              disabled={isSubmitting}
              inputProps={{
                'aria-label': 'Task description',
              }}
            />

            <Box display="flex" gap={2} mt={2}>
              <TextField
                fullWidth
                select
                label="Status *"
                name="status"
                value={formData.status}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.status}
                helperText={errors.status}
                disabled={isSubmitting}
                inputProps={{
                  'aria-label': 'Task status',
                }}
              >
                <MenuItem value="todo">Todo</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="Priority *"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.priority}
                helperText={errors.priority}
                disabled={isSubmitting}
                inputProps={{
                  'aria-label': 'Task priority',
                }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="med">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Box>

            <TextField
              fullWidth
              label="Due Date *"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.dueDate}
              helperText={errors.dueDate}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={isSubmitting}
              inputProps={{
                'aria-label': 'Task due date',
                min: new Date().toISOString().split('T')[0], // Prevent past dates
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            aria-label={isEdit ? 'Update task' : 'Create task'}
          >
            {isSubmitting
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
              ? 'Update'
              : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TaskForm
