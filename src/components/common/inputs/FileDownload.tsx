/**
 * 파일 다운로드 컴포넌트
 * 파일 다운로드 로직을 통합하여 재사용 가능하도록 구성
 */

import React, { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import toast from '@/utils/toast'
import { showErrorToast } from '@/utils/errorHandler'
import Button from '../base/Button'

export interface FileDownloadProps {
  /**
   * 파일 URL
   */
  fileUrl?: string

  /**
   * 파일명 (다운로드 시 사용)
   */
  fileName?: string

  /**
   * 버튼 텍스트
   */
  buttonText?: string

  /**
   * 아이콘 표시 여부
   */
  showIcon?: boolean

  /**
   * 버튼 variant
   */
  variant?: 'primary' | 'secondary' | 'action' | 'outline'

  /**
   * 비활성화 여부
   */
  disabled?: boolean

  /**
   * 클래스명
   */
  className?: string

  /**
   * 다운로드 성공 후 콜백
   */
  onSuccess?: () => void

  /**
   * 커스텀 다운로드 핸들러
   * fileUrl이 없을 때 사용
   */
  onDownload?: () => Promise<void>

  /**
   * 링크 스타일로 표시 (버튼 대신)
   */
  asLink?: boolean
}

/**
 * FileDownload 컴포넌트
 */
export const FileDownload: React.FC<FileDownloadProps> = ({
  fileUrl,
  fileName,
  buttonText = '다운로드',
  showIcon = true,
  variant = 'outline',
  disabled = false,
  className = '',
  onSuccess,
  onDownload,
  asLink = false,
}) => {
  const [downloading, setDownloading] = useState(false)

  /**
   * 파일 다운로드 실행
   */
  const handleDownload = async () => {
    // 파일 URL도 없고 커스텀 핸들러도 없으면 에러
    if (!fileUrl && !onDownload) {
      toast.error('다운로드할 파일이 없습니다')
      return
    }

    setDownloading(true)

    try {
      // 커스텀 핸들러가 있으면 사용
      if (onDownload) {
        await onDownload()
        toast.success('다운로드 완료')
        if (onSuccess) onSuccess()
        return
      }

      // 파일 URL이 있으면 다운로드
      if (fileUrl) {
        await downloadFile(fileUrl, fileName)
        toast.success('다운로드 완료')
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      showErrorToast(error, '파일 다운로드')
    } finally {
      setDownloading(false)
    }
  }

  /**
   * 파일 다운로드 헬퍼
   */
  const downloadFile = async (url: string, filename?: string): Promise<void> => {
    try {
      // fetch로 파일 가져오기
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('파일을 다운로드할 수 없습니다')
      }

      // Blob 생성
      const blob = await response.blob()

      // 다운로드 링크 생성
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl

      // 파일명 설정
      if (filename) {
        link.download = filename
      } else {
        // URL에서 파일명 추출 시도
        const urlFilename = url.split('/').pop()
        if (urlFilename) {
          link.download = urlFilename
        } else {
          link.download = 'download'
        }
      }

      // 다운로드 실행
      document.body.appendChild(link)
      link.click()

      // 정리
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw error
    }
  }

  // 링크 스타일로 렌더링
  if (asLink) {
    return (
      <button
        onClick={handleDownload}
        disabled={disabled || downloading}
        className={`inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {showIcon && <Download size={14} />}
        <span>{downloading ? '다운로드 중...' : buttonText}</span>
      </button>
    )
  }

  // 버튼 스타일로 렌더링
  return (
    <Button
      variant={variant}
      onClick={handleDownload}
      disabled={disabled || downloading || (!fileUrl && !onDownload)}
      className={`flex items-center gap-2 ${className}`}
    >
      {showIcon && <Download size={18} />}
      {downloading ? '다운로드 중...' : buttonText}
    </Button>
  )
}

/**
 * 파일 정보 표시 + 다운로드 컴포넌트
 */
export interface FileInfoWithDownloadProps extends Omit<FileDownloadProps, 'buttonText' | 'asLink'> {
  /**
   * 파일 크기 (bytes)
   */
  fileSize?: number

  /**
   * 업로드 날짜
   */
  uploadDate?: string
}

export const FileInfoWithDownload: React.FC<FileInfoWithDownloadProps> = ({
  fileName,
  fileSize,
  uploadDate,
  ...downloadProps
}) => {
  /**
   * 파일 크기 포맷팅
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
      <FileText size={24} className="text-gray-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">
          {fileName || '파일'}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {fileSize && <span>{formatFileSize(fileSize)}</span>}
          {fileSize && uploadDate && <span>•</span>}
          {uploadDate && <span>{uploadDate}</span>}
        </div>
      </div>
      <FileDownload
        {...downloadProps}
        fileName={fileName}
        buttonText="다운로드"
        showIcon={true}
        variant="outline"
      />
    </div>
  )
}

export default FileDownload
