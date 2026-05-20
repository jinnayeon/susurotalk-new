import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

interface Task {
  id: string
  title: string
  subject: string
  status: string
  date: string
  completedAt: string | null
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tasks')
      setTasks(data)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  return { tasks, loading, reload }
}
