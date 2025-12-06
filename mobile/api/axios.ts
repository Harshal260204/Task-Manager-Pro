import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// IMPORTANT: For Android phone testing, replace 'localhost' with your computer's IP address
// Find your IP: Run 'ipconfig' in PowerShell and look for IPv4 Address
// Example: 'http://192.168.1.100:5000/api'
// For emulator, you can use: 'http://10.0.2.2:5000/api'
const API_URL = 'http://192.168.29.150:5000/api' // Change to your backend URL (use your computer's IP for physical device)

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add Authorization header from AsyncStorage
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
      } catch (storageError) {
        console.error('Error clearing storage:', storageError)
      }
    }

    // Handle network errors
    if (!error.response) {
      error.isNetworkError = true
      error.message = 'Network error. Please check your connection.'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

