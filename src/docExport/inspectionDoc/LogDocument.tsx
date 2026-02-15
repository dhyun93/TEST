import React from "react"
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"
import { COLORS, SIZES, tableStyles, notesStyles, statusStyles, ApprovalBox } from "../styles"

export interface InspectionCheckItem {
  id: number
  category?: string
  content: string
  status: "양호" | "불량" | ""
  note: string
  photos: string[]
}

export interface InspectionLogData {
  template: string
  workplace: string
  field: string
  kind: string
  inspector: string
  inspectedAt: string
  confirmed: boolean
  notes: string
  signature?: string
  items: InspectionCheckItem[]
  specialNotes?: string
  managerInstructions?: string
}

const s = StyleSheet.create({
  page: { fontFamily: "NotoSansKR", fontSize: SIZES.base, padding: 30, backgroundColor: "#ffffff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  titleWrap: { flex: 1, alignItems: "center" },
  title: { fontSize: SIZES.xxl, fontWeight: 700 },
  infoTable: { borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  infoRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoRowLast: { flexDirection: "row" },
  infoTh: { backgroundColor: COLORS.headerBg, paddingHorizontal: 6, paddingVertical: 5, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderRightColor: COLORS.border },
  infoTd: { paddingHorizontal: 6, paddingVertical: 5, justifyContent: "center", borderRightWidth: 1, borderRightColor: COLORS.border },
  infoTdLast: { paddingHorizontal: 6, paddingVertical: 5, justifyContent: "center" },
  infoText: { fontSize: SIZES.sm, color: COLORS.textPrimary },
  infoLabel: { fontSize: SIZES.sm, fontWeight: 700, color: COLORS.gray },
  checkTable: { borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  checkHeaderRow: { flexDirection: "row", backgroundColor: COLORS.headerBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  signatureWrap: { flexDirection: "row", alignItems: "center" },
  signatureText: { fontSize: SIZES.sm, color: COLORS.gray },
  signatureImage: { height: 20, width: 40, objectFit: "contain" },
})

interface Props {
  data: InspectionLogData
}

export const LogDocument: React.FC<Props> = ({ data }) => {
  const groupedItems = data.items.reduce(
    (acc, item) => {
      const cat = item.category || ""
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {} as Record<string, InspectionCheckItem[]>
  )

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View style={{ width: 100 }} />
          <View style={s.titleWrap}>
            <Text style={s.title}>점검일지</Text>
          </View>
          <ApprovalBox />
        </View>

        <View style={s.infoTable}>
          <View style={s.infoRow}>
            <View style={[s.infoTh, { width: "11%" }]}>
              <Text style={s.infoLabel}>점검표명</Text>
            </View>
            <View style={[s.infoTd, { width: "28%" }]}>
              <Text style={s.infoText}>{data.template}</Text>
            </View>
            <View style={[s.infoTh, { width: "11%" }]}>
              <Text style={s.infoLabel}>점검종류</Text>
            </View>
            <View style={[s.infoTd, { width: "12%" }]}>
              <Text style={s.infoText}>{data.kind}</Text>
            </View>
            <View style={[s.infoTh, { width: "11%" }]}>
              <Text style={s.infoLabel}>점검일</Text>
            </View>
            <View style={[s.infoTdLast, { width: "27%" }]}>
              <Text style={s.infoText}>{data.inspectedAt}</Text>
            </View>
          </View>
          <View style={s.infoRowLast}>
            <View style={[s.infoTh, { width: "11%" }]}>
              <Text style={s.infoLabel}>점검장소</Text>
            </View>
            <View style={[s.infoTd, { width: "28%" }]}>
              <Text style={s.infoText}>{data.workplace}</Text>
            </View>
            <View style={[s.infoTh, { width: "11%" }]}>
              <Text style={s.infoLabel}>점검분야</Text>
            </View>
            <View style={[s.infoTd, { width: "12%" }]}>
              <Text style={s.infoText}>{data.field}</Text>
            </View>
            <View style={[s.infoTh, { width: "11%" }]}>
              <Text style={s.infoLabel}>점검자</Text>
            </View>
            <View style={[s.infoTdLast, { width: "27%" }]}>
              <View style={s.signatureWrap}>
                <Text style={s.infoText}>{data.inspector}</Text>
                {data.signature ? <Image src={data.signature} style={s.signatureImage} /> : <Text style={s.signatureText}> (인)</Text>}
              </View>
            </View>
          </View>
        </View>

        <View style={s.checkTable}>
          <View style={s.checkHeaderRow}>
            <View style={[tableStyles.th, { width: "8%" }]}>
              <Text style={tableStyles.thText}>구분</Text>
            </View>
            <View style={[tableStyles.th, { width: "42%" }]}>
              <Text style={tableStyles.thText}>점검항목</Text>
            </View>
            <View style={[tableStyles.th, { width: "5%" }]}>
              <Text style={tableStyles.thText}>양호</Text>
            </View>
            <View style={[tableStyles.th, { width: "5%" }]}>
              <Text style={tableStyles.thText}>불량</Text>
            </View>
            <View style={[tableStyles.th, { width: "34%" }]}>
              <Text style={tableStyles.thText}>비고/조치사항</Text>
            </View>
            <View style={[tableStyles.thLast, { width: "6%" }]}>
              <Text style={tableStyles.thText}>사진</Text>
            </View>
          </View>

          {Object.entries(groupedItems).map(([category, categoryItems], catIdx, catArr) => (
            <React.Fragment key={category}>
              {categoryItems.map((item, idx) => {
                const isLastCategory = catIdx === catArr.length - 1
                const isLastItem = idx === categoryItems.length - 1
                const isLastRow = isLastCategory && isLastItem
                const RowStyle = isLastRow ? tableStyles.rowLast : tableStyles.row

                return (
                  <View key={item.id} style={RowStyle}>
                    {idx === 0 && category && (
                      <View style={[tableStyles.th, { width: "8%", height: categoryItems.length * 20 }]}>
                        <Text style={tableStyles.thText}>{category}</Text>
                      </View>
                    )}
                    {idx !== 0 && !category && <View style={[tableStyles.td, { width: "8%" }]} />}
                    <View style={[tableStyles.td, { width: "42%" }]}>
                      <Text style={tableStyles.tdText}>{item.content}</Text>
                    </View>
                    <View style={[tableStyles.td, { width: "5%", alignItems: "center" }]}>{item.status === "양호" && <Text style={statusStyles.good}>○</Text>}</View>
                    <View style={[tableStyles.td, { width: "5%", alignItems: "center" }]}>{item.status === "불량" && <Text style={statusStyles.bad}>✕</Text>}</View>
                    <View style={[tableStyles.td, { width: "34%" }]}>
                      <Text style={tableStyles.tdText}>{item.note || "-"}</Text>
                    </View>
                    <View style={[isLastRow ? tableStyles.tdLast : tableStyles.td, { width: "6%", alignItems: "center" }]}>
                      <Text style={tableStyles.tdText}>{item.photos.length > 0 ? `${item.photos.length}장` : "-"}</Text>
                    </View>
                  </View>
                )
              })}
            </React.Fragment>
          ))}
        </View>

        <View style={notesStyles.table}>
          <View style={notesStyles.row}>
            <View style={notesStyles.th}>
              <Text style={notesStyles.label}>특이사항 및 위험요인</Text>
              <Text style={notesStyles.label}>(일자, 장소 표시 후 기록)</Text>
            </View>
            <View style={notesStyles.td}>
              <Text style={notesStyles.text}>{data.specialNotes || data.notes || "-"}</Text>
            </View>
          </View>
          <View style={notesStyles.rowLast}>
            <View style={notesStyles.th}>
              <Text style={notesStyles.label}>관리책임자</Text>
              <Text style={notesStyles.label}>안전점검 지시사항</Text>
            </View>
            <View style={notesStyles.td}>
              <Text style={notesStyles.text}>{data.managerInstructions || "-"}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default LogDocument
