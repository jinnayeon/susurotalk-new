import { useEffect, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useTasks } from '../../hooks/useTasks'
import { api } from '../../lib/api'
import { AppHeader } from '../../components/AppHeader'
import { getCharacter, type CharacterDef } from '@seolf-talk/domain'

type Profile = {
  characterId?: string
  nickname?: string
  totalPoints?: number
  equippedSkin?: { skinName: string } | null
}

export default function HomeScreen() {
  const { tasks, loading } = useTasks()
  const [profile, setProfile] = useState<Profile | null>(null)
  const done = tasks.filter((t) => t.status === 'done').length
  const total = tasks.length

  useEffect(() => {
    api.get('/profile').then((r) => setProfile(r.data)).catch(() => {})
  }, [])

  const char: CharacterDef = getCharacter(profile?.characterId ?? 'bonggu')
  const skinLabel = profile?.equippedSkin?.skinName
  const greeting = done === total && total > 0 ? char.dialogues.correct : char.dialogues.greeting

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader title="홈" showBack={false} />

      {/* 캐릭터 영역 */}
      <View style={[styles.characterBox, { backgroundColor: char.color + '22' }]}>
        <View style={[styles.characterBadge, { borderColor: char.color }]}>
          <Text style={styles.characterEmoji}>{char.emoji}</Text>
        </View>
        <Text style={[styles.characterName, { color: char.color }]}>
          {skinLabel ?? char.displayName}
        </Text>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{greeting}</Text>
        </View>
      </View>

      {/* 포인트 배지 */}
      <View style={styles.pointRow}>
        <Text style={styles.pointLabel}>✨ 스스로 포인트</Text>
        <Text style={[styles.pointValue, { color: char.color }]}>
          {profile?.totalPoints ?? 0}P
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: char.color }]}
        onPress={() => router.push('/(tabs)/planner')}
      >
        <Text style={styles.startBtnText}>📚 공부 시작하기</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 미션</Text>
        {loading ? (
          <Text style={styles.muted}>불러오는 중...</Text>
        ) : tasks.length === 0 ? (
          <Text style={styles.muted}>오늘 미션이 없어요. 추가해봐!</Text>
        ) : (
          tasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskRow}>
              <Text style={styles.taskDot}>{task.status === 'done' ? '✅' : '⬜'}</Text>
              <Text style={[styles.taskText, task.status === 'done' && styles.taskDone]}>
                {task.title}
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.changeCharBtn} onPress={() => router.push('/(tabs)/store')}>
        <Text style={styles.changeCharText}>👗 스킨 상점 보기</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  content: { padding: 24 },
  characterBox: { alignItems: 'center', paddingVertical: 28, borderRadius: 24, marginBottom: 16 },
  characterBadge: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  characterEmoji: { fontSize: 52 },
  characterName: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  speechBubble: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12, marginTop: 12, maxWidth: '85%', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  speechText: { fontSize: 14, color: '#3D2B1F', lineHeight: 21, textAlign: 'center' },
  pointRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E8D5B7' },
  pointLabel: { fontSize: 14, color: '#A89080' },
  pointValue: { fontSize: 20, fontWeight: '800' },
  startBtn: { borderRadius: 20, padding: 18, alignItems: 'center', marginBottom: 24 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#E8D5B7', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  taskDot: { fontSize: 20, marginRight: 10 },
  taskText: { fontSize: 15, color: '#3D2B1F' },
  taskDone: { textDecorationLine: 'line-through', color: '#A89080' },
  muted: { color: '#888', marginTop: 8 },
  changeCharBtn: { alignItems: 'center', paddingVertical: 14 },
  changeCharText: { color: '#A89080', fontSize: 14 },
})
