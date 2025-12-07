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

  console.log('📋 TaskFormScreen rendered')
  console.log('  Params received:', params)
  console.log('  taskId:', taskId)
  console.log('  mode:', mode)
  console.log('  isEdit:', isEdit)

  const [task, setTask] = useState<Task | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')
  const [dueDate, setDueDate] = useState('')
  const [dueDateObj, setDueDateObj] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    if (isEdit && taskId) {
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
      setStatus(taskData.status)
      setPriority(taskData.priority)
      if (taskData.dueDate) {
        const date = new Date(taskData.dueDate)
        setDueDateObj(date)
        setDueDate(date.toISOString().split('T')[0])
      } else {
        setDueDate('')
        setDueDateObj(null)
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load task')
      router.back()
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required')
      return
    }

    setLoading(true)

    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
      }

      if (dueDateObj) {
        taskData.dueDate = dueDateObj.toISOString()
      }

      if (isEdit && taskId) {
        await axiosInstance.put(`/tasks/${taskId}`, taskData)
        Alert.alert('Success', 'Task updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ])
      } else {
        await axiosInstance.post('/tasks', taskData)
        Alert.alert('Success', 'Task created successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ])
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${isEdit ? 'update' : 'create'} task`

      Alert.alert('Error', message)
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
            style={styles.input}
            placeholder="Enter task title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.optionsRow}>
            {(['todo', 'in-progress', 'done'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.optionButton,
                  status === s && styles.optionButtonActive,
                ]}
                onPress={() => setStatus(s)}
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

          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionsRow}>
            {(['low', 'med', 'high'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.optionButton,
                  priority === p && styles.optionButtonActive,
                ]}
                onPress={() => setPriority(p)}
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

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateInputContainer}
            onPress={() => !loading && setShowDatePicker(true)}
            disabled={loading}
          >
            <View style={styles.dateInput}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={[styles.dateInputText, !dueDate && styles.dateInputPlaceholder]}>
                {dueDate || 'Select due date (optional)'}
              </Text>
            </View>
            {dueDate && (
              <TouchableOpacity
                onPress={() => {
                  setDueDate('')
                  setDueDateObj(null)
                }}
                style={styles.clearDateButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

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
})

