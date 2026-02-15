import { logout } from "@/api/00_Auth/auth.api"
import { useEffect, useCallback, useRef } from "react"
import { useLocation } from "react-router-dom"
import { AUTO_LOGOUT_TIMEOUT_MS } from "@/constants/security"
import { useSecurityStore } from "@/stores/securityStore"

export default function useSecurityBlock() {
  const location = useLocation()
  const { setRemainingMs } = useSecurityStore()
  const lastActivityRef = useRef<number>(Date.now())

  const handleLogout = useCallback(() => {
    alert("장시간 활동이 없어 자동 로그아웃됩니다")
    logout()
  }, [])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    document.addEventListener("contextmenu", handleContextMenu)
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname.startsWith("/public")) {
      setRemainingMs(AUTO_LOGOUT_TIMEOUT_MS)
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>
    let intervalId: ReturnType<typeof setInterval>

    const updateRemaining = () => {
      const remaining = Math.max(0, AUTO_LOGOUT_TIMEOUT_MS - (Date.now() - lastActivityRef.current))
      setRemainingMs(remaining)
    }

    const resetTimer = () => {
      clearTimeout(timeoutId)
      lastActivityRef.current = Date.now()
      updateRemaining()
      timeoutId = setTimeout(handleLogout, AUTO_LOGOUT_TIMEOUT_MS)
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(event => document.addEventListener(event, resetTimer))

    intervalId = setInterval(updateRemaining, 1000)
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      events.forEach(event => document.removeEventListener(event, resetTimer))
    }
  }, [location.pathname, handleLogout, setRemainingMs])
}
