// QR 관리 API

import { axiosInstance } from "@/utils/axiosInterceptor"

// QR 코드 조회
export type QrListRequest = {
  type: number //유형(0:TBM,1:아차사고,2:안전교육,3:자산관리,4:안전작업허가서,5:도급협의체관리,6:위험성평가)
  post_id: number //포스트고유ID
}

export type QrListResponse = {
  code: number //응답코드
  msg: string //응답메시지
}

export const getQrList = async (data: QrListRequest): Promise<QrListResponse> => {
  const res = await axiosInstance.get<QrListResponse>("/posts/qr_list/", {
    params: {
      type: data.type,
      post_id: data.post_id,
    },
  })
  return res.data
}
