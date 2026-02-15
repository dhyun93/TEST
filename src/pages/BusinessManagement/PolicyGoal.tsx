import React, { useCallback, useEffect, useRef, useState } from "react"
import FormScreen from "@/components/common/forms/FormScreen"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import YearPicker from "@/components/common/inputs/YearPicker"
import ApprovalConfirmDialog from "@/components/dialog/ApprovalConfirmDialog"
import useApproval from "@/hooks/useApproval"
import { Upload, Download, Printer, Trash2, X, FileSpreadsheet } from "lucide-react"
import useHandlers from "@/hooks/useHandlers"
import { DocumentTemplate } from "@/docExport"
import { DataRow } from "@/components/common/tables/DataTable"
import { policyGoalMockData } from "@/data/mockBusinessData"
import { get_policy, getPolicyDelete, regist_Policy, Policy_Post } from "@/api/10_BusinessManagement/02_Policy"
import { getFileNameFromUrl } from "@/utils/file"
import { useAlerts } from "@/hooks/useAlerts"
import { downloadAssetFile } from "@/utils/download"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

type PolicyRow = DataRow & { id: number | string; year: string; goalTitle: string; content: string }

type Field = { label: string; name: string; type: "text" | "textarea" | "custom"; placeholder?: string; style?: React.CSSProperties; customRender?: React.ReactNode }

const createPolicyTemplate = (row: PolicyRow): DocumentTemplate => ({
  id: `policy-${row.id}`,
  title: "경영방침",
  companyName: "",
  documentNumber: `POL_${String(row.id).padStart(8, "0")}`,
  createdAt: row.year,
  showApproval: false,
  fields: [
    { label: "연도", value: row.year, type: "text", section: "overview" },
    { label: "방침목표명", value: row.goalTitle, type: "text", section: "overview" },
    { label: "내용", value: row.content, type: "textarea", section: "content" },
  ],
})

