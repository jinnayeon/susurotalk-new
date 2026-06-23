import { Router } from 'express'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { getDialogue } from '@seolf-talk/domain'

export const learningRouter = Router()
learningRouter.use(requireAuth)

// 학습 세션 시작 (과제와 캐릭터 연결)
learningRouter.post('/start/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const profile = await prisma.childProfile.findUniqueOrThrow({ where: { userId: req.userId! } })
    const task = await prisma.studyTask.findUniqueOrThrow({
      where: { id: req.params.taskId, userId: req.userId! },
    })

    const state = await prisma.learningState.upsert({
      where: { taskId: task.id },
      create: {
        userId: req.userId!,
        taskId: task.id,
        characterId: profile.characterId,
        status: 'IN_PROGRESS',
      },
      update: { status: 'IN_PROGRESS' },
    })

    const greeting = getDialogue(state.characterId, 'greeting')
    res.json({ ...state, message: greeting })
  } catch (err) {
    next(err)
  }
})

// 오답 기록 (캐릭터 위로 대사 반환)
learningRouter.post('/wrong/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const state = await prisma.learningState.update({
      where: { taskId: req.params.taskId },
      data: { wrongCount: { increment: 1 } },
    })

    const message = getDialogue(state.characterId, 'wrong')
    const sosTriggered = state.wrongCount >= 3

    if (sosTriggered) {
      await prisma.learningState.update({
        where: { taskId: req.params.taskId },
        data: { status: 'MENTOR_HELP_REQUIRED' },
      })
    }

    res.json({
      wrongCount: state.wrongCount,
      message: sosTriggered ? getDialogue(state.characterId, 'sos') : message,
      sosTriggered,
    })
  } catch (err) {
    next(err)
  }
})

// SOS 직접 요청 (아이가 "어려워요" 버튼 클릭)
learningRouter.post('/sos/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const state = await prisma.learningState.update({
      where: { taskId: req.params.taskId },
      data: { status: 'MENTOR_HELP_REQUIRED' },
    })

    const message = getDialogue(state.characterId, 'sos')
    res.json({ ...state, message })
  } catch (err) {
    next(err)
  }
})
