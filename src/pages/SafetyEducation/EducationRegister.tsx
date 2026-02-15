"use client"
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Button from "@/components/common/base/Button"
import CustomSelect from "@/components/common/base/CustomSelect"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import ToggleSwitch from "@/components/common/base/ToggleSwitch"
import PageTitle from "@/components/common/base/PageTitle"
import AttendeePanel from "@/components/snippet/AttendeePanel"
import LoadListDialog from "@/components/dialog/LoadListDialog"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import { X } from "lucide-react"
import useForm, { ValidationRules } from "@/hooks/useForm"
import useApproval from "@/hooks/useApproval"
import { getEducationDetail, getEducationRegist, EducationDetailPost } from "@/api/03_SafetyEducation/education.api"
import { getList as getRiskAssessmentList, RiskAssessment_Post } from "@/api/02_RiskAssessment/riskAssessment.api"
import {
  EDUCATION_ALARM_TIME_OPTIONS,
  EDUCATION_CATEGORY_COURSE_MAP,
  EDUCATION_COURSE_DETAIL_OPTIONS,
  EDUCATION_COURSE_OPTIONS,
  EDUCATION_METHOD_OPTIONS,
  EDUCATION_TARGET_OPTIONS,
} from "@/constants/options/education"
import { getFileNameFromUrl } from "@/utils/file"
import { formatPhoneNumber } from "@/utils/phone"
import { useAlerts } from "@/hooks/useAlerts"
import { useLoadingStore } from "@/stores/loadingStore"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

interface NotificationTarget {
  name: string
  phone: string
  group?: string
}

interface ExistingFile {
  id: number
  url: string
  name?: string
}

const riskEvaluationTemplates = ["건설기계_2025-03-30", "물리적인자_2025-03-30", "터널 공사_2025-03-30", "기타_2025-03-30", "크레인 작업_2025-03-30"]

interface EducationFormState {
  category: string // 교육대상 (training_target)
  course: string // 교육과정 (type)
  eduName: string // 교육명 (title)
  startDate: string // 교육시작일 (training_start)
  endDate: string // 교육종료일 (training_end)
  startHour: string // 시작시간 시 (start_time)
  startMinute: string // 시작시간 분
  endHour: string // 종료시간 시 (end_time)
  endMinute: string // 종료시간 분
  educationMethod: string // 교육방식 (category)
  assigner: string // 교육담당자 (name)
  trainer: string // 외부강사 (teacher)
  eduMaterial: string // 교육자료
  sitePhotos: string // 현장사진
  fileUpload: string // 첨부파일
  note: string // 비고 (memo)
  notifyWhen: string // 알림 발송시점 (alarm_time)
  linkedRiskAssessmentId: string // 위험성평가 ID
  linkedRiskAssessmentTitle: string // 위험성평가명
}

// 옵션 헬퍼 함수
type OptionWithId = { value: string; label: string; id?: number }
const educationCourseOptions: ReadonlyArray<OptionWithId> = EDUCATION_COURSE_OPTIONS
const educationTargetOptions: ReadonlyArray<OptionWithId> = EDUCATION_TARGET_OPTIONS

