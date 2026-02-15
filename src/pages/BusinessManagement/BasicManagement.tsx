import React, { useCallback, useEffect, useMemo, useState } from "react"
import Button from "@/components/common/base/Button"
import DataTable, { Column, DataRow } from "@/components/common/tables/DataTable"
import PageTitle from "@/components/common/base/PageTitle"
import FormScreen, { Field } from "@/components/common/forms/FormScreen"
import TabMenu from "@/components/common/base/TabMenu"
import SignaturePadDialog from "@/components/dialog/SignaturePadDialog"
import { basicManagementMockData } from "@/data/mockBusinessData"
import { BUSINESS_SUBJECT_OPTIONS, BUSINESS_TYPE_OPTIONS, getOptionValueById } from "@/constants/options/business"
import { useLoadingStore } from "@/stores/loadingStore"
import { formatPhoneNumberFlexible } from "@/utils/phone"
import { formatBusinessNumber } from "@/utils/number"
import { useAlerts } from "@/hooks/useAlerts"
import {
  BaseManageInfoPost,
  getBaseManageInfo,
  getBusinessPlaceList,
  manageBusinessPlaceList,
  registBaseManageInfo,
  BusinessPlaceListPost,
  BusinessPlaceListRequestItem,
} from "@/api/10_BusinessManagement/01_Basic"

// true = dummy, false = BE API
const USE_MOCK_DATA = false

const columns: Column[] = [
  { key: "factory", label: "사업장명", type: "input" },
  { key: "manager", label: "안전보건관리책임자", type: "input" },
  { key: "contact", label: "연락처", type: "input", maxLength: 13, formatter: formatPhoneNumberFlexible },
  { key: "address", label: "사업장 소재지", type: "input" },
]

type FormValues = {
  company: string
  ceo: string
  address: string
  phone: string
  businessType1: string
  businessType2: string
  businessNumber: string
  signature: string
}

const emptyFormValues: FormValues = {
  company: "",
  ceo: "",
  address: "",
  phone: "",
  businessType1: "",
  businessType2: "",
  businessNumber: "",
  signature: "",
}

const mockFormValues: FormValues = {
  company: "주식회사 테스트",
  ceo: "박대표",
  address: "서울특별시 강남구 도곡동 11-1",
  phone: "010-3867-1234",
  businessType1: "",
  businessType2: "",
  businessNumber: "333-00-67890",
  signature: "/images/sample-signature.png",
}

const formatPhone = (value: string) => formatPhoneNumberFlexible(value)

const buildPhone = (values: FormValues) => values.phone.replace(/[^\d]/g, "")

const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const [header, body] = dataUrl.split(",")
  if (!header || !body) return null
  const match = header.match(/data:(.*);base64/)
  if (!match) return null
  const mime = match[1]
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], fileName, { type: mime })
}

const mapBaseInfoToForm = (post: BaseManageInfoPost): FormValues => {
  return {
    company: post.title || "",
    ceo: post.ceo_name || "",
    address: post.address || "",
    phone: formatPhone(post.phone || ""),
    businessType1: getOptionValueById(BUSINESS_TYPE_OPTIONS, post.business_type),
    businessType2: getOptionValueById(BUSINESS_SUBJECT_OPTIONS, post.subject),
    businessNumber: formatBusinessNumber(post.business_num || ""),
    signature: post.seal || "",
  }
}

const mapPlacePostToRow = (post: BusinessPlaceListPost): DataRow => ({
  id: post.id,
  factory: post.title,
  manager: post.manager,
  contact: post.phone,
  address: post.address,
})

