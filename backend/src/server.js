import app from './app.js'
import connectDB from './config/db.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  // Close server & exit process
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})


