import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import axiosInstance, { API_URL } from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    console.log('\n🔐 LOGIN ATTEMPT:')
    console.log('  Email:', email.trim())
    console.log('  Password Length:', password.length)

    setLoading(true)

    try {
      console.log('  Sending request to /auth/login...')
      const startTime = Date.now()
      
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim(),
        password,
      })

      const endTime = Date.now()
      console.log(`  ✅ Login successful in ${endTime - startTime}ms`)
      console.log('  Response:', JSON.stringify(response.data, null, 2))

      const { token, user } = response.data
      console.log('  Token received:', token ? 'Yes' : 'No')
      console.log('  User:', JSON.stringify(user, null, 2))
      
      await login(token, user)
      console.log('  ✅ Navigation to home screen')
    } catch (error: any) {
      console.error('  ❌ Login failed:', error)
      
      let message = 'Login failed. Please try again.'
      let details = ''

      if (error.response) {
        // Server responded with error
        message = error.response.data?.message || `Server error (${error.response.status})`
        details = `Status: ${error.response.status}\nResponse: ${JSON.stringify(error.response.data, null, 2)}`
        console.error('  Server Response:', error.response.data)
      } else if (error.request) {
        // Request made but no response
        message = error.message || 'Network error. Please check your connection.'
        details = `Error Code: ${error.code || 'Unknown'}\nURL: ${error.config?.baseURL}${error.config?.url}\n\nMake sure:\n1. Backend server is running\n2. IP address is correct\n3. Phone and computer are on same network`
        console.error('  Network Error Details:', {
          code: error.code,
          message: error.message,
          url: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A'
        })
      } else {
        // Request setup error
        message = error.message || 'Request setup error'
        details = error.toString()
        console.error('  Request Error:', error)
      }

      console.error('  Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

      Alert.alert(
        'Login Error',
        `${message}\n\n${details ? `Details:\n${details}` : ''}`,
        [{ text: 'OK' }]
      )
    } finally {
      setLoading(false)
      console.log('  Login attempt completed\n')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Task Manager Pro</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>API: {API_URL}</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/register')}
              disabled={loading}
            >
              <Text style={styles.linkText}>
                Don't have an account? Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#1976d2',
    fontSize: 14,
  },
  debugInfo: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  debugText: {
    fontSize: 10,
    color: '#1976d2',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
})

