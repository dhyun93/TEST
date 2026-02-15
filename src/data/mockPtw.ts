// PTW 임시 데이터
import type { PTWGroupItem, WorkPermitItem, JSAItem, SiteEvaluationItem, TBMItem } from "@/types/ptw"

export const ptwGroupMockData: PTWGroupItem[] = [
  { id: 1, ptwName: "슬래그공장 철골 용접작업", createdAt: "2026-01-15", registrant: "김안전", updatedAt: "2026-01-20" },
  { id: 2, ptwName: "야적장 크레인 인양작업", createdAt: "2026-01-10", registrant: "박관리", updatedAt: "2026-01-18" },
  { id: 3, ptwName: "보일러실 배관 교체작업", createdAt: "2026-01-08", registrant: "이점검", updatedAt: "2026-01-15" },
]

export const workPermitMockData: WorkPermitItem[] = [
  { id: 1, workName: "철골 용접 및 보수작업", workDate: "2026-01-20", workLocation: "슬래그공장 2층", workPersonnel: "3명", workType: "화기작업", applicant: "홍길동", applicationDate: "2026-01-18", signatureStatus: { text: "2/4", color: "orange" }, sitePhotos: [], fileAttach: false },
  { id: 2, workName: "크레인 자재 인양작업", workDate: "2026-01-19", workLocation: "야적장", workPersonnel: "5명", workType: "중장비", applicant: "김철수", applicationDate: "2026-01-17", signatureStatus: { text: "4/4", color: "blue" }, sitePhotos: ["/images/photo1.jpg"], fileAttach: true },
  { id: 3, workName: "배관 교체 및 용접작업", workDate: "2026-01-18", workLocation: "보일러실", workPersonnel: "4명", workType: "LOTOTO", applicant: "박민수", applicationDate: "2026-01-16", signatureStatus: { text: "0/4", color: "red" }, sitePhotos: [], fileAttach: false },
]

export const jsaMockData: JSAItem[] = [
  { id: 1, jsaNo: "JSA-2026-001", workName: "고소 용접작업", workDate: "2026-01-20", team: "정비1팀", applicationDate: "2026-01-18", sitePhotos: [], fileAttach: false },
  { id: 2, jsaNo: "JSA-2026-002", workName: "밀폐공간 청소작업", workDate: "2026-01-19", team: "설비팀", applicationDate: "2026-01-17", sitePhotos: ["/images/photo2.jpg"], fileAttach: true },
  { id: 3, jsaNo: "JSA-2026-003", workName: "전기배선 교체", workDate: "2026-01-18", team: "전기팀", applicationDate: "2026-01-16", sitePhotos: [], fileAttach: false },
]

export const siteEvaluationMockData: SiteEvaluationItem[] = [
  { id: 1, workTeam: "정비1팀", workerName: "홍길동", workDate: "2026-01-20", author: "김안전", signatureStatus: { text: "완료", color: "blue" }, sitePhotos: ["/images/photo1.jpg"], fileAttach: false },
  { id: 2, workTeam: "설비팀", workerName: "김철수", workDate: "2026-01-19", author: "박관리", signatureStatus: { text: "미완료", color: "red" }, sitePhotos: [], fileAttach: true },
  { id: 3, workTeam: "전기팀", workerName: "박민수", workDate: "2026-01-18", author: "이점검", signatureStatus: { text: "완료", color: "blue" }, sitePhotos: [], fileAttach: false },
]

export const tbmMockData: TBMItem[] = [
  { id: 1, processName: "슬래그 파쇄공정 정비작업", meetingDate: "2026-01-20", meetingTime: "08:00", manager: "김안전", participants: "6명", sitePhotos: [], fileAttach: false },
  { id: 2, processName: "보일러 정비공정", meetingDate: "2026-01-19", meetingTime: "07:30", manager: "박관리", participants: "8명", sitePhotos: ["/images/photo3.jpg"], fileAttach: true },
  { id: 3, processName: "전기실 점검 및 배선 교체", meetingDate: "2026-01-18", meetingTime: "08:30", manager: "이점검", participants: "4명", sitePhotos: [], fileAttach: false },
]