import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'

interface AnswerDetail {
  questionId: string
  questionType: string
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  score: number
  feedback?: string
}

interface Report {
  summary: string
  scoreText: string
  resultBandText: string
  strongAreasText: string
  weakAreasText: string
  nextTestLabel: string
  nextTestDescription: string
  parentGuide: string
  resultNotice: string
}

interface TestResult {
  level: number
  targetBand: string
  totalQuestions: number
  correctAnswers: number
  totalScore: number
  maxScore: number
  scorePercent: number
  resultBand: string
  strongAreas: string[]
  weakAreas: string[]
  reviewWords: string[]
  recommendedLevel: number
  recommendedLevelLabel: string
  needsLowerLevelCheck?: boolean
  levelConfirmed?: boolean
  answerDetails: AnswerDetail[]
  report: Report
}

const RESULT_BAND_COLOR: Record<string, string> = {
  '기초 어휘 보강 필요': '#EF9A9A',
  '기본 어휘 이해 중':   '#FFE082',
  '권장 수준 근접':       '#A5D6A7',
  '현재 레벨 안정권':     '#81D4FA',
}

const RESULT_BAND_EMOJI: Record<string, string> = {
  '기초 어휘 보강 필요': '🌱',
  '기본 어휘 이해 중':   '📖',
  '권장 수준 근접':       '🌳',
  '현재 레벨 안정권':     '🏆',
}

function ScoreMeter({ percent }: { percent: number }) {
  return (
    <View style={meterStyles.wrap}>
      <View style={meterStyles.track}>
        <View style={[meterStyles.fill, { width: `${Math.min(percent, 100)}%` }]} />
      </View>
      <Text style={meterStyles.label}>{percent}%</Text>
    </View>
  )
}

const meterStyles = StyleSheet.create({
  wrap: { marginVertical: 8 },
  track: { height: 14, backgroundColor: '#E8D5B7', borderRadius: 7, overflow: 'hidden' },
  fill: { height: 14, backgroundColor: '#F4A428', borderRadius: 7 },
  label: { fontSize: 13, color: '#A89080', textAlign: 'right', marginTop: 4 },
})

