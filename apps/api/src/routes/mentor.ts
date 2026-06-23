import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const mentorRouter = Router()
mentorRouter.use(requireAuth)

// 멘토 프로필 등록/수정
mentorRouter.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      bio: z.string().optional(),
      subjects: z.array(z.enum(['math', 'korean', 'english'])),
    })
    const data = schema.parse(req.body)

    const profile = await prisma.mentorProfile.upsert({
      where: { userId: req.userId! },
      create: { userId: req.userId!, ...data },
      update: data,
    })

    await prisma.user.update({ where: { id: req.userId! }, data: { role: 'mentor' } })
    res.json(profile)
  } catch (err) {
    next(err)
  }
})

// 멘토가 볼 수 있는 OPEN 질문 목록 (담당 과목 기준)
mentorRouter.get('/open-posts', async (req: AuthRequest, res, next) => {
  try {
    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId: req.userId! } })
    const subjects = (mentorProfile?.subjects as string[]) ?? []

    const posts = await prisma.boardPost.findMany({
      where: {
        status: 'OPEN',
        ...(subjects.length > 0 && { subject: { in: subjects } }),
      },
      include: {
        user: { select: { childProfile: { select: { nickname: true, grade: true } } } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 30,
    })
    res.json(posts)
  } catch (err) {
    next(err)
  }
})

// 멘토가 맡은 질문 목록 (ACTIVE 매칭)
mentorRouter.get('/my-matches', async (req: AuthRequest, res, next) => {
  try {
    const matches = await prisma.mentorMatch.findMany({
      where: { mentorUserId: req.userId!, status: 'ACTIVE' },
      include: {
        post: {
          include: {
            user: { select: { childProfile: { select: { nickname: true, grade: true } } } },
            comments: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
      orderBy: { matchedAt: 'desc' },
    })
    res.json(matches)
  } catch (err) {
    next(err)
  }
})

// 멘토가 질문을 클레임(매칭)
mentorRouter.post('/claim/:postId', async (req: AuthRequest, res, next) => {
  try {
    const post = await prisma.boardPost.findUniqueOrThrow({ where: { id: req.params.postId } })

    if (post.status !== 'OPEN') {
      res.status(400).json({ message: '이미 매칭된 질문이에요.' })
      return
    }

    await prisma.$transaction([
      prisma.mentorMatch.create({
        data: { postId: post.id, mentorUserId: req.userId! },
      }),
      prisma.boardPost.update({
        where: { id: post.id },
        data: { status: 'MATCHED' },
      }),
    ])

    res.status(201).json({ message: '매칭 완료! 아이와 대화를 시작하세요. 🎉' })
  } catch (err) {
    next(err)
  }
})

// 멘토가 매칭을 취소 (다시 OPEN으로)
mentorRouter.delete('/claim/:postId', async (req: AuthRequest, res, next) => {
  try {
    await prisma.$transaction([
      prisma.mentorMatch.updateMany({
        where: { postId: req.params.postId, mentorUserId: req.userId!, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      }),
      prisma.boardPost.update({
        where: { id: req.params.postId },
        data: { status: 'OPEN' },
      }),
    ])
    res.json({ message: '매칭 취소되었어요.' })
  } catch (err) {
    next(err)
  }
})
