/**
 * 스켈레톤 로더 컴포넌트
 * 데이터 로딩 중 placeholder UI 표시
 */

import React from 'react'

export interface SkeletonProps {
  /**
   * 클래스명
   */
  className?: string

  /**
   * 너비
   */
  width?: string | number

  /**
   * 높이
   */
  height?: string | number

  /**
   * 원형 스켈레톤 여부
   */
  circle?: boolean

  /**
   * 반복 횟수
   */
  count?: number

  /**
   * 애니메이션 비활성화
   */
  noAnimation?: boolean
}

/**
 * Skeleton 컴포넌트
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height = 16,
  circle = false,
  count = 1,
  noAnimation = false,
}) => {
  const baseClass = 'bg-gray-200'
  const animationClass = noAnimation ? '' : 'animate-pulse'
  const shapeClass = circle ? 'rounded-full' : 'rounded'

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (circle && !width) {
    style.width = style.height
  }

  const skeletonElement = (
    <div
      className={`${baseClass} ${animationClass} ${shapeClass} ${className}`}
      style={style}
    />
  )

  if (count === 1) {
    return skeletonElement
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {skeletonElement}
        </div>
      ))}
    </div>
  )
}

/**
 * 텍스트 스켈레톤
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={12}
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * 카드 스켈레톤
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1">
          <Skeleton height={16} width="60%" className="mb-2" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

/**
 * 테이블 스켈레톤
 */
export const SkeletonTable: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* 헤더 */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} height={12} />
          ))}
        </div>
      </div>

      {/* 바디 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-gray-200 p-3 last:border-b-0"
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={12} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 리스트 스켈레톤
 */
export const SkeletonList: React.FC<{
  items?: number
  className?: string
}> = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <Skeleton circle width={48} height={48} />
          <div className="flex-1">
            <Skeleton height={14} width="70%" className="mb-2" />
            <Skeleton height={12} width="40%" />
          </div>
          <Skeleton width={80} height={32} />
        </div>
      ))}
    </div>
  )
}

/**
 * 이미지 스켈레톤
 */
export const SkeletonImage: React.FC<{
  width?: string | number
  height?: string | number
  className?: string
}> = ({ width = '100%', height = 200, className = '' }) => {
  return (
    <Skeleton
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
    />
  )
}

/**
 * 대시보드 위젯 스켈레톤
 */
export const SkeletonWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <Skeleton height={16} width="50%" className="mb-4" />
      <Skeleton height={48} width="100%" className="mb-3" />
      <SkeletonText lines={2} />
    </div>
  )
}

export default Skeleton
