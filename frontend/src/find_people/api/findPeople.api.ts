import api from "@/shared/auth/api.config"

export interface SpokenLanguage {
    id: number
    language: string
}

export interface LearningLanguage {
    id: number
    language: string
}

export interface SnsLink {
    id: number
    platform: string
    value: string
}

export interface ProfileDetails {
    id: number
    bio?: string
    attendanceDays?: number
    aiTranslationCount?: number
    MyLearningCollectionCount?: number
    spokenLangs?: SpokenLanguage[]
    learningLangs?: LearningLanguage[]
    snsLinks?: SnsLink[]
}

export interface FindPeopleUser {
    id: number
    name: string
    flag: string
    statusMsg?: string
    lastLoginAt?: string
    profileDetails?: ProfileDetails
}

export interface FindPeopleQueryParams {
    page?: number
    limit?: number
    refresh?: boolean
}

export interface FindPeopleResponse {
    items: FindPeopleUser[]
    meta: {
        page: number
        total: number
        totalPages: number
        hasMore: boolean
    }
}


// REST API 통신 모듈
export const findPeopleApi = {
    // 사람 찾기 디렉토리 목록 조회 (페이지네이션 및 매핑)
   async getPeopleList(
        params?: FindPeopleQueryParams
    ): Promise<FindPeopleResponse> {
        const response = await api.get('/api/find-people', {
            params: {
                page: params?.page || 1,
                limit: params?.limit || 20,
                refresh: params?.refresh || false,
            },
        })

        const data = response.data
        const rawItems = data.data || []
        
        // 💡 메타데이터 매핑 수정
        const meta = {
            page: data.meta?.page || params?.page || 1,
            total: data.meta?.total || 0,
            totalPages: data.meta?.totalPages || 1,
            hasMore: data.meta?.hasMore || false,
        }

        const mappedItems: FindPeopleUser[] = rawItems.map((user: any) => ({
            id: user.id,
            name: user.name,
            flag: user.flag,
            statusMsg: user.statusMsg || '',
            lastLoginAt: user.lastLoginAt,
            profileDetails: user.profileDetails
                ? {
                      id: user.profileDetails.id,
                      bio: user.profileDetails.bio || '',
                      attendanceDays: user.profileDetails.attendanceDays || 0,
                      aiTranslationCount: user.profileDetails.aiTranslationCount || 0,
                      MyLearningCollectionCount: user.profileDetails.MyLearningCollectionCount || 0,
                      spokenLangs: user.profileDetails.spokenLangs || [],
                      learningLangs: user.profileDetails.learningLangs || [],
                      snsLinks: user.profileDetails.snsLinks || [],
                  }
                : undefined,
        }))

        return {
            items: mappedItems,
            meta,
        }
    },

    // 특정 유저의 소개글(상세 프로필) 조회
    async getUserProfile(userId: number): Promise<FindPeopleUser> {
        const response = await api.get(`/api/find-people/${userId}`)
        const data = response.data

        return {
            id: data.id,
            name: data.name,
            flag: data.flag,
            statusMsg: data.statusMsg || '',
            lastLoginAt: data.lastLoginAt,
            profileDetails: data.profileDetails
                ? {
                      id: data.profileDetails.id,
                      bio: data.profileDetails.bio || '',
                      attendanceDays: data.profileDetails.attendanceDays || 0,
                      aiTranslationCount: data.profileDetails.aiTranslationCount || 0,
                      MyLearningCollectionCount: data.profileDetails.MyLearningCollectionCount || 0,
                      spokenLangs: data.profileDetails.spokenLangs || [],
                      learningLangs: data.profileDetails.learningLangs || [],
                      snsLinks: data.profileDetails.snsLinks || [],
                  }
                : undefined,
        }
    },


    // 💡 내 비공개 상태 조회
  async getPrivacyStatus(): Promise<boolean> {
    const response = await api.get('/api/find-people/privacy')
    return response.data.isPrivate || false
  },

  // 💡 내 비공개 상태 토글
  async updatePrivacyStatus(isPrivate: boolean): Promise<void> {
    await api.patch('/api/find-people/privacy', { isPrivate })
  },
  
}