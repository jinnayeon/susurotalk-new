import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const profileRouter = Router()
profileRouter.use(requireAuth)

profileRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const profile = await prisma.childProfile.findUnique({ where: { userId: req.userId! } })
    const stickerCount = await prisma.sticker.count({ where: { userId: req.userId! } })
    const equippedSkin = await prisma.studentSkin.findFirst({
      where: { userId: req.userId!, isEquipped: true },
    })
    res.json({ ...profile, stickerCount, equippedSkin })
  } catch (err) {
    next(err)
  }
})

const updateSchema = z.object({
  characterId: z.enum(['ddong-i', 'bonggu', 'topping']).optional(),
  nickname: z.string().min(1).optional(),
})

profileRouter.patch('/', async (req: AuthRequest, res, next) => {
  try {
    const data = updateSchema.parse(req.body)
    const profile = await prisma.childProfile.upsert({
      where: { userId: req.userId! },
      create: { userId: req.userId!, nickname: data.nickname ?? '친구', ...data },
      update: data,
    })
    res.json(profile)
  } catch (err) {
    next(err)
  }
})
