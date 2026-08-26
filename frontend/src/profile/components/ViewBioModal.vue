<script setup lang="ts">
import { watch } from 'vue'
import { useModalStore } from '@/shared/modal/ModalStore' // 경로 확인 필요
import { useProfileStore } from '@/profile/store/ProfileStore' // 경로 확인 필요
import { useAuthStore } from '@/shared/auth/AuthStore'
import { useUIStore } from '@/shared/ui/UiStore'

const modalStore = useModalStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

// ------------------------------------
// 모달 오픈 감지 및 데이터 자동 조회
// ------------------------------------
watch(
  () => modalStore.activeModal,
  async (newModal) => {
    // 'viewBio' 모달이 열릴 때 프로필 상세 API 호출
    if (newModal === 'viewBio') {
      try {
        console.log("profileMenuFriendId : ", uiStore.profileMenuFriendId)
        await profileStore.fetchUserProfileDetails(uiStore.profileMenuFriendId)
      } catch (err) {
        console.error('프로필 로딩 실패:', err)
      }
    }
  },
  { immediate: true }
)

// SNS 플랫폼 아이콘 매핑용 데이터
const snsOptions = [
  { id: 'instagram', name: 'Instagram', iconUrl: 'https://cdn.simpleicons.org/instagram/E4405F', isLink: true },
  { id: 'x', name: 'X (Twitter)', iconUrl: 'https://cdn.simpleicons.org/x/000000', isLink: true },
  { id: 'github', name: 'GitHub', iconUrl: 'https://cdn.simpleicons.org/github/181717', isLink: true },
  { id: 'other', name: '웹사이트', iconUrl: 'https://cdn.simpleicons.org/googlechrome/4285F4', isLink: true },
  { id: 'kakaotalk', name: 'KakaoTalk', iconUrl: 'https://cdn.simpleicons.org/kakaotalk/FEE500', isLink: false },
  { id: 'line', name: 'Line', iconUrl: 'https://cdn.simpleicons.org/line/00C300', isLink: false },
  { id: 'discord', name: 'Discord', iconUrl: 'https://cdn.simpleicons.org/discord/5865F2', isLink: false }
]

const getSnsOption = (id: string) => {
  return snsOptions.find((opt) => opt.id === id) || snsOptions[3]
}

