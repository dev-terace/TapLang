import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { quizApi, Collection, Sentence, CreateCollectionDto } from '@/quiz/api/quiz.api'

const IMPORTED_AUTHORS_KEY = 'quiz_imported_authors'

export const useQuizStore = defineStore('quiz', () => {
  const myCollections = ref<Collection[]>([])
  const sharedCollections = ref<Collection[]>([])
  const isLoading = ref<boolean>(false)

  const selectedCollectionId = ref<number>(1)
  const selectedSentenceIndex = ref<number>(0)
  const editingCollectionId = ref<number | null>(null)

  const sharedSortType = ref<'recent' | 'popular'>('recent')
  const sharedCursor = ref<string | number | null>(null)
  const sharedHasMore = ref<boolean>(true)

  const myCursor = ref<string | number | null>(null)
  const myHasMore = ref<boolean>(true)

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

  const activeCollection = computed(() => {
    return (
      myCollections.value.find(c => c.id === selectedCollectionId.value) ||
      sharedCollections.value.find(c => c.id === selectedCollectionId.value) ||
      myCollections.value[0] ||
      { id: 0, title: '', description: '', author: '', isShared: false, isMine: false, sentences: [] }
    )
  })

  const currentSentence = computed<Sentence>(() => {
    if (!activeCollection.value || !activeCollection.value.sentences?.length) {
      return { id: 0, translatedText: '등록된 문장이 없습니다.', voiceText: '' }
    }
    return activeCollection.value.sentences[selectedSentenceIndex.value] || activeCollection.value.sentences[0]
  })

  const fetchMyCollections = async (isLoadMore = false) => {
    if (isLoading.value) return 0
    if (!isLoadMore) {
      myCursor.value = null
      myHasMore.value = true
      myCollections.value = []
    }
    if (!myHasMore.value) return 0

    isLoading.value = true
    try {
      const res = await quizApi.getMyCollections({ cursor: myCursor.value, limit: 10 })
      const importedMap = getImportedMap()
      const items = Array.isArray(res) ? res : res.items || []
      const nextCursor = Array.isArray(res) ? null : res.nextCursor

      const mappedItems = items.map(col => ({
        ...col,
        author: importedMap[col.id] || col.author
      }))

      myCollections.value.push(...mappedItems)
      myCursor.value = nextCursor

      // 💡 배열 응답인 경우 요청 limit(10개) 수신 여부로 다음 페이지 유무 판단
      myHasMore.value = Array.isArray(res) ? items.length === 10 : !!nextCursor
      return mappedItems.length
    } catch (error) {
      console.error('내 컬렉션 로드 실패:', error)
      return 0
    } finally {
      isLoading.value = false
    }
  }

  const refreshMyCollections = async () => fetchMyCollections(false)

  const fetchSharedCollections = async (isLoadMore = false) => {
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
      const items = Array.isArray(res) ? res : res.items || []
      const nextCursor = Array.isArray(res) ? null : res.nextCursor

      sharedCollections.value.push(...items)
      sharedCursor.value = nextCursor
      sharedHasMore.value = Array.isArray(res) ? items.length === 10 : !!nextCursor
      return items.length
    } catch (error) {
      console.error('공유 컬렉션 로드 실패:', error)
      return 0
    } finally {
      isLoading.value = false
    }
  }

  const refreshSharedCollections = async () => fetchSharedCollections(false)

  const changeSharedSort = async (sortType: 'recent' | 'popular') => {
    sharedSortType.value = sortType
    await fetchSharedCollections(false)
  }

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
    myCollections, sharedCollections, isLoading, selectedCollectionId,
    selectedSentenceIndex, editingCollectionId, sharedSortType, sharedCursor,
    sharedHasMore, myCursor, myHasMore, activeCollection, currentSentence,
    loadCollections, fetchMyCollections, refreshMyCollections, fetchSharedCollections,
    refreshSharedCollections, changeSharedSort, changeCollection, selectSentence,
    deleteCollection, importCollection, toggleShare, saveCollection
  }
})