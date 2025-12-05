import { Box, AppBar, Toolbar, Typography, Button as MuiButton } from '@mui/material'
import { useAuth } from '../features/auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import TaskList from '../features/tasks/TaskList'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager Pro
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <MuiButton color="inherit" onClick={handleLogout}>
            Logout
          </MuiButton>
        </Toolbar>
      </AppBar>
      <TaskList />
    </Box>
  )
}

export default Dashboard

