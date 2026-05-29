import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = ref(!!token.value)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  function login(userData: any, jwtToken: string) {
    isAuthenticated.value = true
    user.value = userData
    token.value = jwtToken
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return { isAuthenticated, user, token, login, logout }
})
