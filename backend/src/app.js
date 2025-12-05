import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import tasksRoutes from './routes/tasksRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'

// Load environment variables
dotenv.config()

const app = express()

// Security middleware
app.use(helmet())

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', tasksRoutes)

// 404 handler
app.use(notFoundHandler)

// Global error handling middleware (must be last)
app.use(errorHandler)

export default app


