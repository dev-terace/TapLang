<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue'

import { useUIStore } from '@/shared/ui/UiStore'

import {
  Bot,
  Sticker,
  Image as ImageIcon,
  Plus,
  Crown,
  UserMinus,
  X
} from 'lucide-vue-next'

import type { Component } from 'vue'

const uiStore = useUIStore()

// =========================================================
// Feature 타입
// =========================================================

export interface Feature {
  id: string
  name: string
  subName?: string
  icon: Component
}

// =========================================================
// Props
// =========================================================

const props = withDefaults(
  defineProps<{
    loading?: boolean
    showOwnerFeatures?: boolean
  }>(),
  {
    loading: false,
    showOwnerFeatures: false
  }
)

// =========================================================
// Emits
// =========================================================

const emit = defineEmits<{
  (e: 'select', feature: Feature): void
}>()

// =========================================================
// 기본 기능
// =========================================================

const baseFeatures: Feature[] = [
  {
    id: 'AI',
    name: 'AI 번역',
    subName: '스마트 변환',
    icon: Bot
  },
  {
    id: 'Sticker',
    name: '이모티콘',
    subName: '스티커',
    icon: Sticker
  },
  {
    id: 'Image',
    name: '사진',
    subName: '업로드',
    icon: ImageIcon
  }
]

// =========================================================
// 방장 전용 기능
// =========================================================

const ownerFeatures: Feature[] = [
  {
    id: 'TransferOwner',
    name: '방장 위임',
    subName: '방장 변경',
    icon: Crown
  },
  {
    id: 'KickMember',
    name: '멤버 내보내기',
    subName: '멤버 퇴장',
    icon: UserMinus
  }
]

// =========================================================
// 최종 기능 목록
// =========================================================

const features = computed<Feature[]>(() => {
  if (props.showOwnerFeatures) {
    return [
      ...baseFeatures,
      ...ownerFeatures
    ]
  }

  return baseFeatures
})

// =========================================================
// 상태
// =========================================================

const showFeatureModal = ref(false)

// 방장 위임 선택 모달
const showTransferOwnerModal = ref(false)

// 멤버 내보내기 선택 모달
const showKickMemberModal = ref(false)

const recentFeature = ref<Feature>(
  baseFeatures[0]
)

const isRecentFeaturePressed = ref(false)

// =========================================================
// 기능 선택
// =========================================================

const select = (feature: Feature) => {
  // 방장 위임
  if (feature.id === 'TransferOwner') {
    showFeatureModal.value = false
    showTransferOwnerModal.value = true
    return
  }

  // 멤버 내보내기
  if (feature.id === 'KickMember') {
    showFeatureModal.value = false
    showKickMemberModal.value = true
    return
  }

  // 일반 기능
  recentFeature.value = feature
  showFeatureModal.value = false

  emit('select', feature)
}

// =========================================================
// 방장 위임 목업
// =========================================================

const closeTransferOwnerModal = () => {
  showTransferOwnerModal.value = false
}

const confirmTransferOwner = () => {
  // 실제 API 연결 예정
  window.alert('방장 위임 기능은 준비 중입니다.')

  showTransferOwnerModal.value = false
}

// =========================================================
// 멤버 내보내기 목업
// =========================================================

const closeKickMemberModal = () => {
  showKickMemberModal.value = false
}

const confirmKickMember = () => {
  // 실제 API 연결 예정
  window.alert('멤버 내보내기 기능은 준비 중입니다.')

  showKickMemberModal.value = false
}

// =========================================================
// 최근 기능 실행
// =========================================================

const useRecentFeature = () => {
  if (props.loading) {
    return
  }

  isRecentFeaturePressed.value = true

  setTimeout(() => {
    isRecentFeaturePressed.value = false
  }, 150)

  emit(
    'select',
    recentFeature.value
  )
}

// =========================================================
// 키보드
// =========================================================

const handleKeydown = (
  e: KeyboardEvent
) => {
  if (
    uiStore.currentTab !== 'chatRoom' &&
    uiStore.currentTab !== 'inviteChatRoom' &&
    uiStore.currentTab !== 'customChatRoom'
  ) {
    return
  }

  if (props.loading) {
    return
  }

  if (
    e.ctrlKey &&
    e.key.toLowerCase() === 'e'
  ) {
    e.preventDefault()
    useRecentFeature()
  }
}

// =========================================================
// Lifecycle
// =========================================================

