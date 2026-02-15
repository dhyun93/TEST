import React, { useEffect, useState } from "react"

type IconKey =
  | "weather-clear.png"
  | "weather-cloudy.png"
  | "weather-hail.png"
  | "weather-overcast.png"
  | "weather-partly-cloudy.png"
  | "weather-partly-rainy.png"
  | "weather-rainy.png"
  | "weather-snowy.png"
  | "weather-windy.png"
type NominatimAddress = {
  state?: string
  region?: string
  province?: string
  city?: string
  town?: string
  village?: string
  county?: string
  borough?: string
  city_district?: string
  district?: string
  suburb?: string
}
type NominatimResp = { address: NominatimAddress }
const WEATHER_LABELS: Record<IconKey, string> = {
  "weather-clear.png": "맑고 화창함",
  "weather-cloudy.png": "구름 많음",
  "weather-hail.png": "우박 내림",
  "weather-overcast.png": "흐림",
  "weather-partly-cloudy.png": "구름 많고 해",
  "weather-partly-rainy.png": "구름 많고 비 옴",
  "weather-rainy.png": "비 내림",
  "weather-snowy.png": "눈 내림",
  "weather-windy.png": "바람 강함",
}
const pickCity = (a: NominatimAddress) => a.city || a.town || a.village || a.region || a.province || a.state || ""
const pickDistrict = (a: NominatimAddress) => a.city_district || a.borough || a.district || a.county || a.suburb || ""
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`, { headers: { Accept: "application/json" } })
  if (!r.ok) return ""
  const j: Partial<NominatimResp> = await r.json()
  const a = j.address || {}
  const city = pickCity(a)
  const gu = pickDistrict(a)
  if (city && gu) return `${city} ${gu}`
  if (city) return city
  return ""
}

const DashboardWeather: React.FC = () => {
  const [addr, setAddr] = useState<string>("서울특별시 서대문구")
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const date = today.getDate()
  const weekDaysKR = ["일", "월", "화", "수", "목", "금", "토"]
  const day = weekDaysKR[today.getDay()]
  const hour = today.getHours()
  const tempMax = 18,
    tempMin = 9
  const isNight = hour >= 18 || hour < 6
  const background = isNight ? "linear-gradient(180deg,#005380 0%,#003865 50%,#001D33 100%)" : "linear-gradient(180deg,#A7D8FF 0%,#92B9F2 50%,#6E88E6 100%)"
  const iconKey: IconKey = "weather-partly-cloudy.png"
  const label = WEATHER_LABELS[iconKey]
  useEffect(() => {
    let mounted = true
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async p => {
          const s = await reverseGeocode(p.coords.latitude, p.coords.longitude)
          if (mounted && s) setAddr(s.replace("특별시", "시").replace("광역시", "시"))
        },
        () => void 0,
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      )
    }
    return () => {
      mounted = false
    }
  }, [])
  return (
    <section className="rounded-[16px] p-3 sm:p-4 w-full select-none flex flex-col min-h-[100px] sm:h-[128px] overflow-hidden" style={{ background }}>
      <div className="flex justify-end items-center leading-tight mb-1 sm:mb-0 sm:flex-[1]">
        <span className="text-[10px] sm:text-xs text-white truncate">
          {addr}{" "}
          <span className="text-[10px] sm:text-[11px] text-white/80 ml-1">
            {year}. {month}. {date} ({day})
          </span>
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-[9] sm:items-center mt-1 gap-2 sm:gap-0">
        <div className="flex items-center flex-1 sm:flex-[7] sm:pr-5">
          <img src={`/weather-icons/${iconKey}`} alt={label} className="w-10 h-10 sm:w-14 sm:h-14 object-contain shrink-0" />
          <div className="ml-2 sm:ml-3 flex flex-col justify-center leading-tight min-w-0">
            <span className="text-xl sm:text-2xl font-bold text-white">13℃</span>
            <span className="text-[11px] sm:text-[13px] text-white mt-0.5 truncate">{label}</span>
            <span className="text-[10px] sm:text-[11px] text-white/80 mt-0.5">
              최고 {tempMax}℃ / 최저 {tempMin}℃
            </span>
          </div>
        </div>
        <ul className="hidden sm:block sm:flex-[3] sm:pl-5 space-y-0.5 text-[13px] text-white leading-tight">
          <li>
            습도: <span className="font-medium text-white">65%</span>
          </li>
          <li>
            바람: <span className="font-medium text-white">3.9 m/s</span>
          </li>
          <li>
            풍향: <span className="font-medium text-white">북동 (NE)</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default DashboardWeather
