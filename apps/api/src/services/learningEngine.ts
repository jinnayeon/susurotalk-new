import { prisma } from '@seolf-talk/db'

export async function getTodayTasks(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return prisma.studyTask.findMany({
    where: { userId, date: { gte: today } },
    orderBy: { date: 'asc' },
  })
}
