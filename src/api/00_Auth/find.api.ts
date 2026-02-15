/**
 * 아이디/비밀번호찾기 API
 */

import axios from "axios"
import { env } from "@/config/env"

type FindPasswordRequest = {
  phone: string
  username: string
}

type FindIdRequest = {
  phone: string
  name: string
}

export type FindPasswordResponse = {
  msg: string
  code: number
}

const axiosNoAuth = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
})

// ====================================================
// 📋 비밀번호 찾기 (토큰 없이)
// ====================================================
export const findPassword = async (payload: FindPasswordRequest): Promise<FindPasswordResponse> => {
  const formData = new FormData()
  formData.append("phone", payload.phone)
  formData.append("username", payload.username)

  const res = await axiosNoAuth.post<FindPasswordResponse>("/users/find_password/", formData)
  return res.data
}

// ====================================================
// 📋 아이디 찾기 (토큰 없이)
// ====================================================
export const findId = async (payload: FindIdRequest): Promise<FindPasswordResponse> => {
  const formData = new FormData()
  formData.append("phone", payload.phone)
  formData.append("name", payload.name)

  const res = await axiosNoAuth.post<FindPasswordResponse>("/users/find_username/", formData)
  return res.data
}
