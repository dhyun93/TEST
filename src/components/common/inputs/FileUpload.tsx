/**
 * 파일 업로드 컴포넌트
 * 파일 업로드 로직을 통합하여 재사용 가능하도록 구성
 */

import React, { useRef, useState } from 'react'
import { Upload, X, File } from 'lucide-react'
import toast from '@/utils/toast'
import { showErrorToast } from '@/utils/errorHandler'
import Button from '../base/Button'

export interface FileUploadProps {
  /**
   * 허용할 파일 타입 (예: 'image/*', '.pdf', 'image/png,image/jpeg')
   */
  accept?: string

  /**
   * 최대 파일 크기 (MB 단위)
   */
  maxSize?: number

  /**
   * 다중 파일 선택 허용 여부
   */
  multiple?: boolean

  /**
   * 파일 업로드 핸들러
   * @param files - 선택된 파일 배열
   * @returns Promise<void>
   */
  onUpload: (files: File[]) => Promise<void>

  /**
   * 파일 선택 후 콜백 (업로드 전)
   */
  onFileSelect?: (files: File[]) => void

  /**
   * 업로드 성공 후 콜백
   */
  onSuccess?: () => void

  /**
   * 비활성화 여부
   */
  disabled?: boolean

  /**
   * 버튼 텍스트
   */
  buttonText?: string

  /**
   * 버튼 variant
   */
  variant?: 'primary' | 'secondary' | 'action' | 'outline'

  /**
   * 클래스명
   */
  className?: string

  /**
   * 선택된 파일 표시 여부
   */
  showSelectedFiles?: boolean
}

/**
 * FileUpload 컴포넌트
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  maxSize = 10,
  multiple = false,
  onUpload,
  onFileSelect,
  onSuccess,
  disabled = false,
  buttonText = '파일 선택',
  variant = 'action',
  className = '',
  showSelectedFiles = true,
}) => {
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 파일 크기 검증
   */
  const validateFileSize = (file: File): boolean => {
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`파일 크기는 ${maxSize}MB 이하만 가능합니다. (${file.name})`)
      return false
    }
    return true
  }

  /**
   * 파일 타입 검증
   */
  const validateFileType = (file: File): boolean => {
    if (accept === '*') return true

    const acceptedTypes = accept.split(',').map(t => t.trim())
    const fileType = file.type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    const isValid = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        // image/*, video/* 등
        const category = type.split('/')[0]
        return fileType.startsWith(category + '/')
      } else if (type.startsWith('.')) {
        // .pdf, .jpg 등
        return fileExtension === type.toLowerCase()
      } else {
        // image/jpeg, application/pdf 등
        return fileType === type
      }
    })

    if (!isValid) {
      toast.error(`허용되지 않는 파일 형식입니다. (${file.name})`)
      return false
    }

    return true
  }

  /**
   * 파일 선택 핸들러
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    // 파일 검증
    const validFiles = files.filter(file => {
      return validateFileSize(file) && validateFileType(file)
    })

    if (validFiles.length === 0) return

    // 선택된 파일 저장
    setSelectedFiles(validFiles)

    // 파일 선택 콜백
    if (onFileSelect) {
      onFileSelect(validFiles)
    }

    // 자동 업로드
    await handleUpload(validFiles)

    // 파일 input 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * 파일 업로드 실행
   */
  const handleUpload = async (files: File[]) => {
    setUploading(true)
    try {
      await onUpload(files)
      toast.success(
        files.length === 1
          ? '파일 업로드 완료'
          : `${files.length}개 파일 업로드 완료`
      )
      if (onSuccess) {
        onSuccess()
      }
      setSelectedFiles([])
    } catch (error) {
      showErrorToast(error, '파일 업로드')
    } finally {
      setUploading(false)
    }
  }

  /**
   * 파일 선택 대화상자 열기
   */
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  /**
   * 선택된 파일 제거
   */
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  /**
   * 파일 크기 포맷팅
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={`file-upload ${className}`}>
      {/* 파일 input (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* 업로드 버튼 */}
      <Button
        variant={variant}
        onClick={openFileDialog}
        disabled={disabled || uploading}
        className="flex items-center gap-2"
      >
        <Upload size={18} />
        {uploading ? '업로드 중...' : buttonText}
      </Button>

      {/* 선택된 파일 목록 */}
      {showSelectedFiles && selectedFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
            >
              <File size={16} className="text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                disabled={uploading}
                className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
