import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme-dark') === 'true' || true)

  // Aplicar tema inicial
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme-dark', isDark.value.toString())
  }

  return {
    isDark,
    toggleTheme
  }
})
