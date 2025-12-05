import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import { CircularProgress, Box, Container } from '@mui/material'

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth

