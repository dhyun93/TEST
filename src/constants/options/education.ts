type EducationOption = { value: string; label: string; id?: number }

export const EDUCATION_COURSE_OPTIONS: ReadonlyArray<EducationOption> = [
  { value: "", label: "교육과정 선택" },
  { id: 0, value: "정기교육", label: "정기교육" },
  { id: 1, value: "채용 시 교육", label: "채용 시 교육" },
  { id: 2, value: "작업내용 변경 시 교육", label: "작업내용 변경 시 교육" },
  { id: 3, value: "특별교육", label: "특별교육" },
  { id: 4, value: "신규교육", label: "신규교육" },
  { id: 5, value: "보수교육", label: "보수교육" },
  { id: 6, value: "최초 노무제공 시 교육", label: "최초 노무제공 시 교육" },
  { id: 7, value: "건설업 기초안전보건교육", label: "건설업 기초안전보건교육" },
]

export const EDUCATION_TARGET_OPTIONS: ReadonlyArray<EducationOption> = [
  { value: "", label: "교육대상 선택" },
  { id: 0, value: "근로자 교육", label: "근로자 교육" },
  { id: 1, value: "관리자 교육", label: "관리자 교육" },
  { id: 2, value: "기타 교육", label: "기타 교육" },
]

export const EDUCATION_METHOD_OPTIONS = [
  { id: 0, value: "자체교육", label: "자체교육" },
  { id: 1, value: "온라인교육", label: "온라인교육" },
  { id: 2, value: "집체교육", label: "집체교육" },
] as const

export const EDUCATION_ALARM_TIME_OPTIONS = [
  { id: 0, value: "1일 전", label: "1일 전" },
  { id: 1, value: "1주일 전", label: "1주일 전" },
  { id: 2, value: "1개월 전", label: "1개월 전" },
] as const

export const EDUCATION_COURSE_DETAIL_OPTIONS = [
  { id: 0, value: "정기교육 (사무직 종사 근로자)", label: "정기교육 (사무직 종사 근로자)", course_hour: "매반기 6시간 이상" },
  { id: 1, value: "정기교육 (판매업무 직접 종사 근로자)", label: "정기교육 (판매업무 직접 종사 근로자)", course_hour: "매반기 6시간 이상" },
  { id: 2, value: "정기교육 (그 외 근로자)", label: "정기교육 (그 외 근로자)", course_hour: "매반기 12시간 이상" },
  { id: 3, value: "채용 시 교육 (일용근로자·계약 1주 이하 기간제근로자)", label: "채용 시 교육 (일용근로자·계약 1주 이하 기간제근로자)", course_hour: "1시간 이상" },
  { id: 4, value: "채용 시 교육 (계약 1주 초과~1개월 이하 기간제근로자)", label: "채용 시 교육 (계약 1주 초과~1개월 이하 기간제근로자)", course_hour: "4시간 이상" },
  { id: 5, value: "채용 시 교육 (그 외 근로자)", label: "채용 시 교육 (그 외 근로자)", course_hour: "8시간 이상" },
  { id: 6, value: "작업내용 변경 시 교육 (일용근로자·계약 1주 이하 기간제근로자)", label: "작업내용 변경 시 교육 (일용근로자·계약 1주 이하 기간제근로자)", course_hour: "1시간 이상" },
  { id: 7, value: "작업내용 변경 시 교육 (그 외 근로자)", label: "작업내용 변경 시 교육 (그 외 근로자)", course_hour: "2시간 이상" },
  { id: 8, value: "특별교육 (39개 유해·위험 작업 수행 근로자 중 일용·계약 1주 이하, 타워크레인 제외)", label: "특별교육 (39개 유해·위험 작업 수행 근로자 중 일용·계약 1주 이하, 타워크레인 제외)", course_hour: "2시간 이상" },
  { id: 9, value: "특별교육 (타워크레인 신호작업 근로자)", label: "특별교육 (타워크레인 신호작업 근로자)", course_hour: "8시간 이상" },
  { id: 10, value: "특별교육 (그 외 근로자)", label: "특별교육 (그 외 근로자)", course_hour: "16시간 이상" },
  { id: 11, value: "정기교육 (관리감독자)", label: "정기교육 (관리감독자)", course_hour: "연간 16시간 이상" },
  { id: 12, value: "채용 시 교육 (관리감독자)", label: "채용 시 교육 (관리감독자)", course_hour: "8시간 이상" },
  { id: 13, value: "작업내용 변경 시 교육 (관리감독자)", label: "작업내용 변경 시 교육 (관리감독자)", course_hour: "2시간 이상" },
  { id: 14, value: "특별교육 (관리감독자)", label: "특별교육 (관리감독자)", course_hour: "16시간 이상" },
  { id: 15, value: "신규교육 (안전보건관리책임자)", label: "신규교육 (안전보건관리책임자)", course_hour: "6시간 이상" },
  { id: 16, value: "보수교육 (안전보건관리책임자)", label: "보수교육 (안전보건관리책임자)", course_hour: "6시간 이상" },
  { id: 17, value: "신규교육 (안전보건관리자)", label: "신규교육 (안전보건관리자)", course_hour: "34시간 이상" },
  { id: 18, value: "보수교육 (안전보건관리자)", label: "보수교육 (안전보건관리자)", course_hour: "24시간 이상" },
  { id: 19, value: "보수교육 (안전보건관리담당자)", label: "보수교육 (안전보건관리담당자)", course_hour: "8시간 이상" },
  { id: 20, value: "최초 노무제공 시 교육 (특수형태근로종사자)", label: "최초 노무제공 시 교육 (특수형태근로종사자)", course_hour: "2시간 이상 (단기작업 1시간 이상)" },
] as const

export const EDUCATION_CATEGORY_COURSE_MAP: Readonly<Record<string, { id: number; value: string; label: string }[]>> = {
  "근로자 교육": EDUCATION_COURSE_DETAIL_OPTIONS.filter(option => option.id <= 10),
  "관리자 교육": EDUCATION_COURSE_DETAIL_OPTIONS.filter(option => option.id >= 11 && option.id <= 19),
  "기타 교육": EDUCATION_COURSE_DETAIL_OPTIONS.filter(option => option.id === 20),
} as const
