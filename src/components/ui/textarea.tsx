'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-felora-silver placeholder:text-felora-silver/50 focus:outline-none focus:ring-2 focus:ring-felora-aurora/50 focus:border-felora-aurora/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }