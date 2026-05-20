import { Router } from 'express'
import { requireAuth } from '../middleware/auth'

export const learningRouter = Router()
learningRouter.use(requireAuth)
