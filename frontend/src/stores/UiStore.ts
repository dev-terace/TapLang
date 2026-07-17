import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUIStore = defineStore('ui', () => {
  const currentTab = ref('memo')

  const changeTab = (tab: string) => {
    currentTab.value = tab
  }

  return {
    currentTab,
    changeTab
  }
})