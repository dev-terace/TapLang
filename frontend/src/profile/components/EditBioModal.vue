<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModalStore } from '@/shared/modal/ModalStore.js'
import { useProfileStore } from '../store/ProfileStore'
import { useAuthStore } from '@/shared/auth/AuthStore'
import { useFriendStore } from '@/friends/stores/FriendStore'
const modalStore = useModalStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const friendStore = useFriendStore()
// ------------------------------------
// 사용자 ID 수정
// ------------------------------------

const username = ref('')
const usernameTag = ref('#0')

// 태그 조회 버튼 핸들러 (서버에서 계산된 태그 수신)
const fetchUsernameTag = async () => {
  const value = username.value.trim()

  if (!value) {
    alert('아이디를 입력해주세요.')
    return
  }
  if (value.length < 2 || value.length > 20) {
    alert('아이디는 2자 이상 20자 이하로 입력해주세요.')
    return
  }

  try {
    // 백엔드로 아이디 전달 -> 동명 유저 수 체크 후 태그 번호 수신
    const res = await profileStore.checkUsernameTag(value)

    // 백엔드 응답 형태에 맞춰 지정 (예: res.tag 또는 res.usernameTag)
    usernameTag.value = res.tag
    
    alert(`사용 가능한 태그(${usernameTag.value})를 불러왔습니다. '프로필 갱신' 버튼을 눌러야 최종 저장됩니다.`)
  } catch (error: any) {
    console.error('태그 조회 실패:', error)
    alert(error?.response?.data?.message || '태그 정보를 불러오지 못했습니다.')
  }
}




const bioFormData = ref({
  spokenLangs: ['한국어'] as string[],
  learningLangs: ['English'] as string[],
  bio: '',
  snsLinks: [] as { platform: string, value: string }[]
})

// ------------------------------------
// 언어 추가 로직 (자동완성 추천 데이터 포함)
// ------------------------------------
const newSpokenLang = ref('')
const newLearningLang = ref('')

// 자동완성(API 대체)을 위한 추천 언어 목록
const suggestedLanguages = [
  // 동아시아
  '한국어',
  '日本語',
  '中文 (简体)',
  '中文 (繁體)',
  '粵語',
  'Монгол',

  // 동남아시아
  'Tiếng Việt',
  'ภาษาไทย',
  'Bahasa Indonesia',
  'Bahasa Melayu',
  'Filipino',
  'မြန်မာဘာသာ',
  'ខ្មែរ',
  'ລາວ',

  // 남아시아
  'English',
  'हिन्दी',
  'বাংলা',
  'اردو',
  'ਪੰਜਾਬੀ',
  'मराठी',
  'ગુજરાતી',
  'தமிழ்',
  'తెలుగు',
  'ಕನ್ನಡ',
  'മലയാളം',
  'नेपाली',
  'සිංහල',

  // 유럽
  'Español',
  'Français',
  'Deutsch',
  'Italiano',
  'Português',
  'Nederlands',
  'Polski',
  'Čeština',
  'Slovenčina',
  'Magyar',
  'Română',
  'Български',
  'Русский',
  'Українська',
  'Ελληνικά',
  'Svenska',
  'Dansk',
  'Norsk',
  'Suomi',
  'Íslenska',
  'Eesti',
  'Latviešu',
  'Lietuvių',
  'Slovenščina',
  'Hrvatski',
  'Српски',
  'Bosanski',
  'Shqip',
  'Català',
  'Euskara',
  'Galego',

  // 중동 / 중앙아시아
  'العربية',
  'עברית',
  'فارسی',
  'Türkçe',
  'Հայերեն',
  'ქართული',
  'Azərbaycan dili',
  'Қазақша',
  'O‘zbekcha',
  'Кыргызча',
  'Тоҷикӣ',
  'Türkmençe',

  // 아프리카
  'Kiswahili',
  'Afrikaans',
  'አማርኛ',
  'Yorùbá',
  'Igbo',
  'Hausa',
  'isiZulu',

  // 기타
  'Esperanto',
  'Latin'
]

const addSpokenLang = () => {
  const val = newSpokenLang.value.trim()
  if (val && !bioFormData.value.spokenLangs.includes(val)) {
    bioFormData.value.spokenLangs.push(val)
  }
  newSpokenLang.value = ''
}
const removeSpokenLang = (index: number) => {
  bioFormData.value.spokenLangs.splice(index, 1)
}

const addLearningLang = () => {
  const val = newLearningLang.value.trim()
  if (val && !bioFormData.value.learningLangs.includes(val)) {
    bioFormData.value.learningLangs.push(val)
  }
  newLearningLang.value = ''
}
const removeLearningLang = (index: number) => {
  bioFormData.value.learningLangs.splice(index, 1)
}

