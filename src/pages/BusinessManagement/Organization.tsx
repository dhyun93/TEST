import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import html2canvas from "html2canvas"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import Button from "@/components/common/base/Button"
import PageTitle from "@/components/common/base/PageTitle"
import TabMenu from "@/components/common/base/TabMenu"
import Pagination from "@/components/common/base/Pagination"
import OrganizationTree, { OrgNode } from "@/components/snippetBusiness/OrganizationTree"
import StaffRegisterModal from "./StaffRegister"
import useHandlers from "@/hooks/useHandlers"
import usePagination from "@/hooks/usePagination"
import { CirclePlus, Image, Upload, Trash2, ShieldAlert } from "lucide-react"
import { organizationMockData } from "@/data/mockBusinessData"
import TotalCount from "@/components/common/base/TotalCount"
import { useLoadingStore } from "@/stores/loadingStore"
import {
  getOrganizationList,
  deleteOrganization,
  registOrganization,
  uploadOrganization,
  OrganizationListPost,
} from "@/api/10_BusinessManagement/04_Organization"

// true = dummy, false = BE API
const USE_MOCK_DATA = true  // 임시로 Mock 데이터 사용 (백엔드 API 대기 중)

// TODO: 백엔드 position 매핑 확인 필요 (0=경영책임자, 1=안전보건관리책임자, 2=안전관리자, 3=보건관리자, 4=관리감독자)
const POSITION_LABELS: Record<number, string> = {
  0: "경영책임자",
  1: "안전보건관리책임자",
  2: "안전관리자",
  3: "보건관리자",
  4: "관리감독자",
}
const POSITION_VALUES: Record<string, number> = {
  "경영책임자": 0,
  "안전보건관리책임자": 1,
  "안전관리자": 2,
  "보건관리자": 3,
  "관리감독자": 4,
  "해당없음": 5, // TODO: 백엔드 확인 필요
}

const TAB_LABELS = ["전체인력 목록"]
const ORG_CHART_TABS = ["시스템 조직도", "조직도 이미지"]

const columns: Column[] = [
  { key: "name", label: "이름" },
  { key: "safetyPosition", label: "안전직위" },
  { key: "subject", label: "부서" },
  { key: "rank", label: "직급" },
  { key: "phone", label: "연락처" },
  { key: "employment_date", label: "입사일" },
  { key: "designated_date", label: "안전직위 지정일" },
  // TODO: 백엔드 선임신고서 파일 필드 추가 대기
  { key: "appointmentCertificate", label: "선임(신고서)", type: "download" },
  { key: "manage", label: "관리", type: "manage" },
]

type OrgRow = DataRow & {
  id: number | string
  name: string
  safetyPosition: string
  positionNum: number
  subject: string
  rank: string
  phone: string
  employment_date: string
  designated_date: string
  appointmentCertificate: boolean
}

const mapOrgPostToRow = (post: OrganizationListPost): OrgRow => ({
  id: post.id,
  name: post.name,
  safetyPosition: POSITION_LABELS[post.position] ?? "해당없음",
  positionNum: post.position,
  subject: post.subject,
  rank: post.rank,
  phone: post.phone,
  employment_date: post.employment_date,
  designated_date: post.designated_date,
  // TODO: 백엔드 선임신고서 파일 필드 추가 대기
  appointmentCertificate: false,
})

const buildOrgTreeFromStaffs = (staffs: DataRow[]): { treeData: OrgNode | null; supervisors: OrgNode[] } => {
  const ceo = staffs.find(s => s.safetyPosition === "경영책임자")
  const safetyOfficer = staffs.find(s => s.safetyPosition === "안전보건관리책임자")
  const safetyManagers = staffs.filter(s => s.safetyPosition === "안전관리자")
  const healthManagers = staffs.filter(s => s.safetyPosition === "보건관리자")
  const supervisorsList = staffs.filter(s => s.safetyPosition === "관리감독자")

  if (!ceo) return { treeData: null, supervisors: [] }

  const managersChildren: OrgNode[] = [
    ...safetyManagers.map(m => ({
      id: m.id,
      title: "안전관리자",
      name: String(m.name),
      position: String(m.rank || ""),
    })),
    ...healthManagers.map(m => ({
      id: m.id,
      title: "보건관리자",
      name: String(m.name),
      position: String(m.rank || ""),
    })),
  ]

  const treeData: OrgNode = {
    id: ceo.id,
    title: "경영책임자",
    name: String(ceo.name),
    position: String(ceo.rank || ""),
    children: safetyOfficer
      ? [
          {
            id: safetyOfficer.id,
            title: "안전보건관리책임자",
            name: String(safetyOfficer.name),
            position: String(safetyOfficer.rank || ""),
            children: managersChildren.length > 0 ? managersChildren : undefined,
          },
        ]
      : undefined,
  }

  const supervisors: OrgNode[] = supervisorsList.map(s => ({
    id: s.id,
    title: "관리감독자",
    name: String(s.name),
    position: String(s.rank || ""),
  }))

  return { treeData, supervisors }
}

