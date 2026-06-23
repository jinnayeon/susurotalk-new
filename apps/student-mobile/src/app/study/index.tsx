import { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { api } from '../../lib/api'

interface LevelItem {
  level: number
  label: string
  targetBand: string
  title: string
  description: string
  recommendNote: string
  questionCount: number
}

const LEVEL_EMOJI: Record<number, string> = {
  1: '🌱', 2: '🌿', 3: '🌳', 4: '📘', 5: '📙', 6: '🎓',
}

export default function StudyScreen() {
  const [levels, setLevels] = useState<LevelItem[]>([])
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api
      .get('/vocabulary/levels')
      .then((r) => {
        setLevels(r.data.levels ?? [])
        setNotice(r.data.notice ?? '')
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerEmoji}>🔤</Text>
        <Text style={styles.title}>국어 어휘력 진단</Text>
        <Text style={styles.subtitle}>
          {'레벨을 골라 어휘력을 진단해 보세요.\n학습에 권장되는 레벨을 알려줄게요.'}
        </Text>

        {/* 학습 참고용 안내 (항상 노출) */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ {notice || '본 진단은 학습 참고용이며 공식 인증 검사나 학년 판정이 아닙니다.'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F4A428" style={{ marginTop: 60 }} />
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>목록을 불러오지 못했어요.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryBtnText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          levels.map((lv) => (
            <TouchableOpacity
              key={lv.level}
              style={styles.levelCard}
              onPress={() =>
                router.push({
                  pathname: '/study/vocabulary-test',
                  params: { level: String(lv.level) },
                })
              }
            >
              <View style={styles.levelBadge}>
                <Text style={styles.levelEmoji}>{LEVEL_EMOJI[lv.level] ?? '📖'}</Text>
                <Text style={styles.levelLabel}>{lv.label}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>
                  {lv.title} <Text style={styles.levelBand}>· {lv.targetBand}</Text>
                </Text>
                <Text style={styles.levelDesc} numberOfLines={2}>{lv.description}</Text>
                <Text style={styles.levelMeta}>{lv.questionCount}문항 · {lv.recommendNote}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/(tabs)/')}>
          <Text style={styles.backLinkText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8E7' },
  content: { padding: 20 },
  headerEmoji: { fontSize: 48, textAlign: 'center', marginTop: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#3D2B1F', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#7A6152', textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 16 },
  noticeBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FFD8A8' },
  noticeText: { fontSize: 12, color: '#8A6D3B', lineHeight: 18 },
  center: { alignItems: 'center', marginTop: 40 },
  errorText: { fontSize: 14, color: '#A89080', marginBottom: 16 },
  retryBtn: { backgroundColor: '#F4A428', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28 },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  levelCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#E8D5B7',
  },
  levelBadge: { alignItems: 'center', width: 56, marginRight: 12 },
  levelEmoji: { fontSize: 28 },
  levelLabel: { fontSize: 12, fontWeight: '800', color: '#F4A428', marginTop: 2 },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 15, fontWeight: '700', color: '#3D2B1F' },
  levelBand: { fontSize: 13, color: '#A89080', fontWeight: '600' },
  levelDesc: { fontSize: 13, color: '#7A6152', lineHeight: 19, marginTop: 4 },
  levelMeta: { fontSize: 11, color: '#A89080', marginTop: 6 },
  arrow: { fontSize: 20, color: '#F4A428', fontWeight: '700', marginLeft: 8 },
  backLink: { alignItems: 'center', paddingVertical: 16 },
  backLinkText: { color: '#A89080', fontSize: 14 },
})
