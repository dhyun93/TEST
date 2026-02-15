import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { setupLoadingInterceptors } from "./utils/axiosInterceptor"

// Axios 인터셉터 설정 (토큰 자동 첨부 및 로딩 상태 관리)
setupLoadingInterceptors()

const container = document.getElementById("root")
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