const getOptionIdByValue = (options: ReadonlyArray<OptionWithId>, value: string) => options.find(opt => opt.value === value)?.id
const getOptionLabelById = (options: ReadonlyArray<OptionWithId>, id: number) => options.find(opt => opt.id === id)?.label || ""
const toNumberId = (value: number | string | null | undefined) => {
  if (typeof value === "number") return value
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const getCourseLabelById = (id: number) => EDUCATION_COURSE_DETAIL_OPTIONS.find(option => option.id === id)?.label || ""

const ALARM_TIME_MAP: Record<string, number> = Object.fromEntries(EDUCATION_ALARM_TIME_OPTIONS.map(option => [option.label, option.id]))
const ALARM_TIME_REVERSE_MAP: Record<number, string> = Object.fromEntries(EDUCATION_ALARM_TIME_OPTIONS.map(option => [option.id, option.label]))

export default function EducationRegister() {
  const { alertRequiredFields } = useAlerts()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = location.state?.mode === "edit"
  const postId = location.state?.postId as number | undefined

  const { setLoading } = useLoadingStore()
  const [notificationTargets, setNotificationTargets] = useState<NotificationTarget[]>([])
  const [notify, setNotify] = useState(true)
  const [riskModalOpen, setRiskModalOpen] = useState(false)
  const [riskYear, setRiskYear] = useState(new Date().getFullYear().toString())
  const [riskItems, setRiskItems] = useState<RiskAssessment_Post[]>([])
  const [riskPage, setRiskPage] = useState(1)
  const [riskTotalPages, setRiskTotalPages] = useState(1)
  const initialSnapshotRef = useRef<string | null>(null)

  // 기존 파일 ID 관리 (수정 시 유지할 파일들)
  const [existingPhotos, setExistingPhotos] = useState<ExistingFile[]>([])
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [existingEduData, setExistingEduData] = useState<ExistingFile[]>([])

  // 새로 추가할 파일들
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newEduDataFiles, setNewEduDataFiles] = useState<File[]>([])

  const [formData, setFormData] = useState<EducationFormState>({
    category: "",
    course: "",
    eduName: "",
    startDate: "",
    endDate: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    educationMethod: "",
    assigner: "",
    trainer: "",
    eduMaterial: "",
    sitePhotos: "",
    fileUpload: "",
    note: "",
    notifyWhen: "1주일 전",
    linkedRiskAssessmentId: "",
    linkedRiskAssessmentTitle: "",
  })

  const formatDate = (year: number, month: number, day: number) => {
    const y = String(year)
    const m = String(month).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const getYearRange = (yearValue: string) => {
    const year = Number(yearValue) || new Date().getFullYear()
    const endDay = new Date(year, 12, 0).getDate()
    return {
      start_date: formatDate(year, 1, 1),
      end_date: formatDate(year, 12, endDay),
    }
  }

  const fetchRiskAssessmentList = async (yearValue: string, pageValue: number) => {
    if (USE_MOCK_DATA) return
    try {
      const { start_date, end_date } = getYearRange(yearValue)
      const response = await getRiskAssessmentList({ page: pageValue, start_date, end_date })
      if (response.code === 200) {
        setRiskItems(response.posts || [])
        setRiskTotalPages(response.all_page_count || 1)
      }
    } catch (error) {
      console.error("위험성평가 목록 조회 실패:", error)
    }
  }

  useEffect(() => {
    if (!riskModalOpen) return
    fetchRiskAssessmentList(riskYear, riskPage)
  }, [riskModalOpen, riskYear, riskPage])

  useEffect(() => {
    setRiskPage(1)
  }, [riskYear])

  useEffect(() => {
    if (USE_MOCK_DATA) return
    if (!formData.linkedRiskAssessmentId || formData.linkedRiskAssessmentTitle) return
    const yearFromDate = formData.startDate?.slice(0, 4)
    const targetYear = yearFromDate || riskYear
    if (yearFromDate && yearFromDate !== riskYear) setRiskYear(yearFromDate)
    fetchRiskAssessmentList(targetYear, 1)
  }, [formData.linkedRiskAssessmentId, formData.linkedRiskAssessmentTitle, formData.startDate, riskYear])

  const riskAssessmentOptions = USE_MOCK_DATA
    ? riskEvaluationTemplates.map(template => ({ id: template, name: template }))
    : riskItems.map(item => ({
        id: String(item.id),
        name: item.title || "-",
        registeredAt: item.created_at?.slice(0, 10) || "",
      }))

  useEffect(() => {
    if (!formData.linkedRiskAssessmentId || formData.linkedRiskAssessmentTitle) return
    const matched = riskAssessmentOptions.find(option => String(option.id) === String(formData.linkedRiskAssessmentId))
    if (matched?.name) {
      setFormData(prev => ({ ...prev, linkedRiskAssessmentTitle: matched.name || "" }))
    }
  }, [riskAssessmentOptions, formData.linkedRiskAssessmentId, formData.linkedRiskAssessmentTitle])

  const normalizeTargets = (targets: NotificationTarget[]) =>
    targets
      .map(t => ({ name: t.name.trim(), phone: t.phone.trim() }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.phone.localeCompare(b.phone))

  const createSnapshot = (payload: {
    formData: EducationFormState
    notify: boolean
    notificationTargets: NotificationTarget[]
    existingPhotos: ExistingFile[]
    existingFiles: ExistingFile[]
    existingEduData: ExistingFile[]
    newPhotoFiles: File[]
    newFiles: File[]
    newEduDataFiles: File[]
  }) => {
    const sortedIds = (items: ExistingFile[]) => items.map(item => item.id).filter((id): id is number => typeof id === "number").sort((a, b) => a - b)
    const sortedNames = (files: File[]) => files.map(file => file.name).sort()
    const sortedTargets = normalizeTargets(payload.notificationTargets)

    const snapshot = {
      formData: {
        category: payload.formData.category,
        course: payload.formData.course,
        eduName: payload.formData.eduName,
        startDate: payload.formData.startDate,
        endDate: payload.formData.endDate,
        startHour: payload.formData.startHour,
        startMinute: payload.formData.startMinute,
        endHour: payload.formData.endHour,
        endMinute: payload.formData.endMinute,
        educationMethod: payload.formData.educationMethod,
        assigner: payload.formData.assigner,
        trainer: payload.formData.trainer,
        eduMaterial: payload.formData.eduMaterial,
        sitePhotos: payload.formData.sitePhotos,
        fileUpload: payload.formData.fileUpload,
        note: payload.formData.note,
        notifyWhen: payload.formData.notifyWhen,
        linkedRiskAssessmentId: payload.formData.linkedRiskAssessmentId,
        linkedRiskAssessmentTitle: payload.formData.linkedRiskAssessmentTitle,
      },
      notify: payload.notify,
      notificationTargets: sortedTargets,
      existingPhotos: sortedIds(payload.existingPhotos),
      existingFiles: sortedIds(payload.existingFiles),
      existingEduData: sortedIds(payload.existingEduData),
      newPhotoFiles: sortedNames(payload.newPhotoFiles),
      newFiles: sortedNames(payload.newFiles),
      newEduDataFiles: sortedNames(payload.newEduDataFiles),
    }

    return JSON.stringify(snapshot)
  }

  // API에서 상세 데이터 불러오기 (편집 모드)
  const fetchEducationDetail = useCallback(async () => {
    if (!postId || USE_MOCK_DATA) return

    setLoading(true)
    try {
      const response = await getEducationDetail({ post_id: postId })
      console.log("교육 상세 응답:", response)

      // API 응답 구조 확인: posts 배열이 있는지 체크
      // response가 {code, posts} 형태이거나 단일 post 객체일 수 있음
      const posts = response.posts || (response as any).post || (response as any).data?.posts || []
      const postsArray = Array.isArray(posts) ? posts : posts && typeof posts === "object" ? [posts] : []

      if ((response.code === 200 || (response as any).status === 200) && postsArray.length > 0) {
        const post: EducationDetailPost = postsArray[0]

        // 교육대상 (training_target) -> category
        const targetId = toNumberId(post.training_target ?? post.category)
        const categoryLabel = typeof targetId === "number" ? getOptionLabelById(educationTargetOptions, targetId) : ""

        // 교육과정 (type) -> course
        const courseId = toNumberId(post.type)
        const courseValue = typeof courseId === "number" ? String(courseId) : ""

        // 교육방식 (category) -> educationMethod
        const methodId = typeof post.category === "number" ? post.category : Number(post.category)
        const educationMethodLabel = methodOptions.find(option => option.id === methodId)?.label || ""

        // 시간 파싱 (HH:MM)
        const [startHour, startMinute] = (post.start_time || "").split(":")
        const [endHour, endMinute] = (post.end_time || "").split(":")

        const photoNames = post.photofile?.map(f => getFileNameFromUrl(f.url)).filter(Boolean) || []
        const fileNames = post.files?.map(f => getFileNameFromUrl(f.url)).filter(Boolean) || []
        const eduDataNames = post.education_data?.map(f => getFileNameFromUrl(f.url)).filter(Boolean) || []

        const riskId = (post as any).risk_id ?? (post as any).riskAssessId
        const nextFormData: EducationFormState = {
          category: categoryLabel,
          course: courseValue,
          eduName: post.title || "",
          startDate: post.training_start || "",
          endDate: post.training_end || "",
          startHour: startHour || "",
          startMinute: startMinute || "",
          endHour: endHour || "",
          endMinute: endMinute || "",
          educationMethod: educationMethodLabel,
          assigner: post.name || "",
          trainer: post.teacher || "",
          eduMaterial: eduDataNames.join(","),
          sitePhotos: photoNames.join(","),
          fileUpload: fileNames.join(","),
          note: post.memo || "",
          notifyWhen: ALARM_TIME_REVERSE_MAP[post.alarm_time] || "1주일 전",
          linkedRiskAssessmentId: riskId !== undefined && riskId !== null ? String(riskId) : "",
          linkedRiskAssessmentTitle: (post as any).rist_title || (post as any).riskAssessTitle || "",
        }

        const targetList = post.education_target_list || []
        const attendeeList = (post as any).attendeeList
        const nextTargets = Array.isArray(targetList) && targetList.length > 0
          ? targetList.map(target => ({ name: target.target_name, phone: formatPhoneNumber(target.target_phone) }))
          : Array.isArray(attendeeList)
            ? attendeeList.map((att: { name: string; phoneNumber: string }) => ({ name: att.name, phone: formatPhoneNumber(att.phoneNumber) }))
            : []
        const nextNotify = Boolean(post.is_alarm)

        setFormData(nextFormData)
        setNotificationTargets(nextTargets)
        setNotify(nextNotify)

        initialSnapshotRef.current = createSnapshot({
          formData: nextFormData,
          notify: nextNotify,
          notificationTargets: nextTargets,
          existingPhotos: post.photofile?.map(f => ({ id: f.id, url: f.url })) || [],
          existingFiles: post.files?.map(f => ({ id: f.id, url: f.url })) || [],
          existingEduData: post.education_data?.map(f => ({ id: f.id, url: f.url })) || [],
          newPhotoFiles: [],
          newFiles: [],
          newEduDataFiles: [],
        })

        // 기존 파일들 설정
        if (post.photofile) {
          setExistingPhotos(post.photofile.map(f => ({ id: f.id, url: f.url })))
        }
        if (post.files) {
          setExistingFiles(post.files.map(f => ({ id: f.id, url: f.url })))
        }
        if (post.education_data) {
          setExistingEduData(post.education_data.map(f => ({ id: f.id, url: f.url })))
        }
      } else {
        console.warn("교육 상세 데이터 없음:", { response, postsArray })
        alert("해당 교육 정보를 찾을 수 없습니다.")
      }
    } catch (error) {
      console.error("교육 상세 조회 실패:", error)
      alert("데이터를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (isEdit && postId) {
      fetchEducationDetail()
    }
  }, [isEdit, postId, fetchEducationDetail])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      category: { required: true },
      course: { required: true },
      eduName: { required: true },
      startDate: { required: true },
      endDate: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const { isDialogOpen, approvalLineName, approvers, defaultContent: approvalDefaultContent, checkAndSave, handleConfirmApproval, handleCancel } = useApproval({ documentType: "안전보건교육" })

  const categoryOptions = educationTargetOptions.filter(option => option.value).map(option => option.label)
  const methodOptions = EDUCATION_METHOD_OPTIONS

  const categoryCourseMap = EDUCATION_CATEGORY_COURSE_MAP

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category" ? { course: "" } : {}),
    }))
  }

  const handleRiskSelect = (selected: string | number | (string | number)[] | null) => {
    if (selected === null) return
    let value = ""
    if (Array.isArray(selected)) {
      if (selected.length > 0) value = String(selected[0])
    } else {
      value = String(selected)
    }
    if (value) {
      const matched = riskAssessmentOptions.find(option => String(option.id) === String(value))
      setFormData(prev => ({
        ...prev,
        linkedRiskAssessmentId: value,
        linkedRiskAssessmentTitle: matched?.name ? String(matched.name) : prev.linkedRiskAssessmentTitle,
      }))
    }
    setRiskModalOpen(false)
  }

  const NotifyToggle = <ToggleSwitch checked={notify} onChange={checked => setNotify(checked)} />

  const initialSnapshot = (() => {
    if (!isEdit || !initialSnapshotRef.current) return null
    try {
      return JSON.parse(initialSnapshotRef.current)
    } catch {
      return null
    }
  })()

  const initialForm = initialSnapshot?.formData || {}
  const editedFields: Record<string, boolean> = initialSnapshot
    ? {
        category: initialForm.category !== formData.category,
        course: initialForm.course !== formData.course,
        eduName: initialForm.eduName !== formData.eduName,
        educationMethod: initialForm.educationMethod !== formData.educationMethod,
        assigner: initialForm.assigner !== formData.assigner,
        trainer: initialForm.trainer !== formData.trainer,
        eduMaterial: initialForm.eduMaterial !== formData.eduMaterial,
        sitePhotos: initialForm.sitePhotos !== formData.sitePhotos,
        fileUpload: initialForm.fileUpload !== formData.fileUpload,
        note: initialForm.note !== formData.note,
        notifyWhen: initialForm.notifyWhen !== formData.notifyWhen,
        notify: initialSnapshot?.notify !== notify,
        linkedRiskAssessmentId: initialForm.linkedRiskAssessmentId !== formData.linkedRiskAssessmentId,
        startDate: initialForm.startDate !== formData.startDate,
        endDate: initialForm.endDate !== formData.endDate,
        startHour: initialForm.startHour !== formData.startHour,
        startMinute: initialForm.startMinute !== formData.startMinute,
        endHour: initialForm.endHour !== formData.endHour,
        endMinute: initialForm.endMinute !== formData.endMinute,
      }
    : {}

  const courseIdValue = Number(formData.course)
  const selectedCourse = formData.course && !Number.isNaN(courseIdValue) ? EDUCATION_COURSE_DETAIL_OPTIONS.find(option => option.id === courseIdValue) || null : null
  const hourText = selectedCourse?.course_hour || ""
  const selectedCourseLabel = selectedCourse?.label || ""

  const fields: Field[] = [
    {
      label: "교육대상",
      name: "category",
      type: "select",
      options: categoryOptions.map(v => ({ value: v, label: v })),
      required: true,
      hasError: isFieldInvalid("category"),
    },
    {
      label: "교육과정",
      name: "course",
      type: "custom",
      required: true,
      hasError: isFieldInvalid("course"),
      customRender: (
        <div className="flex items-center gap-2 w-full">
          <div className="w-full md:w-[300px]">
            <CustomSelect
              value={formData.course}
              onChange={v => handleChange({ target: { name: "course", value: v } } as React.ChangeEvent<HTMLSelectElement>)}
              options={[
                { value: "", label: "선택" },
                ...(categoryCourseMap[formData.category] || []).map(course => ({ value: String(course.id), label: course.label })),
                ...(formData.course && !(categoryCourseMap[formData.category] || []).some(course => String(course.id) === formData.course)
                  ? [{ value: formData.course, label: selectedCourseLabel || formData.course }]
                  : []),
              ]}
              buttonClassName={`${isFieldInvalid("course") ? "border-red-500" : ""} ${editedFields.course ? "bg-[#E9F0FE]" : ""}`}
            />
          </div>
          {hourText && <span className="text-xs md:text-base font-medium text-[#6D808E] whitespace-nowrap">교육시간: {hourText}</span>}
        </div>
      ),
    },
    { label: "교육명", name: "eduName", type: "text", required: true, hasError: isFieldInvalid("eduName") },
    { label: "교육기간", name: "educationPeriod", type: "daterange", required: true, hasError: isFieldInvalid("startDate") || isFieldInvalid("endDate") },
    { label: "교육시간", name: "educationTime", type: "timeRange", required: false },
    {
      label: "교육방식",
      name: "educationMethod",
      type: "select",
      options: EDUCATION_METHOD_OPTIONS,
      required: false,
    },
    { label: "교육담당자", name: "assigner", type: "text", required: false },
    { label: "외부강사", name: "trainer", type: "text", required: false },
    {
      label: "교육자료",
      name: "eduMaterial",
      type: "fileUpload",
      required: false,
      buttonRender: (
        <div className="flex items-center gap-2 w-full">
          {!formData.linkedRiskAssessmentId ? (
            <Button variant="action" onClick={() => setRiskModalOpen(true)} className="shrink-0 h-[30px] text-xs px-2">
              위험성평가 불러오기
            </Button>
          ) : (
            <div className="flex items-center gap-1 px-[9px] py-[3px] bg-[#F9F9F9] border border-[#E5E7EB] rounded-[8px] text-[13px] text-gray-800">
              <span className="truncate max-w-[200px]">{formData.linkedRiskAssessmentTitle || "-"}</span>
              <button
                onClick={() => setFormData(prev => ({ ...prev, linkedRiskAssessmentId: "", linkedRiskAssessmentTitle: "" }))}
                className="ml-1 text-gray-500 hover:text-gray-700"
                title="삭제"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {riskModalOpen && (
            <LoadListDialog
              isOpen={riskModalOpen}
              items={riskAssessmentOptions}
              selectedId={formData.linkedRiskAssessmentId}
              singleSelect
              onChangeSelected={handleRiskSelect}
              year={riskYear}
              onYearChange={setRiskYear}
              page={riskPage}
              totalPages={riskTotalPages}
              onPageChange={setRiskPage}
              onClose={() => setRiskModalOpen(false)}
            />
          )}
        </div>
      ),
    },
    { label: "현장사진", name: "sitePhotos", type: "photoUpload", required: false },
    { label: "첨부파일", name: "fileUpload", type: "fileUpload", required: false },
    { label: "비고", name: "note", type: "textarea", required: false },
    { label: "알림 전송여부", name: "notify", type: "custom", customRender: NotifyToggle, required: false },
    {
      label: "알림 발송시점",
      name: "notifyWhen",
      type: "select",
      options: EDUCATION_ALARM_TIME_OPTIONS,
      disabled: !notify,
      required: false,
    },
  ]

  const valuesForForm: { [key: string]: string } = {
    category: formData.category,
    course: formData.course,
    eduName: formData.eduName,
    startDate: formData.startDate,
    endDate: formData.endDate,
    startHour: formData.startHour,
    startMinute: formData.startMinute,
    endHour: formData.endHour,
    endMinute: formData.endMinute,
    educationMethod: formData.educationMethod,
    assigner: formData.assigner,
    trainer: formData.trainer,
    eduMaterial: formData.eduMaterial,
    sitePhotos: formData.sitePhotos,
    fileUpload: formData.fileUpload,
    note: formData.note,
    notifyWhen: formData.notifyWhen,
    linkedRiskAssessmentId: formData.linkedRiskAssessmentId,
    linkedRiskAssessmentTitle: formData.linkedRiskAssessmentTitle,
  }

  const hasChanges = () => {
    if (!isEdit || !initialSnapshotRef.current) return true
    const currentSnapshot = createSnapshot({
      formData,
      notify,
      notificationTargets,
      existingPhotos,
      existingFiles,
      existingEduData,
      newPhotoFiles,
      newFiles,
      newEduDataFiles,
    })
    return currentSnapshot !== initialSnapshotRef.current
  }

  const doSave = async () => {
    if (USE_MOCK_DATA) {
      console.log("저장 데이터 (목데이터 모드):", { ...formData, notify }, notificationTargets)
      navigate("/safety-education")
      return
    }

    setLoading(true)
    try {
      // 교육대상 ID 찾기
      const trainingTargetId = getOptionIdByValue(educationTargetOptions, formData.category) ?? 0

      // 교육과정 ID 찾기
      const typeId = Number.isNaN(Number(formData.course)) ? 0 : Number(formData.course)

      const methodId = methodOptions.find(option => option.label === formData.educationMethod)?.id ?? 0

      const requestData = {
        post_id: isEdit && postId ? postId : 0,
        training_target: trainingTargetId,
        type: typeId,
        title: formData.eduName,
        training_start: formData.startDate,
        training_end: formData.endDate,
        start_time: formData.startHour && formData.startMinute ? `${formData.startHour}:${formData.startMinute}` : "",
        end_time: formData.endHour && formData.endMinute ? `${formData.endHour}:${formData.endMinute}` : "",
        category: methodId,
        is_alarm: notify,
        alarm_time: ALARM_TIME_MAP[formData.notifyWhen] ?? 1,
        name: formData.assigner,
        teacher: formData.trainer,
        memo: formData.note,
        photo_id: existingPhotos.map(p => p.id),
        photofiles: newPhotoFiles,
        file_id: existingFiles.map(f => f.id),
        files: newFiles,
        data_id: existingEduData.map(d => d.id),
        education_data: newEduDataFiles,
        risk_id: formData.linkedRiskAssessmentId || undefined,
        target_list: notificationTargets.map(att => ({
          name: att.name,
          phone: formatPhoneNumber(att.phone),
        })),
      }

      console.log("API 요청 데이터:", requestData)

      const response = await getEducationRegist(requestData as any)

      if (response.code === 200) {
        alert(isEdit ? "수정되었습니다." : "등록되었습니다.")
        navigate("/safety-education")
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("교육 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (isEdit && !hasChanges()) {
      alert("변경사항이 없습니다.")
      return
    }
    if (!validateForm(valuesForForm)) {
      alertRequiredFields()
      return
    }
    checkAndSave(doSave, formData.eduName)
  }

  const isRequiredFilled = Boolean(formData.category && formData.course && formData.eduName && formData.startDate && formData.endDate)
  const isSaveDisabled = !isRequiredFilled || (isEdit && !hasChanges())

  const isAttendeeModified = Boolean(
    isEdit &&
      initialSnapshot &&
      JSON.stringify(normalizeTargets(notificationTargets)) !== JSON.stringify(initialSnapshot.notificationTargets || [])
  )
  const attendeeModifiedRowIndices = (() => {
    if (!isEdit || !initialSnapshot) return []
    const toKey = (t: NotificationTarget) => `${t.name.trim()}|${t.phone.trim()}`
    const initialSet = new Set((initialSnapshot.notificationTargets || []).map((t: NotificationTarget) => toKey(t)))
    return notificationTargets
      .map((t, idx) => (initialSet.has(toKey(t)) ? -1 : idx))
      .filter(idx => idx >= 0)
  })()

  // 파일 업로드 핸들러 - 실제 File 객체를 state에 저장
  const handleFileChange = (name: string, files: File[]) => {
    if (name === "sitePhotos") {
      setNewPhotoFiles(prev => [...prev, ...files])
    } else if (name === "fileUpload") {
      setNewFiles(prev => [...prev, ...files])
    } else if (name === "eduMaterial") {
      setNewEduDataFiles(prev => [...prev, ...files])
    }
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name === "sitePhotos") {
      setNewPhotoFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "fileUpload") {
      setNewFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "eduMaterial") {
      setNewEduDataFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    setExistingFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
    setExistingEduData(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const handleExistingPhotoRemove = (fileName: string, url: string) => {
    setExistingPhotos(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const handleAddTarget = (t: NotificationTarget) => setNotificationTargets(prev => [...prev, t])
  const handleRemoveTarget = (idx: number) => setNotificationTargets(prev => prev.filter((_, i) => i !== idx))
  const handleAddMultiple = (ts: NotificationTarget[]) => setNotificationTargets(prev => [...prev, ...ts])

  return (
    <section className="w-full">
      <PageTitle>안전보건교육 {isEdit ? "편집" : "등록"}</PageTitle>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:flex-[6] border border-[#F3F3F3] rounded-[16px] p-3" style={{ minHeight: "700px" }}>
          <FormScreen
            fields={fields}
            values={valuesForForm}
            editedFields={editedFields}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            onSave={handleSave}
            onClose={() => navigate("/safety-education")}
            notifyEnabled={notify}
            existingFileMap={{
              eduMaterial: existingEduData.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
              fileUpload: existingFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            existingPhotoMap={{
              sitePhotos: existingPhotos.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            onExistingFileRemove={handleExistingFileRemove}
            onExistingPhotoRemove={handleExistingPhotoRemove}
          />
        </div>
        <aside className="w-full lg:flex-[4] flex flex-col gap-6">
          <PageTitle className="block lg:hidden">알림 대상</PageTitle>
          <AttendeePanel
            attendees={notificationTargets}
            onAdd={handleAddTarget}
            onRemove={handleRemoveTarget}
            onAddMultiple={handleAddMultiple}
            isModified={isAttendeeModified}
            modifiedRowIndices={attendeeModifiedRowIndices}
          />
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSave} disabledStyleOnly={isSaveDisabled}>
              저장하기
            </Button>
          </div>
        </aside>
      </div>
      <ApprovalConfirmDialog
        isOpen={isDialogOpen}
        documentType="안전보건교육"
        approvalLineName={approvalLineName}
        approvers={approvers}
        defaultContent={approvalDefaultContent}
        onConfirm={handleConfirmApproval}
        onCancel={handleCancel}
      />
    </section>
  )
}
