export interface QRItem {
  id: number
  qrName: string
  desc: string
  path: string
  useStatus: boolean
}

export const QR_ITEMS: QRItem[] = [
  { id: 1, qrName: "근로자 앱 설치 QR", desc: "안드로이드/iOS 다운로드 링크", path: "/app/download", useStatus: true },
  { id: 2, qrName: "관리자 페이지 접속 QR", desc: "관리자용 웹페이지 링크", path: "/admin", useStatus: true },
  { id: 3, qrName: "관리자 사용 가이드 QR", desc: "관리자용 사용 설명서", path: "/guide/admin", useStatus: true },
]

export const getQRUrl = (path: string) => `${window.location.origin}${path}`
