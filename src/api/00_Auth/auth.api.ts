/**
 * Auth 수정
 */

import { axiosInstance } from "@/utils/axiosInterceptor"
import { useAuthStore } from "@/stores/authUserStore"
import { AUTH_STORAGE_KEY, LOGOUT_ALERT_KEY } from "@/constants/auth"

// ====================================================
// 로그인
// ====================================================
type LoginRequest = {
  username: string
  password: string
}

type LoginResponse = {
  code: number // 200=성공, 그 외 실패
  msg: string

  // 성공 시만 내려올 수 있으므로 옵셔널 처리
  token?: string
  userid?: number
  username?: string
  company_name?: string
  is_admin?: boolean
  user_account?: string
  is_level?: number
}

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const form = new URLSearchParams()
  form.append("username", payload.username)
  form.append("password", payload.password)

  const res = await axiosInstance.post<LoginResponse>("/users/user_login/", form)

  const data = res.data

  if (data.code === 200 && data.token) {
    const { setTokens, setUser } = useAuthStore.getState()
    setTokens(data.token)
    const userInfo = {
      userid: data.userid!,
      username: data.username!,
      company_name: data.company_name!,
      is_admin: data.is_admin!,
      user_account: data.user_account!,
      is_level: data.is_level!,
    }
    setUser(userInfo)
    console.log("[auth] logged in user:", userInfo)
  }

  return data
}

// ====================================================
// 로그아웃
// ====================================================
export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.get("/users/logout/")
  } catch {
    // API 실패해도 로컬 로그아웃 진행
  }

  // 1. zustand 메모리 상태 초기화 (persist가 빈 상태를 저장하려고 시도)
  const { logout: clearAuth } = useAuthStore.getState()
  clearAuth()

  // 2. localStorage에서 인증 데이터 직접 삭제 (persist가 다시 저장해도 여기서 삭제)
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.setItem(LOGOUT_ALERT_KEY, "1")

  // 3. 로그인 페이지로 이동 (replace로 히스토리 대체하여 뒤로가기 방지)
  window.location.replace("/login")
}

// ====================================================
// 비밀번호 확인
// ====================================================
export type CheckPasswordRequest = {
  password: string //패스워드
}

export type CheckPasswordResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const checkPassword = async (data: CheckPasswordRequest): Promise<CheckPasswordResponse> => {
  const fd = new FormData()
  fd.append("password", data.password)
  const res = await axiosInstance.post<CheckPasswordResponse>("/users/check_password/", fd)
  return res.data
}

// ====================================================
// 비밀번호 변경
// ====================================================
export type SetMyPasswordRequest = {
  password: string //기존비밀번호
  new_password: string //새로운비밀번호
}

export type SetMyPasswordResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setMyPassword = async (data: SetMyPasswordRequest): Promise<SetMyPasswordResponse> => {
  const fd = new FormData()
  fd.append("password", data.password)
  fd.append("new_password", data.new_password)
  const res = await axiosInstance.post<SetMyPasswordResponse>("/users/set_my_password/", fd)
  return res.data
}

// ====================================================
// 이메일 변경
// ====================================================
export type SetMyEmailRequest = {
  email: string //이메일
}

export type SetMyEmailResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setMyEmail = async (data: SetMyEmailRequest): Promise<SetMyEmailResponse> => {
  const fd = new FormData()
  fd.append("email", data.email)
  const res = await axiosInstance.post<SetMyEmailResponse>("/users/set_my_email/", fd)
  return res.data
}

// ====================================================
// 휴대전화번호 변경
// ====================================================
export type SetPhoneRequest = {
  phone: string //전화번호
}

export type SetPhoneResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const setPhone = async (data: SetPhoneRequest): Promise<SetPhoneResponse> => {
  const fd = new FormData()
  fd.append("phone", data.phone)
  const res = await axiosInstance.post<SetPhoneResponse>("/users/set_phone/", fd)
  return res.data
}

// ====================================================
// 전자서명 등록
// ====================================================
export type ManageMySealRequest = {
  seal: File //서명파일
}

export type ManageMySealResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const manageMySeal = async (data: ManageMySealRequest): Promise<ManageMySealResponse> => {
  const fd = new FormData()
  fd.append("seal", data.seal)
  const res = await axiosInstance.post<ManageMySealResponse>("/users/manage_my_seal/", fd)
  return res.data
}

// ====================================================
// 마이페이지 수정
// ====================================================
export type ManageMyRequest = {
  password: string //기존비밀번호
  phone: string //핸드폰번호
  email: string //이메일
  seal?: File //서명파일
  new_password?: string //새로운비밀번호(선택)
}

export type ManageMyResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const manageMy = async (data: ManageMyRequest): Promise<ManageMyResponse> => {
  const fd = new FormData()
  fd.append("password", data.password)
  fd.append("phone", data.phone)
  fd.append("email", data.email)
  if (data.seal) fd.append("seal", data.seal)
  if (data.new_password) fd.append("new_password", data.new_password)
  const res = await axiosInstance.post<ManageMyResponse>("/users/manage_my/", fd)
  return res.data
}

// ====================================================
// 마이페이지 기본 정보 조회
// ====================================================
export type MyInfoRequest = {
  page: number //페이지번호
  start_date?: string //시작일 YYYY-MM-DD
  end_date?: string //종료일 YYYY-MM-DD
  query?: string //검색어
}

export type MyInfoResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getMyInfo = async (data: MyInfoRequest): Promise<MyInfoResponse> => {
  const fd = new FormData()
  fd.append("page", String(data.page))
  if (data.start_date) fd.append("start_date", data.start_date)
  if (data.end_date) fd.append("end_date", data.end_date)
  if (data.query) fd.append("query", data.query)
  const res = await axiosInstance.post<MyInfoResponse>("/users/my_info/", fd)
  return res.data
}

// ====================================================
// 회사 리스트 조회 (앱가입시)
// ====================================================
export type BusinessListRequest = {
  code: string //회사코드
}

export type BusinessListResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getBusinessList = async (data: BusinessListRequest): Promise<BusinessListResponse> => {
  const fd = new FormData()
  fd.append("code", data.code)
  const res = await axiosInstance.post<BusinessListResponse>("/users/business_list/", fd)
  return res.data
}

// ====================================================
// 휴대폰번호 인증
// ====================================================
export type SignupRequest = {
  phone: string //전화번호
}

export type SignupResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const fd = new FormData()
  fd.append("phone", data.phone)
  const res = await axiosInstance.post<SignupResponse>("/users/signup/", fd)
  return res.data
}

// ====================================================
// 최종가입등록
// ====================================================
export type UserCertificationRequest = {
  phone: string //전화번호
  business_id: number //회사고유ID
  name: string //이름
  email: string //이메일
  seal?: File //서명파일
}

export type UserCertificationResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const userCertification = async (data: UserCertificationRequest): Promise<UserCertificationResponse> => {
  const fd = new FormData()
  fd.append("phone", data.phone)
  fd.append("business_id", String(data.business_id))
  fd.append("name", data.name)
  fd.append("email", data.email)
  if (data.seal) fd.append("seal", data.seal)
  const res = await axiosInstance.post<UserCertificationResponse>("/users/user_certification/", fd)
  return res.data
}
