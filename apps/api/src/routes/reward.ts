import { Router } from 'express'
import { requireAuth } from '../middleware/auth'

export const rewardRouter = Router()
rewardRouter.use(requireAuth)
