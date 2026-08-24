<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUIStore } from '@/shared/ui/UiStore'

const uiStore = useUIStore()

// 서브 뷰 상태: 'menu' | 'practice' | 'shared' | 'generator'
const subView = ref('menu')

// --- 타입 정의 ---
interface Sentence {
  id: number
  kr: string
  en: string
}

interface Collection {
  id: number
  title: string
  description: string
  author: string
  isShared: boolean
  isMine: boolean
  sentences: Sentence[]
}

// --- 컬렉션 데이터베이스 (샘플 데이터) ---
const collections = ref<Collection[]>([
  {
    id: 1,
    title: '큰맘 먹고 ~했다 표현 모음',
    description: '용기를 내서 무언가를 시도했을 때 쓰는 실전 표현들',
    author: '영어마스터',
    isShared: true,
    isMine: true,
    sentences: [
      { id: 101, kr: "큰맘 먹고 두바이 쫀득 쿠키를 샀어요.", en: "I mustered up the courage and bought Dubai chewy cookies." },
      { id: 102, kr: "큰맘 먹고 비싼 헤드폰을 질렀어요.", en: "I finally decided to splurge on an expensive pair of headphones." },
      { id: 103, kr: "큰맘 먹고 오랜만에 친구에게 연락했어요.", en: "I took the plunge and reached out to my friend after a long time." },
      { id: 104, kr: "큰맘 먹고 혼자 여행을 예약했어요.", en: "I gathered my courage and booked a solo trip." },
      { id: 105, kr: "큰맘 먹고 운동 시작을 선언했어요.", en: "I mustered up the courage to start exercising." },
      { id: 106, kr: "큰맘 먹고 고양이를 입양했어요.", en: "I finally took the plunge and adopted a cat." }
    ]
  },
  {
    id: 2,
    title: '카페 & 식당 주문 필수 패턴',
    description: '해외여행 가서 당황하지 않고 바로 쓰는 회화 문장',
    author: '여행자Alice',
    isShared: true,
    isMine: false,
    sentences: [
      { id: 201, kr: "디카페인 아이스 아메리카노 한 잔 부탁해요.", en: "Can I get a decaf iced Americano, please?" },
      { id: 202, kr: "포장해서 가져갈 수 있나요?", en: "Can I have this to go?" },
      { id: 203, kr: "이 메뉴 추천해주시겠어요?", en: "Could you recommend something popular?" }
    ]
  },
  {
    id: 3,
    title: '비즈니스 이메일 핵심 표현',
    description: '격식 있고 정확한 업무용 영문장 모음',
    author: '나 (User)',
    isShared: false,
    isMine: true,
    sentences: [
      { id: 301, kr: "답장이 늦어서 죄송합니다.", en: "Apologies for the delayed response." },
      { id: 302, kr: "첨부파일 확인 부탁드립니다.", en: "Please find the attached document for your review." }
    ]
  }
])

// --- [ Listen & Type 학습 상태 ] ---
const selectedCollectionId = ref<number>(1)
const selectedSentenceIndex = ref<number>(0)
const userAnswer = ref('')
const resultState = ref<{ status: 'none' | 'correct' | 'incorrect' | 'empty' | 'show'; message: string; diffs?: string }>({ status: 'none', message: '' })

// 현재 선택된 컬렉션 및 문장 계산
const activeCollection = computed(() => {
  return collections.value.find(c => c.id === selectedCollectionId.value) || collections.value[0] || { id: 0, title: '', description: '', author: '', isShared: false, isMine: false, sentences: [] }
})

const currentSentence = computed(() => {
  if (!activeCollection.value || !activeCollection.value.sentences.length) {
    return { id: 0, kr: '등록된 문장이 없습니다.', en: '' }
  }
  return activeCollection.value.sentences[selectedSentenceIndex.value] || activeCollection.value.sentences[0]
})

// TTS 음성 재생 및 사운드바 이퀄라이저
const isPlaying = ref(false)
const barHeights = ref([20, 28, 14, 34, 18])
let animInterval: number | null = null

