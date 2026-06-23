import { useCallback, useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView,
} from 'react-native'
import { router } from 'expo-router'
import { api } from '../../lib/api'
import { SUBJECT_LABELS, type Subject } from '@seolf-talk/domain'

type Question = {
  id: string
  subject: Subject
  level: string
  question: string
  options: string[]
}

type Phase = 'grade-select' | 'testing' | 'result'

type ResultItem = { subject: Subject; score: number; level: string }

const LEVEL_LABEL: Record<string, string> = { low: '초급', mid: '중급', high: '고급' }
const LEVEL_EMOJI: Record<string, string> = { low: '🌱', mid: '🌿', high: '🌳' }
const SUBJECT_EMOJI: Record<Subject, string> = { math: '🔢', korean: '📖', english: '🔤' }

export default function LevelTestScreen() {
  const [phase, setPhase] = useState<Phase>('grade-select')
  const [grade, setGrade] = useState<number>(3)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(0)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResultItem[]>([])

  const subjects: Subject[] = ['math', 'korean', 'english']

  const startTest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/level-test/questions')
      setQuestions(res.data.questions)
      setPhase('testing')
      setCurrentSubjectIdx(0)
      setCurrentQIdx(0)
    } catch {
      Alert.alert('앗!', '문제를 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [grade])

  const currentSubject = subjects[currentSubjectIdx]
  const subjectQuestions = questions.filter((q) => q.subject === currentSubject)
  const currentQ = subjectQuestions[currentQIdx]
  const totalSubjectCount = subjects.length
  const overallProgress = currentSubjectIdx * 5 + currentQIdx + 1
  const totalQuestions = totalSubjectCount * 5

  const handleAnswer = (chosen: number) => {
    if (!currentQ) return
    setAnswers((prev) => ({ ...prev, [currentQ.id]: chosen }))

    const isLastQ = currentQIdx === subjectQuestions.length - 1
    const isLastSubject = currentSubjectIdx === subjects.length - 1

    if (isLastQ && isLastSubject) {
      submitTest({ ...answers, [currentQ.id]: chosen })
    } else if (isLastQ) {
      setCurrentSubjectIdx((i) => i + 1)
      setCurrentQIdx(0)
    } else {
      setCurrentQIdx((i) => i + 1)
    }
  }

  const submitTest = async (finalAnswers: Record<string, number>) => {
    setLoading(true)
    try {
      const answerArr = Object.entries(finalAnswers).map(([questionId, chosen]) => ({
        questionId,
        chosen,
      }))
      const res = await api.post('/level-test/submit', { grade, answers: answerArr })
      setResults(res.data.results)
      setPhase('result')
    } catch {
      Alert.alert('앗!', '결과 저장에 실패했어요.')
    } finally {
      setLoading(false)
    }
  }

  // ── 학년 선택 화면 ─────────────────────────────────────────────────
  if (phase === 'grade-select') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.center}>
          <Text style={styles.bigEmoji}>📝</Text>
          <Text style={styles.title}>내 수준 테스트</Text>
          <Text style={styles.desc}>
            {'지금 몇 학년인지 알려주면\n수준에 맞는 문제로 시작할 수 있어! 🌟'}
          </Text>

          <Text style={styles.sectionLabel}>학년 선택</Text>
          <View style={styles.gradeRow}>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
                onPress={() => setGrade(g)}
              >
                <Text style={[styles.gradeBtnText, grade === g && styles.gradeBtnTextActive]}>
                  {g}학년
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.testInfo}>
            {'수학 · 국어 · 영어 각 5문제 = 총 15문제\n4지선다 · 약 5분 소요'}
          </Text>

          <TouchableOpacity
            style={[styles.startBtn, loading && { opacity: 0.6 }]}
            onPress={startTest}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.startBtnText}>테스트 시작! 🚀</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── 테스트 진행 화면 ───────────────────────────────────────────────
  if (phase === 'testing') {
    if (!currentQ || loading) {
      return (
        <View style={styles.safe}>
          <ActivityIndicator size="large" color="#F4A428" style={{ marginTop: 100 }} />
        </View>
      )
    }

    return (
      <SafeAreaView style={styles.safe}>
        {/* 진행 바 */}
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBar, { width: `${(overallProgress / totalQuestions) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.testContent}>
          {/* 과목 뱃지 */}
          <View style={styles.subjectBadgeRow}>
            {subjects.map((s, i) => (
              <View key={s} style={[styles.subjectBadge, i === currentSubjectIdx && styles.subjectBadgeActive]}>
                <Text style={styles.subjectBadgeText}>
                  {SUBJECT_EMOJI[s]} {SUBJECT_LABELS[s]}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.qCount}>
            {SUBJECT_LABELS[currentSubject]} {currentQIdx + 1} / 5
          </Text>
          <Text style={styles.question}>{currentQ.question}</Text>

          {currentQ.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionBtn}
              onPress={() => handleAnswer(idx)}
            >
              <View style={styles.optionNumber}>
                <Text style={styles.optionNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── 결과 화면 ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.bigEmoji}>🎊</Text>
        <Text style={styles.title}>테스트 완료!</Text>
        <Text style={styles.desc}>{'내 수준을 파악했어!\n이제 딱 맞는 공부를 시작하자.'}</Text>

        <View style={styles.resultsCard}>
          {results.map((r) => (
            <View key={r.subject} style={styles.resultRow}>
              <Text style={styles.resultSubject}>
                {SUBJECT_EMOJI[r.subject as Subject]} {SUBJECT_LABELS[r.subject as Subject]}
              </Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{r.score}/5</Text>
                <View style={[styles.levelBadge, { backgroundColor: levelBgColor(r.level) }]}>
                  <Text style={styles.levelBadgeText}>
                    {LEVEL_EMOJI[r.level]} {LEVEL_LABEL[r.level]}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={() => router.replace('/(tabs)/')}>
          <Text style={styles.startBtnText}>공부 시작하러 가기! 📚</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function levelBgColor(level: string) {
  if (level === 'low') return '#FFF3CD'
  if (level === 'mid') return '#D4EDDA'
  return '#CCE5FF'
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  center: { padding: 28, alignItems: 'center', paddingBottom: 60 },
  bigEmoji: { fontSize: 64, marginTop: 24, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#3D2B1F', marginBottom: 8 },
  desc: { fontSize: 15, color: '#7A6152', textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#3D2B1F', alignSelf: 'flex-start', marginBottom: 12 },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
  gradeBtn: { width: 80, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#E8D5B7', backgroundColor: '#fff', alignItems: 'center' },
  gradeBtnActive: { backgroundColor: '#F4A428', borderColor: '#F4A428' },
  gradeBtnText: { fontSize: 14, fontWeight: '700', color: '#7A6152' },
  gradeBtnTextActive: { color: '#fff' },
  testInfo: { fontSize: 13, color: '#A89080', textAlign: 'center', marginBottom: 32 },
  startBtn: { backgroundColor: '#F4A428', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  progressBarWrap: { height: 6, backgroundColor: '#E8D5B7', marginHorizontal: 0 },
  progressBar: { height: 6, backgroundColor: '#F4A428' },
  testContent: { padding: 24, paddingBottom: 48 },
  subjectBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  subjectBadge: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8D5B7', alignItems: 'center' },
  subjectBadgeActive: { backgroundColor: '#F4A428', borderColor: '#F4A428' },
  subjectBadgeText: { fontSize: 12, fontWeight: '700', color: '#3D2B1F' },
  qCount: { fontSize: 14, color: '#A89080', marginBottom: 8 },
  question: { fontSize: 20, fontWeight: '700', color: '#3D2B1F', marginBottom: 28, lineHeight: 30 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#E8D5B7' },
  optionNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F4A428', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionNumberText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  optionText: { fontSize: 15, color: '#3D2B1F', flex: 1 },
  resultsCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', marginBottom: 28, borderWidth: 1.5, borderColor: '#E8D5B7' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0E8D8' },
  resultSubject: { fontSize: 16, fontWeight: '700', color: '#3D2B1F' },
  resultRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultScore: { fontSize: 15, color: '#A89080', fontWeight: '600' },
  levelBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  levelBadgeText: { fontSize: 13, fontWeight: '700', color: '#3D2B1F' },
})
