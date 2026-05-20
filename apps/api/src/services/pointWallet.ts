import { prisma } from '@seolf-talk/db'

export async function addPoints(userId: string, amount: number) {
  return prisma.childProfile.upsert({
    where: { userId },
    create: { userId, nickname: '친구', totalPoints: amount },
    update: { totalPoints: { increment: amount } },
  })
}
