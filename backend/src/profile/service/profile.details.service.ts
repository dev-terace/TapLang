import { postgresPrisma } from "../../lib/prisma";

export interface UpsertProfileDetailsDto {
  bio?: string;
  spokenLangs?: string[];
  learningLangs?: string[];
  snsLinks?: { platform: string; value: string }[];
}

/**
 * DB에서 가져온 프로필 상세 데이터를 프론트엔드 포맷(문자열 배열 등)으로 변환하는 헬퍼 함수
 */

function formatProfileDetails(profile: any) {
  if (!profile) {
    return {
      bio: '',
      spokenLangs: [],
      learningLangs: [],
      snsLinks: [],
    };
  }

  return {
    bio: profile.bio ?? '',
    spokenLangs: profile.spokenLangs?.map((item: { language: string }) => item.language) ?? [],
    learningLangs: profile.learningLangs?.map((item: { language: string }) => item.language) ?? [],
    snsLinks: profile.snsLinks?.map((link: { platform: string; value: string }) => ({
      platform: link.platform,
      value: link.value,
    })) ?? [],
  };
}

/**
 * 유저 전체 프로필 요약 조회 (닉네임 + 통계 + 상세 프로필)
 */
export async function getUserProfileDetails(profileId: number) {
  // 1. 타입 검증 (이전에 발생했던 스택 오버플로 방지용)
  const numericId = Number(profileId);
  if (isNaN(numericId)) {
    throw new Error('유효하지 않은 프로필 ID입니다.');
  }

  // 2. myProfileDetails 테이블 조회 + MyProfile(profile) 조인
  const details = await postgresPrisma.myProfileDetails.findUnique({
    where: { profileId: numericId },
    include: {
      profile: true, // 💡 부모 테이블(MyProfile) 정보 가져오기 (닉네임용)
      spokenLangs: true,
      learningLangs: true,
      snsLinks: true,
    },
  });

  if (!details) {
    throw new Error('프로필 정보를 찾을 수 없습니다.');
  }

  // 3. (as any) 우회 제거하고 타입에 맞게 안전하게 반환
  return {
    // details.profile 에 MyProfile 데이터가 들어있음 (스키마의 name 필드 사용)
    nickname: details.profile?.name ?? '익명 유저',
    stats: {
      attendanceDays: details.attendanceDays ?? 0,
      aiTranslationCount: details.aiTranslationCount ?? 0,
      translationTagCount: details.translationTagCount ?? 0,
    },
    ...formatProfileDetails(details),
  };
}

/**
 * 내 프로필 상세 정보만 조회
 */
export async function getMyProfileDetails(profileId: number) {
  const profile = await postgresPrisma.myProfileDetails.findUnique({
    where: { profileId },
    include: {
      spokenLangs: true,
      learningLangs: true,
      snsLinks: true,
    },
  });

  return formatProfileDetails(profile);
}

/**
 * 프로필 상세 정보를 Upsert(없으면 생성, 있으면 수정)하는 함수
 * 전달된 값만 부분 수정하며, 전달되지 않거나 최초 생성 시 안전하게 빈 값으로 기본 초기화됩니다.
 */
export async function upsertMyProfileDetails(
  profileId: number,
  data: UpsertProfileDetailsDto = {}
) {
  const { bio, spokenLangs, learningLangs, snsLinks } = data;

  // 1. Update 객체: 전달받은 필드만 선택적으로 업데이트 (기존 데이터 유실 방지)
  const updateData: any = {};

  if (bio !== undefined) {
    updateData.bio = bio;
  }
  if (spokenLangs !== undefined) {
    updateData.spokenLangs = {
      deleteMany: {},
      create: spokenLangs.map((lang) => ({ language: lang })),
    };
  }
  if (learningLangs !== undefined) {
    updateData.learningLangs = {
      deleteMany: {},
      create: learningLangs.map((lang) => ({ language: lang })),
    };
  }
  if (snsLinks !== undefined) {
    updateData.snsLinks = {
      deleteMany: {},
      create: snsLinks.map((link) => ({
        platform: link.platform,
        value: link.value,
      })),
    };
  }

  // 2. Create 객체: 최초 생성 시 기본값으로 초기화
  const createData = {
    profileId,
    bio: bio ?? '',
    spokenLangs: {
      create: (spokenLangs ?? []).map((lang) => ({ language: lang })),
    },
    learningLangs: {
      create: (learningLangs ?? []).map((lang) => ({ language: lang })),
    },
    snsLinks: {
      create: (snsLinks ?? []).map((link) => ({
        platform: link.platform,
        value: link.value,
      })),
    },
  };

  const result = await postgresPrisma.myProfileDetails.upsert({
    where: { profileId },
    update: updateData,
    create: createData,
    include: {
      spokenLangs: true,
      learningLangs: true,
      snsLinks: true,
    },
  });

  return formatProfileDetails(result);
}

export const profileDetailService = {
  getUserProfileDetails,
  getMyProfileDetails,
  upsertMyProfileDetails,
};