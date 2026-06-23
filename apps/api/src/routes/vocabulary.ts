import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'
import {
  VOCAB_LEVELS,
  VOCAB_LEVEL_META,
  VOCAB_DIAGNOSIS_DISCLAIMER,
  QUESTION_TYPE_LABELS,
  getVocabularyQuestions,
  gradeVocabulary,
  isVocabLevel,
  type VocabLevel,
  type VocabularyAnswer,
} from '@seolf-talk/domain'

// 국어 어휘력 진단 (학습 참고용)
// - 별도의 DB 모델 없이 도메인 문제은행을 사용하는 무상태(stateless) 진단입니다.
// - 기존 levelTest 라우터 패턴(requireAuth + 도메인 함수)을 그대로 따릅니다.
export const vocabularyRouter = Router()
vocabularyRouter.use(requireAuth)

// 진단 레벨 목록 (Lv.1~6 메타)
vocabularyRouter.get('/levels', (_req: AuthRequest, res) => {
  res.json({
    notice: VOCAB_DIAGNOSIS_DISCLAIMER,
    questionTypes: QUESTION_TYPE_LABELS,
    levels: VOCAB_LEVELS.map((level) => {
      const meta = VOCAB_LEVEL_META[level]
      return {
        level: meta.level,
        label: meta.label,
        targetBand: meta.targetBand,
        title: meta.title,
        description: meta.description,
        recommendNote: meta.recommendNote,
        questionCount: getVocabularyQuestions(level).length,
      }
    }),
  })
})

// 특정 레벨 문항 조회 (정답 제외)
vocabularyRouter.get('/questions', (req: AuthRequest, res, next) => {
  try {
    const level = Number(req.query.level)
    if (!isVocabLevel(level)) {
      return res.status(400).json({ error: 'level은 1~6 사이의 정수여야 합니다.' })
    }
    const meta = VOCAB_LEVEL_META[level as VocabLevel]
    const questions = getVocabularyQuestions(level as VocabLevel).map((q) => ({
      id: q.id,
      level: q.level,
      targetBand: q.targetBand,
      questionType: q.questionType,
      question: q.question,
      options: q.options,
      // answer / explanation / wrongAnswerFeedback 은 제출 후 결과에서 제공
    }))
    res.json({
      level,
      label: meta.label,
      targetBand: meta.targetBand,
      title: meta.title,
      notice: VOCAB_DIAGNOSIS_DISCLAIMER,
      questions,
    })
  } catch (err) {
    next(err)
  }
})

const submitSchema = z.object({
  level: z.number().int().min(1).max(6),
  answers: z.array(
    z.object({ questionId: z.string(), chosen: z.number().int().min(-1).max(3) })
  ),
})

// 답안 제출 → 채점 + 결과 리포트 (학습 참고용, 저장하지 않음)
vocabularyRouter.post('/submit', (req: AuthRequest, res, next) => {
  try {
    const { level, answers } = submitSchema.parse(req.body)
    if (!isVocabLevel(level)) {
      return res.status(400).json({ error: 'level은 1~6 사이의 정수여야 합니다.' })
    }
    const result = gradeVocabulary(level as VocabLevel, answers as VocabularyAnswer[])
    res.json(result)
  } catch (err) {
    next(err)
  }
})
