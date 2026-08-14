<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import {
  Bot,
  Sticker,
  Image as ImageIcon,
  Plus
} from 'lucide-vue-next'
import type { Component } from 'vue'

const uiStore = useUIStore()

export interface Feature {
  id: string
  name: string
  subName?: string
  icon: Component
}

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  {
    loading: false
  }
)

const emit = defineEmits<{
  (e: 'select', feature: Feature): void
}>()

const features: Feature[] = [
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

const showFeatureModal = ref(false)

const recentFeature = ref<Feature>(features[0])
const isRecentFeaturePressed = ref(false)

const select = (feature: Feature) => {
  recentFeature.value = feature
  showFeatureModal.value = false

  emit('select', feature)
}

// Ctrl+E / 버튼 클릭 시 최근 사용 기능 다시 실행
const useRecentFeature = () => {
  if (props.loading) return

  isRecentFeaturePressed.value = true

  setTimeout(() => {
    isRecentFeaturePressed.value = false
  }, 150)

  emit('select', recentFeature.value)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (uiStore.currentTab !== 'chatRoom') return
  if (props.loading) return

  if (e.ctrlKey && e.key.toLowerCase() === 'e') {
    e.preventDefault()
    useRecentFeature()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="relative flex items-center gap-3">

    <!-- 최근 사용 기능 버튼 -->
    <button
      type="button"
      @click="useRecentFeature"
      :disabled="loading"
      title="최근 사용한 기능 (Ctrl + E)"
      class="w-11 h-11 shrink-0 bg-[#e6e2db] text-[#2d2b28]
             flex items-center justify-center
             border-2 border-[#2d2b28]
             transition-all duration-100"
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

    <!-- 모달 열기 버튼 -->
    <button
      type="button"
      @click="showFeatureModal = true"
      :disabled="loading"
      class="w-11 h-11 shrink-0 bg-[#2d2b28] text-white
             flex items-center justify-center
             border-2 border-[#2d2b28]
             shadow-[3px_3px_0px_0px_#2d2b28]
             transition-all duration-100
             active:shadow-none
             active:translate-x-[3px]
             active:translate-y-[3px]
             hover:bg-[#121315]
             disabled:opacity-50
             disabled:cursor-not-allowed"
    >
      <Plus class="w-6 h-6 stroke-[3]" />
    </button>

    <!-- 중앙 대형 모달 -->
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
          class="fixed inset-0 z-[100]
                 flex items-center justify-center
                 bg-black/60 p-4"
          @click.self="showFeatureModal = false"
        >
          <div
            class="w-full max-w-sm
                   bg-[#e6e2db]
                   border-4 border-[#2d2b28]
                   shadow-[8px_8px_0px_0px_#121315]
                   overflow-hidden
                   flex flex-col"
          >

            <!-- 모달 헤더 -->
            <div
              class="bg-[#2d2b28] text-[#fbf9f5]
                     px-4 py-1.5
                     flex justify-between items-center
                     text-xs font-bold"
            >
              <span>// 기능_선택_프로토콜.cfg</span>

              <button
                type="button"
                @click="showFeatureModal = false"
                class="hover:text-red-400
                       font-pixel
                       text-lg
                       leading-none"
              >
                ×
              </button>
            </div>

            <!-- 기능 목록 -->
            <div class="p-5 space-y-4">

              <p class="text-xs font-bold uppercase text-neutral-500">
              </p>

              <div class="grid grid-cols-3 gap-3">

                <button
                  v-for="feature in features"
                  :key="feature.id"
                  type="button"
                  @click="select(feature)"
                  class="group
                         flex flex-col
                         items-center
                         justify-center
                         p-3
                         gap-2
                         bg-white
                         border-2 border-[#2d2b28]
                         shadow-[3px_3px_0px_0px_#2d2b28]
                         transition-all duration-150
                         hover:bg-[#fbf9f5]
                         hover:translate-x-[1px]
                         hover:translate-y-[1px]
                         hover:shadow-[2px_2px_0px_0px_#2d2b28]
                         active:translate-x-[3px]
                         active:translate-y-[3px]
                         active:shadow-none"
                >

                  <!-- 아이콘 -->
                  <div
                    class="w-10 h-10
                           flex items-center justify-center
                           bg-[#e6e2db]
                           rounded-full
                           border-2 border-[#2d2b28]
                           group-hover:bg-[#2d2b28]
                           group-hover:text-white
                           transition-colors"
                  >
                    <component
                      :is="feature.icon"
                      class="w-5 h-5 stroke-[2.5]"
                    />
                  </div>

                  <!-- 이름 -->
                  <div
                    class="flex flex-col
                           items-center
                           gap-0.5"
                  >
                    <span
                      class="text-xs
                             font-bold
                             text-[#2d2b28]
                             leading-none
                             whitespace-nowrap"
                    >
                      {{ feature.name }}
                    </span>

                    <span
                      v-if="feature.subName"
                      class="text-[9px]
                             font-bold
                             text-neutral-500
                             whitespace-nowrap"
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

    <!-- 전역 로딩 오버레이 -->
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
          class="fixed inset-0 z-[200]
                 flex items-center justify-center
                 bg-black/50"
        >
          <div class="flex flex-col items-center gap-4">

            <div
              class="w-14 h-14
                     rounded-full
                     border-4
                     border-[#e6e2db]
                     border-t-[#2d2b28]
                     animate-spin"
            ></div>

            <span
              class="text-xs
                     font-bold
                     text-white
                     tracking-wide"
            >
              번역 중...
            </span>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>