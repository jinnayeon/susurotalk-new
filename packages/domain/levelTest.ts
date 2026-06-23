export type Subject = 'math' | 'korean' | 'english'
export type Level = 'low' | 'mid' | 'high'

export interface TestQuestion {
  id: string
  subject: Subject
  level: Level       // 문제 난이도 (low=1-2학년, mid=3-4학년, high=5-6학년)
  question: string
  options: string[]  // 4지선다
  answer: number     // 정답 index (0-3)
  hint?: string
}

export interface TestAnswer {
  questionId: string
  chosen: number
}

export interface SubjectResult {
  subject: Subject
  score: number    // 0-5
  level: Level
}

// ─── 수학 문제은행 ──────────────────────────────────────────────────
const mathQuestions: TestQuestion[] = [
  // 초등 1-2학년 (low)
  {
    id: 'math-low-1',
    subject: 'math', level: 'low',
    question: '34 + 25 = ?',
    options: ['57', '59', '69', '61'],
    answer: 1,
  },
  {
    id: 'math-low-2',
    subject: 'math', level: 'low',
    question: '72 - 18 = ?',
    options: ['54', '56', '64', '44'],
    answer: 0,
  },
  {
    id: 'math-low-3',
    subject: 'math', level: 'low',
    question: '다음 중 가장 큰 수는?',
    options: ['87', '78', '97', '79'],
    answer: 2,
  },
  {
    id: 'math-low-4',
    subject: 'math', level: 'low',
    question: '사탕 12개를 3명이 똑같이 나누면 한 명이 받는 개수는?',
    options: ['3개', '4개', '5개', '6개'],
    answer: 1,
  },
  {
    id: 'math-low-5',
    subject: 'math', level: 'low',
    question: '직각삼각형의 각 중 직각은 몇 도인가요?',
    options: ['45도', '60도', '90도', '180도'],
    answer: 2,
  },
  // 초등 3-4학년 (mid)
  {
    id: 'math-mid-1',
    subject: 'math', level: 'mid',
    question: '24 × 7 = ?',
    options: ['148', '158', '168', '178'],
    answer: 2,
  },
  {
    id: 'math-mid-2',
    subject: 'math', level: 'mid',
    question: '252 ÷ 4 = ?',
    options: ['61', '62', '63', '64'],
    answer: 2,
  },
  {
    id: 'math-mid-3',
    subject: 'math', level: 'mid',
    question: '1/2 + 1/4 = ?',
    options: ['1/6', '2/6', '3/4', '1/3'],
    answer: 2,
  },
  {
    id: 'math-mid-4',
    subject: 'math', level: 'mid',
    question: '삼각형의 세 각의 합은?',
    options: ['90도', '180도', '270도', '360도'],
    answer: 1,
  },
  {
    id: 'math-mid-5',
    subject: 'math', level: 'mid',
    question: '5 km = ? m',
    options: ['500m', '5,000m', '50,000m', '500,000m'],
    answer: 1,
  },
  // 초등 5-6학년 (high)
  {
    id: 'math-high-1',
    subject: 'math', level: 'high',
    question: '2/3 × 3/4 = ?',
    options: ['5/7', '1/2', '6/12', '2/4'],
    answer: 1,
  },
  {
    id: 'math-high-2',
    subject: 'math', level: 'high',
    question: '원주율(π ≈ 3.14)을 이용해, 반지름이 5cm인 원의 넓이는?',
    options: ['78.5cm²', '31.4cm²', '15.7cm²', '157cm²'],
    answer: 0,
  },
  {
    id: 'math-high-3',
    subject: 'math', level: 'high',
    question: '0.25 × 8 = ?',
    options: ['1', '2', '2.5', '0.2'],
    answer: 1,
  },
  {
    id: 'math-high-4',
    subject: 'math', level: 'high',
    question: '비율 3:5에서 전체가 40이면 큰 쪽의 양은?',
    options: ['15', '20', '25', '30'],
    answer: 2,
  },
  {
    id: 'math-high-5',
    subject: 'math', level: 'high',
    question: '정육면체의 면은 몇 개인가요?',
    options: ['4개', '5개', '6개', '8개'],
    answer: 2,
  },
]

