// PTW 문서 불러오기 다이얼로그
import React, { useMemo } from "react"
import LoadListDialog, { ListItem, ColumnDef } from "./LoadListDialog"
import { workPermitMockData, jsaMockData, siteEvaluationMockData, tbmMockData } from "@/data/mockPtw"
import {
  getWorkPermitDetailData,
  getJSADetailData,
  getSiteEvaluationDetailData,
  getTBMDetailData
} from "@/data/mockPtwDetails"

interface PTWListDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (data: any) => void
  documentType?: string
}

// 위험작업허가서 컬럼
const WORK_PERMIT_COLUMNS: ColumnDef<ListItem>[] = [
  { key: "no", label: "No", width: "w-8 md:w-12", align: "center" },
  { key: "workName", label: "작업명", align: "left" },
  { key: "workDate", label: "작업일", width: "w-24 md:w-28", align: "center", hiddenMobile: true },
  { key: "applicant", label: "신청자", width: "w-20 md:w-24", align: "center", hiddenMobile: true },
]

// JSA 컬럼
const JSA_COLUMNS: ColumnDef<ListItem>[] = [
  { key: "no", label: "No", width: "w-8 md:w-12", align: "center" },
  { key: "jsaNo", label: "JSA No", width: "w-24 md:w-32", align: "center" },
  { key: "workName", label: "작업명", align: "left" },
  { key: "team", label: "팀", width: "w-20 md:w-24", align: "center", hiddenMobile: true },
]

// 현장 위험성평가 컬럼
const SITE_EVAL_COLUMNS: ColumnDef<ListItem>[] = [
  { key: "no", label: "No", width: "w-8 md:w-12", align: "center" },
  { key: "workTeam", label: "작업팀", align: "left" },
  { key: "workerName", label: "작업자", width: "w-20 md:w-24", align: "center" },
  { key: "workDate", label: "작업일", width: "w-24 md:w-28", align: "center", hiddenMobile: true },
]

// TBM 컬럼
const TBM_COLUMNS: ColumnDef<ListItem>[] = [
  { key: "no", label: "No", width: "w-8 md:w-12", align: "center" },
  { key: "processName", label: "공정명", align: "left" },
  { key: "meetingDate", label: "일자", width: "w-24 md:w-28", align: "center" },
  { key: "manager", label: "담당자", width: "w-20 md:w-24", align: "center", hiddenMobile: true },
]

export default function PTWListDialog({ isOpen, onClose, onSelect, documentType = "PTW" }: PTWListDialogProps) {
  const { items, columns, getData } = useMemo(() => {
    switch (documentType) {
      case "위험작업허가서":
      case "위험작업 허가서":
        return {
          items: workPermitMockData.map((item, idx) => ({ ...item, no: idx + 1 })),
          columns: WORK_PERMIT_COLUMNS,
          getData: getWorkPermitDetailData
        }
      case "JSA":
      case "작업위험분석":
      case "작업위험분석(JSA)":
        return {
          items: jsaMockData.map((item, idx) => ({ ...item, no: idx + 1 })),
          columns: JSA_COLUMNS,
          getData: getJSADetailData
        }
      case "현장 위험성평가(JSA)":
      case "현장 위험성평가":
        return {
          items: siteEvaluationMockData.map((item, idx) => ({ ...item, no: idx + 1 })),
          columns: SITE_EVAL_COLUMNS,
          getData: getSiteEvaluationDetailData
        }
      case "TBM":
        return {
          items: tbmMockData.map((item, idx) => ({ ...item, no: idx + 1 })),
          columns: TBM_COLUMNS,
          getData: getTBMDetailData
        }
      default:
        return {
          items: [],
          columns: WORK_PERMIT_COLUMNS,
          getData: () => ({})
        }
    }
  }, [documentType])

  const handleSelect = (selectedItems: ListItem[]) => {
    if (selectedItems.length > 0) {
      const selectedItem = selectedItems[0]
      const detailData = getData(selectedItem.id)
      onSelect(detailData)
      onClose()
    }
  }

  return (
    <LoadListDialog
      isOpen={isOpen}
      items={items}
      onClose={onClose}
      singleSelect
      onChangeSelected={handleSelect}
      title={`${documentType} 불러오기`}
      columns={columns}
      emptyMessage="등록된 문서가 없습니다."
    />
  )
}