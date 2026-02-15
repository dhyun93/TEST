/**
 * 도메인별 DTO (Data Transfer Object) 타입 정의
 */

import type { ApprovalStatus, Attachment, DateRange } from "./api"

// ============================================================================
// TBM (Tool Box Meeting) 관련 DTO
// ============================================================================

export interface TbmListDto {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendeeCount: number
  status: "scheduled" | "completed" | "cancelled"
  createdBy: string
  createdAt: string
}

export interface TbmDetailDto extends TbmListDto {
  description: string
  attendees: AttendeeDto[]
  attachments: Attachment[]
  notes?: string
}

export interface TbmCreateDto {
  title: string
  date: string
  time: string
  location: string
  description: string
  attendees: string[]
}

export interface AttendeeDto {
  id: string
  name: string
  department: string
  position: string
  signatureUrl?: string
  signedAt?: string
}

// ============================================================================
// 점검 (Inspection) 관련 DTO
// ============================================================================

export interface InspectionPlanDto {
  id: string
  title: string
  type: string
  cycle: InspectionCycle
  inspector: string
  targetDate: string
  status: "scheduled" | "in_progress" | "completed" | "overdue"
  createdAt: string
}

export interface InspectionDetailDto extends InspectionPlanDto {
  description: string
  checklist: ChecklistItemDto[]
  location: string
  notes?: string
}

export interface ChecklistItemDto {
  id: string
  category: string
  item: string
  standard: string
  result?: "pass" | "fail" | "na"
  note?: string
  photoUrl?: string
}

export type InspectionCycle = "daily" | "weekly" | "monthly" | "quarterly" | "semi-annual" | "annual"

export interface InspectionResultDto {
  inspectionId: string
  inspectedBy: string
  inspectedAt: string
  items: ChecklistItemDto[]
  overallResult: "pass" | "fail"
  notes?: string
  signatureUrl?: string
}

// ============================================================================
// 위험성 평가 (Risk Assessment) 관련 DTO
// ============================================================================

export interface RiskAssessmentDto {
  id: string
  title: string
  process: string
  department: string
  assessor: string
  assessmentDate: string
  status: "draft" | "in_review" | "approved" | "rejected"
  approvalStatus?: ApprovalStatus
  createdAt: string
}

export interface RiskItemDto {
  id: string
  hazard: string
  risk: string
  frequency: number
  severity: number
  riskLevel: "low" | "medium" | "high" | "critical"
  currentControls: string[]
  additionalControls?: string[]
  residualRisk?: number
}

export interface RiskAssessmentDetailDto extends RiskAssessmentDto {
  description: string
  items: RiskItemDto[]
  attachments: Attachment[]
}

// ============================================================================
// 안전 교육 (Safety Education) 관련 DTO
// ============================================================================

export interface SafetyEducationDto {
  id: string
  title: string
  type: EducationType
  instructor: string
  date: string
  duration: number // 분
  location: string
  targetAudience: string
  attendeeCount: number
  status: "scheduled" | "completed" | "cancelled"
  createdAt: string
}

export type EducationType =
  | "orientation" // 채용 시
  | "regular" // 정기 교육
  | "special" // 특별 교육
  | "manager" // 관리감독자
  | "construction" // 건설업 기초안전

export interface EducationDetailDto extends SafetyEducationDto {
  description: string
  curriculum: string[]
  attendees: AttendeeDto[]
  materials: Attachment[]
  certificate?: string
}

export interface EducationCertificateDto {
  certificateId: string
  educationId: string
  educationTitle: string
  attendeeName: string
  attendeeId: string
  completedDate: string
  duration: number
  instructor: string
  certificateUrl: string
}

// ============================================================================
// 아차사고/안전제안 (Near Miss / Safety Voice) 관련 DTO
// ============================================================================

export interface NearMissDto {
  id: string
  title: string
  type: "near_miss" | "safety_voice"
  reporter: string
  reportDate: string
  location: string
  severity: "low" | "medium" | "high"
  status: "submitted" | "under_review" | "action_taken" | "closed"
  createdAt: string
}

