<script setup lang="ts">
import { ref, computed } from 'vue'

import { useModalStore } from '@/shared/modal/ModalStore'
import { useCustomChatStore } from '../stores/CustomChatStore'
import { customChatApi } from '../api/customChat.api'


const modalStore = useModalStore()
const customChatStore = useCustomChatStore()

const title = ref('')
const description = ref('')
const isSecret = ref(false)
const password = ref('')

const isCreating = ref(false)

const isOpen = computed(() => {
  return modalStore.activeModal === 'customChatCreate'
})


const closeModal = () => {
  if (isCreating.value) return

  modalStore.closeModal()

  title.value = ''
  description.value = ''
  isSecret.value = false
  password.value = ''
}


const createRoom = async () => {

  const trimmedTitle = title.value.trim()
  const trimmedDescription = description.value.trim()
  const trimmedPassword = password.value.trim()

  if (!trimmedTitle) {
    window.alert('방 제목을 입력해주세요.')
    return
  }

  if (trimmedTitle.length > 50) {
    window.alert('방 제목은 50자 이하로 입력해주세요.')
    return
  }

  if (trimmedDescription.length > 200) {
    window.alert('방 설명은 200자 이하로 입력해주세요.')
    return
  }

  if (isSecret.value && !trimmedPassword) {
    window.alert('비밀방 비밀번호를 입력해주세요.')
    return
  }

  isCreating.value = true

  try {

    const response =
      await customChatApi.createCustomChat({
        name: trimmedTitle,

        description:
          trimmedDescription || undefined,

        password:
          isSecret.value
            ? trimmedPassword
            : undefined,
      })

    console.log(
      '생성된 conversationId:',
      response.conversationId
    )

    closeModal()

    window.alert('사설 대화방이 생성되었습니다.')

  } catch (error) {

    console.error(
      '사설 대화방 생성 실패:',
      error
    )

    window.alert(
      error instanceof Error
        ? error.message
        : '사설 대화방 생성에 실패했습니다.'
    )

  } finally {

    isCreating.value = false

  }
}

</script>


<template>

  <Teleport to="body">

    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >

      <!-- 배경 -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="closeModal"
      ></div>


      <!-- 모달 -->
      <div
        class="relative w-full max-w-md bg-[#f4f1eb] border-2 border-[#2d2b28] shadow-[7px_7px_0px_0px_#2d2b28]"
      >

        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 bg-[#2d2b28] text-[#fbf9f5]"
        >

          <div>

            <h2 class="text-sm font-bold tracking-wider">
              // 사설방_개설.exe
            </h2>

            <p class="text-[10px] text-[#c5bfb6] mt-1">
              새로운 커스텀 대화방을 생성합니다.
            </p>

          </div>


          <button
            type="button"
            class="text-lg leading-none hover:text-red-400 transition-colors"
            @click="closeModal"
          >
            ×
          </button>

        </div>


        <!-- Body -->
        <div class="p-5 space-y-5">


          <!-- 제목 -->
          <div>

            <label
              class="block text-[10px] font-bold text-[#2d2b28] mb-2"
            >
              방 제목
            </label>

            <input
              v-model="title"
              type="text"
              maxlength="50"
              placeholder="방 제목을 입력하세요."
              class="w-full px-3 py-2 bg-[#fbf9f5] border-2 border-[#2d2b28] text-xs outline-none focus:bg-white"
            />

            <div class="text-right text-[9px] text-neutral-500 mt-1">
              {{ title.length }}/50
            </div>

          </div>


          <!-- 설명 -->
          <div>

            <label
              class="block text-[10px] font-bold text-[#2d2b28] mb-2"
            >
              방 설명
            </label>

            <textarea
              v-model="description"
              maxlength="200"
              rows="3"
              placeholder="어떤 대화방인지 설명해주세요."
              class="w-full px-3 py-2 bg-[#fbf9f5] border-2 border-[#2d2b28] text-xs outline-none resize-none focus:bg-white"
            ></textarea>

            <div class="text-right text-[9px] text-neutral-500 mt-1">
              {{ description.length }}/200
            </div>

          </div>


          <!-- 비밀방 -->
          <div>

            <button
              type="button"
              class="w-full flex items-center justify-between px-3 py-3 border-2 border-[#2d2b28] transition-all"
              :class="
                isSecret
                  ? 'bg-[#2d2b28] text-white'
                  : 'bg-[#e6e2db] text-[#2d2b28]'
              "
              @click="isSecret = !isSecret"
            >

              <div class="flex items-center gap-2">

                <span>
                  {{ isSecret ? '🔒' : '🌐' }}
                </span>

                <div class="text-left">

                  <div class="text-xs font-bold">
                    {{ isSecret ? '비밀 대화방' : '공개 대화방' }}
                  </div>

                  <div
                    class="text-[9px]"
                    :class="
                      isSecret
                        ? 'text-[#c5bfb6]'
                        : 'text-neutral-500'
                    "
                  >
                    {{
                      isSecret
                        ? '비밀번호가 있어야 입장할 수 있습니다.'
                        : '누구나 대화방을 확인할 수 있습니다.'
                    }}
                  </div>

                </div>

              </div>


              <div
                class="w-8 h-4 border-2 relative"
                :class="
                  isSecret
                    ? 'border-white'
                    : 'border-[#2d2b28]'
                "
              >

                <div
                  class="absolute top-0.5 w-2 h-2 transition-all"
                  :class="
                    isSecret
                      ? 'right-0.5 bg-white'
                      : 'left-0.5 bg-[#2d2b28]'
                  "
                ></div>

              </div>

            </button>

          </div>


          <!-- 비밀번호 -->
          <div v-if="isSecret">

            <label
              class="block text-[10px] font-bold text-[#2d2b28] mb-2"
            >
              비밀번호
            </label>

            <input
              v-model="password"
              type="password"
              maxlength="30"
              placeholder="비밀방 비밀번호"
              class="w-full px-3 py-2 bg-[#fbf9f5] border-2 border-[#2d2b28] text-xs outline-none focus:bg-white"
            />

            <p class="text-[9px] text-neutral-500 mt-1">
              비밀번호를 알고 있는 사용자만 입장할 수 있습니다.
            </p>

          </div>


        </div>


        <!-- Footer -->
        <div
          class="flex justify-end gap-2 px-5 py-4 border-t-2 border-dashed border-[#c5bfb6]"
        >

          <button
            type="button"
            :disabled="isCreating"
            class="px-4 py-2 text-xs font-bold border-2 border-[#2d2b28] bg-[#e6e2db] text-[#2d2b28] hover:bg-[#c5bfb6] disabled:opacity-50"
            @click="closeModal"
          >
            취소
          </button>


          <button
            type="button"
            :disabled="isCreating"
            class="px-4 py-2 text-xs font-bold border-2 border-[#2d2b28] bg-[#2d2b28] text-white hover:bg-white hover:text-[#2d2b28] disabled:opacity-50"
            @click="createRoom"
          >
            {{ isCreating ? '생성 중...' : '사설방 개설' }}
          </button>

        </div>

      </div>

    </div>

  </Teleport>

</template>