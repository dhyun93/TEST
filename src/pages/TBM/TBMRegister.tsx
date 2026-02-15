import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import ProcessRiskAccordion, { RiskItem } from "@/components/snippet/ProcessRiskAccordion"
import LoadListDialog from "@/components/dialog/LoadListDialog"
import AttendeePanel from "@/components/snippet/AttendeePanel"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import useForm, { ValidationRules } from "@/hooks/useForm"
import useApproval from "@/hooks/useApproval"
import { useAlerts } from "@/hooks/useAlerts"
import { getTBMDetail, getTBMRegist, TBMDetailPost } from "@/api/15_TBM/tbm.api"
import { getList as getRiskAssessmentList, RiskAssessment_Post } from "@/api/02_RiskAssessment/riskAssessment.api"
import { getFileNameFromUrl } from "@/utils/file"
import { formatPhoneNumber } from "@/utils/phone"
import { useLoadingStore } from "@/stores/loadingStore"

// 데이터 소스 전환: true = 목데이터, false = API
const USE_MOCK_DATA = false

interface Attendee {
  name: string
  phone: string
  signature?: string
}

interface ExistingFile {
  id: number
  url: string
  name?: string
}

const riskEvaluationTemplates = ["건설기계_2025-03-30", "물리적인자_2025-03-30", "터널 공사_2025-03-30", "기타_2025-03-30", "크레인 작업_2025-03-30"]

const defaultContent = `1. 작업내용 및 작업절차 전달:\n\n2. 위험성평가 내용 공유:\n\n3. 비상시 행동요령:\n\n4. 비상시 행동요령\n- 비상대회 경로 및 대피 후 비상집결지 안내\n- 작업위치 내 소화시설 위치 주지`
const defaultRemark = `개인보호구 착용 상태 확인(근로자간 상호 확인)\n건강 상태 확인(발열 등)\n준비운동 및 스트레칭\n작업 도구/장비 및 주변 위험요소 점검\n비상시 연락망 및 응급조치 장비 위치 확인`

