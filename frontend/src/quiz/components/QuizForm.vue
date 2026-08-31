<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n' // i18n 추가
import { useQuizStore } from '@/quiz/stores/QuizStore'

const { t } = useI18n() // t 함수 가져오기
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
  if (!tempTranslatedText.value.trim()) return alert(t('quiz-form.alertNoOrigin'))
  if (createMode.value === 'ai') {
    tempVoiceText.value = `I practiced ${tempTranslatedText.value.replace(/[\.\?]/g, '')}.`
  }
  if (!tempVoiceText.value.trim()) return alert(t('quiz-form.alertNoTranslation'))

  newSentences.value.push({ translatedText: tempTranslatedText.value, voiceText: tempVoiceText.value })
  tempTranslatedText.value = ''
  tempVoiceText.value = ''
}

const handleSave = async () => {
  if (!newColTitle.value.trim()) return alert(t('quiz-form.alertNoTitle'))
  if (newSentences.value.length === 0) return alert(t('quiz-form.alertNoSentences'))

  await quizStore.saveCollection(newColTitle.value, newColDesc.value, isNewColShared.value, newSentences.value)
  emit('navigate', 'menu')
}
</script>

<template>
  
  <div class="max-w-3xl mx-auto">
    <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-300">
      <h3 class="text-xl font-bold text-slate-900">
        {{ quizStore.editingCollectionId !== null ? t('quiz-form.editTitle') : t('quiz-form.newTitle') }}
      </h3>
      <button @click="emit('navigate', 'menu')" class="bg-white border-2 border-slate-800 rounded-lg px-3.5 py-1.5 text-xs font-bold">
        {{ t('quiz-form.backToMain')  }}
      </button>
    </div>

    <div class="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1e293b] space-y-4">
      <input type="text" v-model="newColTitle" :placeholder="t('quiz-form.titlePlaceholder')" class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-bold outline-none" />
      <input type="text" v-model="newColDesc" :placeholder="t('quiz-form.descPlaceholder')" class="w-full bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none" />

      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="isNewColShared" id="isShared" class="w-4 h-4 accent-amber-400 border-2 border-slate-800 rounded" />
        <label for="isShared" class="text-xs font-bold cursor-pointer">{{ t('quiz-form.publishToShared') }}</label>
      </div>

      <div v-if="newSentences.length > 0" class="space-y-2 my-3 max-h-60 overflow-y-auto pr-1">
        <p class="text-xs font-bold text-slate-700">
          {{ t('quiz-form.sentenceList', { count: newSentences.length }) }}
        </p>
        <div v-for="(item, idx) in newSentences" :key="idx" class="flex items-center justify-between bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-xs">
          <div class="flex-1 mr-2 overflow-hidden">
            <span class="font-bold text-slate-900 block truncate">{{ idx + 1 }}. {{ item.translatedText }}</span>
            <p class="text-slate-500 font-mono text-[11px] truncate">{{ item.voiceText }}</p>
          </div>
          <button @click="newSentences.splice(idx, 1)" class="text-rose-600 font-bold text-[10px] bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg hover:bg-rose-100 flex-shrink-0">
            {{ t('quiz-form.delete') }}
          </button>
        </div>
      </div>

      <div class="border-t-2 border-slate-100 pt-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <input type="text" v-model="tempTranslatedText" :placeholder="t('quiz-form.originPlaceholder')" class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs outline-none" />
          <input type="text" v-model="tempVoiceText" :placeholder="t('quiz-form.translationPlaceholder')" class="bg-slate-50 border-2 border-slate-800 rounded-xl p-2.5 text-xs font-mono outline-none" />
        </div>
        <button @click="addSentence" class="w-full bg-slate-100 border-2 border-slate-800 rounded-xl py-2 text-xs font-bold">
          {{ t('quiz-form.addSentence') }}
        </button>
      </div>

      <button @click="handleSave" class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-3 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b]">
        {{ t('quiz-form.save') }}
      </button>
    </div>
  </div>
</template>