onMounted(() => {
  window.addEventListener(
    'keydown',
    handleKeydown
  )
})

onUnmounted(() => {
  window.removeEventListener(
    'keydown',
    handleKeydown
  )
})
</script>

<template>
  <div class="relative flex items-center gap-3">

    <!-- ================================================= -->
    <!-- 최근 기능 -->
    <!-- ================================================= -->

    <button
      type="button"
      @click="useRecentFeature"
      :disabled="loading"
      title="최근 사용한 기능 (Ctrl + E)"
      class="
        w-11 h-11
        shrink-0
        bg-[#e6e2db]
        text-[#2d2b28]
        flex
        items-center
        justify-center
        border-2
        border-[#2d2b28]
        transition-all
        duration-100
      "
      :class="
        isRecentFeaturePressed
          ? 'shadow-none translate-x-[3px] translate-y-[3px]'
          : 'shadow-[3px_3px_0px_0px_#2d2b28] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]'
      "
    >
      <component
        :is="recentFeature.icon"
        class="w-5 h-5 stroke-[2.5]"
      />
    </button>

    <!-- ================================================= -->
    <!-- 기능 모달 버튼 -->
    <!-- ================================================= -->

    <button
      type="button"
      @click="showFeatureModal = true"
      :disabled="loading"
      class="
        w-11 h-11
        shrink-0
        bg-[#2d2b28]
        text-white
        flex
        items-center
        justify-center
        border-2
        border-[#2d2b28]
        shadow-[3px_3px_0px_0px_#2d2b28]
        transition-all
        duration-100
        active:shadow-none
        active:translate-x-[3px]
        active:translate-y-[3px]
        hover:bg-[#121315]
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      <Plus
        class="w-6 h-6 stroke-[3]"
      />
    </button>

    <!-- ================================================= -->
    <!-- 기능 선택 모달 -->
    <!-- ================================================= -->

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showFeatureModal"
          class="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
          @click.self="showFeatureModal = false"
        >
          <div
            class="
              w-full
              max-w-sm
              bg-[#e6e2db]
              border-4
              border-[#2d2b28]
              shadow-[8px_8px_0px_0px_#121315]
              overflow-hidden
              flex
              flex-col
            "
          >

            <!-- 헤더 -->

            <div
              class="
                bg-[#2d2b28]
                text-[#fbf9f5]
                px-4
                py-1.5
                flex
                justify-between
                items-center
                text-xs
                font-bold
              "
            >
              <span>
                // 기능_선택_프로토콜.cfg
              </span>

              <button
                type="button"
                @click="showFeatureModal = false"
                class="
                  hover:text-red-400
                  font-pixel
                  text-lg
                  leading-none
                "
              >
                ×
              </button>
            </div>

            <!-- 기능 -->

            <div class="p-5">

              <div
                class="
                  grid
                  grid-cols-3
                  gap-3
                "
              >
                <button
                  v-for="feature in features"
                  :key="feature.id"
                  type="button"
                  @click="select(feature)"
                  class="
                    group
                    flex
                    flex-col
                    items-center
                    justify-center
                    p-3
                    gap-2
                    bg-white
                    border-2
                    border-[#2d2b28]
                    shadow-[3px_3px_0px_0px_#2d2b28]
                    transition-all
                    duration-150
                    hover:bg-[#fbf9f5]
                    hover:translate-x-[1px]
                    hover:translate-y-[1px]
                    hover:shadow-[2px_2px_0px_0px_#2d2b28]
                    active:translate-x-[3px]
                    active:translate-y-[3px]
                    active:shadow-none
                  "
                >

                  <!-- 아이콘 -->

                  <div
                    class="
                      w-10
                      h-10
                      flex
                      items-center
                      justify-center
                      bg-[#e6e2db]
                      rounded-full
                      border-2
                      border-[#2d2b28]
                      group-hover:bg-[#2d2b28]
                      group-hover:text-white
                      transition-colors
                    "
                  >
                    <component
                      :is="feature.icon"
                      class="w-5 h-5 stroke-[2.5]"
                    />
                  </div>

                  <!-- 이름 -->

                  <div
                    class="
                      flex
                      flex-col
                      items-center
                      gap-0.5
                    "
                  >
                    <span
                      class="
                        text-xs
                        font-bold
                        text-[#2d2b28]
                        leading-none
                        whitespace-nowrap
                      "
                    >
                      {{ feature.name }}
                    </span>

                    <span
                      v-if="feature.subName"
                      class="
                        text-[9px]
                        font-bold
                        text-neutral-500
                        whitespace-nowrap
                      "
                    >
                      {{ feature.subName }}
                    </span>
                  </div>

                </button>
              </div>

            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ================================================= -->
    <!-- 방장 위임 선택 모달 - 목업 -->
    <!-- ================================================= -->

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showTransferOwnerModal"
          class="
            fixed
            inset-0
            z-[120]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
          @click.self="closeTransferOwnerModal"
        >
          <div
            class="
              w-full
              max-w-sm
              bg-[#e6e2db]
              border-4
              border-[#2d2b28]
              shadow-[8px_8px_0px_0px_#121315]
              overflow-hidden
            "
          >

            <!-- 헤더 -->

            <div
              class="
                bg-[#2d2b28]
                text-[#fbf9f5]
                px-4
                py-2
                flex
                justify-between
                items-center
                text-xs
                font-bold
              "
            >
              <span>
                // 방장_위임_프로토콜.cfg
              </span>

              <button
                type="button"
                @click="closeTransferOwnerModal"
                class="hover:text-red-400"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- 내용 -->

            <div class="p-5">

              <div
                class="
                  flex
                  items-center
                  gap-3
                  mb-4
                  p-3
                  bg-[#f4f1eb]
                  border-2
                  border-[#2d2b28]
                "
              >
                <div
                  class="
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    bg-[#e6e2db]
                    border-2
                    border-[#2d2b28]
                  "
                >
                  <Crown
                    class="w-5 h-5"
                  />
                </div>

                <div>
                  <div
                    class="
                      text-xs
                      font-bold
                      text-[#2d2b28]
                    "
                  >
                    방장 위임
                  </div>

                  <div
                    class="
                      text-[9px]
                      text-neutral-500
                      mt-1
                    "
                  >
                    새로운 방장을 선택하세요.
                  </div>
                </div>
              </div>

              <!-- 목업 멤버 -->

              <div class="space-y-2">

                <button
                  type="button"
                  class="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    bg-white
                    border-2
                    border-[#2d2b28]
                    text-left
                    hover:bg-[#f4f1eb]
                    transition-colors
                  "
                >
                  <div
                    class="
                      w-8
                      h-8
                      bg-[#c5bfb6]
                      border-2
                      border-[#2d2b28]
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                    "
                  >
                    A
                  </div>

                  <div class="flex-1">
                    <div
                      class="
                        text-xs
                        font-bold
                        text-[#2d2b28]
                      "
                    >
                      사용자 A
                    </div>

                    <div
                      class="
                        text-[9px]
                        text-neutral-500
                      "
                    >
                      선택 가능한 멤버
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  class="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    bg-white
                    border-2
                    border-[#2d2b28]
                    text-left
                    hover:bg-[#f4f1eb]
                    transition-colors
                  "
                >
                  <div
                    class="
                      w-8
                      h-8
                      bg-[#c5bfb6]
                      border-2
                      border-[#2d2b28]
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                    "
                  >
                    B
                  </div>

                  <div class="flex-1">
                    <div
                      class="
                        text-xs
                        font-bold
                        text-[#2d2b28]
                      "
                    >
                      사용자 B
                    </div>

                    <div
                      class="
                        text-[9px]
                        text-neutral-500
                      "
                    >
                      선택 가능한 멤버
                    </div>
                  </div>
                </button>

              </div>

              <!-- 버튼 -->

              <div
                class="
                  flex
                  justify-end
                  gap-2
                  mt-5
                  pt-4
                  border-t-2
                  border-dashed
                  border-[#2d2b28]
                "
              >
                <button
                  type="button"
                  @click="closeTransferOwnerModal"
                  class="
                    px-4
                    py-1.5
                    bg-[#c5bfb6]
                    text-[#2d2b28]
                    text-xs
                    font-bold
                    border-2
                    border-[#2d2b28]
                  "
                >
                  취소
                </button>

                <button
                  type="button"
                  @click="confirmTransferOwner"
                  class="
                    px-4
                    py-1.5
                    bg-[#2d2b28]
                    text-white
                    text-xs
                    font-bold
                    border-2
                    border-[#2d2b28]
                  "
                >
                  위임
                </button>
              </div>

            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ================================================= -->
    <!-- 멤버 내보내기 선택 모달 - 목업 -->
    <!-- ================================================= -->

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showKickMemberModal"
          class="
            fixed
            inset-0
            z-[120]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
          @click.self="closeKickMemberModal"
        >
          <div
            class="
              w-full
              max-w-sm
              bg-[#e6e2db]
              border-4
              border-[#2d2b28]
              shadow-[8px_8px_0px_0px_#121315]
              overflow-hidden
            "
          >

            <!-- 헤더 -->

            <div
              class="
                bg-[#2d2b28]
                text-[#fbf9f5]
                px-4
                py-2
                flex
                justify-between
                items-center
                text-xs
                font-bold
              "
            >
              <span>
                // 멤버_내보내기_프로토콜.cfg
              </span>

              <button
                type="button"
                @click="closeKickMemberModal"
                class="hover:text-red-400"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- 내용 -->

            <div class="p-5">

              <div
                class="
                  flex
                  items-center
                  gap-3
                  mb-4
                  p-3
                  bg-[#f4f1eb]
                  border-2
                  border-[#2d2b28]
                "
              >
                <div
                  class="
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    bg-[#e6e2db]
                    border-2
                    border-[#2d2b28]
                  "
                >
                  <UserMinus
                    class="w-5 h-5"
                  />
                </div>

                <div>
                  <div
                    class="
                      text-xs
                      font-bold
                      text-[#2d2b28]
                    "
                  >
                    멤버 내보내기
                  </div>

                  <div
                    class="
                      text-[9px]
                      text-neutral-500
                      mt-1
                    "
                  >
                    내보낼 멤버를 선택하세요.
                  </div>
                </div>
              </div>

              <!-- 목업 멤버 -->

              <div class="space-y-2">

                <button
                  type="button"
                  class="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    bg-white
                    border-2
                    border-[#2d2b28]
                    text-left
                    hover:bg-[#f4f1eb]
                    transition-colors
                  "
                >
                  <div
                    class="
                      w-8
                      h-8
                      bg-[#c5bfb6]
                      border-2
                      border-[#2d2b28]
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                    "
                  >
                    A
                  </div>

                  <div class="flex-1">
                    <div
                      class="
                        text-xs
                        font-bold
                        text-[#2d2b28]
                      "
                    >
                      사용자 A
                    </div>

                    <div
                      class="
                        text-[9px]
                        text-neutral-500
                      "
                    >
                      선택 가능한 멤버
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  class="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    bg-white
                    border-2
                    border-[#2d2b28]
                    text-left
                    hover:bg-[#f4f1eb]
                    transition-colors
                  "
                >
                  <div
                    class="
                      w-8
                      h-8
                      bg-[#c5bfb6]
                      border-2
                      border-[#2d2b28]
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                    "
                  >
                    B
                  </div>

                  <div class="flex-1">
                    <div
                      class="
                        text-xs
                        font-bold
                        text-[#2d2b28]
                      "
                    >
                      사용자 B
                    </div>

                    <div
                      class="
                        text-[9px]
                        text-neutral-500
                      "
                    >
                      선택 가능한 멤버
                    </div>
                  </div>
                </button>

              </div>

              <!-- 버튼 -->

              <div
                class="
                  flex
                  justify-end
                  gap-2
                  mt-5
                  pt-4
                  border-t-2
                  border-dashed
                  border-[#2d2b28]
                "
              >
                <button
                  type="button"
                  @click="closeKickMemberModal"
                  class="
                    px-4
                    py-1.5
                    bg-[#c5bfb6]
                    text-[#2d2b28]
                    text-xs
                    font-bold
                    border-2
                    border-[#2d2b28]
                  "
                >
                  취소
                </button>

                <button
                  type="button"
                  @click="confirmKickMember"
                  class="
                    px-4
                    py-1.5
                    bg-[#2d2b28]
                    text-white
                    text-xs
                    font-bold
                    border-2
                    border-[#2d2b28]
                  "
                >
                  내보내기
                </button>
              </div>

            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ================================================= -->
    <!-- 로딩 -->
    <!-- ================================================= -->

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="loading"
          class="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/50
          "
        >
          <div
            class="
              flex
              flex-col
              items-center
              gap-4
            "
          >

            <div
              class="
                w-14
                h-14
                rounded-full
                border-4
                border-[#e6e2db]
                border-t-[#2d2b28]
                animate-spin
              "
            ></div>

            <span
              class="
                text-xs
                font-bold
                text-white
                tracking-wide
              "
            >
              번역 중...
            </span>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>