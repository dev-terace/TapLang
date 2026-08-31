<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuizStore } from '@/quiz/stores/QuizStore'
import { useInfiniteScroll } from '@/shared/ui/composables/useInfiniteScroll'

const { t } = useI18n()
const props = defineProps<{ scrollContainer: HTMLElement | null }>()
const emit = defineEmits<{(e: 'navigate', view: 'menu'): void }>()

const quizStore = useQuizStore()
const sharedSentinel = ref<HTMLElement | null>(null)

useInfiniteScroll({
  container: () => props.scrollContainer,
  sentinel: sharedSentinel,
  hasMore: () => quizStore.sharedHasMore,
  isLoading: () => quizStore.isLoading,
  loadMore: () => quizStore.fetchSharedCollections(true),
  rootMargin: '200px',
  debugLabel: 'SHARED_COLLECTIONS'
})

const getAuthorName = (author: any) => (!author ? t('quiz-shared.anonymous') : typeof author === 'object' ? author.name : author)

const handleSortChange = async (e: Event) => {
  const target = e.target as HTMLSelectElement
  await quizStore.changeSharedSort(target.value as 'recent' | 'popular')
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
      <h3 class="text-xl font-bold text-slate-900">{{ t('quiz-shared.headerTitle') }}</h3>

      <div class="flex items-center space-x-2">
        <button @click="quizStore.refreshSharedCollections()" :disabled="quizStore.isLoading" class="bg-white hover:bg-slate-50 border-2 border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b] flex items-center space-x-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all">
          <span :class="{ 'animate-spin': quizStore.isLoading }">🔄</span>
          <span>{{ t('quiz-shared.refresh') }}</span>
        </button>

        <select :value="quizStore.sharedSortType" @change="handleSortChange" class="bg-white border-2 border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none shadow-[2px_2px_0px_0px_#1e293b]">
          <option value="recent">{{ t('quiz-shared.sortRecent') }}</option>
          <option value="popular">{{ t('quiz-shared.sortPopular') }}</option>
        </select>
        <button @click="emit('navigate', 'menu')" class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">
          {{ t('quiz-shared.backToMain') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div v-for="col in quizStore.sharedCollections" :key="col.id" class="bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-extrabold text-base text-slate-900 mb-1">{{ col.title }}</h4>
            <span class="px-2 py-0.5 bg-slate-100 border border-slate-800 rounded-md text-[10px] font-bold">
              {{ t('quiz-shared.sentenceCount', { count: col.sentences?.length || 0 }) }}
            </span>
          </div>
          <p class="text-xs text-slate-600 mb-4 line-clamp-2">{{ col.description }}</p>
        </div>

        <div>
          <div class="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 text-[11px] font-medium text-slate-600">
            <span>{{ t('quiz-shared.authorLabel') }} <strong class="text-slate-800 font-bold">{{ getAuthorName(col.author) }}</strong></span>
            <span><strong class="text-rose-600 font-bold">{{ t('quiz-shared.learnersStudying', { count: col.learnerCount || 0 }) }}</strong></span>
          </div>
          <button @click="quizStore.importCollection(col)" class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-2.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
            {{ t('quiz-shared.importToMine') }}
          </button>
        </div>
      </div>
    </div>

    <div ref="sharedSentinel" class="h-16 mt-6 flex justify-center items-center text-xs font-bold text-slate-500">
      <span v-if="quizStore.isLoading && quizStore.sharedCollections.length > 0">{{ t('quiz-shared.loading') }}</span>
      <span v-else-if="!quizStore.sharedHasMore && quizStore.sharedCollections.length > 0">{{ t('quiz-shared.noMore') }}</span>
    </div>
  </div>
</template>