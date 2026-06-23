import { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { api } from '../../lib/api'

interface Question {
  id: string
  level: number
  targetBand: string
  questionType: string
  question: string
  options: string[]
}

const TYPE_LABEL: Record<string, string> = {
  meaning: '어휘 의미',
  relation: '어휘 관계',
  context: '문맥 이해',
  expansion: '어휘 확장',
  usage: '실제 사용',
}

export default function VocabularyTestScreen() {
  const { level: levelParam } = useLocalSearchParams<{ level: string }>()
  const level = Number(levelParam ?? '1')

  const [questions, setQuestions] = useState<Question[]>([])
  const [label, setLabel] = useState('')
  const [notice, setNotice] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setAnswers({})
    setCurrentIdx(0)
    api
      .get('/vocabulary/questions', { params: { level } })
      .then((r) => {
        setQuestions(r.data.questions ?? [])
        setLabel(r.data.label ?? `Lv.${level}`)
        setNotice(r.data.notice ?? '')
      })
      .catch(() => {
        Alert.alert('앗!', '문제를 불러오지 못했어요.', [
          { text: '돌아가기', onPress: () => router.replace('/study') },
        ])
      })
      .finally(() => setLoading(false))
  }, [level])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const submit = async (finalAnswers: Record<string, number>) => {
    setSubmitting(true)
    try {
      const answerArr = questions.map((q) => ({
        questionId: q.id,
        chosen: finalAnswers[q.id] ?? -1,
      }))
      const res = await api.post('/vocabulary/submit', { level, answers: answerArr })
      router.replace({
        pathname: '/study/test-result',
        params: { result: JSON.stringify(res.data) },
      })
    } catch {
      Alert.alert('앗!', '결과를 처리하지 못했어요.')
      setSubmitting(false)
    }
  }

  const handleAnswer = (chosen: number) => {
    const q = questions[currentIdx]
    if (!q) return
    const next = { ...answers, [q.id]: chosen }
    setAnswers(next)
    if (currentIdx === questions.length - 1) {
      submit(next)
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  if (loading || submitting) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#F4A428" style={{ marginTop: 120 }} />
        {submitting && <Text style={styles.loadingText}>결과를 정리하고 있어요...</Text>}
      </SafeAreaView>
    )
  }

  const currentQ = questions[currentIdx]
  if (!currentQ) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>문제가 없어요.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/study')}>
            <Text style={styles.backBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const progress = (currentIdx + 1) / questions.length

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.levelTag}>{label}</Text>
          <Text style={styles.typeTag}>{TYPE_LABEL[currentQ.questionType] ?? currentQ.questionType}</Text>
        </View>

        <Text style={styles.qCount}>{currentIdx + 1} / {questions.length}</Text>
        <Text style={styles.question}>{currentQ.question}</Text>

        {currentQ.options.map((opt, idx) => (
          <TouchableOpacity key={idx} style={styles.optionBtn} onPress={() => handleAnswer(idx)}>
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>{idx + 1}</Text>
            </View>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footerNotice}>ℹ️ {notice || '학습 참고용 진단입니다.'}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  loadingText: { textAlign: 'center', color: '#A89080', marginTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: '#A89080', marginBottom: 16 },
  progressBarWrap: { height: 6, backgroundColor: '#E8D5B7' },
  progressBar: { height: 6, backgroundColor: '#F4A428' },
  content: { padding: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  levelTag: { fontSize: 13, fontWeight: '800', color: '#F4A428' },
  typeTag: { fontSize: 12, color: '#fff', backgroundColor: '#FFB74D', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  qCount: { fontSize: 14, color: '#A89080', marginBottom: 8 },
  question: { fontSize: 19, fontWeight: '700', color: '#3D2B1F', marginBottom: 24, lineHeight: 29 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#E8D5B7' },
  optionNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4A428', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionNumberText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  optionText: { fontSize: 15, color: '#3D2B1F', flex: 1, lineHeight: 22 },
  footerNotice: { fontSize: 11, color: '#A89080', marginTop: 16, lineHeight: 17 },
  backBtn: { backgroundColor: '#F4A428', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { color: '#fff', fontWeight: '700' },
})
