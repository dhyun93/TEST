import React from "react"
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer"

export type DocumentFieldType = "text" | "date" | "datetime" | "timeRange" | "textarea" | "tags" | "photos" | "files" | "badge" | "signature"

export interface DocumentField {
  label: string
  value: string | string[] | { text: string; color: string }
  type: DocumentFieldType
  colSpan?: number
  section?: "overview" | "content" | "result"
}

export interface Participant {
  name: string
  contact: string
  signature?: string
}

export interface DocumentTemplate {
  id: string
  title: string
  fields: DocumentField[]
  companyName?: string
  documentNumber?: string
  createdAt?: string
  participants?: Participant[]
  showApproval?: boolean
}

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Regular.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Bold.ttf", fontWeight: 700 },
    { src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Light.ttf", fontWeight: 300 },
  ],
})

Font.registerHyphenationCallback(word => [word])

const COLORS = {
  black: "#000000",
  gray: "#6b7280",
  textPrimary: "#1f2937",
  border: "#374151",
  headerBg: "#f9fafb",
  tableBorder: "#e5e7eb",
}

const SIZES = {
  xs: 8,
  sm: 9,
  base: 10,
  md: 11,
  lg: 13,
  xl: 15,
  xxl: 20,
  pageNumber: 9,
}

const MARGIN = 40

