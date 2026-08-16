import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import { useUIStore } from '@/shared/ui/UiStore'
import { useChatRoomStore } from '@/chat/store/ChatRoom'

import axios from 'axios'

interface UseChatImageOptions {
  scrollToBottom: () => void
}

export function useChatImage(
  options: UseChatImageOptions
) {
  const uiStore = useUIStore()
  const chatRoomStore = useChatRoomStore()

  // 이미지 파일 input
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // 선택된 이미지
  const selectedFile = ref<File | null>(null)

  // 이미지 미리보기 URL
  const imagePreviewUrl = ref<string | null>(null)

  // 이미지 설명
  const imageCaption = ref('')

  // 이미지 모달
  const isImageModalOpen = ref(false)

  // 이미지 업로드 중
  const isUploadingImage = ref(false)

  /**
   * 이미지 파일 처리
   *
   * 파일 탐색기 / Ctrl+V 모두 여기로 들어옴
   */
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    selectedFile.value = file

    // 기존 Object URL 정리
    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
    }

    // 새로운 Object URL 생성
    imagePreviewUrl.value = URL.createObjectURL(file)

    imageCaption.value = ''
    isImageModalOpen.value = true
  }

  /**
   * 파일 탐색기에서 이미지 선택
   */
  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement

    if (target.files && target.files[0]) {
      processFile(target.files[0])
    }

    // 같은 파일을 다시 선택할 수 있도록 초기화
    target.value = ''
  }

  /**
   * Ctrl + V 이미지 붙여넣기
   */
  const handlePaste = (e: ClipboardEvent) => {
    // 채팅방 화면에서만 처리
    if (
      uiStore.currentTab !== 'chatRoom' &&
      uiStore.currentTab !== 'inviteChatRoom'
    ) {
      return
    }

    const items = e.clipboardData?.items

    if (!items) return

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()

        const file = item.getAsFile()

        if (file) {
          processFile(file)
        }

        break
      }
    }
  }

  /**
   * 이미지 모달 닫기
   */
  const closeImageModal = () => {
    isImageModalOpen.value = false
    selectedFile.value = null
    imageCaption.value = ''

    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(imagePreviewUrl.value)
      imagePreviewUrl.value = null
    }
  }

  /**
   * 이미지 메시지 전송
   */
  const sendImageMessage = async () => {
    if (
      !selectedFile.value ||
      !chatRoomStore.conversationId
    ) {
      return
    }

    try {
      isUploadingImage.value = true

      // 1. 이미지 업로드
      const formData = new FormData()

      formData.append(
        'image',
        selectedFile.value
      )

      const { data } = await axios.post(
        '/api/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      // 2. 업로드된 이미지 정보를 메시지에 첨부
      await chatRoomStore.createMessage({
        conversationId:
          chatRoomStore.conversationId,

        content:
          imageCaption.value.trim(),

        attachments: [
          {
            url: data.url,
            guid: data.guid
          }
        ]
      })

      // 3. 모달 닫기
      closeImageModal()

      // 4. 채팅창 하단으로 이동
      options.scrollToBottom()

    } catch (error) {
      console.error(
        '이미지 전송 실패:',
        error
      )

      alert(
        '이미지 업로드 중 오류가 발생했습니다.'
      )

    } finally {
      isUploadingImage.value = false
    }
  }

  /**
   * 파일 선택창 열기
   */
  const openFilePicker = () => {
    fileInputRef.value?.click()
  }

  /**
   * Paste 이벤트 등록
   */
  onMounted(() => {
    window.addEventListener(
      'paste',
      handlePaste
    )
  })

  /**
   * Paste 이벤트 제거 + Object URL 정리
   */
  onUnmounted(() => {
    window.removeEventListener(
      'paste',
      handlePaste
    )

    if (imagePreviewUrl.value) {
      URL.revokeObjectURL(
        imagePreviewUrl.value
      )
    }
  })

  return {
    fileInputRef,
    selectedFile,
    imagePreviewUrl,
    imageCaption,
    isImageModalOpen,
    isUploadingImage,

    processFile,
    handleFileChange,
    closeImageModal,
    sendImageMessage,
    openFilePicker
  }
}