import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'

interface AuthState {
  token: string | null
  userId: string | null
  isLoading: boolean
  setAuth: (token: string, userId: string) => Promise<void>
  loadAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isLoading: true,

  setAuth: async (token, userId) => {
    await SecureStore.setItemAsync('token', token)
    await SecureStore.setItemAsync('userId', userId)
    set({ token, userId })
  },

  loadAuth: async () => {
    const token = await SecureStore.getItemAsync('token')
    const userId = await SecureStore.getItemAsync('userId')
    set({ token, userId, isLoading: false })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token')
    await SecureStore.deleteItemAsync('userId')
    set({ token: null, userId: null })
  },
}))
