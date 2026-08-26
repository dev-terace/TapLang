import { redis } from "../../lib/redis"; // 프로젝트의 redis 인스턴스 경로

const SESSION_PREFIX = "find_people:session:";
const DEFAULT_TTL = 600; // 10분 (초 단위)

export const findPeopleRedisService = {
  /**
   * 세션 존재 여부 확인
   */
  async hasSession(userId: number): Promise<boolean> {
    const key = `${SESSION_PREFIX}${userId}`;
    return (await redis.exists(key)) === 1;
  },

  /**
   * 1,000명의 유저 ID 배열을 Redis List에 저장
   */
  async createSession(
    userId: number,
    candidateIds: number[],
    ttlSeconds = DEFAULT_TTL
  ): Promise<void> {
    const key = `${SESSION_PREFIX}${userId}`;

    // 기존 세션 삭제 후 새 리스트 생성
    await redis.del(key);

    if (candidateIds.length === 0) return;

    // Redis List에 순서대로 추가 (RPUSH) 및 TTL 설정
    await redis.rpush(key, ...candidateIds.map(String));
    await redis.expire(key, ttlSeconds);
  },

  /**
   * 페이지 범위에 해당하는 유저 ID 목록 슬라이싱 (LRANGE)
   */
  async getPageUserIds(
    userId: number,
    page: number,
    limit: number
  ): Promise<number[]> {
    const key = `${SESSION_PREFIX}${userId}`;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const stringIds = await redis.lrange(key, start, end);
    return stringIds.map(Number);
  },

  /**
   * 세션 강제 삭제 (새로고침 시 사용)
   */
  async deleteSession(userId: number): Promise<void> {
    const key = `${SESSION_PREFIX}${userId}`;
    await redis.del(key);
  },


  async getSessionTotalCount(userId: number): Promise<number> {
    const key = `${SESSION_PREFIX}${userId}`;
    return await redis.llen(key);
  },

};