import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const boardRouter = Router()
boardRouter.use(requireAuth)

const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
  subject: z.enum(['math', 'korean', 'english', 'etc']),
  grade: z.number().int().min(1).max(6),
})

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
})

// 게시판 목록 (최신순, 상태 필터링 가능)
boardRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const subject = req.query.subject as string | undefined
    const status = req.query.status as string | undefined

    const posts = await prisma.boardPost.findMany({
      where: {
        ...(subject && { subject }),
        ...(status && { status }),
      },
      include: {
        user: { select: { id: true, childProfile: { select: { nickname: true, grade: true } } } },
        match: {
          include: {
            mentorProfile: { select: { name: true } },
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(posts)
  } catch (err) {
    next(err)
  }
})

// 게시글 상세 + 댓글
boardRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const post = await prisma.boardPost.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        user: { select: { childProfile: { select: { nickname: true, grade: true } } } },
        comments: {
          include: {
            user: {
              select: {
                role: true,
                childProfile: { select: { nickname: true } },
                mentorProfile: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        match: {
          include: { mentorProfile: { select: { name: true } } },
        },
      },
    })
    res.json(post)
  } catch (err) {
    next(err)
  }
})

// 질문 게시글 작성
boardRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = postSchema.parse(req.body)
    const post = await prisma.boardPost.create({
      data: { ...data, userId: req.userId! },
    })
    res.status(201).json(post)
  } catch (err) {
    next(err)
  }
})

// 댓글 작성
boardRouter.post('/:id/comments', async (req: AuthRequest, res, next) => {
  try {
    const data = commentSchema.parse(req.body)
    await prisma.boardPost.findUniqueOrThrow({ where: { id: req.params.id } })

    const comment = await prisma.boardComment.create({
      data: { postId: req.params.id, userId: req.userId!, content: data.content },
    })
    res.status(201).json(comment)
  } catch (err) {
    next(err)
  }
})

// 게시글 해결 완료 처리 (작성자만 가능)
boardRouter.patch('/:id/resolve', async (req: AuthRequest, res, next) => {
  try {
    const post = await prisma.boardPost.findUniqueOrThrow({
      where: { id: req.params.id, userId: req.userId! },
    })

    await prisma.$transaction([
      prisma.boardPost.update({
        where: { id: post.id },
        data: { status: 'RESOLVED' },
      }),
      ...(post.status === 'MATCHED'
        ? [
            prisma.mentorMatch.updateMany({
              where: { postId: post.id, status: 'ACTIVE' },
              data: { status: 'COMPLETED', resolvedAt: new Date() },
            }),
          ]
        : []),
    ])
    res.json({ message: '해결 완료!' })
  } catch (err) {
    next(err)
  }
})
