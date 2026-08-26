import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizApi, Collection, Sentence, CreateCollectionDto } from '@/quiz/api/quiz.api'

const IMPORTED_AUTHORS_KEY = 'quiz_imported_authors'

export const useQuizStore = defineStore('quiz', () => {
  // --- 상태 (State) ---
  const myCollections = ref<Collection[]>([])
  const sharedCollections = ref<Collection[]>([])
  const isLoading = ref<boolean>(false)

  const selectedCollectionId = ref<number>(1)
  const selectedSentenceIndex = ref<number>(0)
  const editingCollectionId = ref<number | null>(null)

  // --- 무한 스크롤 및 정렬 상태 ---
  const sharedSortType = ref<'recent' | 'popular'>('recent')
  const sharedCursor = ref<string | number | null>(null)
  const sharedHasMore = ref<boolean>(true)

  const myCursor = ref<string | number | null>(null)
  const myHasMore = ref<boolean>(true)

  // --- LocalStorage 헬퍼 함수 ---
  const getImportedMap = (): Record<number, string> => {
    try {
      return JSON.parse(localStorage.getItem(IMPORTED_AUTHORS_KEY) || '{}')
    } catch {
      return {}
    }
  }

  const saveImportedAuthor = (id: number, authorName: string) => {
    const map = getImportedMap()
    map[id] = authorName.includes('(가져옴)') ? authorName : `${authorName} (가져옴)`
    localStorage.setItem(IMPORTED_AUTHORS_KEY, JSON.stringify(map))
  }

  const removeImportedAuthor = (id: number) => {
    const map = getImportedMap()
    delete map[id]
    localStorage.setItem(IMPORTED_AUTHORS_KEY, JSON.stringify(map))
  }

  // --- 게터 (Getters) ---
  const activeCollection = computed(() => {
    return myCollections.value.find(c => c.id === selectedCollectionId.value) || 
           sharedCollections.value.find(c => c.id === selectedCollectionId.value) || 
           myCollections.value[0] || 
           { id: 0, title: '', description: '', author: '', isShared: false, isMine: false, sentences: [] }
  })

  const currentSentence = computed<Sentence>(() => {
    if (!activeCollection.value || !activeCollection.value.sentences.length) {
      return { id: 0, translatedText: '등록된 문장이 없습니다.', voiceText: '' }
    }
    return activeCollection.value.sentences[selectedSentenceIndex.value] || activeCollection.value.sentences[0]
  })

  // --- 액션 (Actions) ---

  // 💡 1. 내 컬렉션 커서 페이징 조회
  const fetchMyCollections = async (isLoadMore = false) => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLoading.value) return 0

    if (!isLoadMore) {
      myCursor.value = null
      myHasMore.value = true
      myCollections.value = []
    }

    if (!myHasMore.value) return 0

    isLoading.value = true
    try {
      const res = await quizApi.getMyCollections({
        cursor: myCursor.value,
        limit: 10,
      })

      const importedMap = getImportedMap()
      const items = Array.isArray(res) ? res : res.items || []
      const nextCursor = Array.isArray(res) ? null : res.nextCursor

      const mappedItems = items.map(col => {
        if (importedMap[col.id]) {
          return { ...col, author: importedMap[col.id] }
        }
        return col
      })

      myCollections.value.push(...mappedItems)
      myCursor.value = nextCursor
      myHasMore.value = !!nextCursor

      return mappedItems.length
    } catch (error) {
      console.error('내 컬렉션 로드 실패:', error)
      return 0
    } finally {
      isLoading.value = false
    }
  }

  // 💡 2. 공유 게시판 데이터 커서 페이징 조회
  const fetchSharedCollections = async (isLoadMore = false) => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLoading.value) return 0

    if (!isLoadMore) {
      sharedCursor.value = null
      sharedHasMore.value = true
      sharedCollections.value = []
    }

    if (!sharedHasMore.value) return 0

    isLoading.value = true
    try {
      const res = await quizApi.getSharedCollections({
        cursor: sharedCursor.value,
        sort: sharedSortType.value,
        limit: 10,
      })

      sharedCollections.value.push(...res.items)
      sharedCursor.value = res.nextCursor
      sharedHasMore.value = !!res.nextCursor

      return res.items.length
    } catch (error) {
      console.error('공유 컬렉션 로드 실패:', error)
      return 0
    } finally {
      isLoading.value = false
    }
  }

  // 3. 공유 게시판 정렬 변경
  const changeSharedSort = async (sortType: 'recent' | 'popular') => {
    sharedSortType.value = sortType
    await fetchSharedCollections(false)
  }

  // 💡 4. 초기 DB 데이터 조회
  const loadCollections = async () => {
    try {
      await fetchMyCollections(false)

      if (myCollections.value.length > 0) {
        selectedCollectionId.value = myCollections.value[0].id
      }

      await fetchSharedCollections(false)
    } catch (error) {
      console.error('컬렉션 로드 실패:', error)
    }
  }

  const changeCollection = (id: number) => {
    selectedCollectionId.value = id
    selectedSentenceIndex.value = 0
  }

  const selectSentence = (index: number) => {
    selectedSentenceIndex.value = index
  }

  const deleteCollection = async (col: Collection) => {
    if (!confirm(`'${col.title}' 컬렉션을 정말 삭제하시겠습니까?`)) return
    isLoading.value = true
    try {
      await quizApi.deleteCollection(col.id)
      
      removeImportedAuthor(col.id)

      myCollections.value = myCollections.value.filter(c => c.id !== col.id)
      if (selectedCollectionId.value === col.id && myCollections.value.length > 0) {
        selectedCollectionId.value = myCollections.value[0].id
      }
      alert('컬렉션이 성공적으로 삭제되었습니다.')
    } finally {
      isLoading.value = false
    }
  }

  const importCollection = async (col: Collection) => {
    const exists = myCollections.value.find(c => c.id === col.id || c.title === col.title)
    if (exists) return alert('이미 내 학습장에 저장된 컬렉션입니다.')

    isLoading.value = true
    try {
      const imported = await quizApi.importCollection(col.id)
      
      const rawAuthor = typeof col.author === 'object' ? (col.author as any)?.name : col.author
      const originalAuthor = rawAuthor || '익명'
      const displayAuthor = originalAuthor.includes('(가져옴)') ? originalAuthor : `${originalAuthor} (가져옴)`
      
      saveImportedAuthor(imported.id, displayAuthor)
      imported.author = displayAuthor

      col.learnerCount = (col.learnerCount || 0) + 1

      myCollections.value.unshift(imported)
      selectedCollectionId.value = imported.id
      selectedSentenceIndex.value = 0

      alert(`'${imported.title}' 컬렉션을 내 학습장에 가져왔습니다!`)
    } catch (error) {
      console.error('컬렉션 가져오기 실패:', error)
    } finally {
      isLoading.value = false
    }
  }

  const toggleShare = async (col: Collection) => {
    const nextState = !col.isShared
    isLoading.value = true
    try {
      await quizApi.toggleShare(col.id, nextState)
      col.isShared = nextState
      alert(col.isShared ? '공유 게시판에 등록되었습니다.' : '공유가 취소되었습니다.')
    } finally {
      isLoading.value = false
    }
  }

  const saveCollection = async (
    title: string, 
    description: string, 
    isShared: boolean, 
    sentences: Array<{ translatedText: string; voiceText: string }>
  ) => {
    const dto: CreateCollectionDto = { title, description, isShared, sentences }
    isLoading.value = true
    try {
      if (editingCollectionId.value !== null) {
        const updated = await quizApi.updateCollection(editingCollectionId.value, dto)
        const idx = myCollections.value.findIndex(c => c.id === editingCollectionId.value)
        if (idx !== -1) myCollections.value[idx] = updated
        alert('컬렉션 수정이 완료되었습니다!')
      } else {
        const created = await quizApi.createCollection(dto)
        myCollections.value.unshift(created)
        alert('새로운 컬렉션이 등록되었습니다!')
      }
      editingCollectionId.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 상태
    myCollections,
    sharedCollections,
    isLoading,
    selectedCollectionId,
    selectedSentenceIndex,
    editingCollectionId,
    sharedSortType,
    sharedCursor,
    sharedHasMore,
    myCursor,
    myHasMore,
    // 게터
    activeCollection,
    currentSentence,
    // 액션
    loadCollections,
    fetchMyCollections,
    fetchSharedCollections,
    changeSharedSort,
    changeCollection,
    selectSentence,
    deleteCollection,
    importCollection,
    toggleShare,
    saveCollection
  }
})