import { ref } from 'vue'

export function useImageViewer() {
  // =====================================================
  // 현재 선택된 이미지
  // =====================================================

  const selectedImageUrl = ref<string | null>(null)

  // =====================================================
  // 이미지 확대 배율
  // =====================================================

  const imageScale = ref(1)

  // =====================================================
  // 확대 기준점
  // =====================================================

  const imageTransformOrigin = ref('center center')

  // =====================================================
  // 이미지 모달 열기
  // =====================================================

  const openImageModal = (url: string) => {
    if (!url) {
      return
    }

    selectedImageUrl.value = url
    imageScale.value = 1
    imageTransformOrigin.value = 'center center'
  }

  // =====================================================
  // 이미지 모달 닫기
  // =====================================================

  const closeImageModal = () => {
    selectedImageUrl.value = null
    imageScale.value = 1
    imageTransformOrigin.value = 'center center'
  }

  // =====================================================
  // 이미지 확대 / 축소
  // 마우스 위치 기준
  // =====================================================

  const handleImageWheel = (
    event: WheelEvent
  ) => {
    event.preventDefault()

    const image =
      event.currentTarget as HTMLImageElement

    const rect =
      image.getBoundingClientRect()

    // 마우스 위치를 이미지 기준 %로 계산
    const x =
      ((event.clientX - rect.left) / rect.width) * 100

    const y =
      ((event.clientY - rect.top) / rect.height) * 100

    imageTransformOrigin.value =
      `${x}% ${y}%`

    const zoomStep = 0.15

    if (event.deltaY < 0) {
      // 위로 스크롤 → 확대
      imageScale.value = Math.min(
        imageScale.value + zoomStep,
        4
      )
    } else {
      // 아래로 스크롤 → 축소
      imageScale.value = Math.max(
        imageScale.value - zoomStep,
        0.5
      )
    }
  }

  // =====================================================
  // 이미지 더블클릭 확대
  // =====================================================

const handleImageDoubleClick = (
  event: MouseEvent
) => {
  const image =
    event.currentTarget as HTMLImageElement

  const rect =
    image.getBoundingClientRect()

  const x =
    ((event.clientX - rect.left) / rect.width) * 100

  const y =
    ((event.clientY - rect.top) / rect.height) * 100

  imageTransformOrigin.value =
    `${x}% ${y}%`

  if (imageScale.value > 1) {
    imageScale.value = 1
  } else {
    imageScale.value = 2
  }
}

  return {
    selectedImageUrl,
    imageScale,
    imageTransformOrigin,
    openImageModal,
    closeImageModal,
    handleImageWheel,
    handleImageDoubleClick
  }
}