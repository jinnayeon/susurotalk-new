import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@seolf-talk/db'
import jwt from 'jsonwebtoken'

export const authRouter = Router()

const otpSchema = z.object({ phone: z.string().min(10) })
const verifySchema = z.object({ phone: z.string(), token: z.string() })

authRouter.post('/otp', async (req, res, next) => {
  try {
    const { phone } = otpSchema.parse(req.body)
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_ANON_KEY!

    const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      },
      body: JSON.stringify({ phone, channel: 'sms' }),
    })

    if (!response.ok) throw new Error('OTP 발송 실패')
    res.json({ message: '인증번호를 문자로 보냈어요!' })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/verify', async (req, res, next) => {
  try {
    const { phone, token } = verifySchema.parse(req.body)
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_ANON_KEY!

    const response = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      },
      body: JSON.stringify({ phone, token, type: 'sms' }),
    })

    if (!response.ok) {
      res.status(401).json({ error: '인증번호가 틀렸어요.' })
      return
    }

    let user = await prisma.user.findUnique({ where: { phone } })
    const isNew = !user
    if (!user) {
      user = await prisma.user.create({ data: { phone } })
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    })

    res.json({ token: accessToken, userId: user.id, isNew })
  } catch (err) {
    next(err)
  }
})
