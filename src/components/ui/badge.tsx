'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          {
            'border-transparent bg-felora-aurora text-white': variant === 'default',
            'border-transparent bg-white/10 text-felora-silver': variant === 'secondary',
            'border-transparent bg-red-500 text-white': variant === 'destructive',
            'border-white/20 text-felora-silver': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }