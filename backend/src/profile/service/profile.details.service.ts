import { postgresPrisma } from "../../lib/prisma";

export interface UpsertProfileDetailsDto {
  userName?: string;
  userNameTag?: string;
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
 * 서버에서 동명 유저 수를 체크하여 사용 가능한 태그 번호(#0001 등) 생성
 */
export async function checkUsernameTag(username: string) {
  const trimmed = username.trim();
  if (!trimmed) {
    throw new Error('유효한 아이디를 입력해주세요.');
  }

  // 1. 해당 이름으로 시작하는 유저 목록 조회
  const existingUsers = await postgresPrisma.myProfile.findMany({
    where: {
      name: {
        startsWith: `${trimmed}#`,
      },
    },
    select: {
      name: true,
    },
  });

  // 2. 사용 중인 태그 번호 추출
  const usedTags = new Set(
    existingUsers
      .map((u) => {
        const tagStr = u.name.split('#').pop();
        return tagStr !== undefined ? parseInt(tagStr, 10) : NaN;
      })
      .filter((tag) => !isNaN(tag))
  );

  // 3. #0부터 가장 작은 미사용 태그 번호 탐색
  let availableTag = 0;
  while (usedTags.has(availableTag)) {
    availableTag++;
  }

  return { tag: `#${availableTag}` };
}

/**
 * 유저 전체 프로필 요약 조회 (닉네임 + 통계 + 상세 프로필)
 */
export async function getUserProfileDetails(profileId: number) {
  const numericId = Number(profileId);
  if (isNaN(numericId)) {
    throw new Error('유효하지 않은 프로필 ID입니다.');
  }

  const details = await postgresPrisma.myProfileDetails.findUnique({
    where: { profileId: numericId },
    include: {
      profile: true,
      spokenLangs: true,
      learningLangs: true,
      snsLinks: true,
    },
  });

  if (!details) {
    throw new Error('프로필 정보를 찾을 수 없습니다.');
  }

  return {
    nickname: details.profile?.name ?? '익명 유저',
    stats: {
      attendanceDays: details.attendanceDays ?? 0,
      aiTranslationCount: details.aiTranslationCount ?? 0,
      MyLearningCollectionCount: details.MyLearningCollectionCount ?? 0,
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
 * 프로필 상세 정보 및 아이디/태그 일괄 Upsert
 */
export async function upsertMyProfileDetails(
  profileId: number,
  data: UpsertProfileDetailsDto = {}
) {
  const { userName, userNameTag, bio, spokenLangs, learningLangs, snsLinks } = data;


  console.log(`userName: ${userName}, userNameTag: ${userNameTag}`)
  return await postgresPrisma.$transaction(async (tx) => {
    // 1. 부모 테이블(MyProfile)의 name 필드 업데이트
    if (userName && userNameTag) {
      const fullName = `${userName.trim()}${userNameTag.trim()}`;
      await tx.myProfile.update({
        where: { id: profileId },
        data: { name: fullName },
      });
    }

    // 2. MyProfileDetails Update 객체 생성
    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
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

    // 3. MyProfileDetails Create 객체 생성
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

    // 4. Upsert 수행
    await tx.myProfileDetails.upsert({
      where: { profileId },
      update: updateData,
      create: createData,
    });

    // 5. 최신 데이터(부모 MyProfile 포함) 재조회
    const result = await tx.myProfileDetails.findUnique({
      where: { profileId },
      include: {
        profile: true, // 💡 업데이트된 name을 가져오기 위해 필수
        spokenLangs: true,
        learningLangs: true,
        snsLinks: true,
      },
    });

    return formatProfileDetails(result);
  });
}

export const profileDetailService = {
  checkUsernameTag,
  getUserProfileDetails,
  getMyProfileDetails,
  upsertMyProfileDetails,
};