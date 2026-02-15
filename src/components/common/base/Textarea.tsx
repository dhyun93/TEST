import * as React from "react"

import { cn } from "@/utils/cn"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] md:min-h-[80px] w-full rounded-[8px] border border-[var(--border)] bg-white px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm font-normal text-gray-800 placeholder:text-xs placeholder:md:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
