import * as React from "react"

import { cn } from "@/utils/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[32px] md:h-[36px] w-full rounded-[8px] border border-[var(--border)] bg-white px-2 md:px-3 py-1 text-xs md:text-sm font-normal text-gray-800 shadow-none transition-colors file:border-0 file:bg-transparent file:text-xs file:md:text-sm file:font-medium file:text-foreground placeholder:text-xs placeholder:md:text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
