import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth-token') || null)
  const userJson = localStorage.getItem('auth-user')
  const user = ref(userJson && userJson !== 'undefined' ? JSON.parse(userJson) : null)

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('auth-token', newToken)
    localStorage.setItem('auth-user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-user')
  }

  return {
    token,
    user,
    setAuth,
    logout
  }
})
