import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { taskRouter } from './routes/task'
import { profileRouter } from './routes/profile'
import { rewardRouter } from './routes/reward'
import { learningRouter } from './routes/learning'
import { boardRouter } from './routes/board'
import { levelTestRouter } from './routes/levelTest'
import { vocabularyRouter } from './routes/vocabulary'
import { mentorRouter } from './routes/mentor'
import { errorHandler } from './middleware/errorHandler'

export const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use('/auth', authRouter)
app.use('/tasks', taskRouter)
app.use('/profile', profileRouter)
app.use('/rewards', rewardRouter)
app.use('/learning', learningRouter)
app.use('/board', boardRouter)
app.use('/level-test', levelTestRouter)
app.use('/vocabulary', vocabularyRouter)
app.use('/mentor', mentorRouter)

app.use(errorHandler)
