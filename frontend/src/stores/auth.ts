import { defineStore } from 'pinia'
import { ref } from 'vue'
import { account } from '../services/appwrite'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<any>(null)
  const isInitialized = ref(false)

  async function checkAuth() {
    try {
      const session = await account.get()
      user.value = session
      isAuthenticated.value = true
    } catch (err) {
      user.value = null
      isAuthenticated.value = false
    } finally {
      isInitialized.value = true
    }
  }

  async function logout() {
    try {
      await account.deleteSession('current')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      isAuthenticated.value = false
      user.value = null
    }
  }

  return { isAuthenticated, user, isInitialized, checkAuth, logout }
})
