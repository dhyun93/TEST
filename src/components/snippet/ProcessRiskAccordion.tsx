import React, { useRef, useEffect, useState } from "react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import EditableCell from "@/components/common/inputs/EditableCell"
import { ChevronDown } from "lucide-react"

export interface RiskItem {
  hazard: string
  countermeasure: string
}

export interface ProcessRiskAccordionProps {
  process: string
  items: RiskItem[]
  expanded: boolean
  toggleExpand: () => void
  handleChangeHazard: (index: number, value: string) => void
  handleChangeCounter: (index: number, value: string) => void
  addRiskItem: () => void
}

export default function ProcessRiskAccordion({ process, items, expanded, toggleExpand, handleChangeHazard, handleChangeCounter, addRiskItem }: ProcessRiskAccordionProps) {
  const columns: Column[] = [
    { key: "hazard", label: "잠재위험요인", minWidth: 150 },
    { key: "countermeasure", label: "대책", minWidth: 150 },
  ]
  const data: DataRow[] = items.map((item, idx) => ({
    id: idx,
    hazard: <EditableCell value={item.hazard} onChange={val => handleChangeHazard(idx, val)} placeholder="위험요인 입력" />,
    countermeasure: <EditableCell value={item.countermeasure} onChange={val => handleChangeCounter(idx, val)} placeholder="대책 입력" />,
  }))

  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (expanded && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    } else {
      setHeight(0)
    }
  }, [expanded, items])

  return (
    <>
      <style>{`
.process-risk-accordion .no-selectable th:first-child,
.process-risk-accordion .no-selectable td:first-child {
display: none !important;
}
`}</style>

      <div className="process-risk-accordion mt-6 border border-[#CCCCCC] rounded-t-[8px] bg-white overflow-hidden">
        <button type="button" onClick={toggleExpand} className="w-full select-none flex items-center px-3 py-3 rounded-t-[8px] bg-white border-b border-[#CCCCCC]">
          <ChevronDown className={`cursor-pointer w-4 h-4 mr-2 transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"} text-[#666666]`} />
          <span className="font-medium text-[#666666] flex-1 text-left">{process}</span>
        </button>
        <div
          ref={contentRef}
          style={{
            height,
            transition: "height 0.3s ease",
            overflowY: "auto",
            padding: expanded ? "16px" : "0 16px",
          }}
          className="no-selectable"
        >
          <DataTable columns={columns} data={data} selectable={false} />
        </div>
      </div>
      {expanded && (
        <div className="mt-3 flex justify-start">
          <Button variant="rowAdd" onClick={addRiskItem}>
            + 항목추가
          </Button>
        </div>
      )}
    </>
  )
}
