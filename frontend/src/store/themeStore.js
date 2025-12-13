import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: true,
      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark
        document.documentElement.classList.toggle('dark', newIsDark)
        return { isDark: newIsDark }
      }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        }
      }
    }
  )
)
