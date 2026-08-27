<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuizStore } from '@/quiz/stores/QuizStore'

const emit = defineEmits<{(e: 'navigate', view: 'menu'): void }>()
const quizStore = useQuizStore()

const newColTitle = ref('')
const newColDesc = ref('')
const isNewColShared = ref(true)
const createMode = ref<'ai' | 'manual'>('manual')
const tempTranslatedText = ref('')
const tempVoiceText = ref('')
const newSentences = ref<Array<{ translatedText: string; voiceText: string }>>([])

onMounted(() => {
  if (quizStore.editingCollectionId !== null) {
    const target = quizStore.myCollections.find(c => c.id === quizStore.editingCollectionId)
    if (target) {
      newColTitle.value = target.title
      newColDesc.value = target.description || ''
      isNewColShared.value = target.isShared
      newSentences.value = target.sentences.map(s => ({ translatedText: s.translatedText, voiceText: s.voiceText }))
    }
  }
})

const addSentence = () => {
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
  emit('navigate', 'menu')
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
      <h3 class="text-xl font-bold text-slate-900">
        {{ quizStore.editingCollectionId !== null ? '✏️ 컬렉션 수정' : '✍️ 새 컬렉션' }}
      </h3>
      <button @click="emit('navigate', 'menu')" class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">← 메인으로</button>
    </div>

    <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b] space-y-4">
      <input type="text" v-model="newColTitle" placeholder="컬렉션 제목" class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-bold outline-none" />
      <input type="text" v-model="newColDesc" placeholder="컬렉션 설명" class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none" />

      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="isNewColShared" id="isShared" class="w-4 h-4 accent-amber-400 border-2 border-slate-800 rounded" />
        <label for="isShared" class="text-xs font-bold cursor-pointer">공유 게시판에 공개하기</label>
      </div>

      <div v-if="newSentences.length > 0" class="space-y-2 my-3 max-h-60 overflow-y-auto pr-1">
        <p class="text-xs font-bold text-slate-700">등록된 문장 목록 ({{ newSentences.length }}개)</p>
        <div v-for="(item, idx) in newSentences" :key="idx" class="flex items-center justify-between bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-xs">
          <div class="flex-1 mr-2 overflow-hidden">
            <span class="font-bold text-slate-900 block truncate">{{ idx + 1 }}. {{ item.translatedText }}</span>
            <p class="text-slate-500 font-mono text-[11px] truncate">{{ item.voiceText }}</p>
          </div>
          <button @click="newSentences.splice(idx, 1)" class="text-rose-600 font-bold text-[10px] bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg hover:bg-rose-100 flex-shrink-0">
            삭제
          </button>
        </div>
      </div>

      <div class="border-t-2 border-slate-100 pt-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <input type="text" v-model="tempTranslatedText" placeholder="한글 표현" class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none" />
          <input type="text" v-model="tempVoiceText" placeholder="영어 번역" class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-mono outline-none" />
        </div>
        <button @click="addSentence" class="w-full bg-slate-100 border-2 border-slate-800 rounded-xl py-2 text-xs font-bold">+ 문장 추가</button>
      </div>

      <button @click="handleSave" class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
        💾 저장하기
      </button>
    </div>
  </div>
</template>