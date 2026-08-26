import { postgresPrisma as prisma } from "../../lib/prisma"; // 프로젝트의 prisma 인스턴스 경로
import { friendsRedisService } from "../../friends/services/friends.redis.service";
import { findPeopleRedisService } from "./findPeople.redis.service";

// Fisher-Yates 셔플 함수
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const findPeopleService = {
  /**
   * 1,000명의 후보 유저 ID 추출 (70% 온라인 / 30% 오프라인 비율)
   */
  async generateCandidateIds(
    currentUserId: number,
    targetTotal = 1000
  ): Promise<number[]> {
    // 1. 온라인 유저 ID 조회 및 자기 자신 제외
    const allOnlineIds = await friendsRedisService.getOnlineUsers();
    const filteredOnlineIds = allOnlineIds.filter((id) => id !== currentUserId);

    // 2. 온라인 유저 최대 700명(70%) 추출 후 셔플
    const targetOnlineCount = Math.min(
      filteredOnlineIds.length,
      Math.floor(targetTotal * 0.7)
    );
    const selectedOnlineIds = shuffleArray(filteredOnlineIds).slice(
      0,
      targetOnlineCount
    );

    // 3. 모자란 인원은 오프라인 유저 할당량으로 이월 (목표: 총 1,000명)
    const targetOfflineCount = targetTotal - selectedOnlineIds.length;
    const excludeIds = [currentUserId, ...selectedOnlineIds];

    // 3일 전 시각 계산
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 4. 3일 이내 오프라인 유저 조회 및 셔플
    const recentOfflineDb = await prisma.myProfile.findMany({
      where: {
        id: { notIn: excludeIds },
        lastLoginAt: { gte: threeDaysAgo },
      },
      select: { id: true },
    });
    const recentOfflineIds = shuffleArray(recentOfflineDb.map((u) => u.id));

    let selectedOfflineIds = recentOfflineIds.slice(0, targetOfflineCount);

    // 5. 3일 이내 오프라인 유저로 부족할 경우, 3일 초과 유저 최근 접속순 채우기
    if (selectedOfflineIds.length < targetOfflineCount) {
      const remainingNeeded = targetOfflineCount - selectedOfflineIds.length;
      const olderOfflineDb = await prisma.myProfile.findMany({
        where: {
          id: { notIn: [...excludeIds, ...selectedOfflineIds] },
          lastLoginAt: { lt: threeDaysAgo },
        },
        orderBy: { lastLoginAt: "desc" },
        take: remainingNeeded,
        select: { id: true },
      });

      selectedOfflineIds = [
        ...selectedOfflineIds,
        ...olderOfflineDb.map((u) => u.id),
      ];
    }

    // 6. 온라인(70%) + 오프라인(30%) 최종 셔플하여 반환
    return [...selectedOnlineIds, ...selectedOfflineIds];
  },

  /**
   * 사람 찾기 목록 조회 (페이지네이션)
   */
async getPeopleList(
    currentUserId: number,
    page: number = 1,
    limit: number = 20,
    refresh: boolean = false
  ) {
    // 새로고침 요청이거나 기존 세션이 없으면 새로운 1,000명 세션 생성
    const hasSession = await findPeopleRedisService.hasSession(currentUserId);
    if (refresh || !hasSession) {
      const candidateIds = await this.generateCandidateIds(currentUserId, 1000);
      await findPeopleRedisService.createSession(currentUserId, candidateIds);
    }

    // 💡 전체 유저 수 및 전체 페이지 수 계산
    const total = await findPeopleRedisService.getSessionTotalCount(currentUserId);
    const totalPages = Math.ceil(total / limit) || 1;

    // Redis에서 해당 페이지의 ID 범위 추출
    const slicedIds = await findPeopleRedisService.getPageUserIds(
      currentUserId,
      page,
      limit
    );

    if (slicedIds.length === 0) {
      return { users: [], page, total, totalPages, hasMore: false };
    }

    // DB에서 ID 해당 유저들의 프로필 상세 정보 조회
    const dbUsers = await prisma.myProfile.findMany({
      where: { id: { in: slicedIds } },
      include: {
        profileDetails: true,
      },
    });

    // Redis 슬라이싱 ID 순서에 맞춰 DB 결과 재정렬
    const orderedUsers = slicedIds
      .map((id) => dbUsers.find((user) => user.id === id))
      .filter(Boolean);

    return {
      users: orderedUsers,
      page,
      total,
      totalPages,
      hasMore: page < totalPages,
    };
  },
};