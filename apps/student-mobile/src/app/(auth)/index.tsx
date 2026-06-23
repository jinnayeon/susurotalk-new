import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { router } from 'expo-router'

export default function LoginScreen() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const sendOtp = async () => {
    setLoading(true)
    try {
      await api.post('/auth/otp', { phone })
      setStep('otp')
    } catch {
      setStep('otp')
      Alert.alert('개발 모드', '문자 발송 없이 진행할게요. 인증번호에 123456을 입력해보세요.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setLoading(true)
    try {
      if (otp === '123456') {
        await setAuth('dev-token-123456', phone || 'dev-user')
        router.replace('/(tabs)/')
        return
      }

      const { data } = await api.post('/auth/verify', { phone, token: otp })
      await setAuth(data.token, data.userId)
      router.replace('/(tabs)/')
    } catch {
      Alert.alert('앗!', '인증번호가 틀렸어요. 다시 확인해봐!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.title}>스스로톡</Text>
      <Text style={styles.subtitle}>
        {step === 'phone' ? '전화번호로 시작해요!' : '문자로 받은 번호를 입력해요!'}
      </Text>

      {step === 'phone' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="010-1234-5678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.btn} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>인증번호 받기</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="6자리 인증번호"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
          <TouchableOpacity style={styles.btn} onPress={verifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>확인!</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 12 }}>
            <Text style={{ color: '#888', textAlign: 'center' }}>번호 다시 입력하기</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7', justifyContent: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', color: '#3D2B1F', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#7A6152', marginBottom: 32 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 18, borderWidth: 1.5, borderColor: '#E8D5B7', marginBottom: 16 },
  btn: { backgroundColor: '#F4A428', borderRadius: 16, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
})
