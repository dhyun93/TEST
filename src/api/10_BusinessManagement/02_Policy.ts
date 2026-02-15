/**
 * 사업장관리 > 경영방침 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// ====================================================
// 📋 경영방침 조회
// ====================================================
export type Policy_Request = {
  year?: string //YYYY
}
export type Policy_Post = {
  id: number
  business_id_id: number | string
  title: string //방침목표명
  contents: string //내용 응답예: "(주)***은 경영활동 전반에 전 사원의 안전과 보건을 기업의 최우선 가치로 인식하고,\n법규 및 기준을 준수하는 안전보건관리체계를 구축하여 전 직원이 안전하고 쾌적한 환경에서 근무할 수 있도록 최선을 다한다.\n이를 위해 다음과 같은 안전보건활동을 통해 지속적으로 안전보건환경을 개선한다.\n1. 경영책임자는 ‘근로자의 생명 보호’와 ‘안전한 작업환경 조성’을 기업경영활동의 최우선 목표로 삼는다.\n2. 경영책임자는 사업장에 안전보건관리체계를 구축하여 사업장의 위험요인 제거·통제를 위한 충분한 인적·물적 자원을 제공한다.\n3. 안전보건 목표를 설정하고, 이를 달성하기 위한 세부적인 실행계획을 수립하여 이행한다.\n4. 안전보건 관계 법령 및 관련 규정을 준수하는 내부규정을 수립하여 충실히 이행한다.\n5. 근로자의 참여를 통해 위험요인을 파악하고, 파악된 위험요인은 반드시 개선하고, 교육을 통해 공유한다.\n6. 모든 구성원이 자신의 직무와 관련된 위험요인을 알도록 하고, 위험요인 제거·대체 및 통제기법에 관해 교육·훈련을 실시한다.\n7. 모든 공급자와 계약자가 우리의 안전보건 방침과 안전 요구사항을 준수하도록 한다.\n8. 모든 구성원은 안전보건활동에 대한 책임과 의무를 성실히 준수토록 한다."
  seal: string //경영방침업로드파일
  year: number //YYYY
  created_at: string //YYYY-MM-DD
}
export type Policy_Response = {
  code: number
  msg: string
  posts: [Policy_Post]
}
export const get_policy = async (data: Policy_Request): Promise<Policy_Response> => {
  const res = await axiosInstance.post<Policy_Response>("/posts/safety_health_list/", data)
  console.log("경영방침조회:", res)
  return res.data
}

// ====================================================
// 📋 경영방침 목록 삭제
// ====================================================
export type PolicyDelRequest = {
  year: number //포스트고유ID 리스트
}
export type PolicyDelResponse = {
  code: number
  msg: string
}
export const getPolicyDelete = async (data: PolicyDelRequest): Promise<PolicyDelResponse> => {
  const formData = new FormData()
  formData.append("year", String(data.year))

  const res = await axiosInstance.post<PolicyDelResponse>("/posts/delete_safety_health/", formData)
  console.log("경영방침삭제:", res)
  return res.data
}

// ====================================================
// 📋 경영방침 수정
// ====================================================
type PolicyRegist_Request = {
  year: number
  title: string
  contents: string
  seal?: File
}
type PolicyRegist_Response = {
  msg: string
  code: number
}

export const regist_Policy = async (data: PolicyRegist_Request): Promise<PolicyRegist_Response> => {
  const fd = new FormData()

  // 기본 필드들
  fd.append("year", String(data.year))
  fd.append("title", data.title)
  fd.append("contents", data.contents)

  // 파일
  if (data.seal) fd.append("seal", data.seal, data.seal.name)

  const res = await axiosInstance.post<PolicyRegist_Response>("/posts/manage_safety_health/", fd)
  console.log("경영방침 수정:", res)
  return res.data
}