const formatUrl = (url: string) => {
  if (!url) return '#'
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

// ------------------------------------
// 모달 액션
// ------------------------------------
const closeModal = () => {
  modalStore.closeModal()
}

const openEditModal = () => {
  modalStore.activeModal = 'editBio'
}
</script>

<template>
  <div>
    <!-- 모달 상태가 'viewBio'일 때 노출 -->
    <div
      v-if="modalStore.activeModal === 'viewBio'"
      class="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-xl bg-[#e6e2db] border-4 border-[#2d2b28] shadow-[8px_8px_0px_0px_#121315] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <!-- 헤더 -->
        <div
          class="bg-[#2d2b28] text-[#fbf9f5] px-4 py-2 flex justify-between items-center text-xs font-bold shrink-0"
        >
          <span>// 프로필_조회.exe</span>
          <button
            class="hover:text-red-400 font-pixel text-lg leading-none"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <!-- 로딩 상태 표기 -->
        <div v-if="profileStore.isLoading" class="p-12 text-center text-[#2d2b28] font-bold">
          <p class="animate-pulse">> 데이터 불러오는 중...</p>
        </div>

        <!-- 본문 (데이터 로드 완료 시) -->
        <div
          v-else-if="profileStore.userProfileDetails"
          class="p-5 overflow-y-auto custom-scrollbar space-y-6"
        >
          <!-- 프로필 요약 & 통계 대시보드 -->
          <div>
            <div class="flex items-end gap-2 mb-3">
              <h2 class="text-xl font-bold text-[#2d2b28]">
                {{ profileStore.userProfileDetails.nickname || '알 수 없는 유저' }}
              </h2>
              <span class="text-xs text-neutral-500 font-bold mb-1">님의 활동 기록</span>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <!-- 출석일 수 -->
              <div
                class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-3 text-center shadow-[2px_2px_0px_0px_#a39b90]"
              >
                <div class="text-[10px] text-neutral-500 font-bold mb-1">출석일 수</div>
                <div class="text-lg font-bold text-[#2d2b28]">
                  {{ profileStore.userProfileDetails.stats?.attendanceDays ?? 0 }} <span class="text-xs">일</span>
                </div>
              </div>
              <!-- AI 번역 사용 -->
              <div
                class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-3 text-center shadow-[2px_2px_0px_0px_#a39b90]"
              >
                <div class="text-[10px] text-neutral-500 font-bold mb-1">AI 번역 사용</div>
                <div class="text-lg font-bold text-[#2d2b28]">
                  {{ profileStore.userProfileDetails.stats?.aiTranslationCount ?? 0 }} <span class="text-xs">회</span>
                </div>
              </div>
           
              <div
                class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-3 text-center shadow-[2px_2px_0px_0px_#a39b90]"
              >
                <div class="text-[10px] text-neutral-500 font-bold mb-1">나의 퀴즈 컬렉션 갯수</div>
                <div class="text-lg font-bold text-[#2d2b28]">
                  {{ profileStore.userProfileDetails.stats?.MyLearningCollectionCount ?? 0 }} <span class="text-xs">회</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 언어 설정 (구사 및 학습 언어) -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 구사 및 학습 언어
            </p>

            <div class="space-y-3">
              <!-- 구사 언어 -->
              <div>
                <span class="text-[10px] font-bold text-[#2d2b28] block mb-1">구사 언어 (Spoken)</span>
                <div class="flex flex-wrap gap-2">
                  <!-- 개선: || [] 를 통해 데이터가 없을 때 빈 배열로 처리 -->
                  <span
                    v-for="(lang, index) in (profileStore.userProfileDetails.spokenLangs || [])"
                    :key="index"
                    class="bg-[#d1cbc1] border border-[#2d2b28] px-2 py-1 text-xs font-bold shadow-[1px_1px_0px_0px_#2d2b28]"
                  >
                    {{ lang }}
                  </span>
                  <!-- 개선: length를 옵셔널 체이닝(?.)으로 안전하게 확인 -->
                  <span
                    v-if="!(profileStore.userProfileDetails.spokenLangs?.length)"
                    class="text-xs text-neutral-400"
                  >
                    등록된 언어가 없습니다.
                  </span>
                </div>
              </div>

              <!-- 학습 언어 -->
              <div>
                <span class="text-[10px] font-bold text-[#2d2b28] block mb-1">학습 언어 (Learning)</span>
                <div class="flex flex-wrap gap-2">
                  <!-- 개선: || [] 를 통해 데이터가 없을 때 빈 배열로 처리 -->
                  <span
                    v-for="(lang, index) in (profileStore.userProfileDetails.learningLangs || [])"
                    :key="index"
                    class="bg-white border border-[#2d2b28] px-2 py-1 text-xs font-bold shadow-[1px_1px_0px_0px_#2d2b28]"
                  >
                    {{ lang }}
                  </span>
                  <!-- 개선: length를 옵셔널 체이닝(?.)으로 안전하게 확인 -->
                  <span
                    v-if="!(profileStore.userProfileDetails.learningLangs?.length)"
                    class="text-xs text-neutral-400"
                  >
                    등록된 언어가 없습니다.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 소개글 -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 소개글 (Bio)
            </p>
            <div
              class="w-full bg-white border-2 border-[#2d2b28] p-3 text-xs shadow-inner whitespace-pre-wrap leading-relaxed min-h-[80px]"
            >
              {{ profileStore.userProfileDetails.bio || '등록된 소개글이 없습니다.' }}
            </div>
          </div>

          <!-- 외부 연결망 (SNS Links) -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 외부 연결망
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <!-- 개선: || [] 를 통해 데이터가 없을 때 빈 배열로 처리 -->
              <div
                v-for="(link, index) in (profileStore.userProfileDetails.snsLinks || [])"
                :key="index"
                class="flex items-center gap-3 bg-[#f4f1eb] border border-[#2d2b28] p-2"
              >
                <!-- 링크 이동 아이콘 -->
                <a
                  v-if="getSnsOption(link.platform).isLink"
                  :href="formatUrl(link.value)"
                  target="_blank"
                  class="hover:scale-110 transition-transform cursor-pointer drop-shadow-sm flex items-center justify-center w-8 h-8 bg-white rounded-md border border-[#c5bfb6] shrink-0"
                  title="링크로 이동"
                >
                  <img :src="getSnsOption(link.platform).iconUrl" alt="icon" class="w-5 h-5 object-contain" />
                </a>

                <!-- 복사/텍스트 아이콘 -->
                <span
                  v-else
                  class="drop-shadow-sm flex items-center justify-center w-8 h-8 bg-white rounded-md border border-[#c5bfb6] cursor-default shrink-0"
                  title="ID입니다"
                >
                  <img :src="getSnsOption(link.platform).iconUrl" alt="icon" class="w-5 h-5 object-contain" />
                </span>

                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-neutral-500">
                    {{ getSnsOption(link.platform).name }}
                  </span>
                  <span class="text-xs text-[#2d2b28] font-bold truncate">
                    {{ link.value }}
                  </span>
                </div>
              </div>

              <!-- 개선: length를 옵셔널 체이닝(?.)으로 안전하게 확인 -->
              <div
                v-if="!(profileStore.userProfileDetails.snsLinks?.length)"
                class="col-span-full text-center py-3 text-xs text-neutral-400 border border-dashed border-[#c5bfb6]"
              >
                등록된 외부 연결망이 없습니다.
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 영역 -->
        <div class="p-4 bg-[#d1cbc1] border-t-2 border-[#2d2b28] flex justify-end gap-3 shrink-0">
          <button
            @click="closeModal"
            class="bg-[#c5bfb6] text-[#2d2b28] border-2 border-[#2d2b28] px-5 py-1.5 text-xs font-bold hover:bg-neutral-300 transition-all shadow-[2px_2px_0px_0px_#a39b90]"
          >
            닫기
          </button>
          <button
            @click="openEditModal"
            class="bg-[#2d2b28] text-[#fbf9f5] border-2 border-[#2d2b28] px-5 py-1.5 text-xs font-bold hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_0px_#a39b90]"
          >
            프로필 수정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #e6e2db;
  border-left: 1px solid #c5bfb6;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2d2b28;
}
</style>