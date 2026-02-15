import React, { useState, useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

type Banner = { id: number; title: string; desc: string }
const banners: Banner[] = [
  { id: 1, title: "중대재해 관련 문의", desc: "재일 노무법인과 함께 안전 상담 받기" },
  { id: 2, title: "안전교육 필수 이수", desc: "중대재해 예방을 위한 교육 프로그램" },
  { id: 3, title: "전문가 현장 지원 서비스", desc: "전문가가 직접 진행하는 위험 점검" },
  { id: 4, title: "법률 대응 지원", desc: "중대재해처벌법 관련 법률 자문" },
  { id: 5, title: "협력사 교육 강화", desc: "수급업체와 함께하는 안전 교육" },
]

type Theme = { bg: string; layers: string; accent: string; edge: string }
const themes: Theme[] = [
  {
    bg: "linear-gradient(135deg,#0a0f1b 0%,#0e1830 55%,#0f1c37 100%)",
    layers:
      "radial-gradient(120% 140% at 88% -10%,rgba(64,212,255,0.12),transparent 60%),radial-gradient(110% 130% at 8% 115%,rgba(0,255,188,0.10),transparent 62%),repeating-linear-gradient(45deg,rgba(255,255,255,0.018) 0 1px,transparent 1px 9px)",
    accent: "rgba(90,225,255,0.35)",
    edge: "linear-gradient(90deg,rgba(90,225,255,0.55),rgba(90,225,255,0))",
  },
  {
    bg: "linear-gradient(135deg,#0a1120 0%,#0d1a33 58%,#102140 100%)",
    layers:
      "radial-gradient(120% 140% at 82% -8%,rgba(0,220,255,0.10),transparent 60%),radial-gradient(105% 135% at 12% 112%,rgba(80,180,255,0.10),transparent 62%),repeating-linear-gradient(90deg,rgba(255,255,255,0.016) 0 1px,transparent 1px 8px)",
    accent: "rgba(80,180,255,0.35)",
    edge: "linear-gradient(90deg,rgba(80,180,255,0.55),rgba(80,180,255,0))",
  },
  {
    bg: "linear-gradient(135deg,#0a1222 0%,#0f2038 56%,#122645 100%)",
    layers:
      "radial-gradient(118% 138% at 90% 6%,rgba(0,255,210,0.10),transparent 60%),radial-gradient(106% 132% at 10% 108%,rgba(120,210,255,0.08),transparent 62%),repeating-linear-gradient(30deg,rgba(255,255,255,0.014) 0 2px,transparent 2px 10px)",
    accent: "rgba(0,255,210,0.35)",
    edge: "linear-gradient(90deg,rgba(0,255,210,0.55),rgba(0,255,210,0))",
  },
  {
    bg: "linear-gradient(135deg,#091120 0%,#0d1b31 58%,#12203d 100%)",
    layers:
      "radial-gradient(120% 135% at 78% -6%,rgba(120,245,255,0.10),transparent 60%),radial-gradient(110% 130% at 14% 116%,rgba(0,215,210,0.08),transparent 62%),repeating-linear-gradient(60deg,rgba(255,255,255,0.014) 0 2px,transparent 2px 9px)",
    accent: "rgba(120,245,255,0.32)",
    edge: "linear-gradient(90deg,rgba(120,245,255,0.55),rgba(120,245,255,0))",
  },
  {
    bg: "linear-gradient(135deg,#0a1121 0%,#0f1f34 60%,#132443 100%)",
    layers:
      "linear-gradient(0deg,rgba(200,230,255,0.05),transparent 60%),radial-gradient(120% 140% at 86% 112%,rgba(0,210,255,0.10),transparent 62%),repeating-linear-gradient(45deg,rgba(255,255,255,0.012) 0 1px,transparent 1px 7px)",
    accent: "rgba(0,210,255,0.33)",
    edge: "linear-gradient(90deg,rgba(0,210,255,0.55),rgba(0,210,255,0))",
  },
]

const DashboardBanner: React.FC = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex(prev => (prev + 1) % banners.length)
    }, 3000)
    return () => window.clearInterval(id)
  }, [])

  const current = useMemo(() => banners[index], [index])
  const theme = themes[index % themes.length]

  return (
    <section className="w-full min-h-[96px] rounded-[16px] overflow-hidden relative text-white p-3 sm:p-4 flex items-center select-none" aria-label="Banner" style={{ background: theme.bg }}>
      <div className="absolute inset-0" style={{ backgroundImage: theme.layers, opacity: 0.5 }} />
      <div className="absolute inset-y-0 left-0 w-[1px]" style={{ background: theme.edge, opacity: 0.6 }} />
      <div className="absolute -top-10 -right-12 w-40 h-40 md:w-56 md:h-56 rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side,${theme.accent},transparent)` }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl" style={{ background: "radial-gradient(closest-side,rgba(255,255,255,0.04),transparent)" }} />
      <div className="relative z-10 w-full">
        <div className="bg-white/5 backdrop-blur-md rounded-[13px] p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`block-${current.id}`}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <motion.h4 className="font-semibold tracking-[-0.01em] text-xs sm:text-base text-left mb-[4px]">{current.title}</motion.h4>
              <motion.p className="font-medium text-[11px] sm:text-sm text-left" style={{ color: "rgba(240,240,240,0.85)" }}>
                {current.desc}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
export default DashboardBanner
