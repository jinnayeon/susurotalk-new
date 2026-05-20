import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const taskRouter = Router()
taskRouter.use(requireAuth)

const createSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
})

taskRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tasks = await prisma.studyTask.findMany({
      where: { userId: req.userId!, date: { gte: today } },
      orderBy: { date: 'asc' },
    })
    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

taskRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const task = await prisma.studyTask.create({
      data: { ...data, userId: req.userId! },
    })
    res.json(task)
  } catch (err) {
    next(err)
  }
})

taskRouter.patch('/:id/complete', async (req: AuthRequest, res, next) => {
  try {
    const task = await prisma.studyTask.update({
      where: { id: req.params.id, userId: req.userId! },
      data: { status: 'done', completedAt: new Date() },
    })

    await prisma.sticker.create({
      data: { userId: req.userId!, type: 'task_done' },
    })

    await prisma.childProfile.upsert({
      where: { userId: req.userId! },
      create: { userId: req.userId!, nickname: '친구', totalPoints: 500 },
      update: { totalPoints: { increment: 500 } },
    })

    res.json(task)
  } catch (err) {
    next(err)
  }
})
