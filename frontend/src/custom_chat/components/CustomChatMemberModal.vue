<script setup lang="ts">
import { ref, watch } from 'vue'

import { useChatRoomStore } from '@/chat/store/ChatRoom'
import { useAuthStore } from '@/shared/auth/AuthStore'

const authStore = useAuthStore()
const chatRoomStore = useChatRoomStore()

// =========================================================
// Props / Emits
// =========================================================

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'member-action',
    action: string,
    member: GroupChatMember
  ): void
}>()

// =========================================================
// 멤버 타입
// =========================================================

export interface GroupChatMember {
  id: number
  name: string
  flag: string
  statusMsg?: string
}

// =========================================================
// 상태
// =========================================================

const members =
  ref<GroupChatMember[]>([])

const expandedMemberIndex =
  ref<number | null>(null)

const isLoading =
  ref(false)

// =========================================================
// 멤버 목록 조회
// =========================================================

const loadMembers = async () => {

  const conversationId =
    chatRoomStore.conversationId

  if (!conversationId) {
    members.value = []
    return
  }

  try {

    isLoading.value = true

    const data =
      await chatRoomStore.getGroupChatMembers(
        conversationId
      )

    const fetchedMembers =
      Array.isArray(data)
        ? data
        : [data]

    // 본인 제외
    members.value =
      fetchedMembers.filter(
        member =>
          member.id !==
          authStore.userInfo?.id
      )

  } catch (error) {

    console.error(
      '멤버 목록을 불러오는 중 오류 발생:',
      error
    )

    members.value = []

  } finally {

    isLoading.value = false

  }
}

// =========================================================
// 모달 열림 감지
// =========================================================

watch(
  () => props.isOpen,
  async (isOpen) => {

    if (isOpen) {

      expandedMemberIndex.value = null

      await loadMembers()

    } else {

      expandedMemberIndex.value = null
      members.value = []

    }

  },
  {
    immediate: true
  }
)

// =========================================================
// 멤버 펼치기
// =========================================================

const toggleMember = (
  index: number
) => {

  expandedMemberIndex.value =
    expandedMemberIndex.value === index
      ? null
      : index
}

</script>


