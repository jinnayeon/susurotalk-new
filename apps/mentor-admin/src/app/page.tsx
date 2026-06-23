'use client'

import { useEffect, useState, useCallback } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type Post = {
  id: string
  title: string
  content: string
  subject: string
  grade: number
  status: string
  createdAt: string
  user?: { childProfile?: { nickname?: string; grade?: number } | null }
  _count?: { comments: number }
}

type Match = {
  id: string
  matchedAt: string
  post: Post & {
    comments: { id: string; userId: string; content: string; createdAt: string }[]
  }
}

const SUBJECT_LABEL: Record<string, string> = { math: '수학', korean: '국어', english: '영어', etc: '기타' }
const SUBJECT_EMOJI: Record<string, string> = { math: '🔢', korean: '📖', english: '🔤', etc: '📝' }

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('mentor_token') ?? ''
}

function authHeader() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
}

export default function MentorDashboard() {
  const [token, setToken] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'dashboard'>('phone')
  const [openPosts, setOpenPosts] = useState<Post[]>([])
  const [myMatches, setMyMatches] = useState<Match[]>([])
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'open' | 'matched'>('open')

  useEffect(() => {
    const t = getToken()
    if (t) { setToken(t); setStep('dashboard') }
  }, [])

  const sendOtp = async () => {
    await fetch(`${API_URL}/auth/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    setStep('otp')
  }

  const verifyOtp = async () => {
    const res = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, token: otp }),
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('mentor_token', data.token)
      setToken(data.token)
      setStep('dashboard')
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    const [openRes, matchRes] = await Promise.all([
      fetch(`${API_URL}/mentor/open-posts`, { headers: authHeader() }),
      fetch(`${API_URL}/mentor/my-matches`, { headers: authHeader() }),
    ])
    setOpenPosts(await openRes.json())
    setMyMatches(await matchRes.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (step === 'dashboard') loadData()
  }, [step, loadData])

  const claim = async (postId: string) => {
    await fetch(`${API_URL}/mentor/claim/${postId}`, { method: 'POST', headers: authHeader() })
    loadData()
  }

  const reply = async (postId: string) => {
    const content = replyText[postId]?.trim()
    if (!content) return
    await fetch(`${API_URL}/board/${postId}/comments`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ content }),
    })
    setReplyText((p) => ({ ...p, [postId]: '' }))
    loadData()
  }

  const logout = () => {
    localStorage.removeItem('mentor_token')
    setToken('')
    setStep('phone')
  }

  // ── 로그인 화면 ─────────────────────────────────────────────────
  if (step !== 'dashboard') {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <div style={styles.logo}>📡 스스로톡 멘토</div>
          <p style={styles.loginDesc}>아이들의 질문에 답해주세요</p>
          {step === 'phone' ? (
            <>
              <input
                style={styles.input}
                placeholder="전화번호 (예: 01012345678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button style={styles.btn} onClick={sendOtp}>인증번호 받기</button>
            </>
          ) : (
            <>
              <input
                style={styles.input}
                placeholder="인증번호 6자리"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button style={styles.btn} onClick={verifyOtp}>로그인</button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── 대시보드 화면 ────────────────────────────────────────────────
  return (
    <div style={styles.dashboard}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>📡 스스로톡 멘토 대시보드</div>
        <button style={styles.logoutBtn} onClick={logout}>로그아웃</button>
      </div>

      {/* 탭 */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'open' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('open')}
        >
          🆕 새 질문 ({openPosts.length})
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'matched' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('matched')}
        >
          💬 내 매칭 ({myMatches.length})
        </button>
      </div>

      {loading && <div style={styles.loading}>불러오는 중...</div>}

      {/* 새 질문 탭 */}
      {activeTab === 'open' && (
        <div style={styles.list}>
          {openPosts.length === 0 && !loading && (
            <div style={styles.empty}>현재 새 질문이 없어요. 잠시 후 확인해주세요!</div>
          )}
          {openPosts.map((post) => (
            <div key={post.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.subjectBadge}>
                  {SUBJECT_EMOJI[post.subject]} {SUBJECT_LABEL[post.subject]}
                </span>
                <span style={styles.grade}>{post.grade}학년</span>
                <span style={styles.nickname}>{post.user?.childProfile?.nickname ?? '익명'}</span>
              </div>
              <div style={styles.cardTitle}>{post.title}</div>
              <div style={styles.cardContent}>{post.content}</div>
              <div style={styles.cardFooter}>
                <span style={styles.meta}>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                <button style={styles.claimBtn} onClick={() => claim(post.id)}>
                  ✋ 내가 도와줄게요!
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 내 매칭 탭 */}
      {activeTab === 'matched' && (
        <div style={styles.list}>
          {myMatches.length === 0 && !loading && (
            <div style={styles.empty}>아직 매칭된 질문이 없어요. 새 질문 탭에서 클레임해보세요!</div>
          )}
          {myMatches.map((match) => (
            <div key={match.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.subjectBadge}>
                  {SUBJECT_EMOJI[match.post.subject]} {SUBJECT_LABEL[match.post.subject]}
                </span>
                <span style={styles.grade}>{match.post.grade}학년</span>
                <span style={{ ...styles.badge, backgroundColor: '#4CAF50' }}>매칭됨</span>
              </div>
              <div style={styles.cardTitle}>{match.post.title}</div>
              <div style={styles.cardContent}>{match.post.content}</div>

              {/* 댓글 목록 */}
              {match.post.comments.length > 0 && (
                <div style={styles.comments}>
                  {match.post.comments.map((c) => (
                    <div key={c.id} style={styles.comment}>{c.content}</div>
                  ))}
                </div>
              )}

              {/* 답변 입력 */}
              <div style={styles.replyRow}>
                <textarea
                  style={styles.textarea}
                  placeholder="친절하게 답변을 써주세요..."
                  value={replyText[match.post.id] ?? ''}
                  onChange={(e) => setReplyText((p) => ({ ...p, [match.post.id]: e.target.value }))}
                />
                <button style={styles.replyBtn} onClick={() => reply(match.post.id)}>
                  답변 보내기 ✉️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 인라인 스타일 (Next.js 초기 세팅이라 CSS module 없이 구성)
const styles: Record<string, React.CSSProperties> = {
  loginWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#FFF8E7' },
  loginCard: { background: '#fff', borderRadius: 24, padding: '40px 32px', width: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' },
  logo: { fontSize: 28, fontWeight: 800, color: '#3D2B1F', marginBottom: 8 },
  loginDesc: { color: '#A89080', marginBottom: 24 },
  input: { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #E8D5B7', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '14px', background: '#F4A428', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 14, cursor: 'pointer' },
  dashboard: { maxWidth: 900, margin: '0 auto', padding: '0 20px 60px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #E8D5B7', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 800, color: '#3D2B1F' },
  logoutBtn: { background: 'none', border: '1px solid #E8D5B7', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#A89080' },
  tabs: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { flex: 1, padding: '12px', border: '1.5px solid #E8D5B7', borderRadius: 14, background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#A89080', fontSize: 14 },
  tabActive: { background: '#F4A428', borderColor: '#F4A428', color: '#fff' },
  loading: { textAlign: 'center', color: '#A89080', padding: 40 },
  empty: { textAlign: 'center', color: '#A89080', padding: 60, fontSize: 15 },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: { background: '#fff', borderRadius: 18, padding: 20, border: '1px solid #E8D5B7' },
  cardHeader: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 },
  subjectBadge: { background: '#FFF3CD', borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700, color: '#3D2B1F' },
  grade: { color: '#A89080', fontSize: 13 },
  nickname: { color: '#7A6152', fontSize: 13, fontWeight: 600 },
  badge: { borderRadius: 8, padding: '3px 10px', fontSize: 12, color: '#fff', fontWeight: 700 },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#3D2B1F', marginBottom: 6 },
  cardContent: { fontSize: 14, color: '#7A6152', lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-wrap' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 12, color: '#A89080' },
  claimBtn: { background: '#F4A428', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  comments: { background: '#F9F3E8', borderRadius: 12, padding: 14, marginBottom: 12 },
  comment: { fontSize: 14, color: '#3D2B1F', marginBottom: 8, lineHeight: 1.5 },
  replyRow: { display: 'flex', flexDirection: 'column', gap: 8 },
  textarea: { width: '100%', minHeight: 90, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E8D5B7', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none' },
  replyBtn: { background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14, alignSelf: 'flex-end' },
}