export default function Organization() {
  const { setLoading } = useLoadingStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const orgChartRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<OrgRow | null>(null)
  const [orgChartTab, setOrgChartTab] = useState(0)
  const [uploadedOrgChart, setUploadedOrgChart] = useState<string>("")

  // mock
  const [mockStaffs, setMockStaffs] = useState<OrgRow[]>(organizationMockData as OrgRow[])
  const { currentPage: mockCurrentPage, totalPages: mockTotalPages, currentData: mockCurrentData, onPageChange: mockOnPageChange } = usePagination<OrgRow>(mockStaffs, 30)

  // BE API
  const [apiStaffs, setApiStaffs] = useState<OrgRow[]>([])
  const [apiCurrentPage, setApiCurrentPage] = useState(1)
  const [apiTotalCount, setApiTotalCount] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(0)

  const fetchOrganizationList = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await getOrganizationList({
        page: apiCurrentPage,
        is_over: 0,
        end_date: "",
      })
      if (response.code === 200) {
        setApiStaffs(response.posts.map(mapOrgPostToRow))
        setApiTotalCount(response.all_count ?? 0)
        setApiTotalPages(response.all_page_count ?? 1)
      }
    } catch (error) {
      console.error("전체인력 목록 조회 실패:", error)
    }
  }, [apiCurrentPage])

  useEffect(() => {
    if (!USE_MOCK_DATA) fetchOrganizationList()
  }, [fetchOrganizationList])

  // data branching
  const staffs = USE_MOCK_DATA ? mockStaffs : apiStaffs
  const currentPage = USE_MOCK_DATA ? mockCurrentPage : apiCurrentPage
  const totalPages = USE_MOCK_DATA ? mockTotalPages : Math.max(1, apiTotalPages)
  const currentData = USE_MOCK_DATA ? mockCurrentData : apiStaffs
  const onPageChange = USE_MOCK_DATA ? mockOnPageChange : setApiCurrentPage

  useEffect(() => {
    setSearchParams({ tab: ORG_CHART_TABS[orgChartTab] })
  }, [orgChartTab, setSearchParams])

  const { handleDelete: mockHandleDelete } = useHandlers({
    data: staffs,
    checkedIds,
    onDeleteSuccess: ids => {
      if (USE_MOCK_DATA) setMockStaffs(prev => prev.filter(row => !ids.includes(row.id)))
    },
  })

  const handleApiDelete = async () => {
    if (checkedIds.length === 0) {
      alert("삭제할 항목을 선택하세요")
      return
    }
    if (!window.confirm("정말 삭제하시겠습니까?")) return

    try {
      const postIds = checkedIds.map(id => (typeof id === "number" ? id : Number(id)))
      const response = await deleteOrganization({ post_id: postIds })
      if (response.code === 200) {
        alert("삭제되었습니다.")
        setCheckedIds([])
        fetchOrganizationList()
      } else {
        alert(response.msg || "삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("인력 삭제 실패:", error)
      alert("삭제에 실패했습니다.")
    }
  }

  const handleDelete = USE_MOCK_DATA ? mockHandleDelete : handleApiDelete

  const { handleDelete: handleDeleteOrgImage } = useHandlers({
    data: uploadedOrgChart ? [{ id: 1 }] : [],
    checkedIds: uploadedOrgChart ? [1] : [],
    onDeleteSuccess: () => setUploadedOrgChart(""),
  })

  const { treeData, supervisors } = useMemo(() => buildOrgTreeFromStaffs(staffs), [staffs])

  // TODO: 조직도 이미지 조회 API 필요 (현재 업로드만 가능)
  const handleOrgChartFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const file = e.target.files[0]
    setUploadedOrgChart(URL.createObjectURL(file))

    if (!USE_MOCK_DATA) {
      try {
        const response = await uploadOrganization({ image: file })
        if (response.code !== 200) {
          alert(response.msg || "조직도 이미지 업로드에 실패했습니다.")
        }
      } catch (error) {
        console.error("조직도 이미지 업로드 실패:", error)
      }
    }
  }

  const handleSaveStaff = async (staff: Partial<DataRow>) => {
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      if (isEditMode && selectedRow) {
        setMockStaffs(prev => prev.map(r => (r.id === selectedRow.id ? { ...r, ...staff } as OrgRow : r)))
      } else {
        setMockStaffs(prev => [{ id: Date.now(), ...staff } as OrgRow, ...prev])
      }
      setModalOpen(false)
      setIsEditMode(false)
      setSelectedRow(null)
      return
    }

    try {
      setLoading(true)
      const positionNum = POSITION_VALUES[String(staff.safetyPosition || "")] ?? 5
      const response = await registOrganization({
        data: [{
          post_id: isEditMode && selectedRow ? Number(selectedRow.id) : 0,
          name: String(staff.name || ""),
          position: positionNum,
          subject: String(staff.subject || ""),
          rank: String(staff.rank || ""),
          phone: String(staff.phone || ""),
          employment_date: String(staff.employment_date || ""),
          designated_date: staff.designated_date ? String(staff.designated_date) : undefined,
        }],
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        setModalOpen(false)
        setIsEditMode(false)
        setSelectedRow(null)
        fetchOrganizationList()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("인력 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (row: DataRow) => {
    // TODO: 백엔드 선임신고서 파일 필드 추가 후 다운로드 구현
    if (row.appointmentCertificate) {
      alert(`파일 다운로드: ${row.appointmentCertificate}`)
    } else {
      alert("등록된 파일이 없습니다.")
    }
  }

  const handleSaveAsImage = async () => {
    if (!orgChartRef.current) return
    try {
      const canvas = await html2canvas(orgChartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `안전조직도_${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      alert("이미지 저장에 실패했습니다.")
    }
  }

  return (
    <section className="mypage-content w-full">
      <PageTitle>전체인력관리</PageTitle>
      <TabMenu tabs={TAB_LABELS} activeIndex={0} onTabClick={() => {}} className="mb-6" />

      <div className="flex justify-between items-center mb-3">
        <TotalCount count={USE_MOCK_DATA ? staffs.length : apiTotalCount} />
        <div className="flex gap-1">
          <Button
            variant="action"
            onClick={() => {
              setIsEditMode(false)
              setSelectedRow(null)
              setModalOpen(true)
            }}
            className="flex items-center gap-1"
          >
            <CirclePlus size={16} />
            인력추가
          </Button>
          <Button variant="action" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            삭제
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <DataTable
          columns={columns}
          data={currentData}
          onCheckedChange={setCheckedIds}
          onDownloadClick={handleDownload}
          onManageClick={row => {
            setSelectedRow(row as OrgRow)
            setIsEditMode(true)
            setModalOpen(true)
          }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      <PageTitle>안전조직도</PageTitle>
      <TabMenu tabs={ORG_CHART_TABS} activeIndex={orgChartTab} onTabClick={setOrgChartTab} className="mb-3" />

      {orgChartTab === 0 ? (
        <div>
          <div className="flex justify-end gap-1 mb-3">
            <Button variant="action" onClick={handleSaveAsImage} className="flex items-center gap-1">
              <Image size={16} />
              이미지로 저장
            </Button>
          </div>
          <div ref={orgChartRef} className="w-full bg-white rounded-[8px] p-6 flex justify-center">
            <div className="w-full max-w-[1200px] text-center">
              {treeData ? (
                <OrganizationTree data={treeData} supervisors={supervisors} />
              ) : (
                <div className="flex flex-col items-center text-center text-gray-600 py-16">
                  <div className="mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShieldAlert size={24} className="sm:w-8 sm:h-8 w-6 h-6 text-gray-500" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold mb-1">경영책임자가 등록되지 않았습니다.</h3>
                  <p className="text-xs sm:text-sm text-gray-500">인력추가에서 경영책임자를 먼저 등록해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {uploadedOrgChart && (
            <div className="flex justify-end gap-1 mb-3">
              <Button variant="action" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1">
                <Upload size={16} />
                이미지 변경
              </Button>
              <Button variant="action" onClick={handleDeleteOrgImage} className="flex items-center gap-1">
                <Trash2 size={16} />
                삭제
              </Button>
            </div>
          )}
          <div className="w-full bg-white rounded-[8px] p-6 flex justify-center min-h-[200px]">
            {uploadedOrgChart ? (
              <div className="w-full flex justify-center">
                <img src={uploadedOrgChart} alt="조직도이미지" className="max-w-[800px] max-h-[600px] object-contain rounded" />
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-gray-600 mt-16 mb-16">
                <div className="mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShieldAlert size={24} className="sm:w-8 sm:h-8 w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold mb-1">사업장 조직도가 등록되지 않았습니다.</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-5">조직도 이미지를 업로드한 후 조직관리를 시작해보세요</p>
                <Button variant="action" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-1 px-6">
                  <Upload size={16} className="text-gray-500" />
                  조직도 이미지 업로드
                </Button>
              </div>
            )}
          </div>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" ref={fileInputRef} className="hidden" onChange={handleOrgChartFileChange} />
        </div>
      )}

      <StaffRegisterModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setIsEditMode(false)
          setSelectedRow(null)
        }}
        onSave={handleSaveStaff}
        existingStaffs={staffs}
        editData={selectedRow}
        isEdit={isEditMode}
      />
    </section>
  )
}