export default function TestResultScreen() {
  const { result: resultParam } = useLocalSearchParams<{ result: string }>()
  let result: TestResult | null = null
  try {
    result = resultParam ? (JSON.parse(resultParam) as TestResult) : null
  } catch {
    result = null
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>결과를 불러올 수 없어요.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/study')}>
            <Text style={styles.backBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const bandColor = RESULT_BAND_COLOR[result.resultBand] ?? '#E8D5B7'
  const bandEmoji = RESULT_BAND_EMOJI[result.resultBand] ?? '📝'

  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/study')
  }

  const retryTest = () => {
    router.replace({
      pathname: '/study/vocabulary-test',
      params: { level: String(result!.level) },
    })
  }

  const tryNextLevel = () => {
    router.replace({
      pathname: '/study/vocabulary-test',
      params: { level: String(result!.recommendedLevel) },
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity style={styles.backTop} onPress={goBack} hitSlop={10}>
          <Text style={styles.backTopText}>‹ 뒤로</Text>
        </TouchableOpacity>

        {/* 결과 헤더 */}
        <View style={[styles.resultHeader, { backgroundColor: bandColor }]}>
          <Text style={styles.resultEmoji}>{bandEmoji}</Text>
          <Text style={styles.resultBandText}>{result.resultBand}</Text>
          <Text style={styles.resultLevelText}>Lv.{result.level} · {result.targetBand} 권장</Text>
        </View>

        {/* 정밀 재진단 안내 (현재 레벨이 어려웠을 때) */}
        {result.needsLowerLevelCheck && (
          <View style={styles.descentBanner}>
            <Text style={styles.descentEmoji}>🔎</Text>
            <Text style={styles.descentTitle}>정확한 수준을 확인해 볼까요?</Text>
            <Text style={styles.descentText}>
              이번 Lv.{result.level} 어휘가 조금 어려웠어요.{'\n'}
              {result.recommendedLevelLabel}을 바로 풀어보면 더 정확한 수준을 알 수 있어요.
            </Text>
            <TouchableOpacity style={styles.descentBtn} onPress={tryNextLevel}>
              <Text style={styles.descentBtnText}>
                {result.recommendedLevelLabel} 정밀 진단 바로 풀기 →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 점수 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 점수 결과</Text>
          <Text style={styles.scoreMain}>{result.totalScore}점</Text>
          <Text style={styles.scoreMax}>/ {result.maxScore}점</Text>
          <ScoreMeter percent={result.scorePercent} />
          <Text style={styles.correctRate}>
            정답 {result.correctAnswers}문항 / 전체 {result.totalQuestions}문항
          </Text>
        </View>

        {/* 영역별 결과 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📌 영역 분석</Text>
          <View style={styles.areaRow}>
            <View style={[styles.areaBox, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.areaLabel}>강한 영역</Text>
              <Text style={styles.areaValue}>
                {result.strongAreas.length > 0 ? result.strongAreas.join('\n') : '데이터 부족'}
              </Text>
            </View>
            <View style={[styles.areaBox, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.areaLabel}>복습 필요 영역</Text>
              <Text style={styles.areaValue}>
                {result.weakAreas.length > 0 ? result.weakAreas.join('\n') : '없음'}
              </Text>
            </View>
          </View>
        </View>

        {/* 복습 단어 */}
        {result.reviewWords.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔖 추천 복습 단어</Text>
            <View style={styles.wordWrap}>
              {result.reviewWords.map((w) => (
                <View key={w} style={styles.wordTag}>
                  <Text style={styles.wordTagText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 다음 레벨 추천 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 다음 학습 추천</Text>
          <Text style={styles.nextLevel}>
            {result.recommendedLevelLabel} 테스트
          </Text>
          <Text style={styles.nextLevelDesc}>{result.report.nextTestDescription}</Text>
          {result.recommendedLevel !== result.level && !result.needsLowerLevelCheck && (
            <TouchableOpacity style={styles.nextBtn} onPress={tryNextLevel}>
              <Text style={styles.nextBtnText}>
                {result.recommendedLevel > result.level
                  ? `${result.recommendedLevelLabel} 도전하기 →`
                  : `${result.recommendedLevelLabel} 복습하기 →`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 결과 참고 안내 */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>📋 결과 참고 안내</Text>
          <Text style={styles.noticeText}>{result.report.resultNotice}</Text>
        </View>

        {/* 부모/보호자 안내 */}
        <View style={styles.parentCard}>
          <Text style={styles.parentTitle}>👨‍👩‍👧 부모·보호자 안내</Text>
          <Text style={styles.parentText}>{result.report.parentGuide}</Text>
        </View>

        {/* 액션 버튼 */}
        <TouchableOpacity style={styles.retryBtn} onPress={retryTest}>
          <Text style={styles.retryBtnText}>🔄 같은 레벨 다시 풀기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/study')}>
          <Text style={styles.homeBtnText}>테스트 목록으로</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8E7' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: '#A89080', marginBottom: 20 },

  backTop: { alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 4 },
  backTopText: { color: '#7A6152', fontSize: 16, fontWeight: '700' },

  // 정밀 재진단 안내
  descentBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F4A428',
    alignItems: 'center',
  },
  descentEmoji: { fontSize: 36, marginBottom: 6 },
  descentTitle: { fontSize: 17, fontWeight: '800', color: '#3D2B1F', marginBottom: 8, textAlign: 'center' },
  descentText: { fontSize: 13, color: '#7A6152', lineHeight: 20, textAlign: 'center', marginBottom: 16 },
  descentBtn: {
    backgroundColor: '#F4A428',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  descentBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },

  // 결과 헤더
  resultHeader: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultEmoji: { fontSize: 52, marginBottom: 8 },
  resultBandText: { fontSize: 22, fontWeight: '800', color: '#3D2B1F' },
  resultLevelText: { fontSize: 14, color: '#3D2B1F', marginTop: 6, opacity: 0.7 },

  // 공통 카드
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8D5B7',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#3D2B1F', marginBottom: 12 },

  // 점수
  scoreMain: { fontSize: 48, fontWeight: '900', color: '#F4A428', textAlign: 'center' },
  scoreMax: { fontSize: 16, color: '#A89080', textAlign: 'center', marginTop: -4, marginBottom: 8 },
  correctRate: { fontSize: 13, color: '#A89080', textAlign: 'center', marginTop: 6 },

  // 영역
  areaRow: { flexDirection: 'row', gap: 10 },
  areaBox: { flex: 1, borderRadius: 12, padding: 12 },
  areaLabel: { fontSize: 12, color: '#3D2B1F', fontWeight: '600', marginBottom: 6 },
  areaValue: { fontSize: 13, color: '#3D2B1F', lineHeight: 20 },

  // 복습 단어
  wordWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  wordTag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  wordTagText: { fontSize: 13, color: '#1565C0', fontWeight: '600' },

  // 다음 레벨
  nextLevel: { fontSize: 20, fontWeight: '800', color: '#F4A428', marginBottom: 4 },
  nextLevelDesc: { fontSize: 13, color: '#A89080', lineHeight: 20, marginBottom: 14 },
  nextBtn: {
    backgroundColor: '#F4A428',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // 안내
  noticeCard: {
    backgroundColor: '#F3F3F3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  noticeTitle: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6 },
  noticeText: { fontSize: 12, color: '#666', lineHeight: 20 },

  // 부모 안내
  parentCard: {
    backgroundColor: '#EDE7F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  parentTitle: { fontSize: 13, fontWeight: '700', color: '#4527A0', marginBottom: 6 },
  parentText: { fontSize: 12, color: '#4527A0', lineHeight: 20 },

  // 버튼
  retryBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F4A428',
  },
  retryBtnText: { color: '#F4A428', fontSize: 15, fontWeight: '700' },
  homeBtn: {
    backgroundColor: '#3D2B1F',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  backBtn: {
    backgroundColor: '#F4A428',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
})
