import { ref } from 'vue'

export interface ResultState {
  status: 'none' | 'correct' | 'incorrect' | 'empty' | 'show'
  message: string
  diffs?: string
}

const normalizeStr = (s: string) => {
  return s.replace(/[“”«»„‟]/g, '"').replace(/[‘’´`]/g, "'").replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

const correctSound = new Audio("https://t1.daumcdn.net/cfile/tistory/99C850485CDEB1111A")

export function usePractice() {
  const userAnswer = ref('')
  const resultState = ref<ResultState>({ status: 'none', message: '' })

  const resetPracticeState = () => {
    userAnswer.value = ''
    resultState.value = { status: 'none', message: '' }
  }

  const checkAnswer = (targetText: string) => {
    const user = userAnswer.value
    const nUser = normalizeStr(user)
    const nTarget = normalizeStr(targetText)

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

  const showAnswer = (targetText: string) => {
    userAnswer.value = targetText
    resultState.value = { status: 'show', message: '정답이 입력창에 표시되었습니다.' }
  }

  return {
    userAnswer,
    resultState,
    resetPracticeState,
    checkAnswer,
    showAnswer
  }
}