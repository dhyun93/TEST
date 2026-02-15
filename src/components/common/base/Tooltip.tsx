// src/components/common/base/Tooltip.tsx
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
  content: string
  side?: "top" | "right" | "bottom" | "left"
  delay?: number
}

export default function Tooltip({ children, content, side = "top", delay = 100 }: Props) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content side={side} sideOffset={4} className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white bg-gray-600 rounded-md shadow-md z-50">
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
