export type CharacterId = 'ddong-i' | 'bonggu' | 'topping'

export type DialogueContext = 'correct' | 'wrong' | 'sos' | 'greeting'

export interface CharacterDef {
  id: CharacterId
  displayName: string
  emoji: string
  color: string
  role: string
  dialogues: Record<DialogueContext, string>
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  'ddong-i': {
    id: 'ddong-i',
    displayName: '똥이',
    emoji: '💩',
    color: '#F4A428',
    role: '칭찬과 응원의 아이콘',
    dialogues: {
      greeting: '안녕! 오늘도 황금빛 하루 만들어보자! ✨',
      correct: '우와아! 대단해! 네 덕분에 내 몸이 더 반짝반짝 빛나는 황금빛이 되었어! ✨',
      wrong: '음~ 아까운걸? 하지만 괜찮아! 원래 명탐정들도 첫 고개엔 힌트를 찾거든. 다시 한번 똥이랑 같이 해볼까?',
      sos: '이번 문제는 혼자 풀기 조금 무겁다! 걱정마, 내가 슈퍼 멘토 선생님께 무전기를 쳤어! 📡',
    },
  },
  bonggu: {
    id: 'bonggu',
    displayName: '뽕구',
    emoji: '💨',
    color: '#7CB97E',
    role: '에너지와 활동성의 아이콘',
    dialogues: {
      greeting: '야호! 오늘 같이 신나게 달려보자! ⚽️',
      correct: '골인~~~!!! ⚽️ 네 정답 슛이 골망을 찢었어! 패스 받아라, 슝!',
      wrong: '워우, 이번 슛은 골대를 살짝 빗나갔네! 삑-! 다시 폼 잡고 제대로 차보자구!',
      sos: '이번 문제는 나도 같이 못 풀겠어! 슈퍼 멘토 선생님한테 SOS 쳤다! 같이 기다리자! 📡',
    },
  },
  topping: {
    id: 'topping',
    displayName: '토핑',
    emoji: '🐰',
    color: '#F4A0A0',
    role: '정서적 안정과 힐링의 아이콘',
    dialogues: {
      greeting: '안녕... 오늘도 토핑이랑 천천히 해보자. 🎵',
      correct: '정말 멋진 연주 같은 정답이었어... 🎵 내 마음도 말랑말랑 행복해져.',
      wrong: '조금 어려웠지? 그럴 수 있어, 토핑이도 피아노 건반 처음 누를 땐 맨날 틀렸는걸. 천천히 다시 해보자.',
      sos: '이번 문제는 조금 어렵네... 괜찮아! 우리를 도와줄 선생님을 불렀어. 같이 기다리자. 🌸',
    },
  },
}

export const CHARACTER_LIST = Object.values(CHARACTERS)

export const DEFAULT_CHARACTER: CharacterId = 'bonggu'

export function getCharacter(id: string): CharacterDef {
  return CHARACTERS[id as CharacterId] ?? CHARACTERS[DEFAULT_CHARACTER]
}

export function getDialogue(characterId: string, context: DialogueContext): string {
  return getCharacter(characterId).dialogues[context]
}

// 상점 스킨 목록 (Reward 테이블 seed 데이터 기준)
export const SKIN_CATALOG = [
  { characterId: 'ddong-i', skinName: '탐정 똥이', title: '[스킨] 탐정 똥이', price: 1500, emoji: '🔍💩' },
  { characterId: 'ddong-i', skinName: '화가 똥이', title: '[스킨] 화가 똥이', price: 1500, emoji: '🎨💩' },
  { characterId: 'bonggu',  skinName: '축구왕 뽕구', title: '[스킨] 축구왕 뽕구', price: 2000, emoji: '⚽💨' },
  { characterId: 'bonggu',  skinName: '우주비행사 뽕구', title: '[스킨] 우주비행사 뽕구', price: 2000, emoji: '🚀💨' },
  { characterId: 'topping', skinName: '피아노 토핑', title: '[스킨] 피아노 토핑', price: 2000, emoji: '🎹🐰' },
  { characterId: 'topping', skinName: '파티시에 토핑', title: '[스킨] 파티시에 토핑', price: 2000, emoji: '🎂🐰' },
] as const

export * from './levelTest'
export * from './vocabularyDiagnosis'