const s = StyleSheet.create({
  page: { fontFamily: "NotoSansKR", fontSize: SIZES.base, paddingTop: MARGIN, paddingBottom: MARGIN + 20, paddingHorizontal: MARGIN, backgroundColor: "#ffffff" },
  headerWrap: { marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: COLORS.border },
  headerLeft: { flexDirection: "column" },
  headerRight: { flexDirection: "column", alignItems: "flex-end" },
  companyName: { fontSize: SIZES.xs, fontWeight: 400, color: COLORS.black, marginBottom: 2 },
  docNumber: { fontSize: SIZES.xs, fontWeight: 400, color: COLORS.gray },
  createdAt: { fontSize: SIZES.xs, fontWeight: 400, color: COLORS.gray },
  titleRow: { flexDirection: "row", alignItems: "center" },
  titleLarge: { fontSize: SIZES.xxl, fontWeight: 700 },
  titleSmall: { fontSize: SIZES.lg, fontWeight: 700 },
  subtitle: { fontSize: SIZES.md, fontWeight: 400, marginLeft: 8 },

  approvalWrap: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 16 },
  approvalBox: { flexDirection: "row" },
  approvalLabel: { width: 24, borderWidth: 1, borderColor: "#333333", justifyContent: "center", alignItems: "center", paddingVertical: 6 },
  approvalLabelText: { fontSize: SIZES.sm, fontWeight: 700, textAlign: "center", marginVertical: 4 },
  approvalCell: { width: 56, borderWidth: 1, borderLeftWidth: 0, borderColor: "#333333" },
  approvalCellTop: { height: 16, borderBottomWidth: 1, borderBottomColor: "#333333", justifyContent: "center", alignItems: "center" },
  approvalCellTopText: { fontSize: SIZES.xs, color: COLORS.gray },
  approvalCellBottom: { height: 22 },

  table: { marginBottom: 12 },
  row: { flexDirection: "row" },
  thText: { fontSize: SIZES.base, fontWeight: 700, color: COLORS.gray },
  tdText: { fontSize: SIZES.base, fontWeight: 400, color: COLORS.textPrimary },

  ovTh: { width: "15%", backgroundColor: COLORS.headerBg, borderWidth: 1, borderColor: COLORS.tableBorder, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center" },
  ovTd: { width: "35%", borderWidth: 1, borderColor: COLORS.tableBorder, borderLeftWidth: 0, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center" },
  ovTdWide: { width: "85%", borderWidth: 1, borderColor: COLORS.tableBorder, borderLeftWidth: 0, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center" },

  ctTh: { width: "15%", backgroundColor: COLORS.headerBg, borderWidth: 1, borderColor: COLORS.tableBorder, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center" },
  ctTd: { flex: 1, borderWidth: 1, borderColor: COLORS.tableBorder, borderLeftWidth: 0, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center" },
  ctThTall: { width: "15%", backgroundColor: COLORS.headerBg, borderWidth: 1, borderColor: COLORS.tableBorder, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center", minHeight: 60 },
  ctTdTall: { flex: 1, borderWidth: 1, borderColor: COLORS.tableBorder, borderLeftWidth: 0, paddingHorizontal: 8, paddingVertical: 10, justifyContent: "center", minHeight: 60 },

  ptTable: { marginTop: 4 },
  ptHeaderRow: { flexDirection: "row", backgroundColor: COLORS.headerBg, height: 24 },
  ptRow: { flexDirection: "row", height: 22 },
  ptTh: { borderWidth: 1, borderColor: COLORS.tableBorder, paddingVertical: 5, justifyContent: "center", alignItems: "center" },
  ptTd: { borderWidth: 1, borderColor: COLORS.tableBorder, borderTopWidth: 0, paddingVertical: 4, justifyContent: "center", alignItems: "center" },
  ptNo: { width: 32 },
  ptName: { flex: 1, borderLeftWidth: 0 },
  ptContact: { flex: 1, borderLeftWidth: 0 },
  ptSign: { width: 56, borderLeftWidth: 0 },
  ptText: { fontSize: 9, color: COLORS.textPrimary },

  photoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 },
  photoBox: { width: "48%", marginBottom: 12, alignItems: "center" },
  photo: { width: "100%", height: 200, objectFit: "contain" },
  photoCaption: { fontSize: SIZES.xs, color: COLORS.gray, marginTop: 2, textAlign: "center" },

  pageNum: { position: "absolute", bottom: MARGIN, left: MARGIN, right: MARGIN, textAlign: "center", fontSize: SIZES.pageNumber, borderTopWidth: 1, borderTopColor: COLORS.black, paddingTop: 4 },
})

const getFieldValue = (field: DocumentField): string => {
  if (field.type === "badge") return (field.value as { text: string })?.text || "-"
  if (field.type === "tags" || field.type === "files") {
    const arr = field.value as string[]
    return arr?.length ? arr.join(", ") : "-"
  }
  if (field.type === "photos") return ""
  return (field.value as string) || "-"
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const PDFHeader = ({
  title,
  companyName,
  documentNumber,
  createdAt,
  subtitle,
  small,
}: {
  title: string
  companyName?: string
  documentNumber?: string
  createdAt?: string
  subtitle?: string
  small?: boolean
}) => (
  <View style={s.headerWrap}>
    <View style={s.header}>
      <View style={s.headerLeft}>
        <View style={s.titleRow}>
          <Text style={small ? s.titleSmall : s.titleLarge}>{title}</Text>
          {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={s.headerRight}>
        {companyName && <Text style={s.companyName}>{companyName}</Text>}
        <Text style={s.docNumber}>[문서번호] {documentNumber}</Text>
        <Text style={s.createdAt}>{formatDate(createdAt)}</Text>
      </View>
    </View>
  </View>
)

const ApprovalTable = () => (
  <View style={s.approvalWrap}>
    <View style={s.approvalBox}>
      <View style={s.approvalLabel}>
        <Text style={s.approvalLabelText}>결</Text>
        <Text style={s.approvalLabelText}>재</Text>
      </View>
      {[0, 1, 2].map(i => (
        <View key={i} style={s.approvalCell}>
          <View style={s.approvalCellTop} />
          <View style={s.approvalCellBottom} />
        </View>
      ))}
    </View>
  </View>
)

const OverviewTable = ({ fields }: { fields: DocumentField[] }) => {
  if (!fields.length) return null
  const rows: React.ReactElement[] = []
  let i = 0
  while (i < fields.length) {
    const f1 = fields[i]
    const isFirst = rows.length === 0

    if (f1.colSpan && f1.colSpan >= 2) {
      rows.push(
        <View style={s.row} key={i}>
          <View style={[s.ovTh, isFirst ? {} : { borderTopWidth: 0 }]}>
            <Text style={s.thText}>{f1.label}</Text>
          </View>
          <View style={[s.ovTdWide, isFirst ? {} : { borderTopWidth: 0 }]}>
            <Text style={s.tdText}>{getFieldValue(f1)}</Text>
          </View>
        </View>
      )
      i += 1
    } else {
      const f2 = fields[i + 1]
      const hasNextColSpan = f2?.colSpan && f2.colSpan >= 2
      rows.push(
        <View style={s.row} key={i}>
          <View style={[s.ovTh, isFirst ? {} : { borderTopWidth: 0 }]}>
            <Text style={s.thText}>{f1.label}</Text>
          </View>
          {f2 && !hasNextColSpan ? (
            <React.Fragment>
              <View style={[s.ovTd, isFirst ? {} : { borderTopWidth: 0 }]}>
                <Text style={s.tdText}>{getFieldValue(f1)}</Text>
              </View>
              <View style={[s.ovTh, { borderLeftWidth: 0 }, isFirst ? {} : { borderTopWidth: 0 }]}>
                <Text style={s.thText}>{f2.label}</Text>
              </View>
              <View style={[s.ovTd, isFirst ? {} : { borderTopWidth: 0 }]}>
                <Text style={s.tdText}>{getFieldValue(f2)}</Text>
              </View>
            </React.Fragment>
          ) : (
            <View style={[s.ovTdWide, isFirst ? {} : { borderTopWidth: 0 }]}>
              <Text style={s.tdText}>{getFieldValue(f1)}</Text>
            </View>
          )}
        </View>
      )
      i += f2 && !hasNextColSpan ? 2 : 1
    }
  }
  return <View style={s.table}>{rows}</View>
}

const ContentTable = ({ fields, photoCount }: { fields: DocumentField[]; photoCount?: number }) => {
  if (!fields.length && !photoCount) return null
  return (
    <View style={s.table}>
      {fields.map((f, i) => {
        const isTall = f.type === "textarea"
        const thStyle = isTall ? s.ctThTall : s.ctTh
        const tdStyle = isTall ? s.ctTdTall : s.ctTd
        return (
          <View style={s.row} key={i}>
            <View style={[thStyle, i === 0 ? { borderTopWidth: 1 } : { borderTopWidth: 0 }]}>
              <Text style={s.thText}>{f.label}</Text>
            </View>
            <View style={[tdStyle, i === 0 ? { borderTopWidth: 1 } : { borderTopWidth: 0 }]}>
              <Text style={s.tdText}>{getFieldValue(f)}</Text>
            </View>
          </View>
        )
      })}
      {(photoCount ?? 0) > 0 && (
        <View style={s.row}>
          <View style={[s.ctTh, fields.length === 0 ? {} : { borderTopWidth: 0 }]}>
            <Text style={s.thText}>현장사진</Text>
          </View>
          <View style={[s.ctTd, fields.length === 0 ? {} : { borderTopWidth: 0 }]}>
            <Text style={s.tdText}>별첨 참조 ({photoCount}장)</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const ResultTable = ({ fields }: { fields: DocumentField[] }) => {
  if (!fields.length) return null
  return (
    <View style={s.table}>
      {fields.map((f, i) => {
        const isTall = f.type === "textarea"
        const thStyle = isTall ? s.ctThTall : s.ctTh
        const tdStyle = isTall ? s.ctTdTall : s.ctTd
        return (
          <View style={s.row} key={i}>
            <View style={[thStyle, i === 0 ? { borderTopWidth: 1 } : { borderTopWidth: 0 }]}>
              <Text style={s.thText}>{f.label}</Text>
            </View>
            <View style={[tdStyle, i === 0 ? { borderTopWidth: 1 } : { borderTopWidth: 0 }]}>
              <Text style={s.tdText}>{getFieldValue(f)}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const ParticipantTable = ({ participants, startIndex }: { participants: Participant[]; startIndex: number }) => (
  <View style={s.ptTable}>
    <View style={s.ptHeaderRow}>
      <View style={[s.ptTh, s.ptNo]}>
        <Text style={[s.ptText, { fontWeight: 700 }]}>번호</Text>
      </View>
      <View style={[s.ptTh, s.ptName]}>
        <Text style={[s.ptText, { fontWeight: 700 }]}>성명</Text>
      </View>
      <View style={[s.ptTh, s.ptContact]}>
        <Text style={[s.ptText, { fontWeight: 700 }]}>연락처</Text>
      </View>
      <View style={[s.ptTh, s.ptSign]}>
        <Text style={[s.ptText, { fontWeight: 700 }]}>서명</Text>
      </View>
    </View>
    {participants.map((p, i) => (
      <View style={s.ptRow} key={i}>
        <View style={[s.ptTd, s.ptNo]}>
          <Text style={s.ptText}>{startIndex + i + 1}</Text>
        </View>
        <View style={[s.ptTd, s.ptName]}>
          <Text style={s.ptText}>{p.name}</Text>
        </View>
        <View style={[s.ptTd, s.ptContact]}>
          <Text style={s.ptText}>{p.contact}</Text>
        </View>
        <View style={[s.ptTd, s.ptSign]}>{p.signature ? <Image src={p.signature} style={{ height: 12, objectFit: "contain" }} /> : <Text style={[s.ptText, { color: "#9ca3af" }]}>(인)</Text>}</View>
      </View>
    ))}
  </View>
)

const getFileName = (url: string): string => {
  try {
    const parts = url.split("/")
    const fileName = parts[parts.length - 1].split("?")[0]
    return decodeURIComponent(fileName) || `photo_${Date.now()}`
  } catch {
    return `photo_${Date.now()}`
  }
}

const PhotoGrid = ({ photos }: { photos: string[] }) => (
  <View style={s.photoGrid}>
    {photos.map((photo, i) => (
      <View style={s.photoBox} key={i}>
        <Image src={photo} style={s.photo} />
        <Text style={s.photoCaption}>{getFileName(photo)}</Text>
      </View>
    ))}
  </View>
)

const PageFooter = ({ current, total }: { current: number; total: number }) => <Text style={s.pageNum} render={() => `Page ${current} of ${total}`} fixed />

// 메인 PDF 컴포넌트
export const PrintDocument = ({ template }: { template: DocumentTemplate }) => {
  const docNumber = template.documentNumber || "DOC_00000000_000"
  const mainFields = template.fields.filter(f => f.type !== "photos")
  const overviewFields = mainFields.filter(f => f.section === "overview")
  const contentFields = mainFields.filter(f => f.section === "content")
  const resultFields = mainFields.filter(f => f.section === "result")
  const allPhotos = template.fields.filter(f => f.type === "photos").flatMap(f => (f.value as string[]) || [])

  const photoPages: string[][] = []
  for (let i = 0; i < allPhotos.length; i += 6) photoPages.push(allPhotos.slice(i, i + 6))

  const participantsPerPage = 30
  const participantPages: Participant[][] = []

  const requiresParticipantPage = template.title === "TBM" || template.title === "안전보건교육"

  if (requiresParticipantPage) {
    const existingParticipants = template.participants || []
    const emptySlots = Math.max(0, participantsPerPage - existingParticipants.length)
    const participants: Participant[] = [...existingParticipants, ...Array.from({ length: emptySlots }, () => ({ name: "", contact: "" }))]
    participantPages.push(participants)
  } else if (template.participants?.length) {
    for (let i = 0; i < template.participants.length; i += participantsPerPage) {
      participantPages.push(template.participants.slice(i, i + participantsPerPage))
    }
  }

  const totalPages = 1 + participantPages.length + photoPages.length

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PDFHeader title={template.title} companyName={template.companyName} documentNumber={docNumber} createdAt={template.createdAt} />
        {template.showApproval !== false && <ApprovalTable />}
        <OverviewTable fields={overviewFields} />
        <ContentTable fields={contentFields} photoCount={allPhotos.length} />
        <ResultTable fields={resultFields} />
        <PageFooter current={1} total={totalPages} />
      </Page>

      {participantPages.map((participants, i) => (
        <Page size="A4" style={s.page} key={`p-${i}`}>
          <PDFHeader title={template.title} documentNumber={docNumber} createdAt={template.createdAt} subtitle="참석자 명단" small />
          <ParticipantTable participants={participants} startIndex={i * participantsPerPage} />
          <PageFooter current={i + 2} total={totalPages} />
        </Page>
      ))}

      {photoPages.map((photos, i) => (
        <Page size="A4" style={s.page} key={`ph-${i}`}>
          <PDFHeader title={template.title} documentNumber={docNumber} createdAt={template.createdAt} subtitle="현장사진" small />
          <PhotoGrid photos={photos} />
          <PageFooter current={i + 2 + participantPages.length} total={totalPages} />
        </Page>
      ))}
    </Document>
  )
}

export default PrintDocument