export interface NearMissDetailDto extends NearMissDto {
  description: string
  hazardCategory: string
  potentialConsequence: string
  photos: string[]
  actionTaken?: string
  preventiveMeasures?: string[]
  assignedTo?: string
  completedAt?: string
}

// ============================================================================
// 자산 관리 (Asset Management) 관련 DTO
// ============================================================================

export interface MachineAssetDto {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  purchaseDate: string
  location: string
  status: "active" | "maintenance" | "inactive" | "disposed"
  lastInspectionDate?: string
  nextInspectionDate?: string
}

export interface HazardousMaterialDto {
  id: string
  name: string
  casNumber?: string
  category: string
  quantity: number
  unit: string
  location: string
  msdsUrl?: string
  expiryDate?: string
  lastUpdated: string
}

// ============================================================================
// 협력업체 관리 (Supply Chain) 관련 DTO
// ============================================================================

export interface PartnerDto {
  id: string
  name: string
  businessNumber: string
  representative: string
  contact: string
  email: string
  address: string
  contractStartDate: string
  contractEndDate: string
  status: "active" | "inactive" | "suspended"
  safetyRating?: number
}

export interface PartnerEvaluationDto {
  id: string
  partnerId: string
  partnerName: string
  evaluationDate: string
  evaluator: string
  category: string
  score: number
  maxScore: number
  rating: "excellent" | "good" | "fair" | "poor"
  comments?: string
}

// ============================================================================
// 공지사항/게시판 (Notice Board) 관련 DTO
// ============================================================================

export interface NoticeDto {
  id: string
  title: string
  category: NoticeCategory
  author: string
  publishDate: string
  isPinned: boolean
  viewCount: number
  hasAttachments: boolean
}

export type NoticeCategory =
  | "announcement" // 공지사항
  | "safety" // 안전
  | "regulation" // 규정
  | "education" // 교육

export interface NoticeDetailDto extends NoticeDto {
  content: string
  attachments: Attachment[]
}

// ============================================================================
// 결재 (Approval) 관련 DTO
// ============================================================================

export interface ApprovalRequestDto {
  id: string
  documentType: string
  documentId: string
  title: string
  requester: string
  requestDate: string
  status: ApprovalStatus
  currentApprover?: string
  urgency: "normal" | "urgent"
}

export interface ApprovalDetailDto extends ApprovalRequestDto {
  content: string
  approvalLine: ApprovalLineItemDto[]
  attachments: Attachment[]
  comments: ApprovalCommentDto[]
}

export interface ApprovalLineItemDto {
  order: number
  approver: string
  position: string
  status: ApprovalStatus
  approvedAt?: string
  comment?: string
}

export interface ApprovalCommentDto {
  id: string
  author: string
  content: string
  createdAt: string
}

// ============================================================================
// 대시보드 (Dashboard) 관련 DTO
// ============================================================================

export interface DashboardStatsDto {
  totalInspections: number
  completedInspections: number
  pendingApprovals: number
  recentIncidents: number
  upcomingEducations: number
  overdueInspections: number
}

export interface DashboardChartDataDto {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
  }[]
}

// ============================================================================
// QR 관리 관련 DTO
// ============================================================================

export interface QrCodeDto {
  id: string
  type: "inspection" | "tbm" | "nearmiss" | "education"
  targetId: string
  targetName: string
  qrCodeUrl: string
  publicUrl: string
  createdBy: string
  createdAt: string
  expiryDate?: string
}

// ============================================================================
// 조직 관리 (Organization) 관련 DTO
// ============================================================================

export interface DepartmentDto {
  id: string
  name: string
  parentId?: string
  managerId?: string
  managerName?: string
  employeeCount: number
}

export interface OrganizationTreeDto extends DepartmentDto {
  children: OrganizationTreeDto[]
}

export interface EmployeeDto {
  id: string
  name: string
  employeeNumber: string
  department: string
  position: string
  email: string
  phone: string
  hireDate: string
  status: "active" | "inactive" | "leave"
}

// ============================================================================
// 검색 관련 DTO
// ============================================================================

export interface SearchRequestDto {
  keyword?: string
  category?: string
  dateRange?: DateRange
  status?: string
  page?: number
  limit?: number
}
