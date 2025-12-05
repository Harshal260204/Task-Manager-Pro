import { createContext, useContext, useReducer, useEffect } from 'react'
import axiosInstance from '../../api/axios'

// Auth context
const AuthContext = createContext(null)

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  SET_LOADING: 'SET_LOADING',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: {
            token,
            user: userData,
          },
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      })

      const { token, user } = response.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user },
      })

      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE })

      const message =
        error.response?.data?.message || 'Login failed. Please try again.'

      return { success: false, message }
    }
  }

  // Register function
  const register = async (name, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })

      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
      })

      const { token, user } = response.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { token, user },
      })

      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE })

      const message =
        error.response?.data?.message || 'Registration failed. Please try again.'

      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err) => err.message)
          .join(', ')
        return { success: false, message: validationErrors }
      }

      return { success: false, message }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider

