import { verifyToken } from '../services/authService.js'
import User from '../models/userModel.js'

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header must start with "Bearer "',
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      })
    }

    // Verify token
    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      })
    }

    // Find user and attach to request
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
    }

    next()
  } catch (error) {
    next(error)
  }
}

