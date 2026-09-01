<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/shared/ui/UiStore'
import { noticeApi, type NoticeItem } from '@/notice/api/notice.api'

const { t } = useI18n()
const uiStore = useUIStore()

const notices = ref<NoticeItem[]>([])
const isLoading = ref(false)
const selectedNoticeId = ref<number | null>(null)

// 모달 및 폼 상태
const isModalOpen = ref(false)
const isEditing = ref(false)
const editTargetId = ref<number | null>(null)
const formTitle = ref('')
const formIsUrgent = ref(false)
const formContent = ref('') // HTML 코드가 직접 저장될 상태

const isAdmin = ref(false)

const fetchNotices = async () => {
  try {
    isLoading.value = true
    notices.value = await noticeApi.getNotices()
  } catch (err) {
    console.error('공지사항 로딩 실패:', err)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  if (!isAdmin.value) return
  isEditing.value = false
  editTargetId.value = null
  formTitle.value = ''
  formIsUrgent.value = false
  formContent.value = ''
  isModalOpen.value = true
}

const openEditModal = (notice: NoticeItem, event: Event) => {
  event.stopPropagation()
  if (!isAdmin.value) return
  isEditing.value = true
  editTargetId.value = notice.id
  formTitle.value = notice.title
  formIsUrgent.value = notice.isUrgent
  formContent.value = notice.content
  isModalOpen.value = true
}

const handleSave = async () => {
  if (!isAdmin.value) return alert(t('notice.noPermission'))
  if (!formTitle.value.trim()) return alert(t('notice.alertEnterTitle'))
  if (!formContent.value.trim()) return alert(t('notice.alertEnterContent'))

  try {
    const payload = {
      title: formTitle.value,
      content: formContent.value,
      isUrgent: formIsUrgent.value,
    }

    if (isEditing.value && editTargetId.value) {
      await noticeApi.updateNotice(editTargetId.value, payload)
    } else {
      await noticeApi.createNotice(payload)
    }
    isModalOpen.value = false
    await fetchNotices()
  } catch (error) {
    alert(t('notice.saveError'))
  }
}

const handleDelete = async (id: number, event: Event) => {
  event.stopPropagation()
  if (!isAdmin.value) return alert(t('notice.noPermission'))
  if (!confirm(t('notice.confirmDelete'))) return
  try {
    await noticeApi.deleteNotice(id)
    await fetchNotices()
  } catch (error) {
    alert(t('notice.deleteError'))
  }
}

const toggleDetail = (id: number) => {
  selectedNoticeId.value = selectedNoticeId.value === id ? null : id
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toISOString().split('T')[0]
}

onMounted(async () => {
  isAdmin.value = await noticeApi.checkAdmin()
  fetchNotices()
})
</script>

<template>
  <div v-if="uiStore.currentTab === 'notice'" class="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
    <div>
      <!-- 헤더 영역 -->
      <div class="border-b-2 border-dashed border-[#2d2b28] pb-4 mb-6 flex justify-between items-center">
        <div>
          <h3 class="font-bold text-base tracking-wider">{{ t('notice.title') }}</h3>
          <p class="text-[10px] text-neutral-500">{{ t('notice.description') }}</p>
        </div>
        
        <button 
          v-if="isAdmin"
          @click="openCreateModal"
          class="border-2 border-[#2d2b28] bg-white text-xs px-2 py-1 font-bold hover:bg-[#2d2b28] hover:text-white transition-all shadow-[2px_2px_0px_0px_#2d2b28]"
        >
          {{ t('notice.createNotice') }}
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="py-12 text-center text-xs font-bold animate-pulse">
        {{ t('notice.loading') }}
      </div>

      <!-- 목록 영역 -->
      <div v-else class="space-y-3">
        <div 
          v-for="notice in notices" 
          :key="notice.id"
          @click="toggleDetail(notice.id)"
          class="bg-white border-2 border-[#2d2b28] p-3 text-xs shadow-[2px_2px_0px_0px_#2d2b28] cursor-pointer transition-colors hover:bg-neutral-50"
        >
          <div class="flex justify-between items-center">
            <span class="font-bold" :class="notice.isUrgent ? 'text-red-600' : 'text-[#2d2b28]'">
              {{ notice.isUrgent ? t('notice.badgeUrgent') : t('notice.badgeNormal') }} {{ notice.title }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-neutral-400">{{ formatDate(notice.createdAt) }}</span>
              
              <div v-if="isAdmin" class="flex gap-1">
                <button 
                  @click="openEditModal(notice, $event)" 
                  class="border border-[#2d2b28] bg-neutral-100 text-[9px] px-1 font-bold hover:bg-[#2d2b28] hover:text-white"
                >
                  {{ t('notice.edit') }}
                </button>
                <button 
                  @click="handleDelete(notice.id, $event)" 
                  class="border border-[#2d2b28] bg-red-100 text-red-600 text-[9px] px-1 font-bold hover:bg-red-600 hover:text-white"
                >
                  {{ t('notice.delete') }}
                </button>
              </div>
            </div>
          </div>

          <div 
            v-if="selectedNoticeId === notice.id" 
            class="mt-3 pt-3 border-t border-dashed border-neutral-300 text-xs text-neutral-700 leading-relaxed space-y-2 prose max-w-none"
            v-html="notice.content"
          ></div>
        </div>
      </div>
    </div>

    <!-- 작성/수정 모달 (HTML 전용) -->
    <div v-if="isAdmin && isModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#f4f1eb] border-2 border-[#2d2b28] w-full max-w-2xl p-5 shadow-[4px_4px_0px_0px_#2d2b28]">
        <h4 class="font-bold text-sm mb-4 border-b-2 border-[#2d2b28] pb-2 flex justify-between items-center">
          <span>{{ isEditing ? t('notice.modalEditTitle') : t('notice.modalCreateTitle') }}</span>
          <span class="text-[10px] bg-[#2d2b28] text-white px-2 py-0.5">{{ t('notice.htmlMode') }}</span>
        </h4>

        <div class="space-y-3">
          <div class="flex gap-2 items-center">
            <label class="flex items-center gap-1 text-xs font-bold select-none border-2 border-[#2d2b28] bg-white px-2 py-1 cursor-pointer">
              <input type="checkbox" v-model="formIsUrgent" class="accent-[#2d2b28]" />
              {{ t('notice.urgentLabel') }}
            </label>
            <input 
              v-model="formTitle" 
              type="text" 
              :placeholder="t('notice.titlePlaceholder')" 
              class="flex-1 border-2 border-[#2d2b28] p-1 text-xs font-bold focus:outline-none"
            />
          </div>

          <!-- HTML 코드 작성 영역 -->
          <div class="relative">
            <textarea
              v-model="formContent"
              :placeholder="t('notice.contentPlaceholder')"
              class="w-full border-2 border-[#2d2b28] bg-[#1e1e1e] text-[#a6e22e] p-4 h-72 overflow-y-auto text-xs font-mono focus:outline-none leading-relaxed resize-none shadow-inner"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button 
            @click="isModalOpen = false" 
            class="border-2 border-[#2d2b28] bg-white px-3 py-1 text-xs font-bold hover:bg-neutral-200"
          >
            {{ t('notice.cancel') }}
          </button>
          <button 
            @click="handleSave" 
            class="border-2 border-[#2d2b28] bg-[#2d2b28] text-white px-3 py-1 text-xs font-bold hover:bg-black"
          >
            {{ t('notice.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>