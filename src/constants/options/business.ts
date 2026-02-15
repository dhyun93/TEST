export type BusinessOption = { value: string; label: string; id?: number }

const toOptions = (labels: string[]): BusinessOption[] => {
  const options = labels.map((label, index) => {
    const id = index + 1
    return { value: String(id), label, id }
  })
  return options
}

export const getOptionValueById = (options: ReadonlyArray<BusinessOption>, id?: number | null): string => {
  if (typeof id !== "number") return ""
  const exact = options.find(option => option.id === id)
  if (exact) return exact.value
  const shifted = options.find(option => option.id === id + 1)
  return shifted ? shifted.value : ""
}

export const BUSINESS_TYPE_OPTIONS = toOptions([
    "식료품 제조업",
    "음료 제조업",
    "담배 제조업",
    "섬유제품 제조업",
    "의복 제조업",
    "가죽 및 관련 제품 제조업",
    "목재 및 나무제품 제조업",
    "펄프 종이 및 종이제품 제조업",
    "인쇄 및 기록매체 복제업",
    "화학물질 및 화학제품 제조업",
    "의약품 제조업",
    "고무 및 플라스틱 제조업",
    "비금속 광물제품 제조업",
    "1차 금속 제조업",
    "금속가공제품 제조업",
    "전자부품 컴퓨터 영상 음향 및 통신장비 제조업",
    "의료 정밀 광학기기 및 시계 제조업",
    "전기장비 제조업",
    "기계 및 장비 제조업",
    "자동차 및 트레일러 제조업",
    "기타 운송장비 제조업",
    "가구 제조업",
    "기타 제품 제조업",
    "산업용 기계 및 장비 수리업",
    "전기 가스 증기 및 공기조절 공급업",
    "수도 하수 및 폐기물 처리 원료 재생업",
    "도매 및 소매업",
    "운수 및 창고업",
    "정보통신업",
    "금융 및 보험업",
    "부동산업",
    "전문 과학 및 기술 서비스업",
    "사업시설 관리 사업 지원 및 임대 서비스업",
    "공공행정 국방 및 사회보장 행정",
    "교육 서비스업",
    "보건업 및 사회복지 서비스업",
    "예술 스포츠 및 여가관련 서비스업",
    "협회 및 단체 수리 및 기타 개인 서비스업",
])

export const BUSINESS_SUBJECT_OPTIONS = toOptions(["제조", "도매", "소매", "도소매", "서비스", "운수업", "임대업", "정보통신업", "용역", "기타"])
