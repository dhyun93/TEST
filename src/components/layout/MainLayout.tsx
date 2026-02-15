import React, { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../Sidebar/Sidebar"
import Breadcrumb from "../common/base/Breadcrumb"
import Header from "../layout/Header"
import useSecurityBlock from "../../hooks/useSecurityBlock"
import { useCompanyStore } from "@/stores/companyStore"

const MainLayout: React.FC = () => {
  const location = useLocation()
  const { factoryName } = useCompanyStore()
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard"
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  useSecurityBlock()

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileSidebarOpen])

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", paddingTop: 60, overflow: "hidden" }}>
      <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} onCloseSidebar={() => setIsMobileSidebarOpen(false)} isMobileMenuOpen={isMobileSidebarOpen} />
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 60px)", overflow: "hidden" }}>
        <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} factoryName={factoryName} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "2rem 2rem 0 2rem",
            background: "#F8F8F8",
            boxSizing: "border-box",
            position: "relative",
            overflow: "auto",
          }}
          className="main-layout-content"
        >
          <Breadcrumb />
          <div
            style={
              isDashboard
                ? { flex: 1, maxWidth: "100%", width: "100%", margin: "0 auto" }
                : { background: "#fff", borderRadius: 12, padding: "2rem", boxSizing: "border-box", flex: 1, maxWidth: "100%", width: "100%", margin: "0 auto", boxShadow: "0 0 3px rgb(0 0 0 / 0.01)" }
            }
            className="content-wrapper"
          >
            <Outlet />
          </div>
        </div>
      </div>
      <style>{`
@media (max-width:767px){
.main-layout-content{
padding:0.75rem 0.5rem 0 0.5rem !important;
}
.content-wrapper{
padding:0.75rem !important;
border-radius:8px !important;
}
}
@media (max-width:390px){
.main-layout-content{
padding:0.5rem 0.25rem 0 0.25rem !important;
}
.content-wrapper{
padding:0.5rem !important;
}
}
`}</style>
    </div>
  )
}

export default MainLayout
