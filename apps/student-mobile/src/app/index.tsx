import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'

export default function Index() {
  const { token, isLoading } = useAuthStore()
  const [levelTested, setLevelTested] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) return
    api.get('/level-test/my-result')
      .then((r) => setLevelTested(r.data.levelTested))
      .catch(() => setLevelTested(false))
  }, [token])

  if (isLoading) return null
  if (!token) return <Redirect href="/(auth)/" />
  if (levelTested === null) return null  // 레벨 조회 중
  if (!levelTested) return <Redirect href="/level-test" />
  return <Redirect href="/(tabs)/" />
}
