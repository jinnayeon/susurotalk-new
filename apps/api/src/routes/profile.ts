import { Router } from 'express'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const profileRouter = Router()
profileRouter.use(requireAuth)

profileRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const profile = await prisma.childProfile.findUnique({
      where: { userId: req.userId! },
    })
    const stickerCount = await prisma.sticker.count({
      where: { userId: req.userId! },
    })
    res.json({ ...profile, stickerCount })
  } catch (err) {
    next(err)
  }
})
