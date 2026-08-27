<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'
import { useQuizStore } from '@/quiz/stores/QuizStore'
import type { Collection } from '@/quiz/api/quiz.api'
import { useTTS } from '@/quiz/composables/useTTS'
import { usePractice } from '@/quiz/composables/usePractice'
import { useInfiniteScroll } from '@/shared/ui/composables/useInfiniteScroll'

const uiStore = useUIStore()
const quizStore = useQuizStore()
const { languages, selectedTtsLang, isPlaying, barHeights, speak } = useTTS()
const { userAnswer, resultState, resetPracticeState, checkAnswer, showAnswer } = usePractice()

const subView = ref<'menu' | 'practice' | 'shared' | 'generator'>('menu')

// --- 무한 스크롤 참조(Ref) ---
const scrollContainer = ref<HTMLElement | null>(null)
const mySentinel = ref<HTMLElement | null>(null)
const sharedSentinel = ref<HTMLElement | null>(null)

// 1. 내 컬렉션 무한 스크롤 옵저버
const myScroll = useInfiniteScroll({
  container: scrollContainer,
  sentinel: mySentinel,
  hasMore: () => quizStore.myHasMore,
  isLoading: () => quizStore.isLoading,
  loadMore: () => quizStore.fetchMyCollections(true),
  rootMargin: '200px',
  debugLabel: 'MY_COLLECTIONS'
})

// 2. 공유 게시판 무한 스크롤 옵저버
const sharedScroll = useInfiniteScroll({
  container: scrollContainer,
  sentinel: sharedSentinel,
  hasMore: () => quizStore.sharedHasMore,
  isLoading: () => quizStore.isLoading,
  loadMore: () => quizStore.fetchSharedCollections(true),
  rootMargin: '200px',
  debugLabel: 'SHARED_COLLECTIONS'
})

// 💡 탭, 뷰, 로딩 상태 변경에 따른 Observer 단일 감시 로직
watch(
  [() => uiStore.currentTab, subView, () => quizStore.isLoading],
  async ([tab, view, loading]) => {
    if (tab !== 'quiz') {
      myScroll.teardown()
      sharedScroll.teardown()
      return
    }

    await nextTick()

    if (view === 'menu') {
      sharedScroll.teardown()
      if (!loading) myScroll.setup()
    } else if (view === 'shared') {
      myScroll.teardown()
      if (!loading) sharedScroll.setup()
    } else {
      myScroll.teardown()
      sharedScroll.teardown()
    }
  },
  { immediate: true }
)

onMounted(() => {
  quizStore.loadCollections()
})

const getAuthorName = (author: any) => {
  if (!author) return '익명'
  return typeof author === 'object' ? author.name : author
}

const handleSortChange = async (e: Event) => {
  const target = e.target as HTMLSelectElement
  await quizStore.changeSharedSort(target.value as 'recent' | 'popular')
}

const startPractice = (collectionId: number) => {
  quizStore.changeCollection(collectionId)
  resetPracticeState()
  subView.value = 'practice'
}

const handleSentenceChange = (idx: number) => {
  quizStore.selectSentence(idx)
  resetPracticeState()
}

const newColTitle = ref('')
const newColDesc = ref('')
const isNewColShared = ref(true)
const createMode = ref<'ai' | 'manual'>('manual')
const tempTranslatedText = ref('')
const tempVoiceText = ref('')
const newSentences = ref<Array<{ translatedText: string; voiceText: string }>>([])

const resetForm = () => {
  quizStore.editingCollectionId = null
  newColTitle.value = ''
  newColDesc.value = ''
  isNewColShared.value = true
  newSentences.value = []
  tempTranslatedText.value = ''
  tempVoiceText.value = ''
}

const openCreateMode = () => {
  resetForm()
  subView.value = 'generator'
}

