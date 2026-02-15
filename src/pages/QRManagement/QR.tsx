import React, { useState, useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import { QR_ITEMS, getQRUrl } from "@/components/QR/qrConfig"
import TotalCount from "@/components/common/base/TotalCount"

interface QRDataRow extends DataRow {
  id: number
  qrName: string
  desc: string
  path: string
  useStatus: boolean
}

export default function QRManagement() {
  const [items, setItems] = useState<QRDataRow[]>(QR_ITEMS)
  const qrRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({})

  const handleToggle = (id: number | string, key: string, value: boolean) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, useStatus: value } : item)))
  }

  const handleDownload = (row: QRDataRow) => {
    const canvas = qrRefs.current[row.id]
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `QR_${row.qrName}.png`
      link.href = url
      link.click()
    }
  }

  const columns: Column<QRDataRow>[] = [
    { key: "qrName", label: "QR항목", align: "center" },
    { key: "desc", label: "내용", align: "center" },
    {
      key: "qrCode",
      label: "QR코드",
      align: "center",
      renderCell: row => (
        <div className="flex justify-center">
          <QRCodeCanvas
            value={getQRUrl(row.path)}
            size={50}
            ref={el => {
              if (el) qrRefs.current[row.id] = el
            }}
          />
        </div>
      ),
    },
    {
      key: "download",
      label: "이미지 저장",
      type: "download",
      align: "center",
    },
    { key: "useStatus", label: "사용여부", type: "toggle", align: "center" },
  ]

  return (
    <section className="qr-management-content w-full bg-white">
      <PageTitle>QR관리</PageTitle>
      <TabMenu tabs={["QR 관리"]} activeIndex={0} onTabClick={() => {}} className="mb-6" />
      <div className="flex justify-between items-center mb-3">
        <TotalCount count={items.length} />
      </div>
      <DataTable columns={columns} data={items} onDownloadClick={handleDownload} onToggleChange={handleToggle} />
    </section>
  )
}
