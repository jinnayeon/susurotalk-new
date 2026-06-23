import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { api } from '../../lib/api'
import { AppHeader } from '../../components/AppHeader'
import { getCharacter, CHARACTER_LIST } from '@seolf-talk/domain'

type RewardItem = {
  id: string
  title: string
  price: number
  characterId: string | null
  skinName: string | null
  isOwned: boolean
  isEquipped: boolean
}

type Profile = { totalPoints?: number; stickerCount?: number }

export default function StoreScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChar, setActiveChar] = useState('bonggu')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, r] = await Promise.all([api.get('/profile'), api.get('/rewards')])
      setProfile(p.data)
      setRewards(r.data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const equip = async (item: RewardItem) => {
    try {
      const res = await api.patch(`/rewards/${item.id}/equip`)
      Alert.alert('', res.data.message)
      load()
    } catch {
      Alert.alert('앗!', '장착에 실패했어요.')
    }
  }

  const purchase = async (item: RewardItem) => {
    if (item.isOwned) {
      equip(item)
      return
    }
    Alert.alert(
      `${item.title} 구매`,
      `${item.price}P를 사용해서 구매할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매!',
          onPress: async () => {
            try {
              const res = await api.post(`/rewards/${item.id}/purchase`)
              Alert.alert('', res.data.message)
              load()
            } catch (e: any) {
              Alert.alert('앗!', e.response?.data?.message ?? '구매 실패')
            }
          },
        },
      ]
    )
  }

  const filtered = rewards.filter((r) => r.characterId === activeChar)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader title="스킨 상점" showBack={false} />

      {/* 포인트 / 스티커 */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>✨ 포인트</Text>
          <Text style={styles.statValue}>{profile?.totalPoints ?? 0}P</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🌟 스티커</Text>
          <Text style={styles.statValue}>{profile?.stickerCount ?? 0}개</Text>
        </View>
      </View>

      {/* 캐릭터 탭 */}
      <View style={styles.tabRow}>
        {CHARACTER_LIST.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.tab, activeChar === c.id && { backgroundColor: c.color }]}
            onPress={() => setActiveChar(c.id)}
          >
            <Text style={styles.tabEmoji}>{c.emoji}</Text>
            <Text style={[styles.tabName, activeChar === c.id && { color: '#fff' }]}>
              {c.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 스킨 목록 */}
      {loading ? (
        <ActivityIndicator size="large" color="#F4A428" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.muted}>아직 준비된 스킨이 없어요.</Text>
      ) : (
        filtered.map((item) => {
          const char = getCharacter(item.characterId ?? 'bonggu')
          return (
            <View
              key={item.id}
              style={[styles.skinCard, item.isEquipped && { borderColor: char.color, borderWidth: 2 }]}
            >
              <View style={[styles.skinEmojiBg, { backgroundColor: char.color + '22' }]}>
                <Text style={styles.skinEmoji}>{char.emoji}</Text>
              </View>
              <View style={styles.skinInfo}>
                <Text style={styles.skinName}>{item.title}</Text>
                <Text style={[styles.skinPrice, { color: char.color }]}>{item.price}P</Text>
                {item.isEquipped && <Text style={styles.equippedBadge}>✔ 장착 중</Text>}
              </View>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: item.isEquipped ? '#ccc' : char.color },
                ]}
                onPress={() => purchase(item)}
                disabled={item.isEquipped}
              >
                <Text style={styles.actionBtnText}>
                  {item.isEquipped ? '착용 중' : item.isOwned ? '장착' : '구매'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  content: { padding: 24, paddingBottom: 48 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E8D5B7' },
  statLabel: { fontSize: 13, color: '#A89080', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#F4A428' },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8D5B7' },
  tabEmoji: { fontSize: 22 },
  tabName: { fontSize: 12, fontWeight: '700', color: '#3D2B1F', marginTop: 2 },
  skinCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E8D5B7' },
  skinEmojiBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  skinEmoji: { fontSize: 28 },
  skinInfo: { flex: 1 },
  skinName: { fontSize: 15, fontWeight: '700', color: '#3D2B1F' },
  skinPrice: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  equippedBadge: { fontSize: 12, color: '#4CAF50', marginTop: 2 },
  actionBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  muted: { textAlign: 'center', color: '#A89080', marginTop: 40 },
})
