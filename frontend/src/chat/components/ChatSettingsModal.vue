<script setup lang="ts">
import { watch } from 'vue'
import {
  X,
  Settings,
  Languages,
  MessageSquare,
  Bell,
  Volume2
} from 'lucide-vue-next'

import { useModalStore } from '@/shared/modal/ModalStore'
import { useChatSettingsStore } from '../store/ChatSettingsStore'
import { useChatRoomNotificationStore } from '../store/ChatRoomNotificationStore'
import { useUIStore } from '@/shared/ui/UiStore'
import { useChatStore } from '../store/Chat'

const modalStore = useModalStore()
const chatSettigsStore = useChatSettingsStore()
const chatRoomNotificationStore =
  useChatRoomNotificationStore()
const uiStore = useUIStore()
const chatStore = useChatStore();


// ==================================================
// 모달 닫기
// ==================================================

const closeModal = () => {
  modalStore.closeModal()
}


// ==================================================
// 모달 열릴 때 설정 불러오기
// ==================================================

watch(
  [
    () => modalStore.activeModal,
    () => uiStore.conversationId
  ],
  async ([modal, conversationId]) => {

    if (modal !== 'chatRoomSettings') {
      return
    }

    await chatSettigsStore.loadChatSettings()

    if (!conversationId) {
      return
    }

    await chatRoomNotificationStore.getNotification(
      conversationId
    )
  },
  {
    immediate: true
  }
)


// ==================================================
// 설정 저장
// ==================================================


const toggleNotification = () => {
  const conversationId = uiStore.conversationId

  if (!conversationId) {
    return
  }

  const current =
    chatRoomNotificationStore.isNotificationEnabled(
      conversationId
    )

  chatRoomNotificationStore.setNotificationEnabled(
    conversationId,
    !current
  )
}

const saveSettings = async () => {

  try {

    const conversationId =
      uiStore.conversationId

    await chatSettigsStore.saveChatSettings()

    if (conversationId) {

      await chatRoomNotificationStore.updateNotification(
        conversationId,
        chatRoomNotificationStore.isNotificationEnabled(
          conversationId
        )
      )
    }
    chatStore.getMyConversations()

    closeModal()

  } catch (error) {

    console.error(
      '채팅 설정 저장 실패:',
      error
    )

  }
}

</script>


