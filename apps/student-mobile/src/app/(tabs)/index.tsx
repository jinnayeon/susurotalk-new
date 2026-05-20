import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useTasks } from '../../hooks/useTasks'

export default function HomeScreen() {
  const { tasks, loading } = useTasks()
  const done = tasks.filter((t) => t.status === 'done').length
  const total = tasks.length

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.characterBox}>
        <Text style={styles.character}>🐾</Text>
        <Text style={styles.greeting}>
          {done === total && total > 0
            ? '오늘 다 했어! 대단해! 🎉'
            : `오늘도 같이 해보자!\n${done}/${total} 완료했어`}
        </Text>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/(tabs)/planner')}>
        <Text style={styles.startBtnText}>📚 공부 시작하기</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 미션</Text>
        {loading ? (
          <Text style={{ color: '#888', marginTop: 8 }}>불러오는 중...</Text>
        ) : tasks.length === 0 ? (
          <Text style={{ color: '#888', marginTop: 8 }}>오늘 미션이 없어요. 추가해봐!</Text>
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  content: { padding: 24 },
  characterBox: { alignItems: 'center', paddingVertical: 32 },
  character: { fontSize: 80 },
  greeting: { fontSize: 18, fontWeight: '700', color: '#3D2B1F', textAlign: 'center', marginTop: 12, lineHeight: 28 },
  startBtn: { backgroundColor: '#F4A428', borderRadius: 20, padding: 18, alignItems: 'center', marginBottom: 24 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#E8D5B7' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  taskDot: { fontSize: 20, marginRight: 10 },
  taskText: { fontSize: 15, color: '#3D2B1F' },
  taskDone: { textDecorationLine: 'line-through', color: '#A89080' },
})
