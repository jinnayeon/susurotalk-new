import { Router } from 'express'
import { requireAuth } from '../middleware/auth'

export const mentorRouter = Router()
mentorRouter.use(requireAuth)
