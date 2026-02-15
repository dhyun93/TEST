// 로그인 유저의 회사 관련 정보

import { create } from "zustand"

interface CompanyState {
  //회사명
  factoryName: string
  setFactoryName: (name: string) => void

  //대표명
  ceoName: string
  setCeoName: (name: string) => void

  //직위
  position: string
  setPosition: (position: string) => void
}

export const useCompanyStore = create<CompanyState>(set => ({
  factoryName: "(주)경인EPS 오창공장",
  setFactoryName: name => set({ factoryName: name }),

  ceoName: "박대표",
  setCeoName: name => set({ ceoName: name }),

  position: "경영책임자",
  setPosition: position => set({ position: position }),
}))
