// PTW List 타입 정의

export interface PTWGroupItem {
  id: number
  ptwName: string
  createdAt: string
  registrant: string
  updatedAt: string
}

export interface WorkPermitItem {
  id: number
  workName: string
  workDate: string
  workLocation: string
  workPersonnel: string
  workType: string
  applicant: string
  applicationDate: string
  signatureStatus: { text: string; color: string }
  sitePhotos: string[]
  fileAttach: boolean
}

export interface JSAItem {
  id: number
  jsaNo: string
  workName: string
  workDate: string
  team: string
  applicationDate: string
  sitePhotos: string[]
  fileAttach: boolean
}

export interface SiteEvaluationItem {
  id: number
  workTeam: string
  workerName: string
  workDate: string
  author: string
  signatureStatus: { text: string; color: string }
  sitePhotos: string[]
  fileAttach: boolean
}

export interface TBMItem {
  id: number
  processName: string
  meetingDate: string
  meetingTime: string
  manager: string
  participants: string
  sitePhotos: string[]
  fileAttach: boolean
}