const animateBars = (active: boolean) => {
  if (animInterval) { clearInterval(animInterval); animInterval = null; }
  if (active) {
    animInterval = window.setInterval(() => {
      barHeights.value = barHeights.value.map(() => 12 + Math.random() * 28)
    }, 80)
  } else {
    barHeights.value = [20, 28, 14, 34, 18]
  }
}

const speakTarget = () => {
  if (!('speechSynthesis' in window)) {
    alert('이 브라우저는 음성 합성을 지원하지 않습니다.')
    return
  }
  const text = currentSentence.value.en
  if (!text) return

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  utter.rate = 0.95

  window.speechSynthesis.cancel()
  isPlaying.value = true
  animateBars(true)

  utter.onend = () => { isPlaying.value = false; animateBars(false) }
  utter.onerror = () => { isPlaying.value = false; animateBars(false) }

  window.speechSynthesis.speak(utter)
}

// 문장 검사 로직
const normalizeStr = (s: string) => {
  return s.replace(/[“”«»„‟]/g, '"').replace(/[‘’´`]/g, "'").replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

const correctSound = new Audio("https://t1.daumcdn.net/cfile/tistory/99C850485CDEB1111A")

const checkAnswer = () => {
  const user = userAnswer.value
  const target = currentSentence.value.en
  const nUser = normalizeStr(user)
  const nTarget = normalizeStr(target)

  if (!user.trim()) {
    resultState.value = { status: 'empty', message: '문장을 입력한 후 확인을 눌러주세요.' }
    return
  }

  if (nUser === nTarget) {
    resultState.value = { status: 'correct', message: '정답입니다! 🎉' }
    correctSound.currentTime = 0
    correctSound.play().catch(() => {})
  } else {
    const ua = nUser.split(' ')
    const ta = nTarget.split(' ')
    const diffs: string[] = []
    const len = Math.max(ua.length, ta.length)
    for (let i = 0; i < len; i++) {
      if (ua[i] !== ta[i]) diffs.push(ta[i] || '(missing)')
    }
    resultState.value = {
      status: 'incorrect',
      message: '아쉽네요! 다시 시도하거나 정답 보기를 누르세요.',
      diffs: diffs.length ? diffs.slice(0, 5).join(' ') : undefined
    }
  }
}

const showAnswer = () => {
  userAnswer.value = currentSentence.value.en
  resultState.value = { status: 'show', message: '정답이 입력창에 표시되었습니다.' }
}

const changeCollection = (id: number) => {
  selectedCollectionId.value = id
  selectedSentenceIndex.value = 0
  userAnswer.value = ''
  resultState.value = { status: 'none', message: '' }
}

const selectSentence = (index: number) => {
  selectedSentenceIndex.value = index
  userAnswer.value = ''
  resultState.value = { status: 'none', message: '' }
}

const prevSentence = () => {
  if (selectedSentenceIndex.value > 0) {
    selectSentence(selectedSentenceIndex.value - 1)
  }
}

const nextSentence = () => {
  if (selectedSentenceIndex.value < activeCollection.value.sentences.length - 1) {
    selectSentence(selectedSentenceIndex.value + 1)
  }
}

const startPractice = (collectionId: number) => {
  changeCollection(collectionId)
  subView.value = 'practice'
}

// --- [ 컬렉션 & 문장 삭제 로직 ] ---
const deleteCollection = (col: Collection) => {
  if (!confirm(`'${col.title}' 컬렉션을 정말 삭제하시겠습니까?\n포함된 모든 문장이 함께 삭제됩니다.`)) {
    return
  }

  collections.value = collections.value.filter(c => c.id !== col.id)

  if (selectedCollectionId.value === col.id) {
    const remain = collections.value.filter(c => c.isMine)
    if (remain.length > 0) {
      selectedCollectionId.value = remain[0].id
    }
  }

  alert('컬렉션이 성공적으로 삭제되었습니다.')
}

const deleteSentenceInPractice = (sentenceId: number) => {
  if (!confirm('이 문장을 컬렉션에서 삭제하시겠습니까?')) return

  const targetCol = activeCollection.value
  targetCol.sentences = targetCol.sentences.filter(s => s.id !== sentenceId)

  if (selectedSentenceIndex.value >= targetCol.sentences.length) {
    selectedSentenceIndex.value = Math.max(0, targetCol.sentences.length - 1)
  }

  userAnswer.value = ''
  resultState.value = { status: 'none', message: '' }
  alert('문장이 삭제되었습니다.')
}

// --- [ 공유 및 가져오기 로직 (버그 수정됨) ] ---
const importCollection = (col: Collection) => {
  const exists = collections.value.find(c => c.title === col.title && c.isMine)
  if (exists) {
    alert('이미 내 학습장에 저장된 컬렉션입니다.')
    return
  }

  const imported: Collection = {
    ...JSON.parse(JSON.stringify(col)),
    id: Date.now(),
    isMine: true,
    isShared: false, // 👈 가져올 때는 공유 상태를 false로 설정하여 공유 게시판에 중복 생성되는 버그 수정
    author: `${col.author} (가져옴)`
  }
  collections.value.unshift(imported)
  alert(`'${col.title}' 컬렉션을 내 학습장에 성공적으로 가져왔습니다!`)
}

const toggleShare = (col: Collection) => {
  col.isShared = !col.isShared
  alert(col.isShared ? '컬렉션이 공유 게시판에 등록되었습니다!' : '컬렉션 공유가 취소되었습니다.')
}

// --- [ 컬렉션 생성기 로직 ] ---
const newColTitle = ref('')
const newColDesc = ref('')
const isNewColShared = ref(true)
const createMode = ref<'ai' | 'manual'>('manual')
const tempKr = ref('')
const tempEn = ref('')
const newSentences = ref<Array<{ kr: string; en: string }>>([])

const addSentenceToNewCol = () => {
  if (!tempKr.value.trim()) return alert('한글 문장을 입력해주세요.')

  if (createMode.value === 'ai') {
    tempEn.value = `I practiced ${tempKr.value.replace(/[\.\?]/g, '')}.`
  }

  if (!tempEn.value.trim()) return alert('영어 번역 문장을 입력해 주세요.')

  newSentences.value.push({
    kr: tempKr.value,
    en: tempEn.value
  })

  tempKr.value = ''
  tempEn.value = ''
}

const removeSentenceFromNewCol = (idx: number) => {
  newSentences.value.splice(idx, 1)
}

const saveCollection = () => {
  if (!newColTitle.value.trim()) return alert('컬렉션 제목을 입력해주세요.')
  if (newSentences.value.length === 0) return alert('컬렉션에 최소 1개 이상의 문장을 추가해주세요.')

  const newCol: Collection = {
    id: Date.now(),
    title: newColTitle.value,
    description: newColDesc.value || '내가 만든 영어 문장 학습 컬렉션',
    author: '나 (User)',
    isShared: isNewColShared.value,
    isMine: true,
    sentences: newSentences.value.map((s, idx) => ({ id: Date.now() + idx, kr: s.kr, en: s.en }))
  }

  collections.value.unshift(newCol)
  alert('새로운 문장 컬렉션이 등록되었습니다!')

  newColTitle.value = ''
  newColDesc.value = ''
  newSentences.value = []
  subView.value = 'menu'
}
</script>

<template>
  <div v-if="uiStore.currentTab === 'quiz'" class="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f7f5ed] text-slate-800">
    
    <!-- 1. 메인 메뉴 대시보드 -->
    <div v-if="subView === 'menu'" class="max-w-4xl mx-auto py-4">
      <div class="text-center mb-8">
        <span class="inline-block px-3 py-1 bg-[#feefc3] text-[#8c6b00] border-2 border-slate-800 rounded-full text-xs font-bold mb-2 shadow-[2px_2px_0px_0px_#1e293b]">
          COLLECTION-BASED LEARNING
        </span>
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">영어 컬렉션 학습 스튜디오</h2>
        <p class="text-slate-600 text-xs mt-1">컬렉션별로 문장을 묶어 학습하고, 관리/공유해보세요.</p>
      </div>

      <!-- 상단 액션 바 -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-slate-900">📚 내 학습 컬렉션 ({{ collections.filter(c => c.isMine).length }})</h3>
        <div class="flex space-x-2">
          <button 
            @click="subView = 'shared'"
            class="bg-white hover:bg-slate-50 text-slate-900 px-3.5 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_0px_#1e293b] transition-all"
          >
            🌐 공유 게시판 둘러보기
          </button>
          <button 
            @click="subView = 'generator'"
            class="bg-amber-400 hover:bg-amber-300 text-slate-900 px-3.5 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_0px_#1e293b] transition-all"
          >
            + 새 컬렉션 만들기
          </button>
        </div>
      </div>

      <!-- 내 컬렉션 카드 그리드 -->
      <div v-if="collections.filter(c => c.isMine).length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div 
          v-for="col in collections.filter(c => c.isMine)" 
          :key="col.id"
          class="bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-800 rounded-md text-[10px] font-bold">
                문장 {{ col.sentences.length }}개
              </span>
              <div class="flex space-x-1">
                <button 
                  @click="toggleShare(col)"
                  :class="col.isShared ? 'bg-blue-100 text-blue-800 border-blue-800' : 'bg-slate-100 text-slate-600 border-slate-400'"
                  class="text-[10px] font-bold px-2 py-0.5 border rounded"
                >
                  {{ col.isShared ? '🌐 공유 중' : '🔒 비공개' }}
                </button>
                <button 
                  @click="deleteCollection(col)"
                  class="bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded transition-all"
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
            <h4 class="text-base font-extrabold text-slate-900 mb-1">{{ col.title }}</h4>
            <p class="text-slate-600 text-xs mb-4 leading-relaxed">{{ col.description }}</p>
          </div>

          <div class="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
            <span class="text-[11px] text-slate-400 font-medium">작성자: {{ col.author }}</span>
            <button 
              @click="startPractice(col.id)"
              :disabled="col.sentences.length === 0"
              class="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
            >
              🎧 학습 시작
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b]">
        <p class="text-sm font-bold text-slate-600 mb-3">저장된 내 컬렉션이 없습니다.</p>
        <button 
          @click="subView = 'generator'"
          class="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_0px_#1e293b]"
        >
          첫 컬렉션 만들기
        </button>
      </div>
    </div>


    <!-- 2. Listen & Type 컬렉션 연습 화면 -->
    <div v-else-if="subView === 'practice'" class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 border border-amber-800 rounded">
            {{ activeCollection.title }}
          </span>
          <h3 class="text-xl font-bold text-slate-900 mt-1">Listen & Type Practice</h3>
        </div>
        <button 
          @click="subView = 'menu'" 
          class="bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-1.5 text-xs font-bold border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_0px_#1e293b] transition-all"
        >
          ← 목록으로
        </button>
      </div>

      <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#1e293b]">
        <div v-if="activeCollection.sentences.length > 0" class="flex items-center justify-between gap-2 mb-6 bg-slate-50 p-3 border-2 border-slate-800 rounded-xl">
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <label class="block text-[10px] font-bold text-slate-500">
                문장 위치 ({{ selectedSentenceIndex + 1 }} / {{ activeCollection.sentences.length }})
              </label>
              <button 
                @click="deleteSentenceInPractice(currentSentence.id)" 
                class="text-[10px] font-bold text-rose-600 hover:underline"
              >
                이 문장 삭제 🗑️
              </button>
            </div>
            <select 
              :value="selectedSentenceIndex"
              @change="(e: any) => selectSentence(Number(e.target.value))"
              class="w-full bg-white border border-slate-800 rounded-lg p-1.5 text-xs font-bold outline-none"
            >
              <option v-for="(s, idx) in activeCollection.sentences" :key="s.id" :value="idx">
                {{ idx + 1 }}. {{ s.kr }}
              </option>
            </select>
          </div>
          <div class="flex space-x-1 pt-4">
            <button 
              @click="prevSentence" 
              :disabled="selectedSentenceIndex === 0"
              class="px-2.5 py-1.5 bg-white disabled:opacity-40 border border-slate-800 rounded-lg text-xs font-bold"
            >
              ◀ 이전
            </button>
            <button 
              @click="nextSentence" 
              :disabled="selectedSentenceIndex === activeCollection.sentences.length - 1"
              class="px-2.5 py-1.5 bg-white disabled:opacity-40 border border-slate-800 rounded-lg text-xs font-bold"
            >
              다음 ▶
            </button>
          </div>
        </div>

        <div v-if="activeCollection.sentences.length > 0">
          <p class="text-sm font-medium text-slate-700 mb-4">
            문장을 듣고 정확히 입력해 보세요.<br />
            <span class="text-xs text-slate-500">(목표 문장: <strong class="text-slate-900">{{ currentSentence.kr }}</strong>)</span>
          </p>

          <div 
            @click="speakTarget"
            class="bg-amber-100 hover:bg-amber-200/80 border-2 border-slate-800 rounded-xl p-4 cursor-pointer flex items-center justify-between mb-6 shadow-[2px_2px_0px_0px_#1e293b] transition-all"
            title="클릭하여 음성 듣기"
          >
            <div class="flex items-end space-x-1.5 h-10">
              <div 
                v-for="(h, idx) in barHeights" 
                :key="idx" 
                class="w-2.5 bg-slate-800 rounded-t-sm transition-all duration-75"
                :style="{ height: `${h}px` }"
              ></div>
            </div>
            <div class="text-xs font-bold text-slate-900 flex items-center space-x-1">
              <span>🔊 {{ isPlaying ? '재생 중...' : '문장 듣기 (Play)' }}</span>
            </div>
          </div>

          <div class="space-y-3 mb-4">
            <input 
              type="text" 
              v-model="userAnswer"
              @keydown.enter="checkAnswer"
              placeholder="Type the sentence here and press Check (Enter)" 
              class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-sm outline-none focus:bg-white transition-all font-mono"
            />
            <div class="flex space-x-2">
              <button 
                @click="checkAnswer"
                class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
              >
                Check (확인)
              </button>
              <button 
                @click="showAnswer"
                class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
              >
                Show Answer
              </button>
            </div>
          </div>

          <div v-if="resultState.status !== 'none'" class="mt-4 p-3 rounded-xl text-xs font-bold border-2 border-slate-800"
               :class="{
                 'bg-green-100 text-green-900 border-green-800': resultState.status === 'correct',
                 'bg-rose-100 text-rose-900 border-rose-800': resultState.status === 'incorrect',
                 'bg-amber-50 text-amber-900': resultState.status === 'empty' || resultState.status === 'show'
               }">
            <p>{{ resultState.message }}</p>
            <div v-if="resultState.diffs" class="text-[11px] font-mono mt-1 text-rose-700">
              틀린 단어 힌트: {{ resultState.diffs }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-xs font-bold text-slate-500 mb-3">컬렉션에 남아있는 문장이 없습니다.</p>
          <button @click="subView = 'menu'" class="text-xs font-bold underline text-slate-800">목록으로 돌아가기</button>
        </div>

      </div>
    </div>


    <!-- 3. 공유 게시판 (타인 컬렉션 가져오기) -->
    <div v-else-if="subView === 'shared'" class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <div>
          <h3 class="text-xl font-bold text-slate-900">🌐 공유 게시판</h3>
          <p class="text-xs text-slate-500 mt-0.5">공개된 컬렉션을 내 학습장으로 가져와서 연습할 수 있습니다.</p>
        </div>
        <button 
          @click="subView = 'menu'" 
          class="bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-1.5 text-xs font-bold border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_0px_#1e293b] transition-all"
        >
          ← 메인으로
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div 
          v-for="col in collections.filter(c => c.isShared)" 
          :key="col.id"
          class="bg-white border-2 border-slate-800 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                작성자: {{ col.author }}
              </span>
              <span class="text-[11px] font-bold text-slate-500">
                문장 {{ col.sentences.length }}개
              </span>
            </div>
            <h4 class="font-extrabold text-base text-slate-900 mb-1">{{ col.title }}</h4>
            <p class="text-xs text-slate-600 mb-3">{{ col.description }}</p>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 space-y-1">
              <p v-for="s in col.sentences.slice(0, 2)" :key="s.id" class="text-[11px] text-slate-700 truncate">
                • {{ s.kr }}
              </p>
              <p v-if="col.sentences.length > 2" class="text-[10px] text-slate-400 italic">
                ...외 {{ col.sentences.length - 2 }}개 문장 더보기
              </p>
            </div>
          </div>

          <button 
            @click="importCollection(col)"
            class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-2.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
          >
            📥 내 학습장에 가져오기
          </button>
        </div>
      </div>
    </div>


    <!-- 4. 컬렉션 생성기 -->
    <div v-else-if="subView === 'generator'" class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
        <div>
          <h3 class="text-xl font-bold text-slate-900">✍️ 새 컬렉션 만들기</h3>
          <p class="text-xs text-slate-500 mt-0.5">주제별로 문장 그룹을 생성하고 공유해 보세요.</p>
        </div>
        <button 
          @click="subView = 'menu'" 
          class="bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-1.5 text-xs font-bold border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_0px_#1e293b] transition-all"
        >
          ← 메인으로
        </button>
      </div>

      <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b] space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold mb-1 text-slate-800">컬렉션 제목</label>
            <input 
              type="text" 
              v-model="newColTitle"
              placeholder="예: 여행용 필수 표현 모음" 
              class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1 text-slate-800">컬렉션 설명</label>
            <input 
              type="text" 
              v-model="newColDesc"
              placeholder="예: 공항 및 호텔에서 자주 쓰는 실전 문장들" 
              class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            />
          </div>
        </div>

        <div class="border-t-2 border-slate-100 pt-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-xs font-bold text-slate-900">➕ 문장 추가하기</h4>
            <div class="inline-flex p-0.5 bg-slate-200 border border-slate-800 rounded-lg text-[10px] font-bold">
              <button 
                @click="createMode = 'manual'" 
                :class="createMode === 'manual' ? 'bg-slate-900 text-white' : 'text-slate-700'"
                class="px-2 py-1 rounded"
              >
                직접 입력
              </button>
              <button 
                @click="createMode = 'ai'" 
                :class="createMode === 'ai' ? 'bg-slate-900 text-white' : 'text-slate-700'"
                class="px-2 py-1 rounded"
              >
                AI 자동생성
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input 
              type="text" 
              v-model="tempKr" 
              placeholder="한글 표현 (예: 큰맘 먹고 운동을 시작했어요)" 
              class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none"
            />
            <input 
              v-if="createMode === 'manual'"
              type="text" 
              v-model="tempEn" 
              placeholder="영어 번역 (예: I started exercising with high hopes.)" 
              class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none font-mono"
            />
            <div v-else class="flex items-center text-xs text-slate-500 italic px-2">
              (한글 입력 후 [문장 추가] 클릭 시 AI가 자동 생성)
            </div>
          </div>

          <button 
            @click="addSentenceToNewCol"
            class="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-slate-800 rounded-xl py-2 text-xs font-bold transition-all"
          >
            + 목록에 문장 추가
          </button>
        </div>

        <div v-if="newSentences.length > 0" class="border-t-2 border-slate-100 pt-4">
          <h4 class="text-xs font-bold text-slate-900 mb-2">등록 예정 문장 목록 ({{ newSentences.length }}개)</h4>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div 
              v-for="(s, idx) in newSentences" 
              :key="idx" 
              class="flex justify-between items-center bg-slate-50 border border-slate-800 rounded-xl p-2.5 text-xs"
            >
              <div>
                <span class="font-bold text-slate-900 mr-2">{{ idx + 1 }}. {{ s.kr }}</span>
                <span class="font-mono text-slate-600 block text-[11px]">{{ s.en }}</span>
              </div>
              <button 
                @click="removeSentenceFromNewCol(idx)"
                class="text-rose-600 hover:text-rose-800 font-bold px-2 py-1 text-xs"
              >
                삭제
              </button>
            </div>
          </div>
        </div>

        <div class="border-t-2 border-slate-100 pt-4 flex items-center justify-between">
          <label class="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
            <input type="checkbox" v-model="isNewColShared" class="w-4 h-4 accent-slate-900 rounded" />
            <span>생성 후 공유 게시판에 공개하기</span>
          </label>

          <button 
            @click="saveCollection"
            class="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-6 py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-0.5 active:shadow-none transition-all"
          >
            💾 컬렉션 저장하기
          </button>
        </div>
      </div>
    </div>

  </div>
</template>