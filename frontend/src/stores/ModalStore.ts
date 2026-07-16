import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {

  const activeModal = ref<string | null>(null)

  const openModal = (modal: string) => {
    activeModal.value = modal
  }

  const closeModal = () => {
    activeModal.value = null
  }

  return {
    activeModal,
    openModal,
    closeModal
  }

})