// ─── 국어 문제은행 ──────────────────────────────────────────────────
const koreanQuestions: TestQuestion[] = [
  // 초등 1-2학년 (low)
  {
    id: 'korean-low-1',
    subject: 'korean', level: 'low',
    question: '다음 중 받침이 있는 글자는?',
    options: ['가', '나', '공', '다'],
    answer: 2,
  },
  {
    id: 'korean-low-2',
    subject: 'korean', level: 'low',
    question: '"강아지가 달린다."에서 주어는?',
    options: ['강아지가', '달린다', '강아지', '아지'],
    answer: 0,
  },
  {
    id: 'korean-low-3',
    subject: 'korean', level: 'low',
    question: '다음 중 올바른 맞춤법은?',
    options: ['할게요', '할께요', '핥께요', '핥게요'],
    answer: 0,
  },
  {
    id: 'korean-low-4',
    subject: 'korean', level: 'low',
    question: '"봄이 왔다. 꽃이 핀다."에서 문장은 몇 개인가요?',
    options: ['1개', '2개', '3개', '4개'],
    answer: 1,
  },
  {
    id: 'korean-low-5',
    subject: 'korean', level: 'low',
    question: '\'예쁘다\'의 반대말은?',
    options: ['크다', '밝다', '못생겼다', '작다'],
    answer: 2,
  },
  // 초등 3-4학년 (mid)
  {
    id: 'korean-mid-1',
    subject: 'korean', level: 'mid',
    question: '"그는 책을 읽었다."에서 목적어는?',
    options: ['그는', '책을', '읽었다', '그'],
    answer: 1,
  },
  {
    id: 'korean-mid-2',
    subject: 'korean', level: 'mid',
    question: '다음 중 의성어는?',
    options: ['반짝반짝', '졸졸', '높이', '빠르게'],
    answer: 1,
  },
  {
    id: 'korean-mid-3',
    subject: 'korean', level: 'mid',
    question: '\'낫다\'의 올바른 활용형은?',
    options: ['나아', '낫아', '나사', '낮아'],
    answer: 0,
  },
  {
    id: 'korean-mid-4',
    subject: 'korean', level: 'mid',
    question: '설명하는 글에서 가장 중요한 것은?',
    options: ['흥미로운 이야기', '정확한 사실', '나의 감정', '긴 문장'],
    answer: 1,
  },
  {
    id: 'korean-mid-5',
    subject: 'korean', level: 'mid',
    question: '"소가 웃는다"처럼 사람이 아닌 것을 사람처럼 표현하는 방법은?',
    options: ['직유법', '은유법', '의인법', '과장법'],
    answer: 2,
  },
  // 초등 5-6학년 (high)
  {
    id: 'korean-high-1',
    subject: 'korean', level: 'high',
    question: '주장하는 글에서 \'근거\'란 무엇인가요?',
    options: ['주장의 이유나 증거', '결론', '이야기의 배경', '인물의 특징'],
    answer: 0,
  },
  {
    id: 'korean-high-2',
    subject: 'korean', level: 'high',
    question: '다음 중 피동문은?',
    options: ['고양이가 쥐를 잡는다', '쥐가 고양이에게 잡힌다', '나는 밥을 먹는다', '친구가 책을 읽는다'],
    answer: 1,
  },
  {
    id: 'korean-high-3',
    subject: 'korean', level: 'high',
    question: '\'백문이 불여일견\'의 뜻은?',
    options: ['백 번 보는 것이 중요하다', '백 번 듣는 것보다 한 번 보는 것이 낫다', '보는 것은 위험하다', '듣는 것이 최고다'],
    answer: 1,
  },
  {
    id: 'korean-high-4',
    subject: 'korean', level: 'high',
    question: '시에서 감정을 표현하는 단어들을 묶어서 부르는 말은?',
    options: ['운율', '심상', '정서어', '상징'],
    answer: 2,
  },
  {
    id: 'korean-high-5',
    subject: 'korean', level: 'high',
    question: '독서 감상문을 쓸 때 꼭 들어가야 하는 내용이 아닌 것은?',
    options: ['줄거리', '느낀 점', '책 제목', '작가의 집 주소'],
    answer: 3,
  },
]

