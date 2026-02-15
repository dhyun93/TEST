import React from "react"

interface PageTitleProps {
  children: React.ReactNode
  className?: string
}

const PageTitle: React.FC<PageTitleProps> = ({ children, className = "" }) => <h2 className={`text-[0.9rem] sm:text-[1.3rem] font-semibold text-[#1F1F1F] mb-2 sm:mb-3 ${className}`}>{children}</h2>

export default PageTitle