export default function BasicManagement() {
  const { setLoading } = useLoadingStore()
  const { alertNoChanges } = useAlerts()
  const [formValues, setFormValues] = useState<FormValues>(USE_MOCK_DATA ? mockFormValues : emptyFormValues)
  const [sealFile, setSealFile] = useState<File | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [baseSnapshot, setBaseSnapshot] = useState<FormValues>(USE_MOCK_DATA ? mockFormValues : emptyFormValues)

  const [mockData, setMockData] = useState<DataRow[]>(basicManagementMockData)
  const [apiData, setApiData] = useState<DataRow[]>([])
  const [placeSnapshot, setPlaceSnapshot] = useState<DataRow[]>(USE_MOCK_DATA ? basicManagementMockData : [])
  const [checkedIds, setCheckedIds] = useState<(number | string)[]>([])

  const data = USE_MOCK_DATA ? mockData : apiData
  const setData = USE_MOCK_DATA ? setMockData : setApiData

  const normalizeBaseForm = (values: FormValues) => ({
    company: values.company.trim(),
    ceo: values.ceo.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    businessType1: values.businessType1,
    businessType2: values.businessType2,
    businessNumber: values.businessNumber.trim(),
    signature: values.signature,
  })

  const editedFields: Record<string, boolean> = useMemo(() => {
    const current = normalizeBaseForm(formValues)
    const snapshot = normalizeBaseForm(baseSnapshot)
    return {
      company: current.company !== snapshot.company,
      ceo: current.ceo !== snapshot.ceo,
      address: current.address !== snapshot.address,
      phone: current.phone !== snapshot.phone,
      businessType1: current.businessType1 !== snapshot.businessType1,
      businessType2: current.businessType2 !== snapshot.businessType2,
      businessNumber: current.businessNumber !== snapshot.businessNumber,
      signature: current.signature !== snapshot.signature,
    }
  }, [formValues, baseSnapshot])

  const hasBaseChanges = useMemo(() => {
    const current = normalizeBaseForm(formValues)
    const snapshot = normalizeBaseForm(baseSnapshot)
    return JSON.stringify(current) !== JSON.stringify(snapshot) || Boolean(sealFile)
  }, [formValues, baseSnapshot, sealFile])

  const normalizePlaceRows = (rows: DataRow[]) =>
    rows.map(row => ({
      id: row.id,
      factory: (row.factory || "").trim(),
      manager: (row.manager || "").trim(),
      contact: (row.contact || "").trim(),
      address: (row.address || "").trim(),
    }))

  const hasPlaceChanges = useMemo(() => {
    const current = normalizePlaceRows(data)
    const snapshot = normalizePlaceRows(placeSnapshot)
    return JSON.stringify(current) !== JSON.stringify(snapshot)
  }, [data, placeSnapshot])

  const isBaseSaveDisabled = !hasBaseChanges
  const isPlaceSaveDisabled = !hasPlaceChanges

  const modifiedPlaceFields = useMemo(() => {
    const snapshotMap = new Map(normalizePlaceRows(placeSnapshot).map(row => [row.id, row]))
    const result = new Map<number | string, Set<string>>()

    normalizePlaceRows(data).forEach(row => {
      const base = snapshotMap.get(row.id)
      if (!base) return
      const changed = new Set<string>()
      if (row.factory !== base.factory) changed.add("factory")
      if (row.manager !== base.manager) changed.add("manager")
      if (row.contact !== base.contact) changed.add("contact")
      if (row.address !== base.address) changed.add("address")
      if (changed.size > 0) result.set(row.id, changed)
    })

    return result
  }, [data, placeSnapshot])

  const fetchBaseInfo = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await getBaseManageInfo()
      if (response.code === 200 && response.posts) {
        const mapped = mapBaseInfoToForm(response.posts)
        setFormValues(mapped)
        setBaseSnapshot(mapped)
        setSealFile(null)
      }
    } catch (error) {
      console.error("기본사업장정보 조회 실패:", error)
    }
  }, [])

  const fetchBusinessPlaces = useCallback(async () => {
    if (USE_MOCK_DATA) return
    try {
      const response = await getBusinessPlaceList({ page: 1 })
      if (response.code === 200) {
        const mapped = response.posts.map(mapPlacePostToRow)
        setApiData(mapped)
        setPlaceSnapshot(mapped)
      }
    } catch (error) {
      console.error("사업장목록 조회 실패:", error)
    }
  }, [])

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      fetchBaseInfo()
      fetchBusinessPlaces()
    }
  }, [fetchBaseInfo, fetchBusinessPlaces])

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setPlaceSnapshot(mockData)
      setBaseSnapshot(mockFormValues)
    }
  }, [USE_MOCK_DATA, mockData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const nextValue = name === "businessNumber" ? formatBusinessNumber(value) : value
    setFormValues(prev => ({ ...prev, [name]: nextValue }))
  }

  const handleSignatureEdit = () => {
    setShowSignaturePad(true)
  }

  const handleSignatureSave = (dataUrl: string) => {
    setFormValues(prev => ({ ...prev, signature: dataUrl }))
    const file = dataUrlToFile(dataUrl, "seal.png")
    if (file) setSealFile(file)
    setShowSignaturePad(false)
  }

  const handleAdd = () => {
    const newId = data.length > 0 ? Math.max(...data.map(d => Number(d.id))) + 1 : 1
    setData(prev => [...prev, { id: newId, factory: "", manager: "", contact: "", address: "" }])
  }

  const handleBaseSave = async () => {
    if (!hasBaseChanges) {
      alertNoChanges()
      return
    }
    if (!window.confirm("저장하시겠습니까?")) return

    if (USE_MOCK_DATA) {
      alert("저장되었습니다.")
      setBaseSnapshot(formValues)
      return
    }

    try {
      setLoading(true)
      const response = await registBaseManageInfo({
        title: formValues.company,
        ceo_name: formValues.ceo,
        business_num: formValues.businessNumber,
        phone: buildPhone(formValues),
        address: formValues.address,
        business_type: Number(formValues.businessType1 || 0),
        subject: Number(formValues.businessType2 || 0),
        seal: sealFile || undefined,
      })
      if (response.code === 200) {
        alert("저장되었습니다.")
        fetchBaseInfo()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("기본사업장정보 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceSave = async () => {
    const emptyRows = data.filter(row => {
      const hasValues = Boolean(row.factory || row.manager || row.contact || row.address)
      return !hasValues
    })
    if (emptyRows.length > 0) {
      alert("내용을 입력해주세요.")
      return
    }
    if (!hasPlaceChanges) {
      alertNoChanges()
      return
    }
    if (!window.confirm("저장하시겠습니까?")) return

    const payload: BusinessPlaceListRequestItem[] = data.map(row => ({
      id: typeof row.id === "number" ? row.id : Number(row.id),
      title: row.factory,
      manager: row.manager,
      phone: row.contact,
      address: row.address,
    }))

    if (USE_MOCK_DATA) {
      alert("저장되었습니다.")
      setPlaceSnapshot(data)
      return
    }

    try {
      setLoading(true)
      const response = await manageBusinessPlaceList(payload)
      if (response.code === 200) {
        alert("저장되었습니다.")
        fetchBusinessPlaces()
      } else {
        alert(response.msg || "저장에 실패했습니다.")
      }
    } catch (error) {
      console.error("사업장목록 저장 실패:", error)
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const formFields: Field[] = useMemo(
    () => [
      { name: "company", label: "회사명", type: "text" },
      { name: "ceo", label: "대표자", type: "text" },
      { name: "address", label: "주소지", type: "text" },
      {
        name: "phone",
        label: "전화번호",
        type: "phone",
        formatter: formatPhoneNumberFlexible,
        options: [
          { value: "010", label: "010" },
          { value: "070", label: "070" },
          { value: "02", label: "02" },
          { value: "031", label: "031" },
          { value: "032", label: "032" },
          { value: "033", label: "033" },
          { value: "041", label: "041" },
          { value: "042", label: "042" },
          { value: "043", label: "043" },
          { value: "044", label: "044" },
          { value: "051", label: "051" },
          { value: "052", label: "052" },
          { value: "053", label: "053" },
          { value: "054", label: "054" },
          { value: "055", label: "055" },
          { value: "061", label: "061" },
          { value: "062", label: "062" },
          { value: "063", label: "063" },
          { value: "064", label: "064" },
        ],
      },
      {
        name: "businessType1",
        label: "업종",
        type: "select",
        options: [{ value: "", label: "선택" }, ...BUSINESS_TYPE_OPTIONS],
      },
      {
        name: "businessType2",
        label: "업태",
        type: "select",
        options: [{ value: "", label: "선택" }, ...BUSINESS_SUBJECT_OPTIONS],
      },
      { name: "businessNumber", label: "사업자등록번호", type: "text" },
      { name: "signature", label: "서명", type: "signature", signatureEditable: true, onSignatureEdit: handleSignatureEdit },
    ],
    [handleSignatureEdit]
  )

  return (
    <>
      <section className="mypage-content w-full">
        <div className="flex justify-between items-center">
          <PageTitle>기본사업장관리</PageTitle>
        </div>

        <TabMenu tabs={["기본사업장관리"]} activeIndex={0} onTabClick={() => {}} className="mb-6" />

        <FormScreen fields={formFields} values={formValues} editedFields={editedFields} onChange={handleChange} onClose={() => {}} onSave={handleBaseSave} />

        <div className="flex justify-end mt-3">
          <Button variant="primary" onClick={handleBaseSave} disabledStyleOnly={isBaseSaveDisabled}>
            저장하기
          </Button>
        </div>

        <div className="flex justify-between items-center mt-8 mb-2">
          <div>
            <PageTitle>사업장목록</PageTitle>
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <DataTable
            columns={columns}
            data={data}
            onCheckedChange={setCheckedIds}
            onInputChange={(id, key, val) => setData(prev => prev.map(row => (row.id === id ? { ...row, [key]: val } : row)))}
            inputClassName={(row, columnKey) => (modifiedPlaceFields.get(row.id)?.has(columnKey) ? "bg-[#E9F0FE]" : "")}
          />
          <div className="mt-3 flex justify-start">
            <Button variant="rowAdd" onClick={handleAdd}>
              + 사업장추가
            </Button>
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <Button variant="primary" onClick={handlePlaceSave} disabledStyleOnly={isPlaceSaveDisabled}>
            저장하기
          </Button>
        </div>
      </section>

      <SignaturePadDialog isOpen={showSignaturePad} onSave={handleSignatureSave} onClose={() => setShowSignaturePad(false)} title="서명하기" />
    </>
  )
}
