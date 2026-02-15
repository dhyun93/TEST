import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import BusinessSidebar from "../Sidebar/BusinessSidebar"
import Breadcrumb from "../common/base/Breadcrumb"
import Header from "../layout/Header"
import { useCompanyStore } from "@/stores/companyStore"

const BusinessManagementLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { factoryName } = useCompanyStore()
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", paddingTop: 60, overflow: "hidden" }}>
      <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} isMobileMenuOpen={isMobileSidebarOpen} />
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 60px)", overflow: "hidden" }}>
        <BusinessSidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} factoryName={factoryName} />
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
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "2rem",
              boxSizing: "border-box",
              flex: 1,
              maxWidth: "100%",
              width: "100%",
              margin: "0 auto",
              boxShadow: "0 0 3px rgb(0 0 0 / 0.01)",
            }}
            className="content-wrapper"
          >
            <Outlet />
          </div>
        </div>
      </div>
      <style>{`
@media (max-width:767px){
.main-layout-content{
padding:1rem 0.75rem 0 0.75rem !important;
}
.content-wrapper{
padding:1rem !important;
border-radius:8px !important;
}
}
`}</style>
    </div>
  )
}

export default BusinessManagementLayout
