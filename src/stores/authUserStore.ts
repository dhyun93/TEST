import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AUTH_STORAGE_KEY, AUTO_LOGIN_TOAST_KEY, SESSION_BOOTSTRAP_KEY } from "@/constants/auth"

interface User {
  userid: number
  username: string
  company_name: string
  is_admin: boolean
  user_account: string
  is_level: number
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean

  // Actions
  setTokens: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (token: string) =>
        set({
          token: token,
          isAuthenticated: true,
        }),

      setUser: user =>
        set({
          user,
        }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        if (state?.isAuthenticated && state.user) {
          console.log("[auth] rehydrated user:", state.user)
          const bootstrapped = sessionStorage.getItem(SESSION_BOOTSTRAP_KEY)
          if (!bootstrapped) {
            sessionStorage.setItem(AUTO_LOGIN_TOAST_KEY, "1")
          }
        }
        if (!sessionStorage.getItem(SESSION_BOOTSTRAP_KEY)) {
          sessionStorage.setItem(SESSION_BOOTSTRAP_KEY, "1")
        }
      },
    }
  )
)
