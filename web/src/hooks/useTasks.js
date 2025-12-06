import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axios'
import { toast } from 'react-toastify'

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })

  // Fetch tasks with filters
  const fetchTasks = useCallback(
    async (params = {}) => {
      // Check if token exists before making request
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to view tasks')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()
        if (params.search) queryParams.append('q', params.search)
        if (params.status) queryParams.append('status', params.status)
        if (params.priority) queryParams.append('priority', params.priority)
        if (params.page) queryParams.append('page', params.page)
        if (params.limit) queryParams.append('limit', params.limit)
        if (params.sortBy) queryParams.append('sortBy', params.sortBy)

        const response = await axiosInstance.get(
          `/tasks?${queryParams.toString()}`
        )

        setTasks(response.data.data || [])
        setMeta((prev) => response.data.meta || prev)
      } catch (err) {
        const message =
          err.response?.data?.message || 'Failed to fetch tasks'
        setError(message)
        // Don't show toast for 401 errors as they're handled by interceptor
        if (err.response?.status !== 401) {
          toast.error(message)
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      const response = await axiosInstance.post('/tasks', taskData)
      const newTask = response.data.data

      // Optimistic update
      setTasks((prev) => [newTask, ...prev])
      setMeta((prev) => ({
        ...prev,
        total: prev.total + 1,
      }))

      toast.success('Task created successfully')
      return { success: true, data: newTask }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to create task'
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  // Update task
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}`, taskData)
      const updatedTask = response.data.data

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? updatedTask : task))
      )

      toast.success('Task updated successfully')
      return { success: true, data: updatedTask }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to update task'
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`)

      // Optimistic update
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
      setMeta((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }))

      toast.success('Task deleted successfully')
      return { success: true }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to delete task'
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    meta,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
