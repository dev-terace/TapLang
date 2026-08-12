import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ProfileApi } from '../api/profile.api'

// 프론트엔드에서 보낼 데이터 타입 정의

export const useProfileStore = defineStore('profile', () => {
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // ----------------------------------------------------
    // API 로직을 Store 내부에 정의 (액션)
    // ----------------------------------------------------
    // ProfileStore.ts 내부
    const profileDetails = ref<ProfileApi.GetProfileDetailsResponse | null>(null)
    const userProfileDetails = ref<ProfileApi.GetUserProfileDetailsResponse | null>(null)




    const updateOnlineStatusVisibility = ProfileApi.updateOnlineStatusVisibility
    const fetchUserProfileDetails = async (userId: number) => {
        isLoading.value = true
        try {
            const data = await ProfileApi.getUserProfileDetails(userId)
            userProfileDetails.value = data
            return data
        } finally {
            isLoading.value = false
        }
    }

    const fetchProfileDetails = async () => {
        isLoading.value = true
        error.value = null

        try {
            const data = await ProfileApi.getProfileDetails()
            profileDetails.value = data
            return data
        } catch (err: any) {
            error.value = err.message || '프로필 정보를 불러오지 못했습니다.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const updateProfileDetails = async (payload: ProfileApi.UpdateProfileDetailsPayload) => {
        isLoading.value = true
        error.value = null

        try {
            // 💡 1. API 모듈 함수 호출 (fetch/axios 핸들링은 ProfileApi가 담당)
            const response = await ProfileApi.updateProfileDetails(payload)

            // axios 결과값의 data 추출
            const data = response

            // (선택) 필요 시 Store 내부의 내 프로필 정보 상태(state) 갱신
            // myProfile.value = data

            return data
        } catch (err: any) {
            // 💡 2. ProfileApi에서 에러가 발생(throw)하면 여기서 잡아서 Store의 error 상태에 저장
            error.value = err.message || '알 수 없는 오류가 발생했습니다.'

            // 💡 3. 컴포넌트(handleSaveProfile)의 catch 블록으로 에러를 다시 전달하기 위해 throw
            throw err
        } finally {
            // 💡 4. 성공/실패 여부와 상관없이 항상 로딩 상태 해제
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        fetchProfileDetails,
        fetchUserProfileDetails,
        profileDetails,
        userProfileDetails,
        updateProfileDetails,
        updateOnlineStatusVisibility
    }
})