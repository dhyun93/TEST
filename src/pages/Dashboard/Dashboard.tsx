import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import DashboardSummary from "./DashboardSummary"
import DashboardCalendar from "./DashboardCalendar"
import DashboardWeather from "./DashboardWeather"
import DashboardBanner from "./DashboardBanner"
import DashboardPolicy from "./DashboardPolicy"
import DashboardNotice from "./DashboardNotice"
import DashboardApproval from "./DashboardApproval"

const Dashboard: React.FC = () => {
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerInterval = useRef<NodeJS.Timer | null>(null)
  const navigate = useNavigate()
  useEffect(() => {
    bannerInterval.current = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % 5)
    }, 1500)
    return () => {
      if (bannerInterval.current) clearInterval(bannerInterval.current)
    }
  }, [])
  const handleViewAllClick = (section: string) => {
    if (section === "공지사항") navigate("/notice-board/notice")
    else if (section === "안전보이스") navigate("/nearmiss/safevoice")
  }
  return (
    <div className="w-full font-sans space-y-2 sm:space-y-3 px-0 sm:px-2 md:px-4 lg:px-0 pb-8">
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <DashboardPolicy />
        <DashboardWeather />
        <DashboardBanner />
      </header>
      <section className="grid grid-cols-1 lg:grid-cols-[4fr_3fr_3fr] gap-2 sm:gap-3 items-stretch" style={{ minHeight: 320 }}>
        <DashboardCalendar />
        <DashboardSummary />
        <DashboardApproval />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-1 gap-2 sm:gap-3">
        <DashboardNotice />
      </section>
    </div>
  )
}
export default Dashboard
