import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import axiosInstance from '../api/axios'

interface Task {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'med' | 'high'
  dueDate?: string
}

export default function TaskFormScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ taskId?: string; mode?: string }>()
  const { taskId, mode } = params
  const isEdit = mode === 'edit' && taskId

  const [task, setTask] = useState<Task | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')
  const [dueDate, setDueDate] = useState('')
  const [dueDateObj, setDueDateObj] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string
  }>({})

  useEffect(() => {
    if (isEdit && taskId) {
      setFetching(true)
      fetchTask()
    }
  }, [isEdit, taskId])

  const fetchTask = async () => {
    try {
      setFetching(true)
      const response = await axiosInstance.get(`/tasks/${taskId}`)
      const taskData = response.data.data
      setTask(taskData)
      setTitle(taskData.title)
      setDescription(taskData.description || '')
      setStatus(taskData.status || 'todo')
      setPriority(taskData.priority || 'med')
      if (taskData.dueDate) {
        const date = new Date(taskData.dueDate)
        setDueDateObj(date)
        setDueDate(date.toISOString().split('T')[0])
      } else {
        setDueDate('')
        setDueDateObj(null)
      }
      setErrors({})
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load task')
      router.back()
    } finally {
      setFetching(false)
    }
  }

  const validateForm = () => {
    const newErrors: {
      title?: string
      description?: string
      status?: string
      priority?: string
      dueDate?: string
    } = {}

    // Validate title
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      newErrors.title = 'Title is required'
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters'
    }

    // Validate description
    const trimmedDescription = description.trim()
    if (!trimmedDescription) {
      newErrors.description = 'Description is required'
    } else if (trimmedDescription.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters'
    }

    // Validate status
    if (!status || !['todo', 'in-progress', 'done'].includes(status)) {
      newErrors.status = 'Status is required and must be valid'
    }

    // Validate priority
    if (!priority || !['low', 'med', 'high'].includes(priority)) {
      newErrors.priority = 'Priority is required and must be valid'
    }

    // Validate due date - both dueDateObj and dueDate string must be present
    if (!dueDateObj || !dueDate || dueDate.trim() === '') {
      newErrors.dueDate = 'Due date is required'
    } else {
      // Validate that due date is not in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(dueDateObj)
      selectedDate.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }
  }

  const handleSubmit = async () => {
    // Validate all fields
    const validation = validateForm()
    if (!validation.isValid) {
      // Errors are already displayed inline with red borders and text
      return
    }

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    // Double-check all required fields (defensive programming)
    if (!trimmedTitle || !trimmedDescription || !status || !priority || !dueDateObj) {
      // Re-validate to show inline errors
      validateForm()
      return
    }

    setLoading(true)

    try {
      // Prepare task data according to backend schema
      const taskData: any = {
        title: trimmedTitle,
        description: trimmedDescription,
        status,
        priority,
        dueDate: dueDateObj.toISOString(), // Required field, always present after validation
      }

      if (isEdit && taskId) {
        await axiosInstance.put(`/tasks/${taskId}`, taskData)
      } else {
        await axiosInstance.post('/tasks', taskData)
      }

      Alert.alert(
        'Success',
        isEdit ? 'Task updated successfully' : 'Task created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      )
    } catch (error: any) {

      // Extract detailed error message from backend
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} task`

      if (error.response?.data) {
        const backendError = error.response.data

        // Backend returns validation errors in different formats
        if (backendError.message) {
          errorMessage = backendError.message
        } else if (backendError.error) {
          // Joi validation errors
          if (typeof backendError.error === 'string') {
            errorMessage = backendError.error
          } else if (backendError.error.details && Array.isArray(backendError.error.details)) {
            // Multiple validation errors
            const errors = backendError.error.details.map((detail: any) => detail.message).join('\n')
            errorMessage = `Validation errors:\n${errors}`
          }
        } else if (backendError.errors) {
          // Mongoose validation errors
          const errors = Object.values(backendError.errors)
            .map((err: any) => err.message)
            .join('\n')
          errorMessage = `Validation errors:\n${errors}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading task...</Text>
      </View>
    )
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
        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Enter task title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={(text) => {
              setTitle(text)
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }))
              }
            }}
            editable={!loading}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Enter task description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={(text) => {
              setDescription(text)
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }))
              }
            }}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          <Text style={styles.label}>Status *</Text>
          <View style={styles.optionsRow}>
            {(['todo', 'in-progress', 'done'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.optionButton,
                  status === s && styles.optionButtonActive,
                  errors.status && styles.optionButtonError,
                ]}
                onPress={() => {
                  setStatus(s)
                  if (errors.status) {
                    setErrors((prev) => ({ ...prev, status: undefined }))
                  }
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    status === s && styles.optionTextActive,
                  ]}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}

          <Text style={styles.label}>Priority *</Text>
          <View style={styles.optionsRow}>
            {(['low', 'med', 'high'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.optionButton,
                  priority === p && styles.optionButtonActive,
                  errors.priority && styles.optionButtonError,
                ]}
                onPress={() => {
                  setPriority(p)
                  if (errors.priority) {
                    setErrors((prev) => ({ ...prev, priority: undefined }))
                  }
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.optionText,
                    priority === p && styles.optionTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.priority && <Text style={styles.errorText}>{errors.priority}</Text>}

          <Text style={styles.label}>Due Date *</Text>
          <TouchableOpacity
            style={[styles.dateInputContainer, errors.dueDate && styles.dateInputError]}
            onPress={() => !loading && setShowDatePicker(true)}
            disabled={loading}
          >
            <View style={styles.dateInput}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={[styles.dateInputText, !dueDate && styles.dateInputPlaceholder]}>
                {dueDate || 'Select due date'}
              </Text>
            </View>
            {dueDate && (
              <TouchableOpacity
                onPress={() => {
                  // Clear date and trigger validation error since it's required
                  setDueDate('')
                  setDueDateObj(null)
                  setErrors((prev) => ({ ...prev, dueDate: 'Due date is required' }))
                }}
                style={styles.clearDateButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}

          {showDatePicker && (
            <DateTimePicker
              value={dueDateObj || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false)
                }
                if (event.type === 'set' && selectedDate) {
                  setDueDateObj(selectedDate)
                  setDueDate(selectedDate.toISOString().split('T')[0])
                  if (errors.dueDate) {
                    setErrors((prev) => ({ ...prev, dueDate: undefined }))
                  }
                  if (Platform.OS === 'ios') {
                    setShowDatePicker(false)
                  }
                } else if (Platform.OS === 'android') {
                  // User cancelled on Android
                  setShowDatePicker(false)
                }
              }}
              minimumDate={new Date()}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.iosDatePickerActions}>
              <TouchableOpacity
                style={styles.iosDatePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.iosDatePickerButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Task' : 'Create Task'}
              </Text>
            )}
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  dateInputPlaceholder: {
    color: '#999',
  },
  clearDateButton: {
    padding: 4,
  },
  iosDatePickerActions: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  iosDatePickerButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  iosDatePickerButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  optionButtonError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  dateInputError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
})

