import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import {
  getQuestionsForTest,
  gradeAnswers,
  scoreToLevel,
  SUBJECTS,
  type Subject,
  type TestAnswer,
} from '@seolf-talk/domain'

export const levelTestRouter = Router()
levelTestRouter.use(requireAuth)

// 레벨 테스트 문제 조회 (학년 기준으로 과목별 5문제)
levelTestRouter.get('/questions', async (req: AuthRequest, res, next) => {
  try {
    const profile = await prisma.childProfile.findUnique({ where: { userId: req.userId! } })
    const grade = profile?.grade ?? 3

    const questions = SUBJECTS.flatMap((subject) =>
      getQuestionsForTest(subject, grade).map((q) => ({
        id: q.id,
        subject: q.subject,
        level: q.level,
        question: q.question,
        options: q.options,
        // answer 필드는 노출 안 함
      }))
    )

    res.json({ grade, questions })
  } catch (err) {
    next(err)
  }
})

const submitSchema = z.object({
  grade: z.number().int().min(1).max(6),
  answers: z.array(
    z.object({ questionId: z.string(), chosen: z.number().int().min(0).max(3) })
  ),
})

// 레벨 테스트 답안 제출 → 채점 → 결과 저장
levelTestRouter.post('/submit', async (req: AuthRequest, res, next) => {
  try {
    const { grade, answers } = submitSchema.parse(req.body)

    const results: { subject: Subject; score: number; level: string }[] = []

    for (const subject of SUBJECTS) {
      const questions = getQuestionsForTest(subject, grade)
      const subjectAnswers: TestAnswer[] = answers.filter((a) =>
        questions.some((q) => q.id === a.questionId)
      )
      const { score } = gradeAnswers(questions, subjectAnswers)
      const level = scoreToLevel(score)

      // upsert: 같은 과목은 최신 결과로 덮어씀
      await prisma.levelTestResult.upsert({
        where: { userId_subject: { userId: req.userId!, subject } },
        create: { userId: req.userId!, subject, score, level, answers: subjectAnswers },
        update: { score, level, answers: subjectAnswers, createdAt: new Date() },
      })

      results.push({ subject, score, level })
    }

    // ChildProfile에 레벨 요약 저장
    const subjectLevels = Object.fromEntries(results.map((r) => [r.subject, r.level]))
    await prisma.childProfile.upsert({
      where: { userId: req.userId! },
      create: { userId: req.userId!, nickname: '친구', grade, levelTested: true, subjectLevels },
      update: { grade, levelTested: true, subjectLevels },
    })

    res.json({ results, subjectLevels })
  } catch (err) {
    next(err)
  }
})

// 내 레벨 결과 조회
levelTestRouter.get('/my-result', async (req: AuthRequest, res, next) => {
  try {
    const profile = await prisma.childProfile.findUnique({ where: { userId: req.userId! } })
    const testResults = await prisma.levelTestResult.findMany({ where: { userId: req.userId! } })
    res.json({ levelTested: profile?.levelTested ?? false, subjectLevels: profile?.subjectLevels ?? {}, results: testResults })
  } catch (err) {
    next(err)
  }
})
