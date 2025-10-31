'use client'

import React, { useState } from 'react'
import { Download, Send, Ban, CheckCircle, Trash2, Mail, X } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBanUsers: () => void
  onUnbanUsers: () => void
  onSendNotification: () => void
  onSendEmail: () => void
  onDeleteUsers: () => void
  onExportCSV: () => void
}

export default function BulkActions({
  selectedCount,
  onClearSelection,
  onBanUsers,
  onUnbanUsers,
  onSendNotification,
  onSendEmail,
  onDeleteUsers,
  onExportCSV
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-purple-500/95 to-pink-500/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-white/20">
            <span className="text-white font-medium">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={onClearSelection}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Désélectionner tout"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSendNotification}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
              title="Envoyer une notification"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Notification</span>
            </button>

            <button
              onClick={onSendEmail}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
              title="Envoyer un email"
            >
              <Mail size={16} />
              <span className="hidden sm:inline">Email</span>
            </button>

            <button
              onClick={onBanUsers}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/30 hover:bg-red-500/40 text-white rounded-lg transition-colors text-sm"
              title="Bannir"
            >
              <Ban size={16} />
              <span className="hidden sm:inline">Bannir</span>
            </button>

            <button
              onClick={onUnbanUsers}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/30 hover:bg-green-500/40 text-white rounded-lg transition-colors text-sm"
              title="Débannir"
            >
              <CheckCircle size={16} />
              <span className="hidden sm:inline">Débannir</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg transition-colors text-sm"
              title="Exporter en CSV"
            >
              <Download size={16} />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={onDeleteUsers}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
              title="Supprimer"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fonction utilitaire pour export CSV
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Échapper les virgules et guillemets
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
