import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  TextField,
  Grid,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Skeleton,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { useTasks } from '../../hooks/useTasks'
import { useDebounce } from '../../hooks/useDebounce'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import Button from '../../components/ui/Button'

const TaskList = () => {
  const {
    tasks,
    loading,
    error,
    meta,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500)

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      page,
      limit,
      sortBy,
    })
  }, [debouncedSearch, statusFilter, priorityFilter, page, limit, sortBy, fetchTasks])

  const handleCreate = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)

    try {
      let result
      if (editingTask) {
        result = await updateTask(editingTask._id, formData)
      } else {
        result = await createTask(formData)
      }

      if (result.success) {
        setFormOpen(false)
        setEditingTask(null)
        // Refetch to get updated list
        fetchTasks({
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          page,
          limit,
          sortBy,
        })
      }
    } catch (err) {
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return

    setIsSubmitting(true)
    const result = await deleteTask(taskToDelete._id)

    if (result.success) {
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
      // Refetch to get updated list
      fetchTasks({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit,
        sortBy,
      })
    }

    setIsSubmitting(false)
  }

  const handlePageChange = (event, value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
    setPage(1)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1">
            My Tasks
          </Typography>
          <Tooltip title="Create new task">
            <IconButton
              color="primary"
              onClick={handleCreate}
              aria-label="create new task"
              size="large"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1) // Reset to first page on search
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                aria-label="Search tasks"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  label="Status"
                  aria-label="Filter by status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="todo">Todo</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value)
                    setPage(1)
                  }}
                  label="Priority"
                  aria-label="Filter by priority"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="med">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  aria-label="Sort tasks"
                >
                  <MenuItem value="createdAt">Newest</MenuItem>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                fullWidth
                aria-label="Clear filters"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Error Message */}
      {error && (
        <Box mb={3}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* Task Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : tasks.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {search || statusFilter || priorityFilter
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </Typography>
          {!search && !statusFilter && !priorityFilter && (
            <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
              Create Task
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <TaskCard
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {meta.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={meta.pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                aria-label="Task pagination"
              />
            </Box>
          )}

          {/* Pagination Info */}
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {tasks.length} of {meta.total} tasks
            </Typography>
          </Box>
        </>
      )}

      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!isSubmitting) {
            setDeleteDialogOpen(false)
            setTaskToDelete(null)
          }
        }}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{taskToDelete?.title}"? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              setTaskToDelete(null)
            }}
            disabled={isSubmitting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isSubmitting}
            variant="contained"
            color="error"
            aria-label="Confirm delete task"
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TaskList

