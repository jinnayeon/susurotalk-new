// ─────────────────────────────────────────────────────────────────────────────
// 국어 어휘력 진단 (학습 참고용)
//
// ⚠️ 본 진단은 국립국어원 등 공개 자료의 어휘 등급 연구 "방향"을 참고하여
//    자체 제작한 "학습 참고용 진단"입니다.
//    - 국가공인/공식 인증/교육부 인증/국립국어원 인증 검사가 아닙니다.
//    - 정확한 학년 판정이나 의학적·심리검사적 진단을 제공하지 않습니다.
//    - 결과는 "현재 학습 권장 레벨"을 안내하는 참고 자료입니다.
//
// 기존 levelTest.ts(수학·국어·영어 레벨 테스트)는 그대로 유지하며,
// 본 모듈은 6단계 어휘 진단을 별도로 확장한 것입니다.
// ─────────────────────────────────────────────────────────────────────────────

/** 진단 레벨 (1=초1-2 … 6=고2-3). "학년 판정"이 아닌 "학습 권장 레벨"입니다. */
export type VocabLevel = 1 | 2 | 3 | 4 | 5 | 6

/** 문항 유형 5종 */
export type VocabQuestionType =
  | 'meaning'   // 어휘 의미
  | 'relation'  // 어휘 관계 (유의어·반의어)
  | 'context'   // 문맥 이해
  | 'expansion' // 어휘 확장 (분류·개념)
  | 'usage'     // 실제 사용

export type VocabDifficulty = 'easy' | 'normal' | 'hard'

export type VocabDomain =
  | 'daily' | 'school' | 'science' | 'society' | 'literature' | 'logic'

/** 결과 구간 (점수 백분율 기준) */
export type VocabResultBand =
  | '기초 어휘 보강 필요'
  | '기본 어휘 이해 중'
  | '권장 수준 근접'
  | '현재 레벨 안정권'

// ─── 출처 / 공식 자료 매핑 (향후 국립국어원 공개자료 연계용) ──────────────────
//
// 현재는 실제 국립국어원 엑셀 원본 파일을 보유하고 있지 않으므로,
// 모든 문항은 자체 제작(self-authored)이며 isOfficial=false 입니다.
// 추후 공식 공개 자료를 확보하면 externalVocabularyId / officialGrade 필드에
// 매핑하여 점진적으로 연계할 수 있도록 구조만 마련해 둡니다.

export const VOCAB_SOURCE_NAME =
  '국립국어원 「국어 기초 어휘 선정 및 어휘 등급화」 연구 방향 참고'
export const VOCAB_SOURCE_LICENSE =
  '공개 자료 참고 · 자체 제작 문항 (원본 파일 미포함)'
export const VOCAB_SOURCE_NOTE =
  '본 진단은 공개 자료의 방향을 참고한 자체 학습 참고용 진단이며, 공식 인증 검사가 아닙니다.'

export interface VocabularySourceMeta {
  /** 참고한 자료 이름 */
  sourceName: string
  /** 자료 성격 */
  sourceType: 'self-authored'
  /** 라이선스/이용 범위 */
  sourceLicense: string
  /** 참고 안내 문구 */
  sourceNote: string
  /** 공식 인증 여부 (항상 false) */
  isOfficial: false
  /** 향후 공식 어휘 ID 매핑용 (현재 null) */
  externalVocabularyId: string | null
  /** 향후 공식 학년/등급 매핑용 (현재 null) */
  officialGrade: string | null
  /** 본 서비스 내부 레벨 */
  serviceLevel: VocabLevel
}

// ─── 문항 타입 ────────────────────────────────────────────────────────────────

export interface VocabularyQuestion {
  id: string
  level: VocabLevel
  /** 권장 학년대 라벨 (예: '초1-2'). 판정이 아닌 참고용 표기 */
  targetBand: string
  questionType: VocabQuestionType
  question: string
  options: string[]
  /** 정답 index (0-base). API 응답 시 제거됨 */
  answer: number
  explanation: string
  /** 다루는 핵심 어휘 */
  vocabulary: string[]
  difficulty: VocabDifficulty
  domain: VocabDomain
  tags: string[]
  score: number
  estimatedTimeSec: number
  wrongAnswerFeedback: string
  nextRecommendation: string
  relatedWords?: string[]
  curriculumNote?: string
  source: VocabularySourceMeta
}

export interface VocabularyAnswer {
  questionId: string
  chosen: number
}

export interface VocabAnswerDetail {
  questionId: string
  questionType: VocabQuestionType
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  score: number
  feedback?: string
}

export interface VocabularyReport {
  summary: string
  scoreText: string
  resultBandText: string
  strongAreasText: string
  weakAreasText: string
  nextTestLabel: string
  nextTestDescription: string
  parentGuide: string
  /** "학습 참고용 진단" 안내. 항상 노출 */
  resultNotice: string
}

export interface VocabularyResult {
  level: VocabLevel
  targetBand: string
  totalQuestions: number
  correctAnswers: number
  totalScore: number
  maxScore: number
  scorePercent: number
  resultBand: VocabResultBand
  strongAreas: string[]
  weakAreas: string[]
  reviewWords: string[]
  recommendedLevel: VocabLevel
  recommendedLevelLabel: string
  answerDetails: VocabAnswerDetail[]
  report: VocabularyReport
}

// ─── 레벨 메타 ────────────────────────────────────────────────────────────────

export interface VocabLevelMeta {
  level: VocabLevel
  label: string          // 'Lv.1'
  targetBand: string     // '초1-2'
  title: string          // '기초 생활 어휘'
  description: string
  /** 항상 "학습 권장 레벨" 톤 */
  recommendNote: string
}

export const VOCAB_LEVEL_META: Record<VocabLevel, VocabLevelMeta> = {
  1: {
    level: 1, label: 'Lv.1', targetBand: '초1-2',
    title: '기초 생활 어휘',
    description: '일상에서 자주 쓰는 기초 낱말의 뜻과 반대말을 익혀요.',
    recommendNote: '초등 1~2학년 학습에 권장되는 레벨이에요.',
  },
  2: {
    level: 2, label: 'Lv.2', targetBand: '초3-4',
    title: '학습 기초 어휘',
    description: '학교 수업과 과학·생활 속 기본 개념어를 익혀요.',
    recommendNote: '초등 3~4학년 학습에 권장되는 레벨이에요.',
  },
  3: {
    level: 3, label: 'Lv.3', targetBand: '초5-6',
    title: '개념·한자어 어휘',
    description: '추상적 개념어와 한자어, 글의 갈래를 이해해요.',
    recommendNote: '초등 5~6학년 학습에 권장되는 레벨이에요.',
  },
  4: {
    level: 4, label: 'Lv.4', targetBand: '중1-2',
    title: '사회·논설 어휘',
    description: '사회·논설문에서 쓰이는 개념어와 추론 어휘를 익혀요.',
    recommendNote: '중학 1~2학년 학습에 권장되는 레벨이에요.',
  },
  5: {
    level: 5, label: 'Lv.5', targetBand: '중3-고1',
    title: '학술·비판 어휘',
    description: '학술 어휘와 비판적 읽기·논증 어휘를 다뤄요.',
    recommendNote: '중학 3학년~고1 학습에 권장되는 레벨이에요.',
  },
  6: {
    level: 6, label: 'Lv.6', targetBand: '고2-3',
    title: '고급 논리·추론 어휘',
    description: '논증의 오류, 철학·논리 개념어 등 고급 어휘를 다뤄요.',
    recommendNote: '고2~3 학습에 권장되는 레벨이에요.',
  },
}

export const QUESTION_TYPE_LABELS: Record<VocabQuestionType, string> = {
  meaning: '어휘 의미',
  relation: '어휘 관계',
  context: '문맥 이해',
  expansion: '어휘 확장',
  usage: '실제 사용',
}

/** 결과 화면 등에서 항상 노출해야 하는 안내 문구 */
export const VOCAB_DIAGNOSIS_DISCLAIMER =
  '본 결과는 학습 참고용 진단입니다. 공식 인증 검사나 정확한 학년 판정이 아니며, ' +
  '현재 학습에 권장되는 어휘 레벨을 안내하는 참고 자료입니다.'

// ─── 문항 데이터 (자체 제작 · 레벨별 10문항 · 유형별 2문항) ──────────────────

type RawVocabQuestion = Omit<VocabularyQuestion, 'id' | 'source'>

