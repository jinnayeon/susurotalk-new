import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: '입력값을 확인해주세요.', details: err.errors })
    return
  }
  console.error(err)
  res.status(500).json({ error: '서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요.' })
}
