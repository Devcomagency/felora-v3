'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const contextValue = {
    value,
    onValueChange,
    isOpen,
    setIsOpen
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = ({ className, children }: SelectTriggerProps) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-felora-silver placeholder:text-felora-silver/50 focus:outline-none focus:ring-2 focus:ring-felora-aurora/50 focus:border-felora-aurora/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
    </button>
  )
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

const SelectContent = ({ children }: SelectContentProps) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.select-root')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div className="select-root absolute top-full left-0 z-50 w-full mt-1 max-h-60 overflow-auto rounded-xl border border-white/10 bg-felora-obsidian backdrop-blur-xl shadow-lg">
      {children}
    </div>
  )
}

const SelectItem = ({ value, children }: SelectItemProps) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleClick = () => {
    onValueChange?.(value)
    setIsOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center px-3 py-2 text-sm text-felora-silver hover:bg-white/10 focus:outline-none focus:bg-white/10 first:rounded-t-xl last:rounded-b-xl"
    >
      {children}
    </button>
  )
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}