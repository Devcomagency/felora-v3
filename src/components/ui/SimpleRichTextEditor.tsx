/**
 * @fileoverview Éditeur de texte enrichi simple
 * Permet formatage basique : gras, italique, listes
 */
'use client'

import { useState, useRef } from 'react'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SimpleRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minLength?: number
  rows?: number
}

export default function SimpleRichTextEditor({
  value,
  onChange,
  placeholder = 'Décrivez-vous...',
  minLength = 0,
  rows = 6
}: SimpleRichTextEditorProps) {
  const t = useTranslations('common')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (selectedText) {
      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
      onChange(newText)

      // Restaurer la sélection
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, end + before.length)
      }, 0)
    }
  }

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = value.substring(0, start) + text + value.substring(end)
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleBold = () => wrapSelection('**', '**')
  const handleItalic = () => wrapSelection('*', '*')
  const handleBulletList = () => insertAtCursor('\n• ')
  const handleNumberedList = () => {
    const lines = value.split('\n')
    const currentLine = value.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length
    insertAtCursor(`\n${currentLine}. `)
  }

  const charCount = value.length
  const isValid = charCount >= minLength

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg border border-gray-600/50">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          title="Gras (**texte**)"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          title="Italique (*texte*)"
        >
          <Italic size={18} />
        </button>
        <div className="w-px h-6 bg-gray-600" />
        <button
          type="button"
          onClick={handleBulletList}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          title="Liste à puces"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={handleNumberedList}
          className="p-2 rounded hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          title="Liste numérotée"
        >
          <ListOrdered size={18} />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none font-sans"
        style={{ lineHeight: '1.6' }}
      />

      {/* Character count */}
      <div className={`text-xs ${isValid ? 'text-emerald-300' : 'text-gray-400'}`}>
        {t('charCount', { current: charCount, min: minLength })}
      </div>
    </div>
  )
}