const PolicyGoal: React.FC = () => {
  const [values, setValues] = useState<{ [key: string]: string }>({
    year: policyGoalMockData.year,
    goalTitle: policyGoalMockData.goalTitle,
    content: policyGoalMockData.content,
    uploadedFile: "",
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("")
  const [policyYear, setPolicyYear] = useState<number | null>(null)
  const [policySnapshot, setPolicySnapshot] = useState({ year: "", goalTitle: "", content: "", seal: "" })
  const { alertNoChanges } = useAlerts()
  const [sealFile, setSealFile] = useState<File | null>(null)

  const { isDialogOpen, approvalLineName, approvers, defaultContent, checkAndSave, handleConfirmApproval, handleCancel } = useApproval({ documentType: "경영방침" })

  const policyData: PolicyRow[] = [{ id: 1, year: values.year, goalTitle: values.goalTitle, content: values.content }]

  const { handleExcelDownload, handlePrint, isDownloading, isPrinting } = useHandlers<PolicyRow>({
    data: policyData,
    checkedIds: [1],
    createTemplate: createPolicyTemplate,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const applyPolicyPost = useCallback((post: Policy_Post) => {
    const sealUrl = post.seal || ""
    setPolicyYear(post.year ?? null)
    setValues(prev => ({
      ...prev,
      year: String(post.year),
      goalTitle: post.title || "",
      content: post.contents || "",
      uploadedFile: sealUrl ? getFileNameFromUrl(sealUrl) : "",
    }))
    setUploadedFileUrl(sealUrl)
    setPolicySnapshot({
      year: String(post.year),
      goalTitle: post.title || "",
      content: post.contents || "",
      seal: sealUrl,
    })
  }, [])

  const fetchPolicy = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await get_policy({ year: values.year })
      if (response.code === 200 && response.posts?.length) {
        applyPolicyPost(response.posts[0])
      } else {
        setPolicyYear(null)
        setValues(prev => ({ ...prev, goalTitle: "", content: "", uploadedFile: "" }))
        setUploadedFileUrl("")
        setPolicySnapshot({ year: values.year, goalTitle: "", content: "", seal: "" })
      }
    } catch (error) {
      console.error("경영방침 조회 실패:", error)
    }
  }, [applyPolicyPost, values.year])

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchPolicy()
    }
  }, [fetchPolicy])

  const doSave = async () => {
    const hasChanges = values.year !== policySnapshot.year || values.goalTitle !== policySnapshot.goalTitle || values.content !== policySnapshot.content || uploadedFileUrl !== policySnapshot.seal
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    if (USE_MOCK_DATA) {
      alert("저장되었습니다")
      return
    }
    try {
      const response = await regist_Policy({
        year: Number(values.year),
        title: values.goalTitle,
        contents: values.content,
        seal: sealFile || undefined,
      })
      if (response.code === 200) {
        alert(response.msg || "저장되었습니다")
        fetchPolicy()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("경영방침 저장 실패:", error)
      alert("저장에 실패했습니다.")
    }
  }
  const handleSave = () => {
    const hasChanges = values.year !== policySnapshot.year || values.goalTitle !== policySnapshot.goalTitle || values.content !== policySnapshot.content || uploadedFileUrl !== policySnapshot.seal
    if (!hasChanges) {
      alertNoChanges()
      return
    }
    checkAndSave(doSave, `${values.year}년 ${values.goalTitle}`)
  }

  const hasPolicyChanges = values.year !== policySnapshot.year || values.goalTitle !== policySnapshot.goalTitle || values.content !== policySnapshot.content || uploadedFileUrl !== policySnapshot.seal
  const editedFields: Record<string, boolean> = {
    year: values.year !== policySnapshot.year,
    goalTitle: values.goalTitle !== policySnapshot.goalTitle,
    content: values.content !== policySnapshot.content,
    uploadFile: uploadedFileUrl !== policySnapshot.seal,
  }
  const handleDeleteClick = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return
    if (USE_MOCK_DATA) {
      setPolicyYear(null)
      setValues(prev => ({ ...prev, goalTitle: "", content: "", uploadedFile: "" }))
      setUploadedFileUrl("")
      alert("삭제되었습니다.")
      return
    }

    if (!policyYear) {
      alert("삭제할 항목이 없습니다.")
      return
    }

    void (async () => {
      try {
        const response = await getPolicyDelete({ year: policyYear })
        if (response.code === 200) {
          setPolicyYear(null)
          setValues(prev => ({ ...prev, goalTitle: "", content: "", uploadedFile: "" }))
          setUploadedFileUrl("")
          alert("삭제되었습니다.")
        } else {
          alert(response.msg || "삭제에 실패했습니다.")
        }
      } catch (error) {
        console.error("경영방침 삭제 실패:", error)
        alert("삭제에 실패했습니다.")
      }
    })()
  }
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const fileName = file.name
      const fileUrl = URL.createObjectURL(file)
      setValues(prev => ({ ...prev, uploadedFile: fileName }))
      setUploadedFileUrl(fileUrl)
      setSealFile(file)
    }
  }
  const handleFileDownload = () => {
    if (uploadedFileUrl) {
      const link = document.createElement("a")
      link.href = uploadedFileUrl
      link.download = values.uploadedFile
      link.click()
    }
  }
  const handleFileRemove = () => {
    setValues(prev => ({ ...prev, uploadedFile: "" }))
    setUploadedFileUrl("")
    setSealFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const fields: Field[] = [
    { label: "방침목표명", name: "goalTitle", type: "text", placeholder: "방침목표명을 입력하세요" },
    {
      label: "내용",
      name: "content",
      type: "custom",
      customRender: (
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
          placeholder="내용을 입력하세요"
          className={`border border-[#AAAAAA] rounded-[8px] p-2 w-full text-sm md:text-[15px] font-medium placeholder:font-normal placeholder:text-[#86939A] placeholder:text-sm md:placeholder:text-[15px] text-[#333639] h-[150px] md:h-[330px] ${
            editedFields.content ? "bg-[#E9F0FE]" : "bg-white"
          }`}
        />
      ),
    },
    {
      label: "양식 내려받기",
      name: "downloadTemplate",
      type: "custom",
      customRender: (
        <Button variant="action" style={{ minWidth: 120 }} className="flex items-center gap-1" onClick={() => void downloadAssetFile("public/downloads/안전보건 경영방침.hwp")}>
          <Download size={18} />
          경영방침 양식
        </Button>
      ),
    },
    {
      label: "경영방침 업로드",
      name: "uploadFile",
      type: "custom",
      customRender: (
        <div className="flex items-center gap-3">
          <Button variant="action" onClick={openFileDialog} style={{ minWidth: 120 }} className="flex items-center gap-1">
            <Upload size={18} />
            경영방침 업로드
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".hwp,.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif" />
          {values.uploadedFile && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 ${editedFields.uploadFile ? "bg-[#E9F0FE]" : "bg-gray-50"}`}>
              <button onClick={handleFileDownload} className="text-sm font-medium hover:underline" style={{ color: "var(--secondary)" }}>
                {values.uploadedFile}
              </button>
              <button onClick={handleFileRemove} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <section className="mypage-content w-full">
      <section>
        <PageTitle>경영방침</PageTitle>
        <TabMenu tabs={["경영방침 목록"]} activeIndex={0} onTabClick={() => {}} className="mb-6" />
        <div className="flex justify-between items-center mb-3">
          <YearPicker year={values.year} onChange={year => setValues(prev => ({ ...prev, year }))} />
          <div className="flex justify-end gap-1">
            <Button variant="action" loading={isPrinting} onClick={handlePrint} className="flex items-center gap-1">
              <Printer size={16} />
              인쇄
            </Button>
            <Button variant="action" loading={isDownloading} onClick={handleExcelDownload} className="flex items-center gap-1">
              <FileSpreadsheet size={16} />
              Excel
            </Button>
            <Button variant="action" onClick={handleDeleteClick} className="flex items-center gap-1">
              <Trash2 size={16} />
              삭제
            </Button>
          </div>
        </div>
        <FormScreen fields={fields} values={values} editedFields={editedFields} onChange={handleChange} onClose={() => {}} onSave={handleSave} />
        <div className="flex justify-end mt-3">
          <Button variant="primary" onClick={handleSave} disabledStyleOnly={!hasPolicyChanges}>
            저장하기
          </Button>
        </div>
      </section>

      <ApprovalConfirmDialog
        isOpen={isDialogOpen}
        documentType="경영방침"
        approvalLineName={approvalLineName}
        approvers={approvers}
        defaultContent={defaultContent}
        onConfirm={handleConfirmApproval}
        onCancel={handleCancel}
      />
    </section>
  )
}
export default PolicyGoal
