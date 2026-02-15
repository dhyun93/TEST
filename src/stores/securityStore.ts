import { create } from "zustand"
import { AUTO_LOGOUT_TIMEOUT_MS } from "@/constants/security"

interface SecurityState {
  remainingMs: number
  setRemainingMs: (remainingMs: number) => void
}

export const useSecurityStore = create<SecurityState>(set => ({
  remainingMs: AUTO_LOGOUT_TIMEOUT_MS,
  setRemainingMs: remainingMs => set({ remainingMs }),
}))
