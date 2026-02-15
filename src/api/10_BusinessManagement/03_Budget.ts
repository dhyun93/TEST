/**
 * 사업장관리 > 예산/목표 API
 */

import { axiosInstance } from "@/utils/axiosInterceptor"

// 안전보건 목표 및 추진계획 조회
export type BudgetPlanList_Request = {
  page?: number
  year: number //YYYY
}
export type BudgetPlanList_Post = {
  id: number
  business_id_id: number | string //???
  plan: string //목표/세부추진계획
  quarter1: number //1분기 1,0
  quarter2: number //2분기 1,0
  quarter3: number //3분기 1,0
  quarter4: number //4분기 1,0
  result: string //성과지표
  charge: string //담당부서
  rate: number //달성률%
  reason: string //실적/부진사유
  created_date: string //생성일 YYYY-MM-DD
  created_at: string //(작성일)수정일 YYYY-MM-DD
}
export type BudgetPlanList_Response = {
  code: number
  msg: string
  posts: BudgetPlanList_Post[]
  all_page_count: number
  all_count: number
}
export const getBudgetPlanList = async (data: BudgetPlanList_Request): Promise<BudgetPlanList_Response> => {
  const res = await axiosInstance.post<BudgetPlanList_Response>("/posts/safety_plan_list/", data)
  console.log("안전보건목표및추진계획조회:", res)
  return res.data
}


// 안전보건목표추진및계획 수정/등록
type BudgetPlanRegist_Request = {
  post_id: number
  plan: string
  quarter1: number
  quarter2: number
  quarter3: number
  quarter4: number
  result: string
  charge: string
  rate: number
  reason: string
  create_date: string //YYYY-MM-DD
}
type BudgetPlanRegist_Response = {
  msg: string
  code: number
}
export const mod_BudgetPlan = async (year: number, data: BudgetPlanRegist_Request[]) => {
  const formData = new FormData()
  formData.append("year", String(year))
  formData.append("data", JSON.stringify(data))

  const res = await axiosInstance.post<BudgetPlanRegist_Response>("/posts/manage_safety_plan/", formData)
  console.log("안전보건목표추진및계획수정/등록: ", res)
  return res.data
}

// ====================================================
// 📋 안전보건목표추진및계획 삭제
// ====================================================
export type BudgetPlanDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type BudgetPlanDelResponse = {
  code: number
  msg: string
}
export const getBudgetPlanDelete = async (data: BudgetPlanDelRequest): Promise<BudgetPlanDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<BudgetPlanDelResponse>("/posts/delete_safety_plan/", formData)
  console.log("안전보건목표추진및계획삭제:", res)
  return res.data
}

// 안전보건예산 조회
export type BudgetList_Request = {
  page?: number
  year: number //YYYY
}
export type BudgetList_Post = {
  id: number
  business_id_id: number | string //???
  title: string
  category: string
  budget_amount: number
  use_amount: number
  remain_amount: number
  is_carry_over: number //1,0
  files: string
  name: string
  create_date: string //yyyy-mm-dd //작성일(수정일)
  created_at: string //yyyy-mm-dd //생성일
}
export type BudgetList_Response = {
  code: number
  msg: string
  posts: BudgetList_Post[]
  all_page_count: number
  all_count: number
  total_budget: number //총예산
  total_use: number //집행액
  total_remain: number //잔액
}
export const getBudgetList = async (data: BudgetList_Request): Promise<BudgetList_Response> => {
  const res = await axiosInstance.post<BudgetList_Response>("/posts/budget_list/", data)
  console.log("안전보건예산조회:", res)
  return res.data
}

// 안전보건예산 수정/등록
export type BudgetRequest = {
  post_id: number //생성:0, 수정:고유ID
  title: string
  category: string
  budget_amount: number
  use_amount: number
  remain_amount: number
  is_carry_over: number //1,0
  name: string
  create_date: string //yyyy-mm-dd
  attachment?: File | string | null
}
type BudgetRegist_Response = {
  msg: string
  code: number
}
export const mod_Budget = async (year: number, budgets: BudgetRequest[]) => {
  const formData = new FormData()
  formData.append("year", String(year)) //yyyy
  const dataPayload = budgets.map((budget, index) => {
    const base: Record<string, any> = {
      index,
      post_id: budget.post_id ?? 0,
      title: budget.title ?? "",
      category: budget.category ?? "",
      budget_amount: budget.budget_amount ?? 0,
      use_amount: budget.use_amount ?? 0,
      remain_amount: budget.remain_amount ?? 0,
      is_carry_over: budget.is_carry_over ?? 0,
      name: budget.name ?? "",
      create_date: budget.create_date ?? "",
    }

    if (budget.attachment instanceof File) {
      const key = `file_${index}`
      formData.append(key, budget.attachment, budget.attachment.name)
      base.file_idx = key
    } else if (budget.attachment === null || budget.attachment === "") {
      base.file_idx = ""
    }

    return base
  })

  formData.append("data", JSON.stringify(dataPayload))

  const res = await axiosInstance.post<BudgetRegist_Response>("/posts/manage_budget/", formData)
  console.log("안전보건예산수정/등록: ", res)
  return res.data
}

// 안전보건예산 삭제
export type BudgetDelRequest = {
  post_id: number[] //포스트고유ID 리스트
}
export type BudgetDelResponse = {
  code: number
  msg: string
}
export const getBudgetDelete = async (data: BudgetDelRequest): Promise<BudgetDelResponse> => {
  const formData = new FormData()
  formData.append("post_id", JSON.stringify(data.post_id))

  const res = await axiosInstance.post<BudgetDelResponse>("/posts/delete_budget/", formData)
  console.log("안전보건예산삭제:", res)
  return res.data
}

// 이월여부 체크/해제
export type BudgetCheckRequest = {
  post_id: number //예산고유ID
}

export type BudgetCheckResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const budgetCheck = async (data: BudgetCheckRequest): Promise<BudgetCheckResponse> => {
  const fd = new FormData()
  fd.append("post_id", String(data.post_id))
  const res = await axiosInstance.post<BudgetCheckResponse>("/posts/budget_check/", fd)
  return res.data
}
