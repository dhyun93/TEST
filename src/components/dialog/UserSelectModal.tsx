/**
 * 조직도에서 사용자 선택 모달
 * - 조직도 인력 목록 조회
 * - 단일 선택 모드
 * - 검색 기능 포함
 */

import React, { useState, useEffect } from "react"
import Button from "@/components/common/base/Button"
import { DIALOG_STYLES } from "@/components/dialog/DialogCommon"
import { X, Search } from "lucide-react"
import { getOrganizationList, OrganizationListPost } from "@/api/10_BusinessManagement/04_Organization"
import { organizationMockData } from "@/data/mockBusinessData"

export type SelectedUser = {
  id: number
  name: string
  position: string // 안전직위
  rank: string // 직급
  phone: string
  subject: string // 부서
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (user: SelectedUser) => void
  title?: string
}

const POSITION_LABELS: Record<number, string> = {
  0: "경영책임자",
  1: "안전보건관리책임자",
  2: "안전관리자",
  3: "보건관리자",
  4: "관리감독자",
  5: "해당없음",
}

export default function UserSelectModal({ isOpen, onClose, onSelect, title = "조직도에서 선택" }: Props) {
  const [users, setUsers] = useState<OrganizationListPost[]>([])
  const [filteredUsers, setFilteredUsers] = useState<OrganizationListPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.subject.toLowerCase().includes(query) ||
          user.rank.toLowerCase().includes(query) ||
          user.phone.includes(query)
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // TODO: 백엔드 API 준비 시 주석 해제
      // const response = await getOrganizationList({
      //   page: 1,
      //   is_over: 0,
      //   end_date: "",
      // })
      // if (response.code === 200) {
      //   setUsers(response.posts)
      //   setFilteredUsers(response.posts)
      // }

      // 임시: Mock 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 300)) // 로딩 시뮬레이션
      const mockUsers = organizationMockData.map(user => ({
        id: typeof user.id === 'number' ? user.id : parseInt(String(user.id)),
        name: String(user.name || ""),
        position: typeof user.positionNum === 'number' ? user.positionNum : 5,
        subject: String(user.subject || ""),
        rank: String(user.rank || ""),
        phone: String(user.phone || ""),
        employment_date: String(user.employment_date || ""),
        designated_date: String(user.designated_date || ""),
        created_at: new Date().toISOString(),
      })) as OrganizationListPost[]

      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } catch (error) {
      console.error("조직도 목록 조회 실패:", error)
      alert("조직도 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (user: OrganizationListPost) => {
    onSelect({
      id: user.id,
      name: user.name,
      position: POSITION_LABELS[user.position] ?? "해당없음",
      rank: user.rank,
      phone: user.phone,
      subject: user.subject,
    })
    setSearchQuery("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={DIALOG_STYLES.overlay}>
      <div className={`${DIALOG_STYLES.container} max-w-3xl`}>
        <div className={DIALOG_STYLES.header}>
          <h2 className={DIALOG_STYLES.title}>{title}</h2>
          <button onClick={onClose} className={DIALOG_STYLES.closeButton}>
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        <div className={DIALOG_STYLES.content}>
          {/* 검색 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="이름, 부서, 직급, 연락처로 검색"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 사용자 목록 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">로딩 중...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchQuery ? "검색 결과가 없습니다." : "등록된 인력이 없습니다."}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">이름</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">안전직위</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">부서</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">직급</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">연락처</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">선택</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{POSITION_LABELS[user.position] ?? "해당없음"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.subject}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.rank}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="primaryOutline" onClick={() => handleSelect(user)} className="text-xs px-3 py-1">
                            선택
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            💡 검토 및 서명이 필요한 담당자를 선택해주세요.
          </div>
        </div>

        <div className={DIALOG_STYLES.footer}>
          <Button variant="primaryOutline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