const openEditCollection = (col: Collection) => {
  const authorName = getAuthorName(col.author)
  if (authorName.includes('(가져옴)')) return alert('가져온 컬렉션은 수정할 수 없습니다.')

  quizStore.editingCollectionId = col.id
  newColTitle.value = col.title
  newColDesc.value = col.description || ''
  isNewColShared.value = col.isShared
  newSentences.value = col.sentences.map(s => ({ translatedText: s.translatedText, voiceText: s.voiceText }))
  subView.value = 'generator'
}

const addSentenceToForm = () => {
  if (!tempTranslatedText.value.trim()) return alert('한글 문장을 입력해주세요.')
  if (createMode.value === 'ai') {
    tempVoiceText.value = `I practiced ${tempTranslatedText.value.replace(/[\.\?]/g, '')}.`
  }
  if (!tempVoiceText.value.trim()) return alert('영어 번역 문장을 입력해 주세요.')

  newSentences.value.push({ translatedText: tempTranslatedText.value, voiceText: tempVoiceText.value })
  tempTranslatedText.value = ''
  tempVoiceText.value = ''
}

const handleSave = async () => {
  if (!newColTitle.value.trim()) return alert('컬렉션 제목을 입력해주세요.')
  if (newSentences.value.length === 0) return alert('최소 1개 이상의 문장을 추가해주세요.')

  await quizStore.saveCollection(newColTitle.value, newColDesc.value, isNewColShared.value, newSentences.value)
  resetForm()
  subView.value = 'menu'
}

const handleRefreshShared = async () => {
  if (quizStore.isLoading) return
  await quizStore.refreshSharedCollections()
}
</script>

