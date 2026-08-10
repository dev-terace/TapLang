import { ref, onMounted, onUnmounted, nextTick, watch, type Ref } from 'vue'

export function useChatScroll(
  containerRef: Ref<HTMLElement | null>,
  watchTarget?: () => any
) {
  const scrollToBottom = () => {
    nextTick(() => {
      requestAnimationFrame(() => {
        if (containerRef.value) {
          containerRef.value.scrollTop = containerRef.value.scrollHeight
        }
      })
    })
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    scrollToBottom()
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => scrollToBottom())
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
  })

  if (watchTarget) {
    watch(watchTarget, () => scrollToBottom(), { deep: true })
  }

  return { scrollToBottom }
}