export default function TBMRegisterScreen() {
  const { alertRequiredFields } = useAlerts()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = location.state?.mode === "edit"
  const postId = location.state?.postId as number | undefined

  const { setLoading } = useLoadingStore()

  const [tbmName, setTbmName] = useState("")
  const [locationText, setLocationText] = useState("")
  const [date, setDate] = useState("")
  const [startHour, setStartHour] = useState("")
  const [startMinute, setStartMinute] = useState("")
  const [endHour, setEndHour] = useState("")
  const [endMinute, setEndMinute] = useState("")
  const [assignee, setAssignee] = useState("")
  const [supervisor, setSupervisor] = useState("")
  const [content, setContent] = useState(defaultContent)
  const [remark, setRemark] = useState(defaultRemark)
  const [fileUpload, setFileUpload] = useState("")
  const [process, setProcess] = useState("")
  const [processListOpen, setProcessListOpen] = useState(false)
  const [processDetails, setProcessDetails] = useState<Record<string, RiskItem[]>>({})
  const [expandedProcesses, setExpandedProcesses] = useState<Record<string, boolean>>({})
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean[]>>({})
  const [attendeesList, setAttendeesList] = useState<Attendee[]>([])
  const [sitePhotos, setSitePhotos] = useState("")
  const [linkedRiskId, setLinkedRiskId] = useState("")

  // 파일 관리 (API 모드)
  const [existingPhotos, setExistingPhotos] = useState<ExistingFile[]>([])
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([])
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])

  // 위험성평가 불러오기
  const [riskModalOpen, setRiskModalOpen] = useState(false)
  const [riskYear, setRiskYear] = useState(new Date().getFullYear().toString())
  const [riskItems, setRiskItems] = useState<RiskAssessment_Post[]>([])
  const [riskPage, setRiskPage] = useState(1)
  const [riskTotalPages, setRiskTotalPages] = useState(1)

  const formatDateForApi = (year: string) => {
    const y = Number(year) || new Date().getFullYear()
    return { start_date: `${y}-01-01`, end_date: `${y}-12-31` }
  }

  const fetchRiskAssessmentList = async (yearValue: string, pageValue: number) => {
    if (USE_MOCK_DATA) return
    try {
      const { start_date, end_date } = formatDateForApi(yearValue)
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

  const riskAssessmentOptions = USE_MOCK_DATA
    ? riskEvaluationTemplates.map(p => ({ id: p, name: p }))
    : riskItems.map(item => ({
        id: String(item.id),
        name: item.title || "-",
        registeredAt: item.created_at?.slice(0, 10) || "",
      }))

  // API에서 상세 데이터 불러오기 (편집 모드)
  const fetchTBMDetail = useCallback(async () => {
    if (!postId || USE_MOCK_DATA) return

    setLoading(true)
    try {
      const response = await getTBMDetail({ post_id: postId })
      console.log("TBM 상세 응답:", response)

      const posts = response.posts || (response.post ? [response.post] : [])
      const postsArray = Array.isArray(posts) ? posts : []

      if ((response.code === 200) && postsArray.length > 0) {
        const post: TBMDetailPost = postsArray[0]

        setTbmName(post.title || "")
        setLocationText(post.place || "")
        setDate(post.tbm_date || "")
        setContent(post.contents || defaultContent)
        setRemark(post.memo || defaultRemark)

        // 시간 파싱
        const [sh, sm] = (post.start_time || "").split(":")
        const [eh, em] = (post.end_time || "").split(":")
        setStartHour(sh || "")
        setStartMinute(sm || "")
        setEndHour(eh || "")
        setEndMinute(em || "")

        // 위험성평가 ID
        if (post.risk_id !== undefined && post.risk_id !== null) {
          setLinkedRiskId(String(post.risk_id))
        }

        // 항목 리스트 -> processDetails
        if (post.item_list && post.item_list.length > 0) {
          const riskItems: RiskItem[] = post.item_list.map(item => ({
            hazard: item.title,
            countermeasure: item.contents,
          }))
          const processName = post.risk_title || "위험성평가"
          setProcess(processName)
          setProcessDetails({ [processName]: riskItems })
          setCheckedItems({ [processName]: new Array(riskItems.length).fill(false) })
          setExpandedProcesses({ [processName]: true })
        }

        // 참석자 리스트
        if (post.tbm_target_list && post.tbm_target_list.length > 0) {
          setAttendeesList(post.tbm_target_list.map(t => ({
            name: t.target_name,
            phone: formatPhoneNumber(t.target_phone),
          })))
        }

        // 기존 파일들
        const photoNames = post.photofile?.map(f => getFileNameFromUrl(f.url)).filter(Boolean) || []
        const fileNames = post.files?.map(f => getFileNameFromUrl(f.url)).filter(Boolean) || []
        setSitePhotos(photoNames.join(","))
        setFileUpload(fileNames.join(","))

        if (post.photofile) {
          setExistingPhotos(post.photofile.map(f => ({ id: f.id, url: f.url })))
        }
        if (post.files) {
          setExistingFiles(post.files.map(f => ({ id: f.id, url: f.url })))
        }
      } else {
        alert("해당 TBM 정보를 찾을 수 없습니다.")
      }
    } catch (error) {
      console.error("TBM 상세 조회 실패:", error)
      alert("데이터를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (isEdit && postId) {
      fetchTBMDetail()
    }
  }, [isEdit, postId, fetchTBMDetail])

  const validationRules = useMemo<ValidationRules>(
    () => ({
      location: { required: true },
      date: { required: true },
      tbmName: { required: true },
    }),
    []
  )

  const { validateForm, isFieldInvalid } = useForm(validationRules)

  const { isDialogOpen, approvalLineName, approvers, defaultContent: approvalDefaultContent, checkAndSave, handleConfirmApproval, handleCancel } = useApproval({ documentType: "TBM" })

  const toggleExpand = (proc: string) => setExpandedProcesses(prev => ({ ...prev, [proc]: !prev[proc] }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "tbmName") setTbmName(value)
    else if (name === "location") setLocationText(value)
    else if (name === "date") setDate(value)
    else if (name === "startHour") setStartHour(value)
    else if (name === "startMinute") setStartMinute(value)
    else if (name === "endHour") setEndHour(value)
    else if (name === "endMinute") setEndMinute(value)
    else if (name === "assignee") setAssignee(value)
    else if (name === "supervisor") setSupervisor(value)
    else if (name === "content") setContent(value)
    else if (name === "remark") setRemark(value)
    else if (name === "sitePhotos") setSitePhotos(value)
    else if (name === "fileUpload") setFileUpload(value)
  }

  const toggleProcessInList = (proc: string) => {
    if (process === proc) {
      setProcess("")
      setProcessDetails(prev => {
        const copy = { ...prev }
        delete copy[proc]
        return copy
      })
      setCheckedItems(prev => {
        const copy = { ...prev }
        delete copy[proc]
        return copy
      })
      setLinkedRiskId("")
      return
    }

    // API 모드에서는 선택한 위험성평가 ID 저장
    if (!USE_MOCK_DATA) {
      setLinkedRiskId(proc)
    }

    setProcess(proc)
    setProcessDetails({ [proc]: [] })
    setCheckedItems({ [proc]: [] })
    setProcessListOpen(false)
  }

  const addRiskItem = (proc: string) => {
    setProcessDetails(d => {
      const items = [...(d[proc] || []), { hazard: "", countermeasure: "" }]
      return { ...d, [proc]: items }
    })
    setCheckedItems(c => {
      const arr = [...(c[proc] || []), false]
      return { ...c, [proc]: arr }
    })
  }

  const handleRiskItemChange = (proc: string, index: number, key: "hazard" | "countermeasure", value: string) => {
    setProcessDetails(prev => {
      const items = prev[proc] ? [...prev[proc]] : []
      if (items[index]) items[index] = { ...items[index], [key]: value }
      return { ...prev, [proc]: items }
    })
  }

  // 파일 업로드 핸들러
  const handleFileChange = (name: string, files: File[]) => {
    if (name === "sitePhotos") {
      setNewPhotoFiles(prev => [...prev, ...files])
    } else if (name === "fileUpload") {
      setNewFiles(prev => [...prev, ...files])
    }
  }

  const handleFileRemove = (name: string, fileName: string) => {
    if (name === "sitePhotos") {
      setNewPhotoFiles(prev => prev.filter(f => f.name !== fileName))
    } else if (name === "fileUpload") {
      setNewFiles(prev => prev.filter(f => f.name !== fileName))
    }
  }

  const handleExistingFileRemove = (fileName: string, url: string) => {
    setExistingFiles(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const handleExistingPhotoRemove = (fileName: string, url: string) => {
    setExistingPhotos(prev => prev.filter(f => f.url !== url && getFileNameFromUrl(f.url) !== fileName))
  }

  const fields: Field[] = [
    { label: "작업명", name: "tbmName", type: "text", placeholder: "작업명 입력", required: true, hasError: isFieldInvalid("tbmName") },
    { label: "TBM 일자", name: "date", type: "date", required: true, hasError: isFieldInvalid("date") },
    { label: "TBM 장소", name: "location", type: "text", placeholder: "장소 입력", required: true, hasError: isFieldInvalid("location") },
    { label: "진행시간", name: "timeRange", type: "timeRange", required: false },
    {
      label: "위험성평가표",
      name: "processes",
      type: "tags",
      required: false,
      buttonRender: (
        <>
          <Button variant="action" onClick={() => setRiskModalOpen(true)}>
            위험성평가표 불러오기
          </Button>
          {riskModalOpen && (
            <LoadListDialog
              isOpen={riskModalOpen}
              items={riskAssessmentOptions}
              selectedId={USE_MOCK_DATA ? process : linkedRiskId}
              singleSelect
              onChangeSelected={selected => {
                if (selected == null) return
                if (Array.isArray(selected)) {
                  const v = selected[0]
                  if (v != null) toggleProcessInList(String(v))
                } else {
                  toggleProcessInList(String(selected))
                }
              }}
              year={riskYear}
              onYearChange={setRiskYear}
              page={riskPage}
              totalPages={riskTotalPages}
              onPageChange={setRiskPage}
              onClose={() => setRiskModalOpen(false)}
            />
          )}
        </>
      ),
    },
    { label: "관리감독자", name: "supervisor", type: "text", placeholder: "관리감독자 입력", required: false },
    { label: "작업내용", name: "content", type: "textarea", required: false },
    { label: "비고", name: "remark", type: "textarea", required: false },
    { label: "현장사진", name: "sitePhotos", type: "photoUpload", required: false },
    { label: "첨부파일", name: "fileUpload", type: "fileUpload", required: false },
  ]

  const values = {
    tbmName,
    location: locationText,
    date,
    startHour,
    startMinute,
    endHour,
    endMinute,
    assignee,
    supervisor,
    content,
    remark,
    fileUpload,
    processes: process,
    sitePhotos,
  }

  const doSave = async () => {
    if (USE_MOCK_DATA) {
      console.log("저장 데이터 (목데이터 모드):", values, attendeesList)
      navigate("/tbm")
      return
    }

    setLoading(true)
    try {
      // item_list 구성 (위험잠재요인 + 대책)
      const itemList = Object.values(processDetails)
        .flat()
        .filter(item => item.hazard || item.countermeasure)
        .map(item => ({ title: item.hazard, contents: item.countermeasure }))

      // tbm_target_list 구성
      const targetList = attendeesList.map(att => ({
        name: att.name,
        phone: formatPhoneNumber(att.phone),
      }))

      const requestData = {
        post_id: isEdit && postId ? postId : 0,
        title: tbmName,
        place: locationText,
        tbm_date: date,
        start_time: startHour && startMinute ? `${startHour}:${startMinute}` : "",
        end_time: endHour && endMinute ? `${endHour}:${endMinute}` : "",
        contents: content,
        memo: remark,
        risk_id: linkedRiskId || undefined,
        item_list: itemList,
        tbm_target_list: targetList,
        count: attendeesList.length,
        photo_id: existingPhotos.map(p => p.id),
        photofiles: newPhotoFiles,
        file_id: existingFiles.map(f => f.id),
        files: newFiles,
      }

      console.log("TBM API 요청 데이터:", requestData)

      const response = await getTBMRegist(requestData)

      if (response.code === 200) {
        alert(isEdit ? "수정되었습니다." : "등록되었습니다.")
        navigate("/tbm")
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("TBM 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm({ location: locationText, date, tbmName })) {
      alertRequiredFields()
      return
    }
    checkAndSave(doSave, tbmName)
  }

  const handleAddAttendee = (att: Attendee) => setAttendeesList(prev => [...prev, att])
  const handleRemoveAttendee = (idx: number) => setAttendeesList(prev => prev.filter((_, i) => i !== idx))

  return (
    <section className="w-full">
      <PageTitle>TBM {isEdit ? "편집" : "등록"}</PageTitle>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:flex-[6] border border-[#F3F3F3] rounded-[16px] p-3" style={{ minHeight: "700px" }}>
          <FormScreen
            fields={fields}
            values={values}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
            onTagRemove={(n, t) => {
              if (n === "processes" && t === process) {
                setProcess("")
                setProcessDetails({})
                setCheckedItems({})
                setLinkedRiskId("")
              }
            }}
            onSubmit={handleSave}
            onClose={() => navigate("/tbm")}
            onSave={handleSave}
            existingFileMap={{
              fileUpload: existingFiles.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            existingPhotoMap={{
              sitePhotos: existingPhotos.map(f => ({ name: getFileNameFromUrl(f.url) || f.url, url: f.url })),
            }}
            onExistingFileRemove={handleExistingFileRemove}
            onExistingPhotoRemove={handleExistingPhotoRemove}
          />
          {process && (
            <ProcessRiskAccordion
              key={process}
              process={process}
              items={processDetails[process] ?? [{ hazard: "", countermeasure: "" }]}
              expanded={expandedProcesses[process] ?? true}
              toggleExpand={() => toggleExpand(process)}
              handleChangeHazard={(i, val) => handleRiskItemChange(process, i, "hazard", val)}
              handleChangeCounter={(i, val) => handleRiskItemChange(process, i, "countermeasure", val)}
              addRiskItem={() => addRiskItem(process)}
            />
          )}
        </div>
        <aside className="w-full lg:flex-[4] flex flex-col gap-6">
          <PageTitle className="block lg:hidden">참석자 목록</PageTitle>
          <div className="w-full">
            <AttendeePanel attendees={attendeesList} onAdd={handleAddAttendee} onRemove={handleRemoveAttendee} />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={handleSave}>
              저장하기
            </Button>
          </div>
        </aside>
      </div>
      <ApprovalConfirmDialog
        isOpen={isDialogOpen}
        documentType="TBM"
        approvalLineName={approvalLineName}
        approvers={approvers}
        defaultContent={approvalDefaultContent}
        onConfirm={handleConfirmApproval}
        onCancel={handleCancel}
      />
    </section>
  )
}
