import React, { useState } from "react"
import PageTitle from "@/components/common/base/PageTitle"

export default function Checklist() {
  return (
    <section className="mypage-content w-full px-3 py-1 bg-[#F8F8F8] flex flex-col min-h-screen">
      <div className="flex justify-center w-full">
        <div className="border border-[#DDDDDD] bg-white rounded-[13px] p-8 mt-3 w-full flex flex-col min-h-[600px]">
          <PageTitle>위험성평가 실시(체크리스트법)</PageTitle>

          <div className="flex-1 flex flex-col items-center justify-center text-[#999999]">
            <span className="text-lg font-medium">페이지 준비중</span>
          </div>
        </div>
      </div>
    </section>
  )
}
