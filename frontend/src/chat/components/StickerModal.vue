<script setup lang="ts">
import { useModalStore } from '@/shared/modal/ModalStore'

const modalStore = useModalStore()

const emit = defineEmits<{
  (e: 'select', sticker: string): void
}>()

const stickers = [
  // 😀 얼굴
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',

  // 😈 장난 / 감정
  '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹',
  '😻', '😼', '😽', '🙀', '😿', '😾',

  // 🫡 표정 / 제스처
  '🫡', '🫠', '🫢', '🫣', '🫡', '🫥', '🫤', '🫨',
  '🫶', '🤝', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
  '✍️', '💅', '🤳', '💪', '🦾', '🦿', '👈', '👉',
  '👆', '👇', '☝️', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '🤌',
  '👊', '✊', '🤛', '🤜', '👍', '👎', '✍️',

  // ❤️ 하트
  '❤️', '🩷', '🧡', '💛', '💚', '🩵', '💙', '💜',
  '🤎', '🖤', '🩶', '🤍', '💔', '❣️', '💕', '💞',
  '💓', '💗', '💖', '💘', '💝', '💟', '♥️',

  // 🔥 인기 / 효과
  '🔥', '✨', '⭐', '🌟', '💫', '💥', '💯', '💢',
  '💦', '💨', '💤', '💬', '💭', '🎉', '🎊', '🎈',
  '🎁', '🏆', '🥇', '🥈', '🥉', '🚀', '⚡', '🌈',

  // 🙏 기타 제스처
  '👀', '👁️', '🫀', '🧠', '👄', '👅', '👂', '👃',
  '💋', '🫦', '💖', '💗', '💓', '💞', '💘',

  // 🐶 동물
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈',
  '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🐺', '🐗', '🐴', '🦄', '🐝', '🪲',
  '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', '🦂', '🐢',
  '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦀', '🐠',
  '🐟', '🐡', '🐬', '🐳', '🐋', '🦈', '🐊', '🦓',

  // 🍎 음식
  '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
  '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
  '🥝', '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️',
  '🍔', '🍟', '🍕', '🌭', '🌮', '🌯', '🥪', '🍿',
  '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍭', '🍬',
  '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🍷', '🍸',

  // ⚽ 스포츠 / 활동
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
  '🥏', '🎱', '🏓', '🏸', '🏆', '🥇', '🥈', '🥉',
  '🎮', '🎲', '🎯', '🎸', '🎹', '🎤', '🎧',

  // 🚗 이동 / 장소
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
  '🚒', '🚜', '✈️', '🚀', '🛸', '🚢', '🚲', '🛵',
  '🏠', '🏢', '🏥', '🏫', '🏪', '🏖️', '🏕️', '🌋',

  // 🌱 자연
  '🌱', '🌿', '☘️', '🍀', '🌷', '🌹', '🌺', '🌸',
  '🌼', '🌻', '🌞', '🌝', '🌙', '⭐', '🌟', '☀️',
  '🌤️', '⛅', '🌧️', '⛈️', '❄️', '☃️', '🌊', '🌍',

  // 🎉 기호
  '✅', '❌', '⭕', '❗', '❓', '‼️', '⁉️', '⚠️',
  '🚫', '💡', '🔔', '🔕', '🎵', '🎶', '✔️', '☑️',
  '➕', '➖', '✖️', '➗', '♻️', '🔴', '🟠', '🟡',
  '🟢', '🔵', '🟣', '⚫', '⚪', '🟤'
]

const selectSticker = (sticker: string) => {
  emit('select', sticker)
  modalStore.closeModal()
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
        v-if="modalStore.activeModal === 'sticker'"
        class="fixed inset-0 z-[150]
               flex items-center justify-center
               bg-black/50 p-4"
        @click.self="modalStore.closeModal()"
      >

        <div
          class="w-full max-w-sm
                 bg-[#e6e2db]
                 border-4 border-[#2d2b28]
                 shadow-[8px_8px_0px_0px_#121315]
                 overflow-hidden"
        >

          <!-- 헤더 -->
          <div
            class="bg-[#2d2b28] text-[#fbf9f5]
                   px-4 py-2
                   flex justify-between items-center"
          >
            <span class="text-xs font-bold">
              // 이모티콘_선택.cfg
            </span>

            <button
              type="button"
              @click="modalStore.closeModal()"
              class="text-lg font-bold leading-none
                     hover:text-red-400"
            >
              ×
            </button>
          </div>

          <!-- 이모티콘 -->
          <div class="p-4">

            <div
              class="grid grid-cols-6 gap-2
                     max-h-[400px]
                     overflow-y-auto
                     pr-1"
            >

              <button
                v-for="(sticker, index) in stickers"
                :key="`${sticker}-${index}`"
                type="button"
                @click="selectSticker(sticker)"
                class="aspect-square
                       flex items-center justify-center
                       text-2xl
                       bg-white
                       border-2 border-[#2d2b28]
                       transition-all duration-100
                       hover:bg-[#fbf9f5]
                       hover:-translate-y-0.5
                       hover:shadow-[2px_2px_0px_0px_#2d2b28]
                       active:translate-x-[2px]
                       active:translate-y-[2px]
                       active:shadow-none"
              >
                {{ sticker }}
              </button>

            </div>

          </div>

        </div>

      </div>
    </Transition>
  </Teleport>
</template>