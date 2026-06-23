import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native'
import { useTasks } from '../../hooks/useTasks'
import { api } from '../../lib/api'
import { AppHeader } from '../../components/AppHeader'
import { getCharacter } from '@seolf-talk/domain'

type DialogueBubble = { message: string; emoji: string } | null

export default function PlannerScreen() {
  const { tasks, loading, reload } = useTasks()
  const [newTitle, setNewTitle] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [characterId, setCharacterId] = useState('bonggu')
  const [bubble, setBubble] = useState<DialogueBubble>(null)

  useEffect(() => {
    api.get('/profile').then((r) => {
      if (r.data?.characterId) setCharacterId(r.data.characterId)
    }).catch(() => {})
  }, [])

  const showBubble = (message: string, cid: string) => {
    const c = getCharacter(cid)
    setBubble({ message, emoji: c.emoji })
    setTimeout(() => setBubble(null), 4000)
  }

  const addTask = async () => {
    if (!newTitle.trim()) return
    try {
      await api.post('/tasks', { title: newTitle, subject: newSubject || '기타' })
      setNewTitle('')
      setNewSubject('')
      reload()
    } catch {
      Alert.alert('앗!', '추가에 실패했어요.')
    }
  }

  const completeTask = async (id: string) => {
    try {
      await api.post(`/learning/start/${id}`).catch(() => {})
      await api.patch(`/tasks/${id}/complete`)
      const char = getCharacter(characterId)
      showBubble(char.dialogues.correct, characterId)
      reload()
    } catch {
      Alert.alert('앗!', '완료 처리에 실패했어요.')
    }
  }

  const callSOS = async (id: string) => {
    try {
      await api.post(`/learning/start/${id}`).catch(() => {})
      const res = await api.post(`/learning/sos/${id}`)
      showBubble(res.data.message, characterId)
      Alert.alert('📡 SOS!', '선생님에게 도움 요청을 보냈어요!\n잠시 기다려줘.')
    } catch {
      Alert.alert('앗!', 'SOS 전송에 실패했어요.')
    }
  }

  const char = getCharacter(characterId)

  return (
    <View style={styles.container}>
      <AppHeader title="오늘의 공부" showBack={false} />

      {/* 캐릭터 말풍선 */}
      {bubble && (
        <View style={[styles.bubbleWrap, { borderColor: char.color }]}>
          <Text style={styles.bubbleEmoji}>{bubble.emoji}</Text>
          <Text style={styles.bubbleText}>{bubble.message}</Text>
        </View>
      )}

      <View style={styles.addBox}>
        <TextInput
          style={styles.input}
          placeholder="할 일 이름"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="과목 (수학, 영어 등)"
          value={newSubject}
          onChangeText={setNewSubject}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: char.color }]} onPress={addTask}>
          <Text style={styles.addBtnText}>+ 추가하기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, item.status === 'done' && styles.done]}>
                {item.title}
              </Text>
              <Text style={styles.taskSubject}>{item.subject}</Text>
            </View>
            {item.status !== 'done' ? (
              <View style={styles.actionGroup}>
                <TouchableOpacity style={styles.sosBtn} onPress={() => callSOS(item.id)}>
                  <Text style={styles.sosBtnText}>😥 어려워요</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: char.color }]}
                  onPress={() => completeTask(item.id)}
                >
                  <Text style={styles.doneBtnText}>완료!</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ fontSize: 24 }}>✅</Text>
            )}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7', padding: 24 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1.5, gap: 10 },
  bubbleEmoji: { fontSize: 28 },
  bubbleText: { flex: 1, fontSize: 14, color: '#3D2B1F', lineHeight: 21 },
  addBox: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1.5, borderColor: '#E8D5B7' },
  input: { backgroundColor: '#F9F3E8', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E8D5B7' },
  addBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  taskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8D5B7' },
  taskInfo: { marginBottom: 10 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#3D2B1F' },
  taskSubject: { fontSize: 13, color: '#A89080', marginTop: 2 },
  done: { textDecorationLine: 'line-through', color: '#A89080' },
  actionGroup: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  sosBtn: { backgroundColor: '#FFF0E0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#FFCCAA' },
  sosBtnText: { color: '#D4622A', fontWeight: '600', fontSize: 13 },
  doneBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  doneBtnText: { color: '#fff', fontWeight: '700' },
})
