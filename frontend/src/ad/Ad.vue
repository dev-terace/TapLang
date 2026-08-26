<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useModalStore } from '@/shared/modal/ModalStore'
import { useUIStore } from '@/shared/ui/UiStore'

const modalStore = useModalStore()
const uiStore = useUIStore()
const adContainer = ref<HTMLElement | null>(null)

// 💡 'ad' 탭에 진입하기 전 이전 탭을 저장해둘 ref (기본값 'chat')
const previousTab = ref<string>('chat')

declare global {
  interface Window {
    PartnersCoupang: any
  }
}

// Coupang 파트너스 광고 스크립트 동적 주입 및 실행
const renderCoupangAd = async () => {
  await nextTick()
  if (!adContainer.value) return

  adContainer.value.innerHTML = ''

  const scriptTag = document.createElement('script')
  scriptTag.src = 'https://ads-partners.coupang.com/g.js'
  scriptTag.async = true

  scriptTag.onload = () => {
    if (window.PartnersCoupang) {
      new window.PartnersCoupang.G({
        id: 921210,
        trackingCode: 'AF0595578',
        subId: null,
        template: 'carousel',
        width: '680',
        height: '140'
      })
    }
  }

  adContainer.value.appendChild(scriptTag)
}

// 💡 1. currentTab 변동 감지: 'ad'로 변경 시 이전 탭(oldTab) 저장 후 모달 오픈
watch(
  () => uiStore.currentTab,
  (newTab, oldTab) => {
    if (newTab === 'ad') {
      if (oldTab && oldTab !== 'ad') {
        previousTab.value = oldTab
      }
      modalStore.openModal('adBanner')
    }
  },
  { immediate: true }
)

// 💡 2. activeModal 상태 감지: 모달 오픈 시 광고 렌더링, 외부 요인으로 닫힐 시 이전 탭 복구
watch(
  () => modalStore.activeModal,
  (newModal) => {
    if (newModal === 'adBanner') {
      renderCoupangAd()
    } else if (newModal === null && uiStore.currentTab === 'ad') {
      // 모달이 닫혔을 때 currentTab이 여전히 'ad'라면 이전 탭으로 복원
      uiStore.changeTab(previousTab.value || 'chat')
    }
  }
)

// 💡 닫기 핸들러: 모달을 닫고 저장해둔 이전 탭으로 이동
const handleClose = () => {
  modalStore.closeModal()
  uiStore.changeTab(previousTab.value || 'chat')
}
</script>

<template>
  <Teleport to="body">
    <!-- 모달 오버레이 배경 -->
    <div
      v-if="modalStore.activeModal === 'adBanner'"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all"
      @click.self="handleClose"
    >
      <!-- 모달 컨테이너 -->
      <div
        class="relative w-full max-w-[740px] bg-[#fbf9f5] border-2 border-[#2d2b28] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#2d2b28] flex flex-col items-center"
      >
        <!-- 모달 헤더 -->
        <div class="w-full flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-200">
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 bg-amber-400 border-2 border-[#2d2b28] rounded-md text-[10px] font-black shadow-[2px_2px_0px_0px_#2d2b28]">
              SPONSORED
            </span>
          </div>

          <!-- 닫기 버튼 -->
          <button
            @click="handleClose"
            class="w-7 h-7 bg-white hover:bg-slate-100 border-2 border-[#2d2b28] rounded-lg text-xs font-black flex items-center justify-center shadow-[2px_2px_0px_0px_#2d2b28] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            ✕
          </button>
        </div>

        <!-- Coupang 광고 배너 영역 -->
        <div class="w-full flex justify-center items-center min-h-[140px] overflow-x-auto my-2">
          <div ref="adContainer" class="flex justify-center items-center"></div>
        </div>

        <!-- 하단 안내문 -->
        <p class="text-[10px] text-slate-400 mt-3 text-center">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>
    </div>
  </Teleport>
</template>