// ------------------------------------
// SNS 플랫폼 목록 (외부 아이콘 URL 적용)
// ------------------------------------
const snsOptions = [
  { id: 'instagram', name: 'Instagram', iconUrl: 'https://cdn.simpleicons.org/instagram/E4405F', isLink: true, placeholder: 'https://instagram.com/...' },
  { id: 'x', name: 'X (Twitter)', iconUrl: 'https://cdn.simpleicons.org/x/000000', isLink: true, placeholder: 'https://x.com/...' },
  { id: 'github', name: 'GitHub', iconUrl: 'https://cdn.simpleicons.org/github/181717', isLink: true, placeholder: 'https://github.com/...' },
  { id: 'other', name: '웹사이트', iconUrl: 'https://cdn.simpleicons.org/googlechrome/4285F4', isLink: true, placeholder: 'https://...' },
  { id: 'kakaotalk', name: 'KakaoTalk', iconUrl: 'https://cdn.simpleicons.org/kakaotalk/FEE500', isLink: false, placeholder: '카카오톡 ID 입력' },
  { id: 'line', name: 'Line', iconUrl: 'https://cdn.simpleicons.org/line/00C300', isLink: false, placeholder: '라인 ID 입력' },
  { id: 'discord', name: 'Discord', iconUrl: 'https://cdn.simpleicons.org/discord/5865F2', isLink: false, placeholder: '디스코드 ID 입력' }
]

const newSnsPlatform = ref(snsOptions[0].id)
const newSnsValue = ref('')

const currentPlaceholder = computed(() => {
  const option = snsOptions.find(opt => opt.id === newSnsPlatform.value)
  return option ? option.placeholder : ''
})

const addSns = () => {
  if (!newSnsValue.value.trim()) return
  bioFormData.value.snsLinks.push({
    platform: newSnsPlatform.value,
    value: newSnsValue.value.trim()
  })
  newSnsValue.value = ''
}

const removeSns = (index: number) => {
  bioFormData.value.snsLinks.splice(index, 1)
}

