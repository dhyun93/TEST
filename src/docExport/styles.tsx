import React from "react"
import { StyleSheet, Font, View, Text } from "@react-pdf/renderer"

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Regular.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Bold.ttf", fontWeight: 700 },
    { src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Light.ttf", fontWeight: 300 },
  ],
})

Font.registerHyphenationCallback(word => [word])

export const COLORS = {
  black: "#000000",
  gray: "#6b7280",
  textPrimary: "#1f2937",
  border: "#DFDFDF",
  headerBg: "#f9fafb",
  primary: "#03386D",
  danger: "#b91c1c",
}

export const SIZES = {
  xs: 8,
  sm: 9,
  base: 10,
  md: 11,
  lg: 13,
  xl: 15,
  xxl: 20,
}

export const approvalStyles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "flex-end" },
  box: { flexDirection: "row" },
  label: {
    width: 22,
    borderWidth: 1,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: COLORS.headerBg,
  },
  labelText: { fontSize: SIZES.sm, fontWeight: 700 },
  cell: { width: 50, borderWidth: 1, borderLeftWidth: 0, borderColor: COLORS.black },
  cellTop: {
    height: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black,
    backgroundColor: COLORS.headerBg,
    justifyContent: "center",
    alignItems: "center",
  },
  cellBottom: { height: 30 },
  cellText: { fontSize: SIZES.xs, color: COLORS.gray },
})

export const tableStyles = StyleSheet.create({
  table: { borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLast: { flexDirection: "row" },
  th: {
    backgroundColor: COLORS.headerBg,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  thLast: {
    backgroundColor: COLORS.headerBg,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  td: {
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tdLast: {
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  thText: { fontSize: SIZES.sm, fontWeight: 700, color: COLORS.gray },
  tdText: { fontSize: SIZES.sm, color: COLORS.textPrimary },
})

export const notesStyles = StyleSheet.create({
  table: { borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLast: { flexDirection: "row" },
  th: {
    width: "20%",
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: 6,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  td: { flex: 1, paddingHorizontal: 6, paddingVertical: 8 },
  label: { fontSize: SIZES.sm, fontWeight: 700, color: COLORS.gray, textAlign: "center" },
  text: { fontSize: SIZES.sm, lineHeight: 1.4, color: COLORS.textPrimary },
})

export const statusStyles = StyleSheet.create({
  good: { fontSize: SIZES.md, color: COLORS.primary, fontWeight: 700 },
  bad: { fontSize: SIZES.md, color: COLORS.danger, fontWeight: 700 },
})

const APPROVAL_LABELS = ["담당", "검토", "관리책임자"]

export const ApprovalBox: React.FC = () => (
  <View style={approvalStyles.wrap}>
    <View style={approvalStyles.box}>
      <View style={approvalStyles.label}>
        <Text style={approvalStyles.labelText}>결</Text>
        <Text style={approvalStyles.labelText}>재</Text>
      </View>
      {APPROVAL_LABELS.map((label, i) => (
        <View key={i} style={approvalStyles.cell}>
          <View style={approvalStyles.cellTop}>
            <Text style={approvalStyles.cellText}>{label}</Text>
          </View>
          <View style={approvalStyles.cellBottom} />
        </View>
      ))}
    </View>
  </View>
)