const RAW_VOCAB_QUESTIONS: RawVocabQuestion[] = [
  // ─── Level 1 (초1-2) ───────────────────────────────────────────────────────
  {
    level: 1, targetBand: '초1-2', questionType: 'meaning',
    question: "'깨끗하다'는 어떤 뜻일까요?",
    options: ['더럽고 지저분하다', '맑고 깔끔하다', '시끄럽고 떠들썩하다', '느리고 조용하다'],
    answer: 1,
    explanation: "'깨끗하다'는 때나 먼지가 없이 맑고 깔끔한 상태를 뜻해요.",
    vocabulary: ['깨끗하다'], difficulty: 'easy', domain: 'daily',
    tags: ['형용사', '상태어', '일상어'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'깨끗하다'는 '더럽다'의 반대말이에요. 세수 후 얼굴처럼 맑은 상태를 생각해 보세요.",
    nextRecommendation: '반대말 학습: 깨끗하다 ↔ 더럽다',
    relatedWords: ['맑다', '청결하다', '더럽다'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'meaning',
    question: "'무겁다'는 어떤 느낌일까요?",
    options: ['들기 힘들 만큼 무게가 큰 느낌', '아주 빠른 느낌', '매우 뜨거운 느낌', '아주 작은 느낌'],
    answer: 0,
    explanation: "'무겁다'는 물건이 많이 나가서 들기 힘든 느낌을 뜻해요.",
    vocabulary: ['무겁다'], difficulty: 'easy', domain: 'daily',
    tags: ['형용사', '감각어'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'무겁다'는 무게와 관련된 말이에요. 책가방이 많이 들어가면 무거워지죠.",
    nextRecommendation: '반대말 학습: 무겁다 ↔ 가볍다',
    relatedWords: ['가볍다', '무게', '들다'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'relation',
    question: "'크다'의 반대말은 무엇일까요?",
    options: ['넓다', '작다', '높다', '굵다'],
    answer: 1,
    explanation: "'크다'는 크기가 큰 것을 말하고, 반대말은 '작다'예요.",
    vocabulary: ['크다', '작다'], difficulty: 'easy', domain: 'daily',
    tags: ['반의어', '크기'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'넓다', '높다', '굵다'는 모두 크기와 관련되지만 '크다'의 직접 반대말은 '작다'예요.",
    nextRecommendation: '반대말 쌍 연습: 크다↔작다, 높다↔낮다, 넓다↔좁다',
    relatedWords: ['작다', '크기', '넓다', '높다'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'relation',
    question: "'빠르다'와 비슷한 뜻의 말은 무엇일까요?",
    options: ['느리다', '무겁다', '날쌔다', '조용하다'],
    answer: 2,
    explanation: "'날쌔다'는 움직임이 빠르고 민첩하다는 뜻으로, '빠르다'와 비슷해요.",
    vocabulary: ['빠르다', '날쌔다'], difficulty: 'easy', domain: 'daily',
    tags: ['유의어', '속도'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'느리다'는 반대말이에요. '날쌔다'처럼 '재빠르다'도 비슷한 뜻이에요.",
    nextRecommendation: '유의어 학습: 빠르다, 날쌔다, 재빠르다',
    relatedWords: ['재빠르다', '민첩하다', '느리다'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'context',
    question: '"오늘 날씨가 ( ) 밖에 나가기 싫다." 빈칸에 알맞은 말은?',
    options: ['맑아서', '추워서', '예뻐서', '높아서'],
    answer: 1,
    explanation: "날씨가 추울 때 밖에 나가기 싫어지는 것이 자연스러운 상황이에요.",
    vocabulary: ['추워서', '날씨'], difficulty: 'easy', domain: 'daily',
    tags: ['문장 완성', '날씨'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "날씨가 맑거나 예쁘면 오히려 밖에 나가고 싶겠죠? '추워서'가 나가기 싫은 이유가 돼요.",
    nextRecommendation: '날씨 관련 어휘: 맑다, 흐리다, 춥다, 덥다',
    relatedWords: ['춥다', '날씨', '겨울'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'context',
    question: '"배가 ( ) 밥을 빨리 먹었다." 빈칸에 알맞은 말은?',
    options: ['가벼워서', '고파서', '무거워서', '작아서'],
    answer: 1,
    explanation: "'배가 고프다'는 밥을 먹고 싶은 상태예요. 배가 고플 때 밥을 빨리 먹게 돼요.",
    vocabulary: ['배가 고프다'], difficulty: 'easy', domain: 'daily',
    tags: ['문장 완성', '신체'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "'배가 무겁다'는 많이 먹은 후의 느낌이에요. 밥을 빨리 먹는 이유는 '배가 고파서'예요.",
    nextRecommendation: '신체 감각 어휘: 배고프다, 배부르다, 피곤하다',
    relatedWords: ['배고프다', '허기지다', '배부르다'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'expansion',
    question: "다음 중 '과일'이 아닌 것은?",
    options: ['사과', '바나나', '당근', '딸기'],
    answer: 2,
    explanation: "'당근'은 채소예요. 사과, 바나나, 딸기는 모두 과일이에요.",
    vocabulary: ['과일', '채소'], difficulty: 'easy', domain: 'daily',
    tags: ['분류', '과일', '채소'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "당근은 땅속에서 자라는 채소예요. 과일은 나무나 식물에서 달콤하게 열리는 것들이에요.",
    nextRecommendation: '과일 vs 채소 분류 학습',
    relatedWords: ['과일', '채소', '사과', '배', '포도'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'expansion',
    question: "학교에서 사용하는 물건이 아닌 것은?",
    options: ['연필', '지우개', '책가방', '냄비'],
    answer: 3,
    explanation: "'냄비'는 요리할 때 쓰는 주방 도구예요. 연필, 지우개, 책가방은 학용품이에요.",
    vocabulary: ['학용품'], difficulty: 'easy', domain: 'school',
    tags: ['분류', '학용품'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "냄비는 부엌에서 사용하는 물건이에요. 학교에 가져가는 물건들을 '학용품'이라고 해요.",
    nextRecommendation: '학용품 어휘: 연필, 자, 가위, 풀, 색연필',
    relatedWords: ['학용품', '문구', '필통'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'usage',
    question: '"친구가 넘어져서 ( )." 빈칸에 가장 어울리는 말은?',
    options: ['웃었다', '울었다', '뛰었다', '잠잤다'],
    answer: 1,
    explanation: "넘어지면 아프기 때문에 우는 것이 자연스러운 반응이에요.",
    vocabulary: ['넘어지다', '울다'], difficulty: 'easy', domain: 'daily',
    tags: ['상황 이해', '감정'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "친구가 다쳤을 때는 아파서 우는 것이 자연스러워요. 웃거나 뛰는 것은 어울리지 않아요.",
    nextRecommendation: '감정 표현 어휘: 울다, 웃다, 놀라다, 무서워하다',
    relatedWords: ['아프다', '다치다', '울다'],
  },
  {
    level: 1, targetBand: '초1-2', questionType: 'usage',
    question: "아침에 일어나서 제일 먼저 하는 일로 가장 자연스러운 것은?",
    options: ['잠자리에 들다', '세수를 하다', '저녁을 먹다', '학교를 마치다'],
    answer: 1,
    explanation: "아침에 일어나면 보통 세수를 하거나 이를 닦는 것이 자연스러운 순서예요.",
    vocabulary: ['세수', '아침'], difficulty: 'easy', domain: 'daily',
    tags: ['일상생활', '순서'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'잠자리에 들다'는 밤에 자러 갈 때 쓰는 표현이에요. 아침 루틴을 생각해 보세요.",
    nextRecommendation: '하루 일과 어휘: 일어나다, 세수하다, 아침 먹다, 등교하다',
    relatedWords: ['아침', '일어나다', '준비하다'],
  },

  // ─── Level 2 (초3-4) ───────────────────────────────────────────────────────
  {
    level: 2, targetBand: '초3-4', questionType: 'meaning',
    question: "'계획'이란 무엇일까요?",
    options: ['앞으로 할 일을 미리 생각해 정하는 것', '지나간 일을 돌아보는 것', '친구에게 부탁하는 것', '물건을 사고파는 것'],
    answer: 0,
    explanation: "'계획'은 앞으로 무엇을 어떻게 할지 미리 생각해 정하는 것이에요.",
    vocabulary: ['계획'], difficulty: 'easy', domain: 'school',
    tags: ['명사', '학습 어휘'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "계획은 미래를 준비하는 것이에요. 지난 일을 돌아보는 것은 '반성'이나 '회고'예요.",
    nextRecommendation: '학습 관련 어휘: 계획, 목표, 실천, 점검',
    relatedWords: ['목표', '준비', '실천'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'meaning',
    question: "'관찰'은 어떤 행동일까요?",
    options: ['빠르게 달리는 것', '주의 깊게 살펴보는 것', '크게 소리를 내는 것', '물건을 만드는 것'],
    answer: 1,
    explanation: "'관찰'은 어떤 대상을 주의 깊게 살펴보는 것이에요. 과학 시간에 많이 해요.",
    vocabulary: ['관찰'], difficulty: 'easy', domain: 'science',
    tags: ['동사', '과학 어휘'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "관찰은 '눈으로 자세히 보는 것'이에요. 실험이나 자연 관찰 활동을 떠올려 보세요.",
    nextRecommendation: '과학 탐구 어휘: 관찰, 실험, 분류, 측정',
    relatedWords: ['살펴보다', '탐구하다', '발견하다'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'relation',
    question: "'시작'의 반대말은?",
    options: ['진행', '끝', '처음', '앞'],
    answer: 1,
    explanation: "'시작'과 반대되는 말은 '끝'이에요. 일이 시작되면 언젠가 끝나죠.",
    vocabulary: ['시작', '끝'], difficulty: 'easy', domain: 'daily',
    tags: ['반의어'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'처음'은 시작과 비슷한 말이에요. 반대말은 '끝' 또는 '마침'이에요.",
    nextRecommendation: '반대말 쌍: 시작↔끝, 처음↔마지막',
    relatedWords: ['마침', '종료', '처음', '마지막'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'relation',
    question: "'용기'와 가장 비슷한 뜻의 말은?",
    options: ['두려움', '게으름', '씩씩함', '부끄러움'],
    answer: 2,
    explanation: "'용기'는 무서운 일도 꿋꿋하게 해내는 마음이에요. '씩씩함'과 비슷해요.",
    vocabulary: ['용기', '씩씩함'], difficulty: 'normal', domain: 'daily',
    tags: ['유의어', '감정·성격'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "'두려움'은 용기의 반대에 가까워요. 용감하고 씩씩한 마음이 '용기'예요.",
    nextRecommendation: '성격·감정 어휘: 용기, 씩씩하다, 두려움, 자신감',
    relatedWords: ['담력', '자신감', '씩씩하다'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'context',
    question: '"선생님의 말씀을 ( ) 들었다." 빈칸에 알맞은 말은?',
    options: ['대충', '집중해서', '빠르게', '크게'],
    answer: 1,
    explanation: "선생님 말씀은 '집중해서' 듣는 것이 바른 태도예요.",
    vocabulary: ['집중하다'], difficulty: 'easy', domain: 'school',
    tags: ['문장 완성', '태도'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "'대충'은 성의 없이 한다는 뜻이라 어울리지 않아요. '집중해서'가 바른 태도를 나타내요.",
    nextRecommendation: '학습 태도 어휘: 집중하다, 경청하다, 성실하다',
    relatedWords: ['경청하다', '주의하다', '귀 기울이다'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'context',
    question: '"실험 결과를 ( )에 기록했다." 빈칸에 알맞은 말은?',
    options: ['하늘', '공책', '운동장', '음식'],
    answer: 1,
    explanation: "실험 결과는 '공책'에 적어 기록해요.",
    vocabulary: ['기록하다', '공책'], difficulty: 'easy', domain: 'science',
    tags: ['문장 완성', '과학'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "기록하는 것은 글을 쓰는 행동이에요. 글을 쓸 수 있는 공간인 '공책'이 알맞아요.",
    nextRecommendation: '기록 관련 어휘: 공책, 관찰 일지, 적다, 정리하다',
    relatedWords: ['적다', '기재하다', '관찰 일지'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'expansion',
    question: "식물이 자라는 데 필요한 것과 가장 거리가 먼 것은?",
    options: ['햇빛', '물', '흙', '유리'],
    answer: 3,
    explanation: "식물은 햇빛, 물, 흙이 있어야 자라요. 유리는 식물 성장에 꼭 필요한 것이 아니에요.",
    vocabulary: ['식물', '햇빛', '흙'], difficulty: 'normal', domain: 'science',
    tags: ['분류', '과학'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "식물이 자라려면 광합성을 위한 햇빛, 뿌리로 흡수할 물과 흙이 필요해요.",
    nextRecommendation: '식물 관련 어휘: 뿌리, 줄기, 잎, 광합성',
    relatedWords: ['광합성', '뿌리', '줄기'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'expansion',
    question: "다음 중 '감정'을 나타내는 말이 아닌 것은?",
    options: ['기쁘다', '슬프다', '빠르다', '화나다'],
    answer: 2,
    explanation: "'빠르다'는 속도를 나타내는 말이에요. 기쁨, 슬픔, 화남은 모두 감정이에요.",
    vocabulary: ['감정'], difficulty: 'normal', domain: 'daily',
    tags: ['분류', '감정'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "'빠르다'는 마음의 상태가 아니라 움직임의 속도를 나타내요.",
    nextRecommendation: '감정 어휘 확장: 기쁘다, 슬프다, 무섭다, 놀랍다, 그립다',
    relatedWords: ['즐겁다', '행복하다', '속상하다'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'usage',
    question: "친구에게 미안한 마음을 전할 때 쓰는 말로 가장 알맞은 것은?",
    options: ['고마워', '잘했어', '미안해', '안녕'],
    answer: 2,
    explanation: "'미안해'는 잘못을 사과할 때 쓰는 말이에요.",
    vocabulary: ['미안하다'], difficulty: 'easy', domain: 'daily',
    tags: ['실용 표현', '사과'],
    score: 10, estimatedTimeSec: 20,
    wrongAnswerFeedback: "'고마워'는 감사할 때, '잘했어'는 칭찬할 때 써요. 사과할 때는 '미안해'가 맞아요.",
    nextRecommendation: '인사·사과 표현: 미안해, 고마워, 괜찮아, 잘했어',
    relatedWords: ['사과하다', '용서하다', '화해하다'],
  },
  {
    level: 2, targetBand: '초3-4', questionType: 'usage',
    question: "'정직'의 의미를 바르게 사용한 문장은?",
    options: [
      '거짓말을 잘해서 정직하다는 칭찬을 받았다',
      '숨기지 않고 솔직하게 말해서 정직하다는 칭찬을 받았다',
      '공부를 열심히 해서 정직하다는 칭찬을 받았다',
      '운동을 잘해서 정직하다는 칭찬을 받았다',
    ],
    answer: 1,
    explanation: "'정직'은 거짓 없이 바르고 솔직한 것을 말해요.",
    vocabulary: ['정직'], difficulty: 'normal', domain: 'daily',
    tags: ['어휘 적용', '가치'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "정직은 거짓말 없이 솔직한 태도예요. 공부나 운동 능력과는 관계없어요.",
    nextRecommendation: '덕목 어휘: 정직, 성실, 배려, 용기',
    relatedWords: ['솔직하다', '진실하다', '거짓말'],
  },

  // ─── Level 3 (초5-6) ───────────────────────────────────────────────────────
  {
    level: 3, targetBand: '초5-6', questionType: 'meaning',
    question: "'예외'의 뜻으로 알맞은 것은?",
    options: ['일반적인 규칙에서 벗어난 특별한 경우', '모든 규칙을 따르는 것', '여러 사람이 함께 하는 것', '처음으로 만들어진 것'],
    answer: 0,
    explanation: "'예외'는 일반 규칙이나 원칙에 들어맞지 않는 특별한 경우를 뜻해요.",
    vocabulary: ['예외'], difficulty: 'normal', domain: 'school',
    tags: ['한자어', '개념어'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'예외'의 '예(例)'는 사례, '외(外)'는 바깥이에요. 즉 규칙 바깥의 사례예요.",
    nextRecommendation: '규칙 관련 어휘: 원칙, 규칙, 예외, 기준',
    relatedWords: ['특수한 경우', '원칙', '규정'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'meaning',
    question: "'분류'란 무엇인가요?",
    options: ['무언가를 크게 만드는 것', '공통된 특성에 따라 나누어 정리하는 것', '빠르게 이동하는 것', '숫자를 더하는 것'],
    answer: 1,
    explanation: "'분류'는 대상들을 공통된 기준에 따라 나누어 정리하는 것이에요.",
    vocabulary: ['분류'], difficulty: 'normal', domain: 'science',
    tags: ['한자어', '탐구 어휘'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'분(分)'은 나눈다, '류(類)'는 무리·종류예요. 즉 종류별로 나누는 것이에요.",
    nextRecommendation: '탐구 어휘: 분류, 비교, 관찰, 추론',
    relatedWords: ['구분하다', '나누다', '정리하다'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'relation',
    question: "'긍정적'의 반대말은?",
    options: ['적극적', '부정적', '합리적', '논리적'],
    answer: 1,
    explanation: "'긍정적'은 좋게 받아들이는 태도이고, 반대는 '부정적'이에요.",
    vocabulary: ['긍정적', '부정적'], difficulty: 'normal', domain: 'daily',
    tags: ['반의어', '한자어'],
    score: 10, estimatedTimeSec: 25,
    wrongAnswerFeedback: "'적극적'은 활발하게 행동하는 것이고, '합리적·논리적'은 사고방식과 관련돼요.",
    nextRecommendation: '태도·사고 어휘 쌍: 긍정↔부정, 적극↔소극',
    relatedWords: ['낙관적', '비관적', '소극적'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'relation',
    question: "'비유'와 가장 관련된 표현 방법은?",
    options: ['수를 세는 것', '한 가지 대상을 다른 것에 빗대어 표현하는 것', '글자를 크게 쓰는 것', '그림을 그리는 것'],
    answer: 1,
    explanation: "'비유'는 어떤 대상을 다른 것에 빗대어 표현함으로써 의미를 더 생생하게 전달하는 방법이에요.",
    vocabulary: ['비유'], difficulty: 'normal', domain: 'literature',
    tags: ['문학 어휘', '수사법'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'비유'는 '~처럼', '~같이' 등을 써서 두 대상을 빗대는 표현 기법이에요.",
    nextRecommendation: '표현 방법 어휘: 비유, 직유, 은유, 의인',
    relatedWords: ['직유', '은유', '의인화'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'context',
    question: '"이 규칙은 모든 학생에게 ( ) 적용된다." 빈칸에 알맞은 말은?',
    options: ['가끔', '일부만', '동일하게', '절대로'],
    answer: 2,
    explanation: "모든 학생에게 똑같이 적용된다는 뜻이므로 '동일하게'가 맞아요.",
    vocabulary: ['동일하다', '적용'], difficulty: 'normal', domain: 'school',
    tags: ['문맥 이해', '설명문 어휘'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'가끔'이나 '일부만'은 모든 학생에게 적용된다는 의미와 어긋나요.",
    nextRecommendation: '정도·범위 어휘: 동일하게, 균등하게, 일부, 전체',
    relatedWords: ['동등하게', '균등히', '일률적으로'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'context',
    question: '"실험에서 ( )을/를 확인하기 위해 조건을 하나씩 바꾸었다." 빈칸에 알맞은 말은?',
    options: ['원인', '장식', '냄새', '소리'],
    answer: 0,
    explanation: "조건을 바꾸어 실험하는 것은 어떤 현상의 '원인'을 찾기 위해서예요.",
    vocabulary: ['원인', '조건'], difficulty: 'normal', domain: 'science',
    tags: ['문맥 이해', '과학'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "조건 변인을 달리하는 실험은 결과의 '원인'을 찾는 과정이에요.",
    nextRecommendation: '과학 탐구 어휘: 원인, 결과, 조건, 변인, 검증',
    relatedWords: ['요인', '결과', '변인'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'expansion',
    question: "다음 중 '설명하는 글'의 특징으로 알맞은 것은?",
    options: ['쓴 사람의 주관적인 감정이 드러난다', '사실에 근거해 정보를 전달한다', '이야기 속 인물이 등장한다', '읽는 사람을 설득하는 것이 목적이다'],
    answer: 1,
    explanation: "설명하는 글은 사실과 정보를 객관적으로 전달하는 것이 목적이에요.",
    vocabulary: ['설명문'], difficulty: 'normal', domain: 'literature',
    tags: ['글 갈래', '국어'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "설득이 목적인 글은 '논설문'이에요. 감정 표현이 주된 것은 '수필'이나 '시'에 가깝죠.",
    nextRecommendation: '글 종류 어휘: 설명문, 논설문, 수필, 이야기',
    relatedWords: ['정보 전달', '객관', '논설문'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'expansion',
    question: "'추상적'이라는 말의 예로 알맞은 것은?",
    options: ['연필', '행복', '책상', '운동화'],
    answer: 1,
    explanation: "'추상적'인 것은 눈에 보이지 않는 개념이에요. '행복'은 눈에 보이지 않는 감정이에요.",
    vocabulary: ['추상적', '구체적'], difficulty: 'normal', domain: 'school',
    tags: ['개념 이해'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "연필, 책상, 운동화는 눈에 보이는 '구체적' 사물이에요. 행복, 사랑, 자유는 '추상적' 개념이에요.",
    nextRecommendation: '추상어 vs 구체어: 사랑/미움/자유/평화 등',
    relatedWords: ['자유', '사랑', '평화', '구체적'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'usage',
    question: "'원인과 결과'를 나타내는 문장은?",
    options: [
      '비가 왔다. 그리고 눈도 왔다.',
      '비가 많이 와서 강이 넘쳤다.',
      '비가 왔다. 또는 눈이 왔다.',
      '비가 왔다. 하지만 춥지 않았다.',
    ],
    answer: 1,
    explanation: "'비가 많이 와서 강이 넘쳤다'는 '비(원인) → 강이 넘침(결과)' 구조예요.",
    vocabulary: ['원인', '결과'], difficulty: 'normal', domain: 'literature',
    tags: ['문장 구조', '인과'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'그리고'는 나열, '또는'은 선택, '하지만'은 대조예요. '~아서/어서'가 인과 관계를 나타내요.",
    nextRecommendation: '접속어 구분: 그리고(나열), 그래서(인과), 하지만(대조)',
    relatedWords: ['인과관계', '접속어', '까닭'],
  },
  {
    level: 3, targetBand: '초5-6', questionType: 'usage',
    question: "'근거'를 들어 주장하는 문장으로 알맞은 것은?",
    options: [
      '나는 강아지가 좋다.',
      '강아지는 귀엽다.',
      '강아지를 키우면 정서 발달에 도움이 된다는 연구 결과가 있으므로 강아지를 키우는 것이 좋다.',
      '많은 사람들이 강아지를 키운다.',
    ],
    answer: 2,
    explanation: "주장(강아지 키우기 좋다) + 근거(연구 결과)가 함께 있는 문장이 올바른 주장하기예요.",
    vocabulary: ['근거', '주장'], difficulty: 'hard', domain: 'literature',
    tags: ['논증', '주장하기'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "주장만 있고 근거가 없는 문장은 설득력이 부족해요. 근거는 주장을 뒷받침하는 이유예요.",
    nextRecommendation: '주장·근거 구조 학습: 주장 + 이유(근거) + 예시',
    relatedWords: ['주장', '이유', '논거', '설득'],
  },

  // ─── Level 4 (중1-2) ───────────────────────────────────────────────────────
  {
    level: 4, targetBand: '중1-2', questionType: 'meaning',
    question: "'가치관'의 뜻으로 가장 적절한 것은?",
    options: [
      '물건의 가격을 평가하는 안목',
      '무엇이 중요하고 옳은지에 대한 개인의 생각과 기준',
      '학교에서 배우는 과목의 이름',
      '사람의 겉모습을 판단하는 기준',
    ],
    answer: 1,
    explanation: "'가치관'은 무엇이 소중하고 옳은지에 대한 개인적인 판단 기준 체계예요.",
    vocabulary: ['가치관'], difficulty: 'normal', domain: 'society',
    tags: ['한자어', '사회 어휘', '개념어'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "'가치(價値)'는 중요성이나 의미를 뜻하고, '관(觀)'은 관점·견해예요. 가치를 보는 눈이 가치관이에요.",
    nextRecommendation: '가치 관련 어휘: 가치관, 세계관, 인생관, 도덕관',
    relatedWords: ['세계관', '인생관', '윤리관'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'meaning',
    question: "'상충(相衝)'의 의미로 옳은 것은?",
    options: [
      '서로 맞아 잘 어울림',
      '서로 부딪치거나 반대되어 함께 이루기 어려움',
      '서로 도와 함께 발전함',
      '서로를 무시하고 외면함',
    ],
    answer: 1,
    explanation: "'상충'은 두 가지가 서로 충돌하여 양립하기 어려운 상태를 말해요.",
    vocabulary: ['상충'], difficulty: 'hard', domain: 'society',
    tags: ['한자어', '개념어'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "'상(相)'은 서로, '충(衝)'은 충돌이에요. 두 가치나 이익이 충돌할 때 써요.",
    nextRecommendation: '대립 관계 어휘: 상충, 갈등, 모순, 대립',
    relatedWords: ['갈등', '모순', '충돌', '대립'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'relation',
    question: "'객관적'의 반대말은?",
    options: ['합리적', '논리적', '주관적', '체계적'],
    answer: 2,
    explanation: "'객관적'은 개인의 감정을 떠나 사실 그대로 보는 것이고, 반대는 '주관적'이에요.",
    vocabulary: ['객관적', '주관적'], difficulty: 'normal', domain: 'school',
    tags: ['반의어', '한자어'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'합리적'·'논리적'은 사고의 방법이고, '객관적'의 반대는 개인 시각이 들어간 '주관적'이에요.",
    nextRecommendation: '사고 방식 어휘: 객관↔주관, 논리적, 합리적',
    relatedWords: ['편향', '중립', '공정'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'relation',
    question: "'논거(論據)'와 가장 관련이 깊은 말은?",
    options: ['감정', '근거', '소문', '기억'],
    answer: 1,
    explanation: "'논거'는 주장이나 논리를 뒷받침하는 근거를 뜻해요.",
    vocabulary: ['논거'], difficulty: 'normal', domain: 'literature',
    tags: ['한자어', '논설문 어휘'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'논(論)'은 논리·주장, '거(據)'는 근거예요. 논리적 근거를 뜻해요.",
    nextRecommendation: '논증 어휘: 주장, 논거, 반론, 결론',
    relatedWords: ['근거', '전제', '논리'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'context',
    question: '"두 정책은 각각 장단점이 있어 서로 ( )하는 관계이다." 빈칸에 알맞은 말은?',
    options: ['보완', '상충', '일치', '협력'],
    answer: 1,
    explanation: "장단점이 있고 양립하기 어려운 관계이므로 '상충'이 알맞아요.",
    vocabulary: ['상충', '양립'], difficulty: 'hard', domain: 'society',
    tags: ['문맥 추론', '사회 어휘'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "'보완'은 서로 부족한 점을 채우는 것, '협력'은 함께 돕는 것이에요. 서로 부딪히는 관계는 '상충'이에요.",
    nextRecommendation: '관계 어휘: 상충, 보완, 대립, 협력, 갈등',
    relatedWords: ['갈등', '모순', '대립'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'context',
    question: '"이 논설문은 뚜렷한 ( )를 들어 독자를 설득한다." 빈칸에 알맞은 말은?',
    options: ['감상', '근거', '소감', '느낌'],
    answer: 1,
    explanation: "논설문에서 주장을 뒷받침하는 것은 '근거'예요.",
    vocabulary: ['근거', '논설문'], difficulty: 'normal', domain: 'literature',
    tags: ['문맥 이해', '논설문'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'감상'·'소감'·'느낌'은 개인적 반응이에요. 논리적 설득에는 '근거'가 필요해요.",
    nextRecommendation: '논설문 구조: 주장 - 근거 - 예시 - 결론',
    relatedWords: ['논거', '주장', '증거'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'expansion',
    question: "한자어 '변화(變化)'의 뜻이 담긴 문장은?",
    options: [
      '어제와 같은 하루였다.',
      '날씨가 따뜻해지면서 옷차림이 달라졌다.',
      '모든 것이 그대로 유지되었다.',
      '아무것도 바뀌지 않았다.',
    ],
    answer: 1,
    explanation: "'변화'는 모양, 상태, 성질 등이 달라지는 것이에요.",
    vocabulary: ['변화'], difficulty: 'normal', domain: 'school',
    tags: ['한자어 이해', '어휘 적용'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'변(變)'은 바뀐다, '화(化)'는 되다/되어지다예요. 달라지는 상태가 변화예요.",
    nextRecommendation: '변화 관련 어휘: 변화, 발전, 퇴화, 혁신',
    relatedWords: ['변동', '전환', '발전'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'expansion',
    question: "'보편성'과 반대되는 개념은?",
    options: ['일반성', '특수성', '공통성', '동질성'],
    answer: 1,
    explanation: "'보편성'은 모든 것에 두루 통하는 성질이고, 반대는 '특수성'이에요.",
    vocabulary: ['보편성', '특수성'], difficulty: 'hard', domain: 'society',
    tags: ['개념어', '철학 어휘'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "'일반성'·'공통성'은 보편성과 비슷한 말이에요. 반대말은 예외적이고 독특한 '특수성'이에요.",
    nextRecommendation: '철학·사회 개념어: 보편↔특수, 일반↔특정',
    relatedWords: ['특수성', '개별성', '다양성'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'usage',
    question: "'상반(相反)된' 의견을 제시하는 접속 표현으로 알맞은 것은?",
    options: ['~뿐만 아니라', '~또한', '~반면에', '~그러므로'],
    answer: 2,
    explanation: "'반면에'는 앞의 내용과 대조되는 내용을 이어줄 때 써요.",
    vocabulary: ['상반', '반면에'], difficulty: 'normal', domain: 'literature',
    tags: ['접속어', '대조'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'뿐만 아니라'·'또한'은 추가, '그러므로'는 결론이에요. 대조에는 '반면에', '그러나'가 맞아요.",
    nextRecommendation: '접속어 기능 구분: 추가/대조/인과/결론',
    relatedWords: ['반면', '그러나', '하지만', '대조'],
  },
  {
    level: 4, targetBand: '중1-2', questionType: 'usage',
    question: "'귀납적' 추론 방식을 설명한 것은?",
    options: [
      '일반 원리에서 출발해 특수한 사례를 이끌어낸다.',
      '여러 구체적 사례에서 공통된 원리를 이끌어낸다.',
      '권위 있는 사람의 말을 그대로 따른다.',
      '감정에 호소해 결론을 내린다.',
    ],
    answer: 1,
    explanation: "'귀납'은 구체적 사례들을 모아 일반 원리를 도출하는 추론 방식이에요.",
    vocabulary: ['귀납적', '추론'], difficulty: 'hard', domain: 'logic',
    tags: ['논리 어휘', '사고력'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "일반→특수가 '연역', 특수→일반이 '귀납'이에요.",
    nextRecommendation: '추론 방식: 귀납법 vs 연역법',
    relatedWords: ['연역적', '사례', '원리', '일반화'],
  },

  // ─── Level 5 (중3-고1) ─────────────────────────────────────────────────────
  {
    level: 5, targetBand: '중3-고1', questionType: 'meaning',
    question: "'역설(逆說)'의 뜻으로 가장 적절한 것은?",
    options: [
      '논리적으로 명확하게 맞는 설명',
      '겉으로는 모순처럼 보이지만 그 안에 진실이 담긴 표현',
      '반대 의견을 완전히 무시하는 주장',
      '상황을 과장해서 설명하는 것',
    ],
    answer: 1,
    explanation: "'역설'은 표면적으로 모순이거나 이상해 보이지만 깊이 생각하면 진실을 담고 있는 표현이에요.",
    vocabulary: ['역설'], difficulty: 'normal', domain: 'literature',
    tags: ['문학 어휘', '수사법'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "'역(逆)'은 거스른다, '설(說)'은 말이에요. '이상하게 들리지만 진실인 말'을 뜻해요.",
    nextRecommendation: '수사법 어휘: 역설, 반어, 과장, 대조',
    relatedWords: ['반어', '아이러니', '모순', '역리'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'meaning',
    question: "'함의(含意)'란?",
    options: [
      '소리 내어 읽는 것',
      '어떤 말이나 글 속에 담겨 있는 숨은 의미',
      '글자를 정확히 쓰는 것',
      '문장을 짧게 줄이는 것',
    ],
    answer: 1,
    explanation: "'함의'는 명시적으로 표현되지 않았지만 내포되어 있는 숨은 의미예요.",
    vocabulary: ['함의'], difficulty: 'hard', domain: 'literature',
    tags: ['학술 어휘', '의미론'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "'함(含)'은 머금다, '의(意)'는 뜻이에요. 겉으로 드러나지 않은 속뜻이 함의예요.",
    nextRecommendation: '의미 관련 어휘: 함의, 내포, 외연, 맥락',
    relatedWords: ['내포', '암시', '시사'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'relation',
    question: "'추상(抽象)'의 반대 개념은?",
    options: ['이상', '구체', '관념', '이념'],
    answer: 1,
    explanation: "눈에 보이지 않는 '추상'의 반대는 직접 경험할 수 있는 '구체'예요.",
    vocabulary: ['추상', '구체'], difficulty: 'normal', domain: 'school',
    tags: ['반의어', '철학 개념'],
    score: 10, estimatedTimeSec: 30,
    wrongAnswerFeedback: "'이상'은 현실과 대비되는 말이에요. '추상'의 반대는 감각으로 파악 가능한 '구체'예요.",
    nextRecommendation: '추상↔구체 개념 학습',
    relatedWords: ['구상', '형상', '구체적'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'relation',
    question: "'연역(演繹)'과 대비되는 추론 방법은?",
    options: ['분류', '귀납', '비교', '요약'],
    answer: 1,
    explanation: "'연역'이 일반→특수라면, '귀납'은 특수→일반으로 대비되는 추론 방식이에요.",
    vocabulary: ['연역', '귀납'], difficulty: 'hard', domain: 'logic',
    tags: ['논리 어휘', '대비'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "연역은 일반 원리에서 시작, 귀납은 사례에서 시작해요. 두 방법은 방향이 반대예요.",
    nextRecommendation: '추론 방법 비교: 귀납 vs 연역',
    relatedWords: ['귀납', '연역', '추론', '논리'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'context',
    question: '"이 글은 현상을 ( )하여 그 원인을 밝히고 있다." 빈칸에 알맞은 말은?',
    options: ['장식', '분석', '암기', '수집'],
    answer: 1,
    explanation: "현상의 원인을 밝히는 것은 '분석' 활동이에요.",
    vocabulary: ['분석'], difficulty: 'normal', domain: 'school',
    tags: ['문맥 이해', '학술 어휘'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "'분석'은 전체를 부분으로 나누어 면밀히 살피는 것이에요. '암기'나 '수집'과는 다른 활동이에요.",
    nextRecommendation: '학술 동사 어휘: 분석, 종합, 평가, 추론',
    relatedWords: ['검토', '고찰', '규명'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'context',
    question: '"사회적 ( )은 개인의 행동에 영향을 미치는 무언의 기대이다." 빈칸에 알맞은 말은?',
    options: ['통념', '규범', '소문', '감정'],
    answer: 1,
    explanation: "'규범'은 사회 구성원이 지켜야 할 기준이나 무언의 기대를 말해요.",
    vocabulary: ['규범'], difficulty: 'hard', domain: 'society',
    tags: ['사회 어휘', '문맥 추론'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "'통념'은 일반적으로 통용되는 생각이에요. 행동 기준이 되는 것은 '규범'이에요.",
    nextRecommendation: '사회 제도 어휘: 규범, 통념, 관습, 제도',
    relatedWords: ['관습', '도덕', '윤리'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'expansion',
    question: "'비판적 읽기'의 태도로 알맞은 것은?",
    options: [
      '글의 내용을 그대로 받아들인다.',
      '필자의 주장과 근거의 타당성을 따져 읽는다.',
      '모르는 단어만 찾아 읽는다.',
      '빠르게 훑어 읽는다.',
    ],
    answer: 1,
    explanation: "비판적 읽기는 글의 주장과 근거가 타당한지 스스로 판단하며 읽는 것이에요.",
    vocabulary: ['비판적 읽기'], difficulty: 'normal', domain: 'literature',
    tags: ['독해 전략', '국어'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "비판적 읽기는 부정적으로 보는 것이 아니라 근거와 논리를 점검하며 읽는 능동적 독서예요.",
    nextRecommendation: '독해 전략: 비판적 읽기, 추론하며 읽기, 요약하기',
    relatedWords: ['타당성', '근거 검토', '능동적 독서'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'expansion',
    question: "다음 중 '학술 어휘'로 볼 수 있는 것은?",
    options: ['맛있다', '패러다임', '달리다', '예쁘다'],
    answer: 1,
    explanation: "'패러다임'은 특정 시대나 분야에서 지배적인 사고 틀을 뜻하는 학술 어휘예요.",
    vocabulary: ['패러다임'], difficulty: 'hard', domain: 'school',
    tags: ['학술 어휘', '어휘 분류'],
    score: 10, estimatedTimeSec: 35,
    wrongAnswerFeedback: "일상어(맛있다, 달리다, 예쁘다)와 달리, '패러다임'은 학문적 논의에서 주로 쓰이는 학술 어휘예요.",
    nextRecommendation: '학술 어휘 목록: 패러다임, 맥락, 논증, 개념, 담론',
    relatedWords: ['개념틀', '시각', '담론'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'usage',
    question: "'통념(通念)'을 반박하는 글의 전략으로 적절한 것은?",
    options: [
      '일반적인 믿음이 옳다고 재확인한다.',
      '일반적으로 받아들여지는 생각이 사실과 다름을 근거로 보여준다.',
      '감동적인 이야기로 독자를 설득한다.',
      '전문가의 말을 그대로 인용한다.',
    ],
    answer: 1,
    explanation: "통념 반박 전략은 사람들이 당연하다고 여기는 생각이 틀렸음을 근거로 입증하는 것이에요.",
    vocabulary: ['통념', '반박'], difficulty: 'hard', domain: 'literature',
    tags: ['글쓰기 전략', '논증'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "전문가 인용만으로는 통념을 반박하기 어려워요. 통념이 잘못된 이유를 구체적 근거로 보여야 해요.",
    nextRecommendation: '논증 전략: 통념 제시 → 반례 제시 → 대안 주장',
    relatedWords: ['반론', '반박', '이의 제기'],
  },
  {
    level: 5, targetBand: '중3-고1', questionType: 'usage',
    question: "'개념 정의' 방식으로 글을 시작하는 방법은?",
    options: [
      "'나는 오늘 학교에 갔다'로 시작한다.",
      "'민주주의란 국민이 주권을 갖는 정치 체제이다'처럼 핵심 개념을 명확히 밝히며 시작한다.",
      '재미있는 일화로 시작한다.',
      '질문만 던지고 답을 보류한다.',
    ],
    answer: 1,
    explanation: "개념 정의 방식은 핵심 개념의 의미를 명확히 제시함으로써 글의 논의 범위를 설정하는 글쓰기 전략이에요.",
    vocabulary: ['개념 정의'], difficulty: 'hard', domain: 'literature',
    tags: ['글쓰기 전략', '비문학'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "개념 정의는 독자와 필자가 같은 출발점에서 논의를 시작할 수 있게 해줘요.",
    nextRecommendation: '글 시작 전략: 개념 정의, 문제 제기, 일화, 통계',
    relatedWords: ['정의', '개념어', '논제 설정'],
  },

  // ─── Level 6 (고2-3) ───────────────────────────────────────────────────────
  {
    level: 6, targetBand: '고2-3', questionType: 'meaning',
    question: "'자의적(恣意的)'의 뜻으로 가장 적절한 것은?",
    options: [
      '규칙이나 원칙에 따라 결정되는',
      '일정한 기준 없이 마음대로인',
      '여러 사람의 합의에 의해 결정되는',
      '과학적 근거에 기반한',
    ],
    answer: 1,
    explanation: "'자의적'은 객관적 기준 없이 자기 마음대로인 상태를 뜻해요.",
    vocabulary: ['자의적'], difficulty: 'hard', domain: 'logic',
    tags: ['한자어', '고급 어휘'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "'자(恣)'는 마음대로·제멋대로, '의(意)'는 뜻·생각이에요. 규칙 없이 임의로 결정하는 것이 자의적이에요.",
    nextRecommendation: '대비 어휘: 자의적 ↔ 필연적, 자의적 ↔ 합의적',
    relatedWords: ['임의적', '자의', '독단적'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'meaning',
    question: "'환원(還元)'의 의미로 가장 적절한 것은?",
    options: [
      '새로운 것을 창조하는 것',
      '복잡한 것을 더 간단한 요소나 원래 상태로 되돌리는 것',
      '여러 개를 하나로 합치는 것',
      '불필요한 것을 제거하는 것',
    ],
    answer: 1,
    explanation: "'환원'은 어떤 것을 보다 근본적이거나 단순한 것으로 되돌리는 것을 뜻해요.",
    vocabulary: ['환원'], difficulty: 'hard', domain: 'logic',
    tags: ['한자어', '철학 어휘'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "'환(還)'은 돌아오다, '원(元)'은 근원이에요. 복잡한 것을 근본으로 되돌리는 것이 환원이에요.",
    nextRecommendation: '철학 어휘: 환원, 통합, 분해, 귀결',
    relatedWords: ['귀결', '소급', '해체'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'relation',
    question: "'귀결(歸結)'과 가장 가까운 뜻의 말은?",
    options: ['출발', '결론', '과정', '원인'],
    answer: 1,
    explanation: "'귀결'은 어떤 과정이나 논의가 마지막으로 도달하는 결론을 뜻해요.",
    vocabulary: ['귀결'], difficulty: 'hard', domain: 'logic',
    tags: ['유의어', '논리 어휘'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "'귀(歸)'는 돌아가다, '결(結)'은 맺다예요. 최종적으로 도달하는 지점이 귀결이에요.",
    nextRecommendation: '결론 표현 어휘: 귀결, 결론, 귀착, 도달',
    relatedWords: ['결론', '귀착', '종착'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'relation',
    question: "'전제(前提)'와 '결론'의 관계로 옳은 것은?",
    options: [
      '전제는 결론 이후에 제시된다.',
      '전제는 결론을 이끌어내는 근거나 조건이다.',
      '전제와 결론은 서로 독립적이다.',
      '결론이 전제를 설명한다.',
    ],
    answer: 1,
    explanation: "논증에서 전제는 결론을 논리적으로 지지하거나 이끌어내는 근거 역할을 해요.",
    vocabulary: ['전제', '결론'], difficulty: 'hard', domain: 'logic',
    tags: ['논리 구조', '추론'],
    score: 10, estimatedTimeSec: 40,
    wrongAnswerFeedback: "논증 구조: 전제(이유·근거) → 결론(주장). 전제 없이는 결론을 도출할 수 없어요.",
    nextRecommendation: '논증 구조 학습: 전제 → 추론 → 결론',
    relatedWords: ['가정', '근거', '논증'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'context',
    question: '"이 이론은 실험 결과와 ( )하지 않아 수정이 필요하다." 빈칸에 알맞은 말은?',
    options: ['모순', '부합', '환원', '전제'],
    answer: 1,
    explanation: "실험 결과와 이론이 맞지 않아 수정이 필요한 상황이므로 '부합하지 않아'가 맞아요.",
    vocabulary: ['부합'], difficulty: 'hard', domain: 'logic',
    tags: ['문맥 추론', '학술 어휘'],
    score: 10, estimatedTimeSec: 45,
    wrongAnswerFeedback: "'부합(符合)'은 서로 맞아 들어맞는 것이에요. '부합하지 않는다'는 맞지 않는다는 뜻이에요.",
    nextRecommendation: '일치 여부 어휘: 부합, 일치, 배치, 상충',
    relatedWords: ['일치', '합치', '배치(背馳)'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'context',
    question: '"글쓴이는 ( ) 논리를 통해 특수한 사례에서 보편 원리를 도출한다." 빈칸에 알맞은 말은?',
    options: ['연역적', '귀납적', '분류적', '비교적'],
    answer: 1,
    explanation: "특수 사례 → 보편 원리는 귀납적 논리예요.",
    vocabulary: ['귀납적'], difficulty: 'hard', domain: 'logic',
    tags: ['문맥 추론', '논리'],
    score: 10, estimatedTimeSec: 45,
    wrongAnswerFeedback: "연역은 보편→특수, 귀납은 특수→보편이에요. 방향을 기억하는 것이 핵심이에요.",
    nextRecommendation: '귀납·연역 비교 심화 학습',
    relatedWords: ['귀납', '연역', '일반화'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'expansion',
    question: "다음 중 '논증의 오류'에 해당하는 것은?",
    options: [
      '근거가 충분히 제시된 주장',
      '권위에 의존하여 주장의 정당성을 대신하는 것',
      '사례와 일반화가 일관된 추론',
      '반론을 수용하고 재반박하는 것',
    ],
    answer: 1,
    explanation: "'권위에 의존하는 오류'는 전문가나 유명인의 말을 근거 없이 진실로 받아들이는 논리적 오류예요.",
    vocabulary: ['논증의 오류', '권위에 의존'], difficulty: 'hard', domain: 'logic',
    tags: ['논리 오류', '비판적 사고'],
    score: 10, estimatedTimeSec: 45,
    wrongAnswerFeedback: "논리적 오류는 주장의 근거가 부적절할 때 발생해요. 권위자의 말도 검증이 필요해요.",
    nextRecommendation: '논리적 오류 유형: 권위 오류, 허수아비 오류, 순환 논리',
    relatedWords: ['허수아비 오류', '순환 논리', '감정 호소'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'expansion',
    question: "'메타언어(metalanguage)'의 개념에 가장 가까운 것은?",
    options: [
      '일상에서 사용하는 구어',
      '언어를 설명하거나 분석하는 데 사용하는 언어',
      '시에서 쓰이는 비유적 표현',
      '외국어를 번역한 말',
    ],
    answer: 1,
    explanation: "'메타언어'는 언어 자체를 대상으로 설명하거나 분석할 때 사용하는 언어예요.",
    vocabulary: ['메타언어'], difficulty: 'hard', domain: 'literature',
    tags: ['언어학 어휘', '고급 개념'],
    score: 10, estimatedTimeSec: 45,
    wrongAnswerFeedback: "'meta-'는 '~에 대한'이라는 의미예요. 메타언어는 언어에 대해 말하는 언어예요.",
    nextRecommendation: '언어학 기초 어휘: 메타언어, 기호, 의미, 맥락',
    relatedWords: ['대상언어', '기호', '의미론'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'usage',
    question: "'상대화(相對化)'를 적절히 사용한 표현은?",
    options: [
      '절대적인 진리는 모든 상황에 동일하게 적용된다.',
      '어떤 가치나 판단은 맥락에 따라 달라질 수 있음을 인정한다.',
      '모든 주장은 동등하게 올바르다.',
      '비교 없이 단독으로 평가한다.',
    ],
    answer: 1,
    explanation: "'상대화'는 절대적이라고 여기던 것을 맥락이나 조건에 따라 달라질 수 있다고 보는 것이에요.",
    vocabulary: ['상대화'], difficulty: 'hard', domain: 'logic',
    tags: ['철학 어휘', '어휘 적용'],
    score: 10, estimatedTimeSec: 45,
    wrongAnswerFeedback: "상대화는 '모든 것이 다 맞다'는 상대주의와 다르게, 맥락을 고려하는 인식론적 태도예요.",
    nextRecommendation: '인식론 어휘: 상대주의, 절대주의, 맥락, 관점',
    relatedWords: ['맥락', '관점', '상대주의'],
  },
  {
    level: 6, targetBand: '고2-3', questionType: 'usage',
    question: "비문학 독해에서 핵심 주제를 파악하는 전략으로 가장 적절한 것은?",
    options: [
      '모르는 어휘를 사전에서 모두 찾아본다.',
      '각 문단의 중심 문장을 찾아 연결하고 글 전체의 논지를 파악한다.',
      '글을 여러 번 소리 내어 읽는다.',
      '먼저 결론 부분만 읽는다.',
    ],
    answer: 1,
    explanation: "비문학 독해의 핵심은 각 문단의 중심 문장을 파악하고 전체 논지를 구성하는 것이에요.",
    vocabulary: ['논지', '중심 문장'], difficulty: 'hard', domain: 'literature',
    tags: ['독해 전략', '비문학'],
    score: 10, estimatedTimeSec: 45,
    wrongAnswerFeedback: "어휘 찾기나 소리 내어 읽기는 보조 수단이에요. 구조적으로 논지를 파악하는 것이 핵심 전략이에요.",
    nextRecommendation: '비문학 독해 전략: 문단 요약 → 주제 통합 → 논지 파악',
    relatedWords: ['논지', '주제', '중심 내용', '논증 구조'],
  },
]

function buildBank(raw: RawVocabQuestion[]): VocabularyQuestion[] {
  const counters: Record<string, number> = {}
  return raw.map((q) => {
    const key = `${q.level}-${q.questionType}`
    counters[key] = (counters[key] ?? 0) + 1
    const id = `vocab-L${q.level}-${q.questionType}-${counters[key]}`
    return {
      ...q,
      id,
      source: {
        sourceName: VOCAB_SOURCE_NAME,
        sourceType: 'self-authored',
        sourceLicense: VOCAB_SOURCE_LICENSE,
        sourceNote: VOCAB_SOURCE_NOTE,
        isOfficial: false,
        externalVocabularyId: null,
        officialGrade: null,
        serviceLevel: q.level,
      },
    }
  })
}

export const VOCABULARY_QUESTION_BANK: VocabularyQuestion[] = buildBank(RAW_VOCAB_QUESTIONS)

export const VOCAB_LEVELS: VocabLevel[] = [1, 2, 3, 4, 5, 6]

// ─── 공개 함수 ────────────────────────────────────────────────────────────────

export function isVocabLevel(n: number): n is VocabLevel {
  return n >= 1 && n <= 6 && Number.isInteger(n)
}

/** 특정 레벨의 문항 (정답 포함, 출제 순서는 유형 섞기). */
export function getVocabularyQuestions(level: VocabLevel): VocabularyQuestion[] {
  return VOCABULARY_QUESTION_BANK.filter((q) => q.level === level)
}

/** 점수 백분율 → 결과 구간 */
export function calcResultBand(scorePercent: number): VocabResultBand {
  if (scorePercent < 40) return '기초 어휘 보강 필요'
  if (scorePercent < 60) return '기본 어휘 이해 중'
  if (scorePercent < 80) return '권장 수준 근접'
  return '현재 레벨 안정권'
}

/** 결과에 따른 다음 권장 레벨 */
export function calcRecommendedLevel(level: VocabLevel, scorePercent: number): VocabLevel {
  if (scorePercent >= 80 && level < 6) return (level + 1) as VocabLevel
  if (scorePercent < 40 && level > 1) return (level - 1) as VocabLevel
  return level
}

/** 채점 + 결과 리포트 생성 (학습 참고용) */
export function gradeVocabulary(
  level: VocabLevel,
  answers: VocabularyAnswer[]
): VocabularyResult {
  const questions = getVocabularyQuestions(level)
  const answerMap = new Map(answers.map((a) => [a.questionId, a.chosen]))

  const answerDetails: VocabAnswerDetail[] = questions.map((q) => {
    const userAnswer = answerMap.get(q.id) ?? -1
    const isCorrect = userAnswer === q.answer
    return {
      questionId: q.id,
      questionType: q.questionType,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect,
      score: isCorrect ? q.score : 0,
      feedback: isCorrect ? undefined : q.wrongAnswerFeedback,
    }
  })

  const totalQuestions = questions.length
  const correctAnswers = answerDetails.filter((d) => d.isCorrect).length
  const totalScore = answerDetails.reduce((sum, d) => sum + d.score, 0)
  const maxScore = questions.reduce((sum, q) => sum + q.score, 0)
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  const resultBand = calcResultBand(scorePercent)
  const recommendedLevel = calcRecommendedLevel(level, scorePercent)

  // 유형별 정답률 → 강한/약한 영역
  const byType: Record<VocabQuestionType, { correct: number; total: number }> = {
    meaning: { correct: 0, total: 0 },
    relation: { correct: 0, total: 0 },
    context: { correct: 0, total: 0 },
    expansion: { correct: 0, total: 0 },
    usage: { correct: 0, total: 0 },
  }
  for (const d of answerDetails) {
    byType[d.questionType].total += 1
    if (d.isCorrect) byType[d.questionType].correct += 1
  }
  const strongAreas: string[] = []
  const weakAreas: string[] = []
  ;(Object.keys(byType) as VocabQuestionType[]).forEach((type) => {
    const { correct, total } = byType[type]
    if (total === 0) return
    const rate = correct / total
    if (rate >= 0.7) strongAreas.push(QUESTION_TYPE_LABELS[type])
    else if (rate < 0.5) weakAreas.push(QUESTION_TYPE_LABELS[type])
  })

  // 복습 추천 단어: 틀린 문항의 핵심 어휘 (중복 제거)
  const reviewWords = Array.from(
    new Set(
      answerDetails
        .filter((d) => !d.isCorrect)
        .flatMap((d) => questions.find((q) => q.id === d.questionId)?.vocabulary ?? [])
    )
  ).slice(0, 8)

  const meta = VOCAB_LEVEL_META[level]
  const recommendedMeta = VOCAB_LEVEL_META[recommendedLevel]
  const report = buildVocabularyReport({
    level,
    scorePercent,
    correctAnswers,
    totalQuestions,
    totalScore,
    maxScore,
    resultBand,
    strongAreas,
    weakAreas,
    recommendedLevel,
  })

  return {
    level,
    targetBand: meta.targetBand,
    totalQuestions,
    correctAnswers,
    totalScore,
    maxScore,
    scorePercent,
    resultBand,
    strongAreas,
    weakAreas,
    reviewWords,
    recommendedLevel,
    recommendedLevelLabel: `${recommendedMeta.label} (${recommendedMeta.targetBand})`,
    answerDetails,
    report,
  }
}

interface ReportInput {
  level: VocabLevel
  scorePercent: number
  correctAnswers: number
  totalQuestions: number
  totalScore: number
  maxScore: number
  resultBand: VocabResultBand
  strongAreas: string[]
  weakAreas: string[]
  recommendedLevel: VocabLevel
}

export function buildVocabularyReport(input: ReportInput): VocabularyReport {
  const meta = VOCAB_LEVEL_META[input.level]
  const recommendedMeta = VOCAB_LEVEL_META[input.recommendedLevel]

  const bandMessage: Record<VocabResultBand, string> = {
    '기초 어휘 보강 필요':
      '기초 어휘를 한 번 더 다지면 좋아요. 쉬운 단어부터 차근차근 익혀보세요.',
    '기본 어휘 이해 중':
      '기본 어휘를 잘 이해하고 있어요. 조금만 더 연습하면 다음 단계가 보여요.',
    '권장 수준 근접':
      '권장 수준에 거의 도달했어요. 약한 영역만 보완하면 안정권이에요.',
    '현재 레벨 안정권':
      '현재 레벨의 어휘를 안정적으로 다루고 있어요. 다음 레벨에 도전해 볼 수 있어요.',
  }

  let nextTestLabel: string
  let nextTestDescription: string
  if (input.recommendedLevel > input.level) {
    nextTestLabel = `${recommendedMeta.label} 도전`
    nextTestDescription =
      `${meta.label} 어휘를 잘 다뤘어요! 다음 단계인 ${recommendedMeta.label}(${recommendedMeta.targetBand}) 어휘에 도전해 보세요.`
  } else if (input.recommendedLevel < input.level) {
    nextTestLabel = `${recommendedMeta.label} 복습`
    nextTestDescription =
      `기초를 한 번 더 다지면 좋아요. ${recommendedMeta.label}(${recommendedMeta.targetBand}) 어휘로 복습해 보세요.`
  } else {
    nextTestLabel = `${meta.label} 한 번 더`
    nextTestDescription =
      `${meta.label} 어휘를 조금 더 익히면 다음 레벨로 올라갈 수 있어요. 약한 영역 위주로 다시 풀어보세요.`
  }

  const strongText = input.strongAreas.length > 0 ? input.strongAreas.join(', ') : '아직 두드러진 영역이 없어요'
  const weakText = input.weakAreas.length > 0 ? input.weakAreas.join(', ') : '특별히 약한 영역은 없어요'

  return {
    summary:
      `${meta.label}(${meta.targetBand}) 어휘 진단에서 ${input.totalQuestions}문항 중 ` +
      `${input.correctAnswers}문항을 맞혔어요. ${bandMessage[input.resultBand]}`,
    scoreText: `${input.totalScore} / ${input.maxScore}점 (${input.scorePercent}%)`,
    resultBandText: input.resultBand,
    strongAreasText: `강한 영역: ${strongText}`,
    weakAreasText: `보강하면 좋은 영역: ${weakText}`,
    nextTestLabel,
    nextTestDescription,
    parentGuide:
      '이 진단은 자녀의 현재 학습에 권장되는 어휘 레벨을 가늠하기 위한 참고 자료입니다. ' +
      '점수가 낮더라도 걱정하기보다, 보강하면 좋은 영역을 함께 살펴보고 꾸준히 어휘를 늘려가도록 격려해 주세요. ' +
      '본 결과는 공식 인증 검사나 학년 판정이 아닙니다.',
    resultNotice: VOCAB_DIAGNOSIS_DISCLAIMER,
  }
}
