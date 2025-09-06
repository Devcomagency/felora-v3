'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Dialog content */}
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ className, children }: DialogContentProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-felora-obsidian to-felora-charcoal border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl",
      "animate-in fade-in-0 zoom-in-95 duration-300",
      className
    )}>
      {children}
    </div>
  )
}

const DialogHeader = ({ className, children }: DialogHeaderProps) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6 pb-2", className)}>
      {children}
    </div>
  )
}

const DialogTitle = ({ className, children }: DialogTitleProps) => {
  return (
    <h2 className={cn("text-xl font-semibold text-felora-silver", className)}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ className, children }: DialogDescriptionProps) => {
  return (
    <p className={cn("text-sm text-felora-silver/70", className)}>
      {children}
    </p>
  )
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}