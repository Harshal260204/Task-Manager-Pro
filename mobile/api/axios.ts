import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// IMPORTANT: For Android phone testing, replace 'localhost' with your computer's IP address
// Find your IP: Run 'ipconfig' in PowerShell and look for IPv4 Address
// Example: 'http://192.168.1.100:5000/api'
// For emulator, you can use: 'http://10.0.2.2:5000/api'
// 
// ⚠️ DO NOT USE 'localhost' on physical devices - it won't work!
// Use your computer's local IP address instead (e.g., 192.168.1.144)
const API_URL = 'http://192.168.1.144:5000/api' // Change to your backend URL (use your computer's IP for physical device)

console.log('🔗 API Configuration:')
console.log('  Base URL:', API_URL)
console.log('  Full URL Example:', `${API_URL}/auth/login`)

// Warning check for localhost on mobile
if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
  console.warn('⚠️ WARNING: Using localhost/127.0.0.1 will NOT work on physical Android devices!')
  console.warn('⚠️ Please change API_URL to your computer\'s IP address (e.g., http://192.168.1.144:5000/api)')
  console.warn('⚠️ Find your IP: Run "ipconfig" in PowerShell and look for IPv4 Address')
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout (increased for debugging)
})

// Request interceptor to add Authorization header from AsyncStorage
axiosInstance.interceptors.request.use(
  async (config) => {
    const timestamp = new Date().toISOString()
    console.log(`\n📤 [${timestamp}] REQUEST:`)
    console.log('  Method:', config.method?.toUpperCase())
    console.log('  URL:', config.url)
    console.log('  Full URL:', `${config.baseURL}${config.url}`)
    console.log('  Headers:', JSON.stringify(config.headers, null, 2))
    if (config.data) {
      const dataCopy = { ...config.data }
      if (dataCopy.password) dataCopy.password = '***HIDDEN***'
      console.log('  Data:', JSON.stringify(dataCopy, null, 2))
    }
    
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('  Token: Added (Bearer token)')
      } else {
        console.log('  Token: None (not authenticated)')
      }
    } catch (error) {
      console.error('❌ Error getting token from AsyncStorage:', error)
    }
    
    return config
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString()
    console.log(`\n✅ [${timestamp}] RESPONSE:`)
    console.log('  Status:', response.status, response.statusText)
    console.log('  URL:', response.config.url)
    console.log('  Data:', JSON.stringify(response.data, null, 2))
    return response
  },
  async (error) => {
    const timestamp = new Date().toISOString()
    console.log(`\n❌ [${timestamp}] ERROR:`)
    
    if (error.response) {
      // Server responded with error status
      console.log('  Status:', error.response.status, error.response.statusText)
      console.log('  URL:', error.config?.url)
      console.log('  Response Data:', JSON.stringify(error.response.data, null, 2))
      console.log('  Headers:', JSON.stringify(error.response.headers, null, 2))
    } else if (error.request) {
      // Request was made but no response received
      console.log('  Type: Network Error (No Response)')
      console.log('  URL:', error.config?.url)
      console.log('  Full URL:', error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A')
      console.log('  Error Code:', error.code)
      console.log('  Error Message:', error.message)
      console.log('  Request:', error.request)
      
      // Additional network error details
      if (error.code === 'ECONNREFUSED') {
        console.log('  💡 Hint: Connection refused - Is the backend server running?')
        console.log('  💡 Hint: Check if the IP address is correct:', API_URL)
      } else if (error.code === 'ETIMEDOUT') {
        console.log('  💡 Hint: Request timed out - Check network connection')
      } else if (error.code === 'ENOTFOUND') {
        console.log('  💡 Hint: Host not found - Check the API URL:', API_URL)
      }
    } else {
      // Error in request setup
      console.log('  Type: Request Setup Error')
      console.log('  Message:', error.message)
    }
    
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      console.log('  🔐 401 Unauthorized - Clearing auth data')
      try {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
      } catch (storageError) {
        console.error('  ❌ Error clearing storage:', storageError)
      }
    }

    // Handle network errors
    if (!error.response) {
      error.isNetworkError = true
      const networkMessage = error.code 
        ? `Network error (${error.code}). Please check your connection and ensure the backend server is running at ${API_URL}`
        : 'Network error. Please check your connection.'
      error.message = networkMessage
      console.log('  📝 Error message set to:', error.message)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
export { API_URL }

