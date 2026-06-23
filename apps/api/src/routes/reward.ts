import { Router } from 'express'
import { prisma } from '@seolf-talk/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const rewardRouter = Router()
rewardRouter.use(requireAuth)

// 상점 전체 아이템 조회 (내 보유 여부 포함)
rewardRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const rewards = await prisma.reward.findMany({ orderBy: { price: 'asc' } })
    const mySkinsIds = await prisma.studentSkin.findMany({
      where: { userId: req.userId! },
      select: { rewardId: true, isEquipped: true },
    })
    const owned = new Map(mySkinsIds.map((s) => [s.rewardId, s.isEquipped]))

    res.json(
      rewards.map((r) => ({
        ...r,
        isOwned: owned.has(r.id),
        isEquipped: owned.get(r.id) ?? false,
      }))
    )
  } catch (err) {
    next(err)
  }
})

// 스킨 구매
rewardRouter.post('/:id/purchase', async (req: AuthRequest, res, next) => {
  try {
    const reward = await prisma.reward.findUniqueOrThrow({ where: { id: req.params.id } })

    const profile = await prisma.childProfile.findUniqueOrThrow({ where: { userId: req.userId! } })
    if (profile.totalPoints < reward.price) {
      res.status(400).json({ message: '포인트가 부족해요. 더 모아봐!' })
      return
    }

    const already = await prisma.studentSkin.findUnique({
      where: { userId_rewardId: { userId: req.userId!, rewardId: reward.id } },
    })
    if (already) {
      res.status(400).json({ message: '이미 갖고 있는 스킨이에요!' })
      return
    }

    await prisma.$transaction([
      prisma.childProfile.update({
        where: { userId: req.userId! },
        data: { totalPoints: { decrement: reward.price } },
      }),
      prisma.studentSkin.create({
        data: {
          userId: req.userId!,
          rewardId: reward.id,
          skinName: reward.skinName ?? reward.title,
          characterId: reward.characterId ?? 'bonggu',
        },
      }),
    ])

    res.json({ message: '구매 성공! 스킨을 장착해봐! 🎉' })
  } catch (err) {
    next(err)
  }
})

// 스킨 장착 (같은 캐릭터의 기존 장착 스킨은 해제)
rewardRouter.patch('/:id/equip', async (req: AuthRequest, res, next) => {
  try {
    const skin = await prisma.studentSkin.findUniqueOrThrow({
      where: { userId_rewardId: { userId: req.userId!, rewardId: req.params.id } },
    })

    await prisma.$transaction([
      prisma.studentSkin.updateMany({
        where: { userId: req.userId!, characterId: skin.characterId, isEquipped: true },
        data: { isEquipped: false },
      }),
      prisma.studentSkin.update({
        where: { userId_rewardId: { userId: req.userId!, rewardId: req.params.id } },
        data: { isEquipped: true },
      }),
    ])

    res.json({ message: '스킨 장착 완료! ✨' })
  } catch (err) {
    next(err)
  }
})