<template>
  <div ref="scrollContainer" v-if="uiStore.currentTab === 'quiz'"
    class="flex-1 h-screen overflow-y-auto p-6 md:p-10 bg-[#f7f5ed] text-slate-800">

    <!-- 로딩 오버레이 -->
    <div v-if="quizStore.isLoading && quizStore.sharedCollections.length === 0 && quizStore.myCollections.length === 0"
      class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div class="bg-white border-2 border-slate-800 p-4 rounded-xl shadow-[4px_4px_0px_0px_#1e293b] font-bold text-xs">
        Data Loading...
      </div>
    </div>

    <!-- 1. 메인 메뉴 -->
    <div v-if="subView === 'menu'" class="max-w-4xl mx-auto py-4">
      <div class="text-center mb-8">
        <span
          class="inline-block px-3 py-1 bg-[#feefc3] text-[#8c6b00] border-2 border-slate-800 rounded-full text-xs font-bold mb-2 shadow-[2px_2px_0px_0px_#1e293b]">
          COLLECTION-BASED LEARNING
        </span>
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">영어 컬렉션 학습 스튜디오</h2>
      </div>

      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-slate-900">📚 내 학습 컬렉션 ({{ quizStore.myCollections.length }})</h3>
        <div class="flex space-x-2">
          <button @click="subView = 'shared'"
            class="bg-white hover:bg-slate-50 border-2 border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b]">
            🌐 공유 게시판
          </button>
          <button @click="openCreateMode"
            class="bg-amber-400 hover:bg-amber-300 border-2 border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b]">
            + 새 컬렉션
          </button>
        </div>
      </div>

      <div v-if="quizStore.myCollections.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div v-for="col in quizStore.myCollections" :key="col.id"
          class="bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="px-2.5 py-0.5 bg-slate-100 border border-slate-800 rounded-md text-[10px] font-bold">
                문장 {{ col.sentences?.length || 0 }}개
              </span>
              <div class="flex space-x-1">
                <template v-if="!getAuthorName(col.author).includes('(가져옴)')">
                  <button @click="quizStore.toggleShare(col)" class="text-[10px] font-bold px-2 py-0.5 border rounded"
                    :class="col.isShared ? 'bg-blue-100 text-blue-800 border-blue-800' : 'bg-slate-100 text-slate-600'">
                    {{ col.isShared ? '🌐 공유 중' : '🔒 비공개' }}
                  </button>

                  <button @click="openEditCollection(col)"
                    class="bg-amber-100 text-amber-900 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    ✏️ 수정
                  </button>
                </template>

                <button @click="quizStore.deleteCollection(col)"
                  class="bg-rose-100 text-rose-800 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  🗑️ 삭제
                </button>
              </div>
            </div>
            <h4 class="text-base font-extrabold text-slate-900 mb-1">{{ col.title }}</h4>
            <p class="text-slate-600 text-xs mb-4 leading-relaxed">{{ col.description }}</p>
          </div>

          <div class="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
            <span class="text-[11px] text-slate-400 font-medium">작성자: {{ getAuthorName(col.author) }}</span>
            <button @click="startPractice(col.id)" :disabled="!col.sentences || col.sentences.length === 0"
              class="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
              🎧 학습 시작
            </button>
          </div>
        </div>
      </div>

      <!-- 내 학습 컬렉션 센티널 -->
      <div ref="mySentinel" class="h-16 mt-6 flex justify-center items-center text-xs font-bold text-slate-500">
        <span v-if="quizStore.isLoading && quizStore.myCollections.length > 0">목록을 불러오는 중...</span>
        <span v-else-if="!quizStore.myHasMore && quizStore.myCollections.length > 0">마지막 컬렉션입니다.</span>
      </div>
    </div>

    <!-- 2. Listen & Type 연습 -->
    <div v-else-if="subView === 'practice'" class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <h3 class="text-xl font-bold text-slate-900">{{ quizStore.activeCollection?.title }}</h3>
        <button @click="subView = 'menu'"
          class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">← 목록으로</button>
      </div>

      <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b]">
        <div class="mb-4 flex items-center justify-between bg-amber-50 p-3 border-2 border-slate-800 rounded-xl">
          <label class="text-xs font-bold text-slate-800">🌐 재생 언어 선택:</label>
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
            <span class="text-xs font-bold text-slate-900">🔊 {{ isPlaying ? '재생 중...' : '문장 듣기' }}</span>
          </div>

          <input type="text" v-model="userAnswer" @keydown.enter="checkAnswer(quizStore.currentSentence.voiceText)"
            placeholder="Type here..."
            class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-sm font-mono mb-3 outline-none" />

          <div class="flex space-x-2">
            <button @click="checkAnswer(quizStore.currentSentence.voiceText)"
              class="flex-1 bg-slate-900 text-white font-bold text-xs py-3 rounded-xl border-2 border-slate-800">Check</button>
            <button @click="showAnswer(quizStore.currentSentence.voiceText)"
              class="bg-white text-slate-800 font-bold text-xs px-5 py-3 rounded-xl border-2 border-slate-800">Show
              Answer</button>
          </div>

          <div v-if="resultState.status !== 'none'"
            class="mt-4 p-3 rounded-xl text-xs font-bold border-2 border-slate-800"
            :class="resultState.status === 'correct' ? 'bg-green-100 text-green-900' : 'bg-rose-100 text-rose-900'">
            <p>{{ resultState.message }}</p>
            <div v-if="resultState.diffs" class="text-[11px] font-mono mt-1 text-rose-700">힌트: {{ resultState.diffs }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 공유 게시판 -->
    <div v-else-if="subView === 'shared'" class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <h3 class="text-xl font-bold text-slate-900">🌐 공유 게시판</h3>

        <div class="flex items-center space-x-2">
          <button @click="handleRefreshShared" :disabled="quizStore.isLoading"
            class="bg-white hover:bg-slate-50 border-2 border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b] flex items-center space-x-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all">
            <span :class="{ 'animate-spin': quizStore.isLoading }">🔄</span>
            <span>새로고침</span>
          </button>

          <select :value="quizStore.sharedSortType" @change="handleSortChange"
            class="bg-white border-2 border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none shadow-[2px_2px_0px_0px_#1e293b]">
            <option value="recent">최신순</option>
            <option value="popular">학습자 많은 순</option>
          </select>
          <button @click="subView = 'menu'"
            class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">← 메인으로</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div v-for="col in quizStore.sharedCollections" :key="col.id"
          class="bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-extrabold text-base text-slate-900 mb-1">{{ col.title }}</h4>
              <span class="px-2 py-0.5 bg-slate-100 border border-slate-800 rounded-md text-[10px] font-bold">
                문장 {{ col.sentences?.length || 0 }}개
              </span>
            </div>
            <p class="text-xs text-slate-600 mb-4 line-clamp-2">{{ col.description }}</p>
          </div>

          <div>
            <div
              class="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3 text-[11px] font-medium text-slate-600">
              <span>✍️ 작성: <strong class="text-slate-800 font-bold">{{ getAuthorName(col.author) }}</strong></span>
              <span>🔥 <strong class="text-rose-600 font-bold">{{ col.learnerCount || 0 }}</strong>명 학습 중</span>
            </div>
            <button @click="quizStore.importCollection(col)"
              class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-2.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
              📥 내 학습장에 가져오기
            </button>
          </div>
        </div>
      </div>

      <!-- 공유 게시판 센티널 -->
      <div ref="sharedSentinel" class="h-16 mt-6 flex justify-center items-center text-xs font-bold text-slate-500">
        <span v-if="quizStore.isLoading && quizStore.sharedCollections.length > 0">목록을 불러오는 중...</span>
        <span v-else-if="!quizStore.sharedHasMore && quizStore.sharedCollections.length > 0">마지막 컬렉션입니다.</span>
      </div>
    </div>

    <!-- 4. 컬렉션 에디터 -->
    <div v-else-if="subView === 'generator'" class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <h3 class="text-xl font-bold text-slate-900">
          {{ quizStore.editingCollectionId !== null ? '✏️ 컬렉션 수정' : '✍️ 새 컬렉션' }}
        </h3>
        <button @click="resetForm(); subView = 'menu'"
          class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">← 메인으로</button>
      </div>

      <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b] space-y-4">
        <input type="text" v-model="newColTitle" placeholder="컬렉션 제목"
          class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-bold outline-none" />
        <input type="text" v-model="newColDesc" placeholder="컬렉션 설명"
          class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none" />

        <div class="flex items-center space-x-2">
          <input type="checkbox" v-model="isNewColShared" id="isShared"
            class="w-4 h-4 accent-amber-400 border-2 border-slate-800 rounded" />
          <label for="isShared" class="text-xs font-bold cursor-pointer">공유 게시판에 공개하기</label>
        </div>

        <div v-if="newSentences.length > 0" class="space-y-2 my-3 max-h-60 overflow-y-auto pr-1">
          <p class="text-xs font-bold text-slate-700">등록된 문장 목록 ({{ newSentences.length }}개)</p>
          <div v-for="(item, idx) in newSentences" :key="idx"
            class="flex items-center justify-between bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-xs">
            <div class="flex-1 mr-2 overflow-hidden">
              <span class="font-bold text-slate-900 block truncate">{{ idx + 1 }}. {{ item.translatedText }}</span>
              <p class="text-slate-500 font-mono text-[11px] truncate">{{ item.voiceText }}</p>
            </div>
            <button @click="newSentences.splice(idx, 1)"
              class="text-rose-600 font-bold text-[10px] bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg hover:bg-rose-100 flex-shrink-0">
              삭제
            </button>
          </div>
        </div>

        <div class="border-t-2 border-slate-100 pt-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input type="text" v-model="tempTranslatedText" placeholder="한글 표현"
              class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none" />
            <input type="text" v-model="tempVoiceText" placeholder="영어 번역"
              class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-mono outline-none" />
          </div>
          <button @click="addSentenceToForm"
            class="w-full bg-slate-100 border-2 border-slate-800 rounded-xl py-2 text-xs font-bold">+ 문장 추가</button>
        </div>

        <button @click="handleSave"
          class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
          💾 저장하기
        </button>
      </div>
    </div>

  </div>
</template>