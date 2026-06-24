import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 개발 환경 전용 self-heal: 백엔드(Supabase) 미가용 등으로 토큰이 만료/무효(401)일 때
// 개발용 로그인 코드(123456)로 자동 재로그인 후 요청을 1회 재시도한다.
// __DEV__가 아닌 실서비스 빌드에서는 절대 동작하지 않는다.
const DEV_PHONE = '01000000000'
let devReloginPromise: Promise<string | null> | null = null

async function devRelogin(): Promise<string | null> {
  try {
    const r = await axios.post(`${API_URL}/auth/verify`, { phone: DEV_PHONE, token: '123456' })
    const { token, userId } = r.data as { token: string; userId: string }
    await SecureStore.setItemAsync('token', token)
    await SecureStore.setItemAsync('userId', userId)
    return token
  } catch {
    return null
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (__DEV__ && error.response?.status === 401 && original && !original._devRetry) {
      original._devRetry = true
      if (!devReloginPromise) {
        devReloginPromise = devRelogin().finally(() => { devReloginPromise = null })
      }
      const token = await devReloginPromise
      if (token) {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      }
    }
    return Promise.reject(error)
  }
)