const getSnsOption = (id: string) => {
  return snsOptions.find(opt => opt.id === id) || snsOptions[0]
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
const handleSaveProfile = async () => {
  try {
    // 1. 폼 데이터 검증 (필요시)
    // if (!bioFormData.value.bio) { alert('소개글을 입력해주세요!'); return; }
    const trimmedUsername = username.value.trim()

  if (!trimmedUsername) {
    alert('아이디를 입력해주세요.')
    return
  }

    // 2. 스토어의 API 호출 함수 실행
    await profileStore.updateProfileDetails({
      userName: trimmedUsername,
      userNameTag: usernameTag.value,
      bio: bioFormData.value.bio,
      spokenLangs: bioFormData.value.spokenLangs,
      learningLangs: bioFormData.value.learningLangs,
      snsLinks: bioFormData.value.snsLinks,
    })

    // 3. 성공 처리
    alert('프로필이 업데이트 되었습니다.')

    authStore.syncAndAssignUser({
            provider: 'clerk',
            email: authStore.userInfo.email,
            name: trimmedUsername,
          })
    modalStore.closeModal()

    // 필요하다면 여기서 유저 프로필 목록/상세 데이터를 다시 불러오는(Refetch) 로직을 추가하세요.

  } catch (error: any) {
    // 4. 실패 처리
    console.error('프로필 저장 에러:', error)
    alert(error.message || '저장 중 오류가 발생했습니다.')
  }
}

const closeModal = () => {
  modalStore.closeModal()
}



const loadProfileData = async () => {
  try {
    const data = await profileStore.fetchProfileDetails()

    if (data) {
      bioFormData.value.bio = data.bio || ''

      // 백엔드 데이터 구조에 맞게 바인딩 (문자열 배열 기준)
      // 만약 백엔드에서 [{ language: '한국어' }] 형태 객체 배열로 온다면 .map(i => i.language) 처리 필요
      bioFormData.value.spokenLangs = data.spokenLangs ? [...data.spokenLangs] : []
      bioFormData.value.learningLangs = data.learningLangs ? [...data.learningLangs] : []

      bioFormData.value.snsLinks = data.snsLinks
        ? data.snsLinks.map(link => ({ platform: link.platform, value: link.value }))
        : []
    }
  } catch (error) {
    console.error('프로필 데이터 로딩 실패:', error)
  }
}

watch(
  () => authStore.userInfo,
  (userInfo) => {
    if (userInfo) {
      loadProfileData()
    }
  },
  { immediate: true } // 이미 로그인된 상태로 컴포넌트가 켜졌을 때도 즉시 실행
)


watch(
  () => authStore.currentUserInfo,
  (userInfo) => {
    if (userInfo?.name) {
      const match = userInfo.name.match(/^(.+)#(\d+)$/)
      if (match) {
        username.value = match[1]
        usernameTag.value = `#${match[2]}`
      } else {
        username.value = userInfo.name
        usernameTag.value = '#0'
      }
    }
  },
  { immediate: true } // 모달/컴포넌트가 로드될 때 즉시 실행
)
</script>

<template>
  <div>
    <div v-if="modalStore.activeModal === 'editBio'"
      class="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div class="w-full max-w-2xl bg-[#e6e2db]
               border-4 border-[#2d2b28]
               shadow-[8px_8px_0px_0px_#121315]
               overflow-hidden flex flex-col max-h-[90vh]">
        <!-- 헤더 -->
        <div class="bg-[#2d2b28] text-[#fbf9f5]
                 px-4 py-1.5
                 flex justify-between items-center
                 text-xs font-bold shrink-0">
          <span>// 프로필_업데이트.exe</span>
          <button class="hover:text-red-400 font-pixel text-lg leading-none" @click="closeModal">
            ×
          </button>
        </div>

        <!-- 본문 -->
        <div class="p-5 overflow-y-auto custom-scrollbar space-y-6">



          <!-- 사용자 ID -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 사용자 ID (Username)
            </p>

            <div class="bg-[#f4f1eb] border-2 border-[#2d2b28] p-3 shadow-[2px_2px_0px_0px_#a39b90]">
              <div class="flex items-center gap-2">
                <div
                  class="flex-1 flex items-stretch bg-white border-2 border-[#2d2b28] shadow-inner focus-within:bg-[#fffdf8] h-[38px]">
                  <input v-model="username" type="text" maxlength="20" placeholder="아이디 입력"
                    class="flex-1 min-w-0 px-3 text-xs font-bold outline-none bg-transparent" />
                  <div
                    class="bg-[#d1cbc1] border-l-2 border-[#2d2b28] px-3 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0 select-none whitespace-nowrap min-w-[50px]">
                    {{ usernameTag }}
                  </div>
                </div>

                <!-- 서버 조회 버튼 -->
                <button @click="fetchUsernameTag" type="button"
                  class="h-[38px] bg-[#2d2b28] text-white border-2 border-[#2d2b28] px-3 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_#a39b90] shrink-0 flex items-center justify-center">
                  태그 확인
                </button>
              </div>

              <!-- 안내 및 현재 ID 상태 -->
              <div class="mt-2.5 flex items-center justify-between text-[10px] text-neutral-500">
                <span>※ 태그 번호는 변경할 수 없습니다.</span>
                <span>현재: <strong class="text-[#2d2b28]">{{ username || '아이디' }}{{ usernameTag }}</strong></span>
              </div>
            </div>
          </div>

          <!-- 언어 선택 영역 (태그 추가 방식) -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 언어 설정 (Languages)
            </p>

            <!-- 자동완성 추천 목록 -->
            <datalist id="language-suggestions">
              <option v-for="lang in suggestedLanguages" :key="lang" :value="lang"></option>
            </datalist>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- 구사 언어 -->
              <div>
                <label class="block text-xs font-bold mb-1">구사 언어 (Spoken Languages)</label>
                <div class="flex gap-2 mb-2">
                  <input type="text" v-model="newSpokenLang" @keyup.enter="addSpokenLang" list="language-suggestions"
                    placeholder="언어 입력 후 Enter"
                    class="flex-1 bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
                  <button @click="addSpokenLang"
                    class="bg-[#2d2b28] text-white border-2 border-[#2d2b28] px-3 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_#a39b90]">
                    추가
                  </button>
                </div>
                <!-- 구사 언어 태그 목록 -->
                <div class="flex flex-wrap gap-2 min-h-[24px]">
                  <span v-for="(lang, index) in bioFormData.spokenLangs" :key="index"
                    class="flex items-center gap-1 bg-[#d1cbc1] border border-[#2d2b28] px-2 py-1 text-[10px] font-bold shadow-[1px_1px_0px_0px_#2d2b28]">
                    {{ lang }}
                    <button @click="removeSpokenLang(index)"
                      class="text-rose-600 hover:text-rose-800 ml-1 leading-none">×</button>
                  </span>
                  <span v-if="bioFormData.spokenLangs.length === 0" class="text-[10px] text-neutral-400">등록된 언어가
                    없습니다.</span>
                </div>
              </div>

              <!-- 학습 언어 -->
              <div>
                <label class="block text-xs font-bold mb-1">학습 언어 (Learning Languages)</label>
                <div class="flex gap-2 mb-2">
                  <input type="text" v-model="newLearningLang" @keyup.enter="addLearningLang"
                    list="language-suggestions" placeholder="언어 입력 후 Enter"
                    class="flex-1 bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
                  <button @click="addLearningLang"
                    class="bg-[#2d2b28] text-white border-2 border-[#2d2b28] px-3 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_#a39b90]">
                    추가
                  </button>
                </div>
                <!-- 학습 언어 태그 목록 -->
                <div class="flex flex-wrap gap-2 min-h-[24px]">
                  <span v-for="(lang, index) in bioFormData.learningLangs" :key="index"
                    class="flex items-center gap-1 bg-[#d1cbc1] border border-[#2d2b28] px-2 py-1 text-[10px] font-bold shadow-[1px_1px_0px_0px_#2d2b28]">
                    {{ lang }}
                    <button @click="removeLearningLang(index)"
                      class="text-rose-600 hover:text-rose-800 ml-1 leading-none">×</button>
                  </span>
                  <span v-if="bioFormData.learningLangs.length === 0" class="text-[10px] text-neutral-400">등록된 언어가
                    없습니다.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 소개글 -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 소개글 (Bio)
            </p>
            <textarea v-model="bioFormData.bio" rows="4" placeholder="자신을 자유롭게 소개해주세요."
              class="w-full bg-white border-2 border-[#2d2b28] p-3 text-xs outline-none shadow-inner resize-none custom-scrollbar leading-relaxed"></textarea>
          </div>

          <!-- SNS 관리 영역 -->
          <div>
            <p class="text-xs font-bold uppercase text-neutral-500 border-b-2 border-[#c5bfb6] pb-1 mb-3">
              > 외부 연결망 (SNS Links)
            </p>

            <div class="flex gap-2 mb-3">
              <select v-model="newSnsPlatform"
                class="bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner min-w-[120px] font-bold cursor-pointer">
                <option v-for="opt in snsOptions" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
              <input type="text" v-model="newSnsValue" @keyup.enter="addSns" :placeholder="currentPlaceholder"
                class="flex-1 bg-white border-2 border-[#2d2b28] p-2 text-xs outline-none shadow-inner" />
              <button @click="addSns"
                class="bg-[#2d2b28] text-white border-2 border-[#2d2b28] px-4 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-[2px_2px_0px_0px_#a39b90]">
                추가
              </button>
            </div>

            <div class="space-y-2">
              <div v-for="(link, index) in bioFormData.snsLinks" :key="index"
                class="flex items-center justify-between bg-[#f4f1eb] border border-[#2d2b28] p-2">
                <div class="flex items-center gap-3 overflow-hidden">
                  <a v-if="getSnsOption(link.platform).isLink" :href="formatUrl(link.value)" target="_blank"
                    class="hover:scale-110 transition-transform cursor-pointer drop-shadow-sm flex items-center justify-center w-8 h-8 bg-white rounded-md border border-[#c5bfb6]"
                    title="링크로 이동">
                    <img :src="getSnsOption(link.platform).iconUrl" alt="icon" class="w-5 h-5 object-contain" />
                  </a>
                  <span v-else
                    class="drop-shadow-sm flex items-center justify-center w-8 h-8 bg-white rounded-md border border-[#c5bfb6] cursor-default"
                    title="ID 복사용">
                    <img :src="getSnsOption(link.platform).iconUrl" alt="icon" class="w-5 h-5 object-contain" />
                  </span>

                  <div class="flex flex-col shrink-0 min-w-0">
                    <span class="text-[10px] font-bold text-neutral-500">
                      {{ getSnsOption(link.platform).name }}
                    </span>
                    <span class="text-xs text-[#2d2b28] font-bold truncate">
                      {{ link.value }}
                    </span>
                  </div>
                </div>

                <button @click="removeSns(index)"
                  class="ml-2 text-rose-500 hover:text-rose-700 font-bold text-xs shrink-0 px-2">
                  삭제
                </button>
              </div>

              <div v-if="bioFormData.snsLinks.length === 0"
                class="text-center py-3 text-xs text-neutral-400 border border-dashed border-[#c5bfb6]">
                등록된 외부 연결망이 없습니다.
              </div>
            </div>
          </div>

        </div>

        <!-- 하단 버튼 영역 -->
        <div class="p-4 bg-[#d1cbc1] border-t-2 border-[#2d2b28] flex justify-end gap-3 shrink-0">
          <button @click="closeModal"
            class="bg-[#c5bfb6] text-[#2d2b28] border-2 border-[#2d2b28] px-5 py-1.5 text-xs font-bold hover:bg-neutral-300 transition-all shadow-[2px_2px_0px_0px_#a39b90]">
            취소
          </button>
          <button @click="handleSaveProfile"
            class="bg-[#2d2b28] text-[#fbf9f5] border-2 border-[#2d2b28] px-5 py-1.5 text-xs font-bold hover:bg-neutral-800 transition-all shadow-[2px_2px_0px_0px_#a39b90]">
            프로필 갱신
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