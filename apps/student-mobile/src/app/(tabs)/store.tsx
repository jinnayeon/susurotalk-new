import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { api } from '../../lib/api'

export default function StoreScreen() {
  const [profile, setProfile] = useState<{ totalPoints?: number; stickerCount?: number } | null>(null)

  useEffect(() => {
    api.get('/profile').then((r) => setProfile(r.data)).catch(() => {})
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>⭐ 내 기록</Text>
      <View style={styles.card}>
        <Text style={styles.label}>스스로 포인트</Text>
        <Text style={styles.big}>{profile?.totalPoints ?? 0}P</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>받은 칭찬 스티커</Text>
        <Text style={styles.big}>{profile?.stickerCount ?? 0}개</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  content: { padding: 24 },
  header: { fontSize: 24, fontWeight: '800', color: '#3D2B1F', marginBottom: 20, marginTop: 48 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1.5, borderColor: '#E8D5B7', alignItems: 'center' },
  label: { fontSize: 14, color: '#A89080', marginBottom: 8 },
  big: { fontSize: 36, fontWeight: '800', color: '#F4A428' },
})
