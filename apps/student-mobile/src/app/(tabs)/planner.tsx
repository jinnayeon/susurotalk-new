import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native'
import { useTasks } from '../../hooks/useTasks'
import { api } from '../../lib/api'

export default function PlannerScreen() {
  const { tasks, loading, reload } = useTasks()
  const [newTitle, setNewTitle] = useState('')
  const [newSubject, setNewSubject] = useState('')

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
      await api.patch(`/tasks/${id}/complete`)
      Alert.alert('야호! 🎉', '미션 완료! 포인트 +500점!')
      reload()
    } catch {
      Alert.alert('앗!', '완료 처리에 실패했어요.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 오늘의 공부</Text>

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
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>+ 추가하기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskTitle, item.status === 'done' && styles.done]}>
                {item.title}
              </Text>
              <Text style={styles.taskSubject}>{item.subject}</Text>
            </View>
            {item.status !== 'done' ? (
              <TouchableOpacity style={styles.doneBtn} onPress={() => completeTask(item.id)}>
                <Text style={styles.doneBtnText}>완료!</Text>
              </TouchableOpacity>
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
  header: { fontSize: 24, fontWeight: '800', color: '#3D2B1F', marginBottom: 20, marginTop: 48 },
  addBox: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1.5, borderColor: '#E8D5B7' },
  input: { backgroundColor: '#F9F3E8', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E8D5B7' },
  addBtn: { backgroundColor: '#F4A428', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8D5B7' },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#3D2B1F' },
  taskSubject: { fontSize: 13, color: '#A89080', marginTop: 2 },
  done: { textDecorationLine: 'line-through', color: '#A89080' },
  doneBtn: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  doneBtnText: { color: '#fff', fontWeight: '700' },
})
