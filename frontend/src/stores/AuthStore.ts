import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useClerk } from '@clerk/vue'



export const useAuthStore = defineStore('auth', () => {

  const isLoggedIn = ref(false)

  const clerk = useClerk()


  const login = async () => {
    await clerk.value.openSignIn()
    isLoggedIn.value = true
  }

  const logout = async () => {
    await clerk.value.signOut()
    
    isLoggedIn.value = false
  }

  return {
    isLoggedIn,
    login,
    logout
  }
})