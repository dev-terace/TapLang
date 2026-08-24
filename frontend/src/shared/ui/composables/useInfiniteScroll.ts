// composables/useInfiniteScroll.ts
import { nextTick, onBeforeUnmount, type Ref } from 'vue'

interface UseInfiniteScrollOptions {
  container: Ref<HTMLElement | null>
  sentinel: Ref<HTMLElement | null>
  hasMore: () => boolean
  isLoading: () => boolean
  /** 반환값이 falsy(0, undefined)면 스크롤 보정을 건너뜁니다 */
  loadMore: () => Promise<number | void> | number | void
  /** true면 로드 후 이전 스크롤 위치를 유지 (위쪽 방향 로딩용) */
  preserveScroll?: boolean
  rootMargin?: string
  threshold?: number
  debugLabel?: string
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const {
    container,
    sentinel,
    hasMore,
    isLoading,
    loadMore,
    preserveScroll = false,
    rootMargin = '0px',
    threshold = 0,
    debugLabel,
  } = options

  let observer: IntersectionObserver | null = null

  const setup = async () => {
    await nextTick()

    if (!container.value || !sentinel.value) return

    observer?.disconnect()

    observer = new IntersectionObserver(
      async (entries) => {
        const isIntersecting = entries[0].isIntersecting

        if (debugLabel) {
          console.log(`[IO:${debugLabel}]`, {
            isIntersecting,
            hasMore: hasMore(),
            isLoading: isLoading(),
          })
        }

        if (!isIntersecting) return
        if (!hasMore()) return
        if (isLoading()) return

        const el = container.value
        if (!el) return

        if (!preserveScroll) {
          await loadMore()
          return
        }

        const prevScrollHeight = el.scrollHeight
        const prevScrollTop = el.scrollTop

        const added = await loadMore()

        if (added) {
          await nextTick()
          const newScrollHeight = el.scrollHeight
          el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight)
        }
      },
      {
        root: container.value,
        rootMargin,
        threshold,
      }
    )

    observer.observe(sentinel.value)
  }

  const teardown = () => {
    observer?.disconnect()
    observer = null
  }

  onBeforeUnmount(teardown)

  return { setup, teardown }
}