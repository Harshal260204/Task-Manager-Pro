import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CardActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'default'
      case 'in-progress':
        return 'primary'
      case 'done':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'info'
      case 'med':
        return 'warning'
      case 'high':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && task.status !== 'done'
  }

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {task.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={task.status}
              color={getStatusColor(task.status)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={task.priority}
              color={getPriorityColor(task.priority)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </Box>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </Typography>
        )}

        {task.dueDate && (
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            sx={{
              color: isOverdue(task.dueDate) ? 'error.main' : 'text.secondary',
            }}
          >
            <CalendarTodayIcon fontSize="small" />
            <Typography
              variant="caption"
              sx={{
                fontWeight: isOverdue(task.dueDate) ? 600 : 400,
              }}
            >
              {formatDate(task.dueDate)}
              {isOverdue(task.dueDate) && ' (Overdue)'}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit task">
          <IconButton
            aria-label="edit task"
            color="primary"
            onClick={() => onEdit(task)}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete task">
          <IconButton
            aria-label="delete task"
            color="error"
            onClick={() => onDelete(task)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

export default TaskCard
