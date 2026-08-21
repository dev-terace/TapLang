import { mongoPrisma } from "../../lib/prisma"

const BAN_DURATION =
  3 * 24 * 60 * 60 * 1000

// =========================================================
// 멤버 밴
// =========================================================

export const banMember = async (
  conversationId: string,
  userId: number
) => {
  const now = new Date()

  const bannedUntil = new Date(
    now.getTime() + BAN_DURATION
  )

  return await mongoPrisma.conversationBan.upsert({
    where: {
      conversationId_userId: {
        conversationId,
        userId
      }
    },

    update: {
      bannedAt: now,
      bannedUntil
    },

    create: {
      conversationId,
      userId,
      bannedAt: now,
      bannedUntil
    }
  })
}


// =========================================================
// 밴 여부 확인
// =========================================================

export const isBanned = async (
  conversationId: string,
  userId: number
): Promise<boolean> => {

  const ban =
    await mongoPrisma.conversationBan.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    })

  // 밴 기록 없음
  if (!ban) {
    return false
  }

  // 밴 기간이 아직 남아있음
  if (
    ban.bannedUntil &&
    ban.bannedUntil > new Date()
  ) {
    return true
  }

  // 밴 기간 만료
  await mongoPrisma.conversationBan.delete({
    where: {
      id: ban.id
    }
  })

  return false
}

export const customBanChatService = {
    isBanned,
    banMember
}