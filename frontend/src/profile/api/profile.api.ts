import api from '@/shared/auth/api.config'
import axios from 'axios'

export namespace ProfileApi {
  // SNS
  export interface SnsLinkPayload {
    platform: string
    value: string
  }

  // 프로필 수정 요청
  export interface UpdateProfileDetailsPayload {
    userName?: string
    userNameTag?: string
    bio: string
    spokenLangs: string[]
    learningLangs: string[]
    snsLinks: SnsLinkPayload[]
  }

  // 프로필 수정 응답
  export interface UpdateProfileResponse {
    message?: string
  }


  export interface ProfileStats {
  attendanceDays: number
  aiTranslationCount: number
  translationTagCount: number
}

  // 프로필 조회 응답
  export interface GetProfileDetailsResponse {
    bio: string
    spokenLangs: string[]
    learningLangs: string[]
    snsLinks: SnsLinkPayload[]
  }


  export interface GetUserProfileDetailsResponse {
    nickname: string
    stats: ProfileStats
    spokenLangs: string[]
    learningLangs: string[]
    bio: string
    snsLinks: SnsLinkPayload[]
}

export interface CheckUsernameTagResponse {
  available: boolean
}


export async function checkUsernameTag(
  username: string
): Promise<CheckUsernameTagResponse> {
  try {
    const response =
      await api.get<CheckUsernameTagResponse>(
        '/api/profile/tag',
        {
          params: {
            username
          }
        }
      )

    return response.data

  } catch (error: unknown) {

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        '사용자 이름 중복 여부를 확인하지 못했습니다.'
      )
    }

    throw new Error(
      '알 수 없는 오류가 발생했습니다.'
    )
  }
}


export async function updateOnlineStatusVisibility(showOnlineStatus: boolean) {
  try {
    const response = await api.post('/api/profile/online', {showOnlineStatus, })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ??
        error.response?.data?.message ??
        '유저 프로필 정보를 불러오는데 실패했습니다.'
      )
    }
    throw new Error('알 수 없는 오류가 발생했습니다.')
  }
}



export async function getUserProfileDetails(userId: number): Promise<GetUserProfileDetailsResponse> {
  try {
    const response = await api.get<GetUserProfileDetailsResponse>(`/api/profile/details/${userId}`)
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ??
        error.response?.data?.message ??
        '유저 프로필 정보를 불러오는데 실패했습니다.'
      )
    }
    throw new Error('알 수 없는 오류가 발생했습니다.')
  }
}

  // 프로필 상세 조회
  export async function getProfileDetails(): Promise<GetProfileDetailsResponse> {
    try {
      const response = await api.get<GetProfileDetailsResponse>(
        '/api/profile/details'
      )

      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ??
            '프로필 정보를 불러오는데 실패했습니다.'
        )
      }

      throw new Error('알 수 없는 오류가 발생했습니다.')
    }
  }

  // 프로필 상세 수정
  export async function updateProfileDetails(
    payload: UpdateProfileDetailsPayload
  ): Promise<UpdateProfileResponse> {
    try {
      const response = await api.post<UpdateProfileResponse>(
        '/api/profile/details',
        payload
      )

      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ??
            '프로필 업데이트에 실패했습니다.'
        )
      }

      throw new Error('알 수 없는 오류가 발생했습니다.')
    }
  }
}