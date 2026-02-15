/**
 * 위험성 평가 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 위험성평가 목록 조회
// ====================================================
export type RiskAssessmentList_Request = {
  page?: number //페이지번호
  start_date?: string //시작일 YYYY-MM-DD
  end_date?: string //종료일 YYYY-MM-DD
  query?: string //검색어
}

export type RiskAssessment_Post = {
  id: number //포스트고유ID
  title: string //위험성평가명
  label: string //평가구분
  method: string //평가방법
  created_at: string //등록일 YYYY-MM-DDTHH:MM:SS.SSS
  update_at: string //수정일 YYYY-MM-DDTHH:MM:SS.SSS
  completion_at: null //완료일
  process: number //공정수
}

export type RiskAssessmentList_Response = {
  code: number //응답코드
  msg: string //응답메시지
  posts: RiskAssessment_Post[] //목록데이터
  all_page_count: number //전체페이지수
  all_count: number //전체건수
}

export const getList = async (params?: RiskAssessmentList_Request): Promise<RiskAssessmentList_Response> => {
  const res = await axiosInstance.post<RiskAssessmentList_Response>("/posts/risk_list/", params)
  console.log("위험성평가리스트:", res)
  return res.data
}

// ====================================================
// 위험성평가 삭제
// ====================================================
export type RiskDeleteRequest = {
  post_id: number[] //삭제할포스트고유ID리스트
}

export type RiskDeleteResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteRisk = async (data: RiskDeleteRequest): Promise<RiskDeleteResponse> => {
  const fd = new FormData()
  fd.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<RiskDeleteResponse>("/posts/delete_risk/", fd)
  return res.data
}

// ====================================================
// 위험성평가 상세 조회
// ====================================================
export type RiskInfoRequest = {
  id: number //위험성평가고유ID
  step: number //위험성평가단계(1,2,3)
}

export type RiskInfoResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getRiskInfo = async (data: RiskInfoRequest): Promise<RiskInfoResponse> => {
  const fd = new FormData()
  fd.append("id", String(data.id))
  fd.append("step", String(data.step))
  const res = await axiosInstance.post<RiskInfoResponse>("/posts/risk_info/", fd)
  return res.data
}

// ====================================================
// 위험성평가 결과 조회
// ====================================================
export type RiskResultRequest = {
  id: number //위험성평가고유ID
}

export type RiskResultResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getRiskResult = async (data: RiskResultRequest): Promise<RiskResultResponse> => {
  const fd = new FormData()
  fd.append("id", String(data.id))
  const res = await axiosInstance.post<RiskResultResponse>("/posts/risk_result/", fd)
  return res.data
}

// ====================================================
// 위험성평가 사전정보 등록/수정 (Step 0)
// ====================================================
export type SetRiskAssessmentRequest = {
  post_id: number //포스트고유ID(생성:0,수정:기존고유ID)
  check_list: string //체크리스트항목(콤마구분) "1,2,3"
  title: string //위험성평가명
  label: string //평가구분
  method: string //평가방법
  file?: File //시행규정파일
  scale?: string //평가척도(0:3x3,1:5x4)
  level?: string //위험성수준(콤마구분,최대값) "2,4,6,10"
}

export type SetRiskAssessmentResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setRiskAssessment = async (data: SetRiskAssessmentRequest): Promise<SetRiskAssessmentResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  fd.append("check_list", data.check_list)
  fd.append("title", data.title)
  fd.append("label", data.label)
  fd.append("method", data.method)
  if (data.file) fd.append("file", data.file)
  if (data.scale !== undefined) fd.append("scale", data.scale)
  if (data.level) fd.append("level", data.level)
  const res = await axiosInstance.post<SetRiskAssessmentResponse>("/posts/set_risk_assessment/", fd)
  return res.data
}

// ====================================================
// 위험성평가 1단계 저장
// ====================================================
export type RiskStep1Item = {
  index: number //배열인덱스
  id: number //고유ID(생성:0,수정:기존고유ID)
  title: string //공정명
  rule: string //산업안전보건법근거
  contents: string //유해위험요인
  action: string //현재안전보건조치
}

export type SetRiskStep1Request = {
  risk_id: number //위험성평가고유ID
  text: string //카테고리텍스트
  data: RiskStep1Item[] //1단계데이터배열
  files?: File[] //첨부파일배열
}

export type SetRiskStep1Response = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setRiskStep1 = async (data: SetRiskStep1Request): Promise<SetRiskStep1Response> => {
  const fd = new FormData()
  fd.append("risk_id", String(data.risk_id))
  fd.append("text", data.text)
  fd.append("data", JSON.stringify(data.data))
  if (data.files) {
    data.files.forEach((file, i) => fd.append(`file_${i}`, file))
  }
  const res = await axiosInstance.post<SetRiskStep1Response>("/posts/set_risk_step1/", fd)
  return res.data
}

// ====================================================
// 위험성평가 2단계 저장
// ====================================================
export type RiskStep2Item = {
  id: number //고유ID(생성:0,수정:기존고유ID)
  grasp_id: number //1단계공정별고유ID
  action: string //현재안전보건조치
  score: string //위험성수준점수또는빈도
  evaluation_date: string //평가일 YYYY-MM-DD
  robbery?: string //빈도법일때강도값
}

export type SetRiskStep2Request = {
  risk_id: number //위험성평가고유ID
  data: RiskStep2Item[] //2단계데이터배열
}

export type SetRiskStep2Response = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setRiskStep2 = async (data: SetRiskStep2Request): Promise<SetRiskStep2Response> => {
  const fd = new FormData()
  fd.append("risk_id", String(data.risk_id))
  fd.append("data", JSON.stringify(data.data))
  const res = await axiosInstance.post<SetRiskStep2Response>("/posts/set_risk_step2/", fd)
  return res.data
}

// ====================================================
// 위험성평가 3단계 저장
// ====================================================
export type RiskStep3Item = {
  id: number //고유ID(생성:0,수정:기존고유ID)
  grasp_id: number //위험성평가고유ID
  measures: string //위험성감소대책
  scheduled_date: string //개선예정일 YYYY-MM-DD
  completion_date: string //완료일 YYYY-MM-DD
  manager: string //평가담당자
  score: string //위험성수준(판단또는빈도)
}

export type SetRiskStep3Request = {
  risk_id: number //위험성평가고유ID
  data: RiskStep3Item[] //3단계데이터배열
}

export type SetRiskStep3Response = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setRiskStep3 = async (data: SetRiskStep3Request): Promise<SetRiskStep3Response> => {
  const fd = new FormData()
  fd.append("risk_id", String(data.risk_id))
  fd.append("data", JSON.stringify(data.data))
  const res = await axiosInstance.post<SetRiskStep3Response>("/posts/set_risk_step3/", fd)
  return res.data
}

// ====================================================
// 업종 선택 목록 조회
// ====================================================
export type ProcessListRequest = {
  query?: string //검색어
}

export type ProcessListResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getProcessList = async (data?: ProcessListRequest): Promise<ProcessListResponse> => {
  const fd = new FormData()
  if (data?.query) fd.append("query", data.query)
  const res = await axiosInstance.post<ProcessListResponse>("/posts/process_list/", fd)
  return res.data
}

// ====================================================
// 공정 선택 목록 조회
// ====================================================
export type ProcessListStep2Request = {
  post_id: number //업종고유ID
}

export type ProcessListStep2Response = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getProcessListStep2 = async (data: ProcessListStep2Request): Promise<ProcessListStep2Response> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<ProcessListStep2Response>("/posts/process_list_step2/", fd)
  return res.data
}

// ====================================================
// 공정 수정
// ====================================================
export type SetProcessItem = {
  id: number //고유ID
  is_check: number //처리결과(0:미채택,1:채택)
  title: string //공정명
  contents: string //설명
}

export type SetProcessRequest = {
  data: SetProcessItem[] //공정데이터배열
}

export type SetProcessResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setProcess = async (data: SetProcessRequest): Promise<SetProcessResponse> => {
  const fd = new FormData()
  fd.append("data", JSON.stringify(data.data))
  const res = await axiosInstance.post<SetProcessResponse>("/posts/set_process/", fd)
  return res.data
}

// ====================================================
// 원인요인 목록 조회
// ====================================================
export type ProblemListResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getProblemList = async (): Promise<ProblemListResponse> => {
  const res = await axiosInstance.post<ProblemListResponse>("/posts/problem_list/")
  return res.data
}

// ====================================================
// 화학물질 목록 조회
// ====================================================
export type ChemistryListRequest = {
  query?: string //검색어
  start_date?: string //시작일 YYYY-MM-DD
  end_date?: string //종료일 YYYY-MM-DD
}

export type ChemistryListResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getChemistryList = async (data?: ChemistryListRequest): Promise<ChemistryListResponse> => {
  const fd = new FormData()
  if (data?.query) fd.append("query", data.query)
  if (data?.start_date) fd.append("start_date", data.start_date)
  if (data?.end_date) fd.append("end_date", data.end_date)
  const res = await axiosInstance.post<ChemistryListResponse>("/posts/chemistry_list/", fd)
  return res.data
}

// ====================================================
// 화학물질 검색
// ====================================================
export type ChemistryInfoRequest = {
  query: string //검색어
  type: number //검색유형(0:화학물질명,1:CAS No)
}

export type ChemistryInfoResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getChemistryInfo = async (data: ChemistryInfoRequest): Promise<ChemistryInfoResponse> => {
  const fd = new FormData()
  fd.append("query", data.query)
  fd.append("type", String(data.type))
  const res = await axiosInstance.post<ChemistryInfoResponse>("/posts/chemistry_info/", fd)
  return res.data
}

// ====================================================
// 화학물질 목록 수정
// ====================================================
export type ManageRiskChemistryItem = {
  index: number //배열인덱스
  id: number //고유ID(생성:0,수정:기존고유ID)
  title: string //공정명
  product: string //제품명
  name: string //화학물질명
  exposure: string //노출수준
  harmfulness: string //유해성수준
}

export type ManageRiskChemistryRequest = {
  risk_id?: number //위험성평가고유ID
  data: ManageRiskChemistryItem[] //화학물질데이터배열
  files?: File[] //첨부이미지파일배열
}

export type ManageRiskChemistryResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const manageRiskChemistry = async (data: ManageRiskChemistryRequest): Promise<ManageRiskChemistryResponse> => {
  const fd = new FormData()
  if (data.risk_id !== undefined) fd.append("risk_id", String(data.risk_id))
  fd.append("data", JSON.stringify(data.data))
  if (data.files) {
    data.files.forEach((file, i) => fd.append(`file_${i}`, file))
  }
  const res = await axiosInstance.post<ManageRiskChemistryResponse>("/posts/manage_risk_chemistry/", fd)
  return res.data
}

// ====================================================
// 화학물질 목록 삭제
// ====================================================
export type DeleteChemistryRequest = {
  post_id: number[] //삭제할고유ID리스트
}

export type DeleteChemistryResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const deleteChemistry = async (data: DeleteChemistryRequest): Promise<DeleteChemistryResponse> => {
  const fd = new FormData()
  fd.append("post_id", JSON.stringify(data.post_id))
  const res = await axiosInstance.post<DeleteChemistryResponse>("/posts/delete_chemistry/", fd)
  return res.data
}

// ====================================================
// 화학물질 상세 등록/수정
// ====================================================
export type ManageChemistryRequest = {
  post_id: number //고유ID(생성:0,수정:기존고유ID)
  title: string //공정명
  product: string //제품명
  name: string //화학물질명
  cas_num: string //CAS No
  evaluation_date: string //평가일 YYYY-MM-DD
  check_result: string //특수건강검진결과(0:미실시,1:실시)
  check_work: string //작업환경측정(0:미실시,1:실시)
  type: string //물리적상태(0:고체/흄/분진,1:액체/기체/증기/미스트)
  ppm: string //측정값(ppm)
  mg: string //측정값(mg)
  division: string //물질구분(0:단일물질,1:혼합물)
  daily: string //일일취급량
  daily_unit: string //단위(0:kg,1:g,2:mg,3:L,4:ml)
  file?: File //첨부파일
  non_acidic: string //비산성값(0,1,2)
  temperature: string //작업온도
  boiling: string //끓는점
  state: string //밀폐환기상태(0:해당없음,1:원격제어/완전밀폐,2:국소배기)
  c_num: string //발암성값
  m_num: string //변이원성값
  r_num: string //생식독성값
  twa_ppm: string //노출기준(ppm)
  twa_mg: string //노출기준(mg)
  h_code: string //유해위험문구값
  h_level: string //유해위험문구수준(1,2,3등)
}

export type ManageChemistryResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const manageChemistry = async (data: ManageChemistryRequest): Promise<ManageChemistryResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  fd.append("title", data.title)
  fd.append("product", data.product)
  fd.append("name", data.name)
  fd.append("cas_num", data.cas_num)
  fd.append("evaluation_date", data.evaluation_date)
  fd.append("check_result", data.check_result)
  fd.append("check_work", data.check_work)
  fd.append("type", data.type)
  fd.append("ppm", data.ppm)
  fd.append("mg", data.mg)
  fd.append("division", data.division)
  fd.append("daily", data.daily)
  fd.append("daily_unit", data.daily_unit)
  if (data.file) fd.append("file", data.file)
  fd.append("non_acidic", data.non_acidic)
  fd.append("temperature", data.temperature)
  fd.append("boiling", data.boiling)
  fd.append("state", data.state)
  fd.append("c_num", data.c_num)
  fd.append("m_num", data.m_num)
  fd.append("r_num", data.r_num)
  fd.append("twa_ppm", data.twa_ppm)
  fd.append("twa_mg", data.twa_mg)
  fd.append("h_code", data.h_code)
  fd.append("h_level", data.h_level)
  const res = await axiosInstance.post<ManageChemistryResponse>("/posts/manage_chemistry/", fd)
  return res.data
}

// ====================================================
// 화학물질 상세 조회
// ====================================================
export type DetailChemistryRequest = {
  post_id: number //고유ID
}

export type DetailChemistryResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getDetailChemistry = async (data: DetailChemistryRequest): Promise<DetailChemistryResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<DetailChemistryResponse>("/posts/detail_chemistry/", fd)
  return res.data
}

// ====================================================
// 감소대책 조회
// ====================================================
export type DetailReductionChemistryRequest = {
  post_id: number //고유ID
}

export type DetailReductionChemistryResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getDetailReductionChemistry = async (data: DetailReductionChemistryRequest): Promise<DetailReductionChemistryResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<DetailReductionChemistryResponse>("/posts/detail_reduction_chemistry/", fd)
  return res.data
}

// ====================================================
// 감소대책 등록/수정
// ====================================================
export type ReductionChemistryRequest = {
  post_id: number //고유ID
  material: string //물질유해성(체크=1,미체크=0) "0,1,0"
  exposure: string //물질노출가능성(체크=1,미체크=0) "1,1,1,0,0,0,0"
  work: string //작업방법(체크=1,미체크=0) "0,0,0,0,0"
  management: string //관리적접근(체크=1,미체크=0) "0,0,0,0,0"
  contents: string //작업환경관리평가내용
  measures: string //작업환경개선대책
}

export type ReductionChemistryResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const reductionChemistry = async (data: ReductionChemistryRequest): Promise<ReductionChemistryResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  fd.append("material", data.material)
  fd.append("exposure", data.exposure)
  fd.append("work", data.work)
  fd.append("management", data.management)
  fd.append("contents", data.contents)
  fd.append("measures", data.measures)
  const res = await axiosInstance.post<ReductionChemistryResponse>("/posts/reduction_chemistry/", fd)
  return res.data
}
