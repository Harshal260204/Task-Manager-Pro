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
import { toast } from 'react-toastify'

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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters'
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const submitData = {
      ...formData,
      dueDate: formData.dueDate || undefined,
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
      <form onSubmit={handleSubmit}>
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
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
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
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                margin="normal"
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
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                margin="normal"
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
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              disabled={isSubmitting}
              inputProps={{
                'aria-label': 'Task due date',
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
