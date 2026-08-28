import { nextTick, onBeforeUnmount, type Ref } from 'vue'

interface UseInfiniteScrollOptions {
  container:
    | Ref<HTMLElement | null>
    | (() => HTMLElement | null)

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

  // Ref / getter 모두 지원
  const getContainer = (): HTMLElement | null => {
    return typeof container === 'function'
      ? container()
      : container.value
  }

  const setup = async () => {
    await nextTick()

    const el = getContainer()

    if (!el || !sentinel.value) return

    observer?.disconnect()

    observer = new IntersectionObserver(
      async (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? false

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

        const currentContainer = getContainer()

        if (!currentContainer) return

        if (!preserveScroll) {
          await loadMore()
          return
        }

        const prevScrollHeight = currentContainer.scrollHeight
        const prevScrollTop = currentContainer.scrollTop

        const added = await loadMore()

        if (added) {
          await nextTick()

          const newScrollHeight = currentContainer.scrollHeight

          currentContainer.scrollTop =
            prevScrollTop + (newScrollHeight - prevScrollHeight)
        }
      },
      {
        root: el,
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

  return {
    setup,
    teardown,
  }
}