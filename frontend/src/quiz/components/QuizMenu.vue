<script setup lang="ts">
import { ref } from 'vue'
import { useQuizStore } from '@/quiz/stores/QuizStore'
import { useInfiniteScroll } from '@/shared/ui/composables/useInfiniteScroll'
import type { Collection } from '@/quiz/api/quiz.api'

const props = defineProps<{ scrollContainer: HTMLElement | null }>()
const emit = defineEmits<{(e: 'navigate', view: 'shared' | 'generator' | 'practice'): void }>()

const quizStore = useQuizStore()
const mySentinel = ref<HTMLElement | null>(null)

useInfiniteScroll({
  container: () => props.scrollContainer,
  sentinel: mySentinel,
  hasMore: () => quizStore.myHasMore,
  isLoading: () => quizStore.isLoading,
  loadMore: () => quizStore.fetchMyCollections(true),
  rootMargin: '200px',
  debugLabel: 'MY_COLLECTIONS'
})

const getAuthorName = (author: any) => {
  if (!author) return '익명'
  return typeof author === 'object' ? author.name : author
}

const openEdit = (col: Collection) => {
  const authorName = getAuthorName(col.author)
  if (authorName.includes('(가져옴)')) return alert('가져온 컬렉션은 수정할 수 없습니다.')
  quizStore.editingCollectionId = col.id
  emit('navigate', 'generator')
}

const startPractice = (id: number) => {
  quizStore.changeCollection(id)
  emit('navigate', 'practice')
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-4">
    <div class="text-center mb-8">
      <span class="inline-block px-3 py-1 bg-[#feefc3] text-[#8c6b00] border-2 border-slate-800 rounded-full text-xs font-bold mb-2 shadow-[2px_2px_0px_0px_#1e293b]">
        COLLECTION-BASED LEARNING
      </span>
      <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">언어_퀴즈_스튜디오</h2>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-slate-900">📚 내 학습 컬렉션 ({{ quizStore.myCollections.length }})</h3>
      <div class="flex space-x-2">
        <button @click="emit('navigate', 'shared')" class="bg-white hover:bg-slate-50 border-2 border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b]">
          🌐 공유 게시판
        </button>
        <button @click="quizStore.editingCollectionId = null; emit('navigate', 'generator')" class="bg-amber-400 hover:bg-amber-300 border-2 border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b]">
          + 새 컬렉션
        </button>
      </div>
    </div>

    <div v-if="quizStore.myCollections.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div v-for="col in quizStore.myCollections" :key="col.id" class="bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="px-2.5 py-0.5 bg-slate-100 border border-slate-800 rounded-md text-[10px] font-bold">
              문장 {{ col.sentences?.length || 0 }}개
            </span>
            <div class="flex space-x-1">
              <template v-if="!getAuthorName(col.author).includes('(가져옴)')">
                <button @click="quizStore.toggleShare(col)" class="text-[10px] font-bold px-2 py-0.5 border rounded" :class="col.isShared ? 'bg-blue-100 text-blue-800 border-blue-800' : 'bg-slate-100 text-slate-600'">
                  {{ col.isShared ? '🌐 공유 중' : '🔒 비공개' }}
                </button>
                <button @click="openEdit(col)" class="bg-amber-100 text-amber-900 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  ✏️ 수정
                </button>
              </template>
              <button @click="quizStore.deleteCollection(col)" class="bg-rose-100 text-rose-800 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                🗑️ 삭제
              </button>
            </div>
          </div>
          <h4 class="text-base font-extrabold text-slate-900 mb-1">{{ col.title }}</h4>
          <p class="text-slate-600 text-xs mb-4 leading-relaxed">{{ col.description }}</p>
        </div>

        <div class="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
          <span class="text-[11px] text-slate-400 font-medium">작성자: {{ getAuthorName(col.author) }}</span>
          <button @click="startPractice(col.id)" :disabled="!col.sentences || col.sentences.length === 0" class="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
            🎧 학습 시작
          </button>
        </div>
      </div>
    </div>

    <div ref="mySentinel" class="h-16 mt-6 flex justify-center items-center text-xs font-bold text-slate-500">
      <span v-if="quizStore.isLoading && quizStore.myCollections.length > 0">목록을 불러오는 중...</span>
      <span v-else-if="!quizStore.myHasMore && quizStore.myCollections.length > 0">마지막 컬렉션입니다.</span>
    </div>
  </div>
</template>