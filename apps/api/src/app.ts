import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { taskRouter } from './routes/task'
import { profileRouter } from './routes/profile'
import { errorHandler } from './middleware/errorHandler'

export const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use('/auth', authRouter)
app.use('/tasks', taskRouter)
app.use('/profile', profileRouter)

app.use(errorHandler)
