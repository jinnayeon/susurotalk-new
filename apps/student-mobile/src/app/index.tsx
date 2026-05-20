import { Redirect } from 'expo-router'
import { useAuthStore } from '../store/authStore'

export default function Index() {
  const { token, isLoading } = useAuthStore()
  if (isLoading) return null
  return <Redirect href={token ? '/(tabs)/' : '/(auth)/'} />
}