// ─── 영어 문제은행 ──────────────────────────────────────────────────
const englishQuestions: TestQuestion[] = [
  // 초등 1-2학년 (low)
  {
    id: 'english-low-1',
    subject: 'english', level: 'low',
    question: '\'사과\'를 영어로 쓰면?',
    options: ['Grape', 'Apple', 'Banana', 'Orange'],
    answer: 1,
  },
  {
    id: 'english-low-2',
    subject: 'english', level: 'low',
    question: '알파벳 순서에서 \'E\' 다음에 오는 글자는?',
    options: ['D', 'G', 'F', 'H'],
    answer: 2,
  },
  {
    id: 'english-low-3',
    subject: 'english', level: 'low',
    question: '\'Red\'의 뜻은?',
    options: ['파란색', '초록색', '노란색', '빨간색'],
    answer: 3,
  },
  {
    id: 'english-low-4',
    subject: 'english', level: 'low',
    question: '\'숫자 3\'을 영어로 쓰면?',
    options: ['One', 'Two', 'Three', 'Four'],
    answer: 2,
  },
  {
    id: 'english-low-5',
    subject: 'english', level: 'low',
    question: '\'Hello\'의 뜻은?',
    options: ['안녕히 가세요', '고맙습니다', '안녕하세요', '미안합니다'],
    answer: 2,
  },
  // 초등 3-4학년 (mid)
  {
    id: 'english-mid-1',
    subject: 'english', level: 'mid',
    question: '"I ___ a student." 빈칸에 들어갈 말은?',
    options: ['is', 'are', 'am', 'be'],
    answer: 2,
  },
  {
    id: 'english-mid-2',
    subject: 'english', level: 'mid',
    question: '\'책\'을 영어로 쓰면?',
    options: ['Book', 'Cook', 'Look', 'Hook'],
    answer: 0,
  },
  {
    id: 'english-mid-3',
    subject: 'english', level: 'mid',
    question: '"What is your name?" 에 대한 알맞은 대답은?',
    options: ['I am fine.', 'My name is Mina.', 'I like cats.', 'Yes, I am.'],
    answer: 1,
  },
  {
    id: 'english-mid-4',
    subject: 'english', level: 'mid',
    question: '\'고양이\'를 영어로 쓰면?',
    options: ['Dog', 'Cat', 'Cow', 'Pig'],
    answer: 1,
  },
  {
    id: 'english-mid-5',
    subject: 'english', level: 'mid',
    question: '\'월요일\'을 영어로 쓰면?',
    options: ['Sunday', 'Tuesday', 'Monday', 'Friday'],
    answer: 2,
  },
  // 초등 5-6학년 (high)
  {
    id: 'english-high-1',
    subject: 'english', level: 'high',
    question: '"She ___ to school every day." 빈칸에 들어갈 말은?',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1,
  },
  {
    id: 'english-high-2',
    subject: 'english', level: 'high',
    question: '"I ___ my homework yesterday." 빈칸에 들어갈 말은?',
    options: ['do', 'does', 'did', 'doing'],
    answer: 2,
  },
  {
    id: 'english-high-3',
    subject: 'english', level: 'high',
    question: '\'더 크다\'를 비교급으로 표현하면?',
    options: ['big', 'biggest', 'bigger', 'most big'],
    answer: 2,
  },
  {
    id: 'english-high-4',
    subject: 'english', level: 'high',
    question: '"Can you help me?" 에서 \'Can\'의 역할은?',
    options: ['명사', '동사', '조동사', '형용사'],
    answer: 2,
  },
  {
    id: 'english-high-5',
    subject: 'english', level: 'high',
    question: '\'도서관\'을 영어로 쓰면?',
    options: ['Cafeteria', 'Library', 'Gymnasium', 'Laboratory'],
    answer: 1,
  },
]

// ─── 공개 API ────────────────────────────────────────────────────────

export const QUESTION_BANK: Record<Subject, TestQuestion[]> = {
  math: mathQuestions,
  korean: koreanQuestions,
  english: englishQuestions,
}

export const SUBJECTS: Subject[] = ['math', 'korean', 'english']

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: '수학',
  korean: '국어',
  english: '영어',
}

// 학년 → 문제 난이도 매핑
export function gradeToLevel(grade: number): Level {
  if (grade <= 2) return 'low'
  if (grade <= 4) return 'mid'
  return 'high'
}

// 점수 → 레벨 판정 (5점 만점)
export function scoreToLevel(score: number): Level {
  if (score <= 2) return 'low'
  if (score <= 3) return 'mid'
  return 'high'
}

// 특정 과목의 레벨별 5문제 가져오기
export function getQuestionsForTest(subject: Subject, grade: number): TestQuestion[] {
  const targetLevel = gradeToLevel(grade)
  const pool = QUESTION_BANK[subject].filter((q) => q.level === targetLevel)
  return pool.slice(0, 5)
}

// 채점
export function gradeAnswers(
  questions: TestQuestion[],
  answers: TestAnswer[]
): { score: number; details: { questionId: string; correct: boolean }[] } {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.chosen]))
  const details = questions.map((q) => ({
    questionId: q.id,
    correct: answerMap.get(q.id) === q.answer,
  }))
  return { score: details.filter((d) => d.correct).length, details }
}
