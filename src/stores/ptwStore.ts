// 최소 구성
import { create } from "zustand"
import type { WorkPermitItem, TBMItem } from "@/types/ptw"

interface PTWState {
  workPermits: WorkPermitItem[]
  addWorkPermit: (item: WorkPermitItem) => void
  tbmList: TBMItem[]
  addTBM: (item: TBMItem) => void
}

export const usePTWStore = create<PTWState>((set) => ({
  workPermits: [],
  addWorkPermit: (item) =>
    set((state) => ({ workPermits: [...state.workPermits, item] })),
  tbmList: [],
  addTBM: (item) =>
    set((state) => ({ tbmList: [...state.tbmList, item] })),
}))