<template>

  <div
    v-if="isOpen"
    class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="emit('close')"
  >

    <!-- ================================================= -->
    <!-- Modal -->
    <!-- ================================================= -->

    <div
      class="
        w-full
        max-w-sm

        bg-[#e6e2db]

        border-4
        border-[#2d2b28]

        shadow-[8px_8px_0px_0px_#121315]

        overflow-hidden

        flex
        flex-col

        max-h-[80vh]
      "
    >

      <!-- ================================================= -->
      <!-- Header -->
      <!-- ================================================= -->

      <div
        class="
          bg-[#2d2b28]
          text-[#fbf9f5]

          px-4
          py-1.5

          flex
          justify-between
          items-center

          text-xs
          font-bold

          shrink-0
        "
      >

        <span>
          // 대화_상대_목록.cfg
        </span>

        <button
          type="button"
          class="
            hover:text-red-400
            font-pixel
            text-lg
            leading-none
            transition-colors
          "
          @click="emit('close')"
        >
          ×
        </button>

      </div>


      <!-- ================================================= -->
      <!-- Body -->
      <!-- ================================================= -->

      <div
        class="
          p-5

          flex
          flex-col
          flex-1

          overflow-hidden

          space-y-4
        "
      >

        <!-- Title -->

        <p
          class="
            text-xs
            font-bold
            uppercase
            text-neutral-500
            shrink-0
          "
        >
          // 현재 참여 인원
        </p>


        <!-- ================================================= -->
        <!-- Member List -->
        <!-- ================================================= -->

        <div
          class="
            flex-1
            overflow-y-auto
            space-y-2.5
            pr-1
          "
        >

          <!-- Loading -->

          <div
            v-if="isLoading"
            class="
              text-center
              py-8

              text-xs
              font-bold
              text-neutral-500

              animate-pulse
            "
          >
            // 데이터를 불러오는 중...
          </div>


          <!-- Empty -->

          <div
            v-else-if="members.length === 0"
            class="
              text-center
              py-8

              text-xs
              font-bold
              text-neutral-500
            "
          >
            // 대화 상대가 존재하지 않습니다.
          </div>


          <!-- Members -->

          <template v-else>

            <div
              v-for="(member, index) in members"
              :key="member.id || index"

              class="
                border-2
                border-[#2d2b28]

                shadow-[3px_3px_0px_0px_#2d2b28]

                transition-all

                overflow-hidden
              "

              :class="
                expandedMemberIndex === index
                  ? 'bg-[#3d3a36] text-[#fbf9f5]'
                  : 'bg-[#f4f1eb]'
              "
            >

              <!-- ================================================= -->
              <!-- Member Profile -->
              <!-- ================================================= -->

              <div
                @click="toggleMember(index)"

                class="
                  group
                  flex
                  items-center
                  gap-2.5
                  p-2

                  cursor-pointer

                  transition-colors
                  relative
                "

                :class="
                  expandedMemberIndex === index
                    ? ''
                    : 'hover:bg-[#e8e3d8] text-[#2d2b28]'
                "
              >

                <!-- Flag -->

                <div
                  class="
                    relative

                    w-7
                    h-7

                    flex
                    items-center
                    justify-center

                    border
                    border-[#2d2b28]

                    shrink-0

                    bg-[#2d2b28]
                  "
                >

                  <img
                    :src="
                      `https://flagcdn.com/w40/${member.flag || 'kr'}.png`
                    "

                    alt=""

                    class="
                      w-4
                      h-3
                      object-cover
                      flex-shrink-0
                    "
                  />

                </div>


                <!-- Name / Status -->

                <div
                  class="
                    flex-1
                    min-w-0
                  "
                >

                  <div
                    class="
                      flex
                      items-center
                      gap-1.5
                  "
                  >

                    <span
                      class="
                        w-1.5
                        h-1.5

                        inline-block
                        rounded-full

                        bg-emerald-500
                      "
                    />

                    <span
                      class="
                        text-xs
                        font-bold
                        truncate
                        tracking-tight
                      "
                    >
                      {{ member.name }}
                    </span>

                  </div>


                  <div
                    class="text-[9px] truncate mt-0.5"

                    :class="
                      expandedMemberIndex === index
                        ? 'text-[#c5bfb6]'
                        : 'text-neutral-500'
                    "
                  >
                    {{
                      member.statusMsg
                      || '상태 메시지가 없습니다.'
                    }}
                  </div>

                </div>


                <!-- Arrow -->

                <div
                  class="
                    text-[8px]
                    opacity-60
                    px-1
                  "
                >

                  <span
                    v-if="
                      expandedMemberIndex === index
                    "
                  >
                    ▲
                  </span>

                  <span
                    v-else
                    class="
                      group-hover:translate-y-0.5
                      inline-block
                      transition-transform
                    "
                  >
                    ▼
                  </span>

                </div>

              </div>


              <!-- ================================================= -->
              <!-- Member Actions -->
              <!-- ================================================= -->

              <Transition name="accordion">

                <div
                  v-show="
                    expandedMemberIndex === index
                  "

                  class="
                    flex

                    bg-[#2d2b28]
                    text-[#fbf9f5]

                    text-[10px]
                    font-bold

                    border-t-2
                    border-[#2d2b28]

                    divide-x
                    divide-[#4a4641]
                  "
                >

                  <!-- 소개글 -->

                  <button
                    type="button"

                    @click.stop="
                      emit(
                        'member-action',
                        'viewBio',
                        member
                      )
                    "

                    class="
                      flex-1
                      py-1.5
                      px-1

                      hover:bg-[#e6c875]
                      hover:text-[#2d2b28]

                      transition-colors

                      flex
                      items-center
                      justify-center

                      gap-1
                    "
                  >
                    <span>📄</span>
                    소개글
                  </button>


                  <!-- 친구 추가 -->

                  <button
                    type="button"

                    @click.stop="
                      emit(
                        'member-action',
                        'addFriend',
                        member
                      )
                    "

                    class="
                      flex-1
                      py-1.5
                      px-1

                      hover:bg-[#e6c875]
                      hover:text-[#2d2b28]

                      transition-colors

                      flex
                      items-center
                      justify-center

                      gap-1
                    "
                  >
                    <span>➕</span>
                    친구 추가
                  </button>


                  <!-- 차단 -->

                  <button
                    type="button"

                    @click.stop="
                      emit(
                        'member-action',
                        'block',
                        member
                      )
                    "

                    class="
                      flex-1
                      py-1.5
                      px-1

                      hover:bg-rose-600
                      hover:text-white

                      text-rose-400

                      transition-colors

                      flex
                      items-center
                      justify-center

                      gap-1
                    "
                  >
                    <span>🚫</span>
                    차단
                  </button>

                </div>

              </Transition>

            </div>

          </template>

        </div>


        <!-- ================================================= -->
        <!-- Footer -->
        <!-- ================================================= -->

        <div
          class="
            mt-2

            flex
            justify-end

            text-xs

            shrink-0

            pt-4

            border-t-2
            border-dashed
            border-[#2d2b28]
          "
        >

          <button
            type="button"

            @click="emit('close')"

            class="
              bg-[#c5bfb6]
              text-[#2d2b28]

              border-2
              border-[#2d2b28]

              px-4
              py-1.5

              font-bold

              hover:bg-neutral-300

              transition-all
            "
          >
            닫기
          </button>

        </div>

      </div>

    </div>

  </div>

</template>


<style scoped>

.accordion-enter-active,
.accordion-leave-active {

  transition:
    max-height 0.2s
    cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.15s ease;

  max-height: 40px;

  opacity: 1;

  overflow: hidden;
}


.accordion-enter-from,
.accordion-leave-to {

  max-height: 0;

  opacity: 0;

  overflow: hidden;
}

</style>