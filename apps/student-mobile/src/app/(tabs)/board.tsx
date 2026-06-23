import { useCallback, useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native'
import { api } from '../../lib/api'
import { AppHeader } from '../../components/AppHeader'
import { SUBJECT_LABELS, type Subject } from '@seolf-talk/domain'

type Post = {
  id: string
  title: string
  content: string
  subject: string
  grade: number
  status: string
  createdAt: string
  user: { childProfile?: { nickname?: string; grade?: number } | null }
  match?: { mentorProfile?: { name?: string } | null } | null
  _count: { comments: number }
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: '도움 필요',
  MATCHED: '멘토 연결됨',
  RESOLVED: '해결 완료',
}
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#F4A428',
  MATCHED: '#4CAF50',
  RESOLVED: '#A89080',
}
const SUBJECT_EMOJI: Record<string, string> = { math: '🔢', korean: '📖', english: '🔤', etc: '📝' }

export default function BoardScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showWrite, setShowWrite] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState<Subject>('math')
  const [grade, setGrade] = useState(3)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/board')
      setPosts(res.data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const submitPost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('앗!', '제목과 내용을 모두 입력해줘!')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/board', { title, content, subject, grade })
      setShowWrite(false)
      setTitle('')
      setContent('')
      load()
      Alert.alert('✅', '질문이 올라갔어! 멘토 선생님이 곧 답해줄 거야.')
    } catch {
      Alert.alert('앗!', '게시 실패했어요.')
    } finally {
      setSubmitting(false)
    }
  }

  const subjects: Subject[] = ['math', 'korean', 'english']

  return (
    <View style={styles.container}>
      <AppHeader title="질문 게시판" showBack={false} />

      {loading ? (
        <ActivityIndicator size="large" color="#F4A428" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {posts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>아직 질문이 없어요{'\n'}첫 질문을 올려봐!</Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.tagRow}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[post.status] + '22' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[post.status] }]}>
                        {STATUS_LABEL[post.status] ?? post.status}
                      </Text>
                    </View>
                    <Text style={styles.subjectTag}>
                      {SUBJECT_EMOJI[post.subject]} {SUBJECT_LABELS[post.subject as Subject] ?? post.subject}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{post.title}</Text>
                  <Text style={styles.cardContent} numberOfLines={2}>{post.content}</Text>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardMeta}>
                    {post.user?.childProfile?.nickname ?? '익명'} · {post.grade}학년
                  </Text>
                  <Text style={styles.cardMeta}>
                    💬 {post._count.comments}
                    {post.match?.mentorProfile?.name ? ` · 멘토: ${post.match.mentorProfile.name}` : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* 질문 쓰기 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowWrite(true)}>
        <Text style={styles.fabText}>✏️ 질문하기</Text>
      </TouchableOpacity>

      {/* 질문 작성 모달 */}
      <Modal visible={showWrite} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>질문 올리기 📝</Text>
              <TouchableOpacity onPress={() => setShowWrite(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 과목 선택 */}
            <Text style={styles.inputLabel}>과목</Text>
            <View style={styles.subjectRow}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.subjectBtn, subject === s && styles.subjectBtnActive]}
                  onPress={() => setSubject(s)}
                >
                  <Text style={[styles.subjectBtnText, subject === s && { color: '#fff' }]}>
                    {SUBJECT_EMOJI[s]} {SUBJECT_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 학년 */}
            <Text style={styles.inputLabel}>학년</Text>
            <View style={styles.gradeRow}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
                  onPress={() => setGrade(g)}
                >
                  <Text style={[styles.gradeBtnText, grade === g && { color: '#fff' }]}>{g}학년</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 제목 */}
            <Text style={styles.inputLabel}>제목</Text>
            <TextInput
              style={styles.input}
              placeholder="질문 제목을 입력해줘"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* 내용 */}
            <Text style={styles.inputLabel}>내용</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="어떤 부분이 어려운지 자세히 써줄수록 멘토 선생님이 더 잘 도와줄 수 있어!"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={2000}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={submitPost}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>질문 올리기! 🚀</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7', paddingHorizontal: 20 },
  list: { paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8D5B7' },
  cardTop: { marginBottom: 10 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  subjectTag: { fontSize: 13, color: '#7A6152' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F', marginBottom: 4 },
  cardContent: { fontSize: 13, color: '#7A6152', lineHeight: 19 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { fontSize: 12, color: '#A89080' },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#A89080', textAlign: 'center', lineHeight: 26 },
  fab: { position: 'absolute', bottom: 28, right: 20, backgroundColor: '#F4A428', borderRadius: 28, paddingHorizontal: 22, paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  modal: { flex: 1, backgroundColor: '#FFF8E7' },
  modalContent: { padding: 24, paddingBottom: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#3D2B1F' },
  closeBtn: { fontSize: 20, color: '#A89080' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#3D2B1F', marginBottom: 8, marginTop: 16 },
  subjectRow: { flexDirection: 'row', gap: 8 },
  subjectBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8D5B7', alignItems: 'center' },
  subjectBtnActive: { backgroundColor: '#F4A428', borderColor: '#F4A428' },
  subjectBtnText: { fontSize: 13, fontWeight: '700', color: '#3D2B1F' },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gradeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8D5B7' },
  gradeBtnActive: { backgroundColor: '#F4A428', borderColor: '#F4A428' },
  gradeBtnText: { fontSize: 13, fontWeight: '700', color: '#3D2B1F' },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1.5, borderColor: '#E8D5B7', color: '#3D2B1F' },
  textarea: { height: 140, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#F4A428', borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