<template>

  <Teleport to="body">

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >

      <div
        v-if="modalStore.activeModal === 'chatRoomSettings'"
        class="
          fixed inset-0 z-[200]
          flex items-center justify-center
          bg-black/60 p-4
        "
        @click.self="closeModal"
      >

        <div
          class="
            w-full max-w-md max-h-[85vh]
            bg-[#e6e2db]
            border-4 border-[#2d2b28]
            shadow-[8px_8px_0px_0px_#121315]
            overflow-hidden
            flex flex-col
          "
        >

          <!-- ================================================== -->
          <!-- 헤더 -->
          <!-- ================================================== -->

          <div
            class="
              flex-shrink-0
              bg-[#2d2b28]
              text-[#fbf9f5]
              px-4 py-2
              flex items-center justify-between
              text-xs font-bold
            "
          >

            <div class="flex items-center gap-2">

              <Settings class="w-4 h-4" />

              <span>
                // 채팅_설정.cfg
              </span>

            </div>


            <button
              type="button"
              @click="closeModal"
              class="hover:text-red-400 transition-colors"
            >

              <X class="w-5 h-5" />

            </button>

          </div>


          <!-- ================================================== -->
          <!-- 스크롤 영역 -->
          <!-- ================================================== -->

          <div
            class="
              flex-1
              min-h-0
              overflow-y-auto
              p-4
              space-y-3
            "
          >




            <!-- ================================================== -->
            <!-- 채팅방 알림 -->
            <!-- ================================================== -->
            <section
              class="
                border-2 border-[#2d2b28]
                bg-[#f4f1eb]
                p-3
              "
            >
              <div
                class="
                  flex items-center
                  justify-between
                "
              >

                <div
                  class="
                    flex items-center
                    gap-3
                  "
                >

                  <div
                    class="
                      flex-shrink-0
                      w-8 h-8
                      flex items-center justify-center
                      bg-[#2d2b28]
                      text-white
                    "
                  >
                    <Bell class="w-4 h-4" />
                  </div>

                  <div>

                    <div
                      class="
                        text-xs
                        font-bold
                        text-[#2d2b28]
                      "
                    >
                      알림
                    </div>

                    <div
                      class="
                        text-[10px]
                        text-neutral-500
                        mt-0.5
                      "
                    >
                      현재 대화방 알림
                    </div>

                  </div>

                </div>


                <!-- Toggle -->

                <button
                  type="button"
                  :disabled="
                    !uiStore.conversationId ||
                    chatRoomNotificationStore.isLoading
                  "
                  @click="toggleNotification"
                  class="
                    relative
                    flex-shrink-0
                    w-12 h-6
                    border-2 border-[#2d2b28]
                    transition-colors
                    disabled:opacity-50
                  "
                  :class="
                    uiStore.conversationId &&
                    chatRoomNotificationStore.isNotificationEnabled(
                      uiStore.conversationId
                    )
                      ? 'bg-[#2d2b28]'
                      : 'bg-white'
                  "
                >

                  <span
                    class="
                      absolute
                      top-[2px]
                      left-[2px]
                      w-4 h-4
                      bg-[#e6e2db]
                      border
                      border-[#2d2b28]
                      transition-transform
                    "
                    :class="
                      uiStore.conversationId &&
                      chatRoomNotificationStore.isNotificationEnabled(
                        uiStore.conversationId
                      )
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    "
                  />

                </button>

              </div>
            </section>



            
            <!-- ================================================== -->
            <!-- 채팅 번역 -->
            <!-- ================================================== -->
            <section
              class="
                border-2 border-[#2d2b28]
                bg-[#f4f1eb]
                p-3
              "
            >

              <div
                class="
                  flex items-center gap-3
                  mb-3
                "
              >

                <div
                  class="
                    flex-shrink-0
                    w-8 h-8
                    flex items-center justify-center
                    bg-[#2d2b28]
                    text-white
                  "
                >

                  <Languages class="w-4 h-4" />

                </div>


                <div>

                  <div
                    class="
                      text-xs
                      font-bold
                      text-[#2d2b28]
                    "
                  >
                    채팅 번역
                  </div>

                  <div
                    class="
                      text-[10px]
                      text-neutral-500
                      mt-0.5
                    "
                  >
                    채팅 번역 방향을 선택합니다.
                  </div>

                </div>

              </div>


              <div
                class="
                  grid
                  grid-cols-2
                  gap-2
                "
              >

                <!-- 원본 -->

                <div>

                  <div
                    class="
                      text-[10px]
                      font-bold
                      mb-1
                    "
                  >
                    원본 언어
                  </div>

                  <select
                    v-model="chatSettigsStore.chatSourceLanguage"
                    class="
                      w-full
                      bg-white
                      border-2 border-[#2d2b28]
                      px-2.5 py-2
                      text-xs
                      font-bold
                      text-[#2d2b28]
                      focus:outline-none
                    "
                  >

                    <option
                      v-for="
                        language
                        in chatSettigsStore.languages
                      "
                      :key="language.code"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>

                  </select>

                </div>


                <!-- 번역 -->

                <div>

                  <div
                    class="
                      text-[10px]
                      font-bold
                      mb-1
                    "
                  >
                    번역 언어
                  </div>

                  <select
                    v-model="chatSettigsStore.chatTargetLanguage"
                    class="
                      w-full
                      bg-white
                      border-2 border-[#2d2b28]
                      px-2.5 py-2
                      text-xs
                      font-bold
                      text-[#2d2b28]
                      focus:outline-none
                    "
                  >

                    <option
                      v-for="
                        language
                        in chatSettigsStore.languages
                      "
                      :key="language.code"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>

                  </select>

                </div>

              </div>


              <div
                class="
                  mt-2
                  text-center
                  text-[10px]
                  font-bold
                  text-[#2d2b28]
                "
              >

                {{
                  chatSettigsStore.languages.find(
                    l =>
                      l.code ===
                      chatSettigsStore.chatSourceLanguage
                  )?.name
                }}

                <span
                  class="
                    mx-2
                    text-neutral-400
                  "
                >
                  →
                </span>

                {{
                  chatSettigsStore.languages.find(
                    l =>
                      l.code ===
                      chatSettigsStore.chatTargetLanguage
                  )?.name
                }}

              </div>

            </section>


            <!-- ================================================== -->
            <!-- 메시지 번역 -->
            <!-- ================================================== -->

            <section
              class="
                border-2 border-[#2d2b28]
                bg-[#f4f1eb]
                p-3
              "
            >

              <div
                class="
                  flex items-center gap-3
                  mb-3
                "
              >

                <div
                  class="
                    flex-shrink-0
                    w-8 h-8
                    flex items-center justify-center
                    bg-[#2d2b28]
                    text-white
                  "
                >

                  <MessageSquare class="w-4 h-4" />

                </div>


                <div>

                  <div
                    class="
                      text-xs
                      font-bold
                      text-[#2d2b28]
                    "
                  >
                    메시지 번역
                  </div>

                  <div
                    class="
                      text-[10px]
                      text-neutral-500
                      mt-0.5
                    "
                  >
                    AI가 원문 언어를 자동으로 감지합니다.
                  </div>

                </div>

              </div>


              <div>

                <div
                  class="
                    text-[10px]
                    font-bold
                    mb-1
                  "
                >
                  번역 결과 언어
                </div>

                <select
                  v-model="
                    chatSettigsStore.messageTranslateLanguage
                  "
                  class="
                    w-full
                    bg-white
                    border-2 border-[#2d2b28]
                    px-2.5 py-2
                    text-xs
                    font-bold
                    text-[#2d2b28]
                    focus:outline-none
                  "
                >

                  <option
                    v-for="
                      language
                      in chatSettigsStore.languages
                    "
                    :key="language.code"
                    :value="language.code"
                  >
                    {{ language.name }}
                  </option>

                </select>

              </div>

            </section>


            <!-- ================================================== -->
            <!-- 음성 -->
            <!-- ================================================== -->

            <section
              class="
                border-2 border-[#2d2b28]
                bg-[#f4f1eb]
                p-3
              "
            >

              <div
                class="
                  flex items-center gap-3
                  mb-3
                "
              >

                <div
                  class="
                    flex-shrink-0
                    w-8 h-8
                    flex items-center justify-center
                    bg-[#2d2b28]
                    text-white
                  "
                >

                  <Volume2 class="w-4 h-4" />

                </div>


                <div>

                  <div
                    class="
                      text-xs
                      font-bold
                      text-[#2d2b28]
                    "
                  >
                    음성 설정
                  </div>

                  <div
                    class="
                      text-[10px]
                      text-neutral-500
                      mt-0.5
                    "
                  >
                    원문과 번역 음성의 언어를 설정합니다.
                  </div>

                </div>

              </div>


              <div
                class="
                  grid
                  grid-cols-2
                  gap-2
                "
              >

                <!-- 원문 음성 -->

                <div>

                  <div
                    class="
                      text-[10px]
                      font-bold
                      mb-1
                    "
                  >
                    원문 음성
                  </div>

                  <select
                    v-model="
                      chatSettigsStore.originalVoiceLanguage
                    "
                    class="
                      w-full
                      bg-white
                      border-2 border-[#2d2b28]
                      px-2.5 py-2
                      text-xs
                      font-bold
                      text-[#2d2b28]
                      focus:outline-none
                    "
                  >

                    <option value="auto">
                      자동 감지
                    </option>

                    <option
                      v-for="
                        language
                        in chatSettigsStore.languages
                      "
                      :key="language.code"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>

                  </select>

                </div>


                <!-- 번역 음성 -->

                <div>

                  <div
                    class="
                      text-[10px]
                      font-bold
                      mb-1
                    "
                  >
                    번역 음성
                  </div>

                  <select
                    v-model="
                      chatSettigsStore.translatedVoiceLanguage
                    "
                    class="
                      w-full
                      bg-white
                      border-2 border-[#2d2b28]
                      px-2.5 py-2
                      text-xs
                      font-bold
                      text-[#2d2b28]
                      focus:outline-none
                    "
                  >

                    <option
                      v-for="
                        language
                        in chatSettigsStore.languages
                      "
                      :key="language.code"
                      :value="language.code"
                    >
                      {{ language.name }}
                    </option>

                  </select>

                </div>

              </div>


              <div
                class="
                  mt-2
                  text-center
                  text-[10px]
                  font-bold
                  text-[#2d2b28]
                "
              >

                {{
                  chatSettigsStore.originalVoiceLanguage === 'auto'
                    ? '자동 감지'
                    : chatSettigsStore.languages.find(
                        l =>
                          l.code ===
                          chatSettigsStore.originalVoiceLanguage
                      )?.name
                }}

                <span
                  class="
                    mx-2
                    text-neutral-400
                  "
                >
                  →
                </span>

                {{
                  chatSettigsStore.languages.find(
                    l =>
                      l.code ===
                      chatSettigsStore.translatedVoiceLanguage
                  )?.name
                }}

              </div>

            </section>


        

 

          </div>


          <!-- ================================================== -->
          <!-- 확인 -->
          <!-- ================================================== -->

          <div
            class="
              flex-shrink-0
              p-3 pt-2
              bg-[#e6e2db]
            "
          >

            <button
              type="button"
              :disabled="chatSettigsStore.isLoading"
              @click="saveSettings"
              class="
                w-full
                bg-[#2d2b28]
                text-white
                py-2
                border-2 border-[#2d2b28]
                text-xs
                font-bold
                shadow-[3px_3px_0px_0px_#121315]
                active:shadow-none
                active:translate-x-[3px]
                active:translate-y-[3px]
                transition-all
                disabled:opacity-50
              "
            >
              확인
            </button>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>

</template>