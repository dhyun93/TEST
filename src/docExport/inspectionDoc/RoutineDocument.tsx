import React from "react"
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import { COLORS, SIZES, tableStyles, notesStyles, statusStyles, ApprovalBox } from "../styles"

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]

export interface RoutineCheckItem {
  category: string
  items: string[]
}

export interface RoutineDayData {
  date: string
  inspector: string
  signature?: string
  headcount: number
  itemStatus: { [itemId: string]: "O" | "X" | "" }
}

export interface InspectionRoutineData {
  location: string
  weekData: { [day: string]: RoutineDayData }
  checkItems: RoutineCheckItem[]
  specialNotes?: string
  managerInstructions?: string
}

const s = StyleSheet.create({
  page: { fontFamily: "NotoSansKR", fontSize: SIZES.sm, padding: 15, backgroundColor: "#ffffff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  titleWrap: { flex: 1, alignItems: "center" },
  title: { fontSize: SIZES.xl, fontWeight: 700 },
  helperCell: { justifyContent: "center", alignItems: "center", paddingVertical: 4, paddingHorizontal: 2 },
  helperText: { fontSize: SIZES.xs, color: COLORS.gray, textAlign: "center", lineHeight: 1.4 },
  legendWrap: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingLeft: 8 },
  legendText: { fontSize: SIZES.xs, color: COLORS.gray },
})

interface Props {
  data: InspectionRoutineData
}

export const RoutineDocument: React.FC<Props> = ({ data }) => {
  const dayWidth = `${76 / 7}%`
  let itemIndex = 0

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View style={{ width: 80 }} />
          <View style={s.titleWrap}>
            <Text style={s.title}>안전순회 점검일지</Text>
          </View>
          <ApprovalBox />
        </View>

        <View style={tableStyles.table}>
          <View style={tableStyles.row}>
            <View style={[tableStyles.th, { width: "8%" }]}>
              <Text style={tableStyles.thText}>점검장소</Text>
            </View>
            <View style={[tableStyles.td, { width: "10%" }]}>
              <Text style={tableStyles.tdText}>{data.location || "사업장 전체"}</Text>
            </View>
            <View style={[tableStyles.th, { width: "6%" }]}>
              <Text style={tableStyles.thText}>점검일</Text>
            </View>
            {DAYS.map((day, i) => (
              <View key={day} style={[i === DAYS.length - 1 ? tableStyles.tdLast : tableStyles.td, { width: dayWidth }]}>
                <Text style={tableStyles.tdText}>
                  {data.weekData[day]?.date || ""}/{day}
                </Text>
              </View>
            ))}
          </View>

          <View style={tableStyles.row}>
            <View style={[tableStyles.td, s.helperCell, { width: "18%", borderRightWidth: 1 }]}>
              <Text style={s.helperText}>※건설기계 등</Text>
              <Text style={s.helperText}>중장비 작업 시</Text>
              <Text style={s.helperText}>별도 점검일지 사용</Text>
            </View>
            <View style={[tableStyles.th, { width: "6%" }]}>
              <Text style={tableStyles.thText}>점검자</Text>
            </View>
            {DAYS.map((day, i) => (
              <View key={day} style={[i === DAYS.length - 1 ? tableStyles.tdLast : tableStyles.td, { width: dayWidth }]}>
                <Text style={tableStyles.tdText}>{data.weekData[day]?.inspector || ""}</Text>
              </View>
            ))}
          </View>

          <View style={tableStyles.row}>
            <View style={[tableStyles.td, { width: "18%", height: 0, borderRightWidth: 1, borderTopWidth: 0 }]} />
            <View style={[tableStyles.th, { width: "6%" }]}>
              <Text style={tableStyles.thText}>서명</Text>
            </View>
            {DAYS.map((day, i) => (
              <View key={day} style={[i === DAYS.length - 1 ? tableStyles.tdLast : tableStyles.td, { width: dayWidth, height: 16 }]} />
            ))}
          </View>

          <View style={tableStyles.row}>
            <View style={[tableStyles.td, { width: "18%", height: 0, borderRightWidth: 1, borderTopWidth: 0 }]} />
            <View style={[tableStyles.th, { width: "6%" }]}>
              <Text style={tableStyles.thText}>출력인원</Text>
            </View>
            {DAYS.map((day, i) => (
              <View key={day} style={[i === DAYS.length - 1 ? tableStyles.tdLast : tableStyles.td, { width: dayWidth }]}>
                <Text style={tableStyles.tdText}>{data.weekData[day]?.headcount ? `${data.weekData[day].headcount}명` : "-"}</Text>
              </View>
            ))}
          </View>

          <View style={tableStyles.row}>
            <View style={[tableStyles.th, { width: "24%" }]}>
              <Text style={tableStyles.thText}>점 검 항 목</Text>
            </View>
            <View style={[tableStyles.thLast, { width: "76%", flexDirection: "row", alignItems: "center" }]}>
              <Text style={tableStyles.thText}>점검결과 표시방법 </Text>
              <View style={s.legendWrap}>
                <Text style={statusStyles.good}>O</Text>
                <Text style={s.legendText}>:양호 / </Text>
                <Text style={statusStyles.bad}>X</Text>
                <Text style={s.legendText}>:불량</Text>
              </View>
            </View>
          </View>

          <View style={tableStyles.row}>
            <View style={[tableStyles.th, { width: "8%" }]}>
              <Text style={tableStyles.thText}>구분</Text>
            </View>
            <View style={[tableStyles.th, { width: "16%" }]}>
              <Text style={tableStyles.thText}>점검내용</Text>
            </View>
            {DAYS.map((day, i) => (
              <View key={day} style={[i === DAYS.length - 1 ? tableStyles.thLast : tableStyles.th, { width: dayWidth }]}>
                <Text style={tableStyles.thText}>{day}</Text>
              </View>
            ))}
          </View>

          {data.checkItems.map((section, sectionIdx) => (
            <React.Fragment key={sectionIdx}>
              {section.items.map((item, idx) => {
                const currentItemId = `item-${itemIndex++}`
                const isLastSection = sectionIdx === data.checkItems.length - 1
                const isLastItem = idx === section.items.length - 1
                const isLastRow = isLastSection && isLastItem
                const RowStyle = isLastRow ? tableStyles.rowLast : tableStyles.row

                return (
                  <View key={currentItemId} style={RowStyle}>
                    {idx === 0 && (
                      <View style={[tableStyles.th, { width: "8%", height: section.items.length * 14 }]}>
                        <Text style={tableStyles.thText}>{section.category}</Text>
                      </View>
                    )}
                    <View style={[tableStyles.td, { width: "16%", alignItems: "flex-start" }]}>
                      <Text style={tableStyles.tdText}>{item}</Text>
                    </View>
                    {DAYS.map((day, i) => {
                      const status = data.weekData[day]?.itemStatus?.[currentItemId] || ""
                      return (
                        <View key={day} style={[i === DAYS.length - 1 ? tableStyles.tdLast : tableStyles.td, { width: dayWidth, alignItems: "center" }]}>
                          {status === "O" && <Text style={statusStyles.good}>O</Text>}
                          {status === "X" && <Text style={statusStyles.bad}>X</Text>}
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </React.Fragment>
          ))}

          <View style={notesStyles.row}>
            <View style={notesStyles.th}>
              <Text style={notesStyles.label}>특이사항 및 위험요인</Text>
              <Text style={notesStyles.label}>(일자, 장소 표시 후 기록)</Text>
            </View>
            <View style={notesStyles.td}>
              <Text style={notesStyles.text}>{data.specialNotes || "-"}</Text>
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

export default RoutineDocument
