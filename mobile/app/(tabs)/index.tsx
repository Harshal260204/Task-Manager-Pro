import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import axiosInstance from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'

interface Task {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'med' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export default function TaskListScreen() {
  const router = useRouter()
  const { logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and search
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [showFilters, setShowFilters] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchTasks = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params: any = {
        limit: 50,
        sortBy,
      }

      if (search.trim()) {
        params.q = search.trim()
      }
      if (statusFilter) {
        params.status = statusFilter
      }
      if (priorityFilter) {
        params.priority = priorityFilter
      }

      console.log('📋 Fetching tasks with params:', params)

      const response = await axiosInstance.get('/tasks', { params })

      setTasks(response.data.data || [])
      console.log('✅ Tasks fetched:', response.data.data?.length || 0)
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch tasks'

      if (err.isNetworkError) {
        setError('Network error. Please check your connection.')
      } else {
        setError(message)
      }

      // Handle 401 - redirect to login
      if (err.response?.status === 401) {
        await logout()
        return
      }

      // Only show alert on initial load, not on refresh
      if (!showRefreshing) {
        Alert.alert('Error', message)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks()
    }, 500)

    return () => clearTimeout(timer)
  }, [search, statusFilter, priorityFilter, sortBy])

  // Fetch tasks when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTasks()
    }, [])
  )

  const onRefresh = useCallback(() => {
    fetchTasks(true)
  }, [])

  const handleTaskPress = (task: Task) => {
    console.log('📝 Opening task for edit:', task._id)
    try {
      const href = {
        pathname: '/task-form',
        params: { mode: 'edit', taskId: task._id },
      }
      console.log('  Navigation href:', JSON.stringify(href, null, 2))
      router.push(href as any)
      console.log('  ✅ router.push() executed')
    } catch (err: any) {
      console.error('❌ Navigation error:', err)
      Alert.alert('Error', 'Failed to open task form')
    }
  }

  const handleCreateTask = () => {
    console.log('➕ Creating new task - Button pressed')
    
    // Try using href format which works better with Expo Router
    const href = {
      pathname: '/task-form',
      params: { mode: 'create' },
    }
    
    console.log('  Navigation href:', JSON.stringify(href, null, 2))
    
    try {
      router.push(href as any)
      console.log('  ✅ router.push() executed')
    } catch (err: any) {
      console.error('❌ Navigation error:', err)
      console.error('  Error message:', err.message)
      console.error('  Error stack:', err.stack)
      
      // Show user-friendly error
      Alert.alert(
        'Navigation Error',
        'Unable to open task form. Please try again or restart the app.',
        [{ text: 'OK' }]
      )
    }
  }

  const handleDeleteTask = async (task: Task) => {
    setTaskToDelete(task)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    try {
      console.log('🗑️ Deleting task:', taskToDelete._id)
      await axiosInstance.delete(`/tasks/${taskToDelete._id}`)
      Alert.alert('Success', 'Task deleted successfully')
      setShowDeleteDialog(false)
      setTaskToDelete(null)
      fetchTasks()
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete task'
      Alert.alert('Error', message)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPriorityFilter('')
    setSortBy('createdAt')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#999'
      case 'in-progress':
        return '#1976d2'
      case 'done':
        return '#2e7d32'
      default:
        return '#999'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return '#2196f3'
      case 'med':
        return '#ff9800'
      case 'high':
        return '#f44336'
      default:
        return '#999'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.7}
        style={styles.taskContent}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.badgeText}>{item.priority}</Text>
            </View>
          </View>
        </View>

        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.dueDate && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text
              style={[
                styles.taskDate,
                isOverdue(item.dueDate) && item.status !== 'done' && styles.overdueDate,
              ]}
            >
              Due: {formatDate(item.dueDate)}
              {isOverdue(item.dueDate) && item.status !== 'done' && ' (Overdue)'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTaskPress(item)}
        >
          <Ionicons name="create-outline" size={20} color="#1976d2" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteTask(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    )
  }

  const hasActiveFilters = search || statusFilter || priorityFilter || sortBy !== 'createdAt'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name={showFilters ? 'filter' : 'filter-outline'}
              size={24}
              color="#1976d2"
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateTask}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.filterButtons}>
                  {['', 'todo', 'in-progress', 'done'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        statusFilter === status && styles.filterChipActive,
                      ]}
                      onPress={() => setStatusFilter(status)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          statusFilter === status && styles.filterChipTextActive,
                        ]}
                      >
                        {status || 'All'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Priority</Text>
                <View style={styles.filterButtons}>
                  {['', 'low', 'med', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.filterChip,
                        priorityFilter === priority && styles.filterChipActive,
                      ]}
                      onPress={() => setPriorityFilter(priority)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          priorityFilter === priority && styles.filterChipTextActive,
                        ]}
                      >
                        {priority || 'All'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <View style={styles.filterButtons}>
                  {[
                    { value: 'createdAt', label: 'Newest' },
                    { value: 'dueDate', label: 'Due Date' },
                    { value: 'title', label: 'Title' },
                    { value: 'priority', label: 'Priority' },
                  ].map((sort) => (
                    <TouchableOpacity
                      key={sort.value}
                      style={[
                        styles.filterChip,
                        sortBy === sort.value && styles.filterChipActive,
                      ]}
                      onPress={() => setSortBy(sort.value)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          sortBy === sort.value && styles.filterChipTextActive,
                        ]}
                      >
                        {sort.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <Ionicons name="close-circle" size={20} color="#f44336" />
                  <Text style={styles.clearFiltersText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTasks()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
              <Text style={styles.emptySubtext}>
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Tap "+ Add" to create your first task'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={showDeleteDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Task</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowDeleteDialog(false)
                  setTaskToDelete(null)
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonTextDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f44336',
  },
  addButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  filterGroup: {
    marginRight: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  taskContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  overdueDate: {
    color: '#f44336',
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonDelete: {
    backgroundColor: '#f44336',
  },
  modalButtonTextCancel: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextDelete: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
