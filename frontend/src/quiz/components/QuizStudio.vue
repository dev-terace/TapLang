<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/shared/ui/UiStore'
import { useQuizStore } from '@/quiz/stores/QuizStore'
import { useTTS } from '@/quiz/composables/useTTS'
import { usePractice } from '@/quiz/composables/usePractice'

// 분리한 컴포넌트 Import
import QuizMenu from './QuizMenu.vue'
import QuizShared from './QuizShared.vue'
import QuizForm from './QuizForm.vue'

const { t } = useI18n()
const uiStore = useUIStore()
const quizStore = useQuizStore()

// Practice View용 Composables
const { languages, selectedTtsLang, isPlaying, barHeights, speak } = useTTS()
const { userAnswer, resultState, resetPracticeState, checkAnswer, showAnswer } = usePractice()

// 화면 상태 및 무한 스크롤 컨테이너 참조
const subView = ref<'menu' | 'practice' | 'shared' | 'generator'>('menu')
const scrollContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  quizStore.loadCollections()
})

// 화면 전환 핸들러
const handleNavigate = (view: 'menu' | 'practice' | 'shared' | 'generator') => {
  if (view === 'practice') {
    resetPracticeState() // 학습 화면 진입 시 상태 초기화
  }
  subView.value = view
}

// 학습 화면에서의 문장 이동 핸들러
const handleSentenceChange = (idx: number) => {
  quizStore.selectSentence(idx)
  resetPracticeState()
}
</script>

<template>
  <div 
    ref="scrollContainer" 
    v-if="uiStore.currentTab === 'quiz'"
    class="flex-1 h-screen overflow-y-auto p-6 md:p-10 bg-[#f7f5ed] text-slate-800"
  >
    <!-- 데이터 로딩 오버레이 -->
    <div v-if="quizStore.isLoading && quizStore.sharedCollections.length === 0 && quizStore.myCollections.length === 0"
      class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div class="bg-white border-2 border-slate-800 p-4 rounded-xl shadow-[4px_4px_0px_0px_#1e293b] font-bold text-xs">
        {{ t('quiz-studio.dataLoading') }}
      </div>
    </div>

    <!-- 1. 메뉴 뷰 -->
    <QuizMenu 
      v-if="subView === 'menu'" 
      :scrollContainer="scrollContainer"
      @navigate="handleNavigate"
    />

    <!-- 2. 공유 게시판 뷰 -->
    <QuizShared 
      v-else-if="subView === 'shared'" 
      :scrollContainer="scrollContainer"
      @navigate="handleNavigate"
    />

    <!-- 3. 폼(생성/수정) 뷰 -->
    <QuizForm 
      v-else-if="subView === 'generator'" 
      @navigate="handleNavigate"
    />

    <!-- 4. Practice 뷰 (학습 진행) -->
    <div v-else-if="subView === 'practice'" class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <h3 class="text-xl font-bold text-slate-900">{{ quizStore.activeCollection?.title }}</h3>
        <button @click="handleNavigate('menu')"
          class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">
          {{ t('quiz-studio.backToList') }}
        </button>
      </div>

      <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b]">
        <div class="mb-4 flex items-center justify-between bg-amber-50 p-3 border-2 border-slate-800 rounded-xl">
          <label class="text-xs font-bold text-slate-800">{{ t('quiz-studio.selectTtsLang') }}</label>
          <select v-model="selectedTtsLang"
            class="bg-white border-2 border-slate-800 rounded-lg text-xs font-bold px-2 py-1 outline-none">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.nativeName }} ({{ lang.name }})
            </option>
          </select>
        </div>

        <div v-if="quizStore.activeCollection?.sentences?.length">
          <div class="mb-6 bg-slate-50 p-3 border-2 border-slate-800 rounded-xl">
            <select :value="quizStore.selectedSentenceIndex"
              @change="(e: any) => handleSentenceChange(Number(e.target.value))"
              class="w-full bg-white border border-slate-800 rounded-lg p-1.5 text-xs font-bold">
              <option v-for="(s, idx) in quizStore.activeCollection.sentences" :key="s.id" :value="idx">
                {{ idx + 1 }}. {{ s.translatedText }}
              </option>
            </select>
          </div>

          <div @click="speak(quizStore.currentSentence.voiceText)"
            class="bg-amber-100 border-2 border-slate-800 rounded-xl p-4 cursor-pointer flex items-center justify-between mb-6 shadow-[2px_2px_0px_0px_#1e293b]">
            <div class="flex items-end space-x-1.5 h-10">
              <div v-for="(h, idx) in barHeights" :key="idx"
                class="w-2.5 bg-slate-800 rounded-t-sm transition-all duration-75" :style="{ height: `${h}px` }"></div>
            </div>
            <span class="text-xs font-bold text-slate-900">
              {{ isPlaying ? t('quiz-studio.ttsPlaying') : t('quiz-studio.ttsListen') }}
            </span>
          </div>

          <input type="text" v-model="userAnswer" @keydown.enter="checkAnswer(quizStore.currentSentence.voiceText)"
            :placeholder="t('quiz-studio.typeHere')"
            class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-sm font-mono mb-3 outline-none" />

          <div class="flex space-x-2">
            <button @click="checkAnswer(quizStore.currentSentence.voiceText)"
              class="flex-1 bg-slate-900 text-white font-bold text-xs py-3 rounded-xl border-2 border-slate-800">
              {{ t('quiz-studio.check') }}
            </button>
            <button @click="showAnswer(quizStore.currentSentence.voiceText)"
              class="bg-white text-slate-800 font-bold text-xs px-5 py-3 rounded-xl border-2 border-slate-800">
              {{ t('quiz-studio.showAnswer') }}
            </button>
          </div>

          <div v-if="resultState.status !== 'none'"
            class="mt-4 p-3 rounded-xl text-xs font-bold border-2 border-slate-800"
            :class="resultState.status === 'correct' ? 'bg-green-100 text-green-900' : 'bg-rose-100 text-rose-900'">
            <p>{{ resultState.message }}</p>
            <div v-if="resultState.diffs" class="text-[11px] font-mono mt-1 text-rose-700">
              {{ t('quiz-studio.hint') }} {{ resultState.diffs }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>