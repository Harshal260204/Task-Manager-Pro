import User from '../models/userModel.js'
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../services/authService.js'
import { AppError } from '../middleware/errorMiddleware.js'

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new AppError('User with this email already exists', 409)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
    })

    // Generate token
    const token = generateToken(user)

    // Return response (passwordHash is excluded by default due to select: false)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user and include passwordHash (normally excluded)
    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }

    // Generate token
    const token = generateToken(user)

    // Return response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    next(error)
  }
}

