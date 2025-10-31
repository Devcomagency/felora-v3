'use client'

import { useState, useEffect } from 'react'
import { X, Save, Clock, ToggleLeft, ToggleRight } from 'lucide-react'

interface DaySchedule {
  open: string
  close: string
  closed: boolean
}

interface Schedule {
  lundi: DaySchedule
  mardi: DaySchedule
  mercredi: DaySchedule
  jeudi: DaySchedule
  vendredi: DaySchedule
  samedi: DaySchedule
  dimanche: DaySchedule
}

interface ScheduleModalProps {
  clubId: string
  clubName: string
  currentSchedule: string | null
  isOpen24_7: boolean
  onClose: () => void
  onSave: () => void
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

const DEFAULT_SCHEDULE: DaySchedule = {
  open: '18:00',
  close: '05:00',
  closed: false
}

export default function ScheduleModal({ clubId, clubName, currentSchedule, isOpen24_7, onClose, onSave }: ScheduleModalProps) {
  const [schedule, setSchedule] = useState<Schedule>({
    lundi: DEFAULT_SCHEDULE,
    mardi: DEFAULT_SCHEDULE,
    mercredi: DEFAULT_SCHEDULE,
    jeudi: DEFAULT_SCHEDULE,
    vendredi: DEFAULT_SCHEDULE,
    samedi: DEFAULT_SCHEDULE,
    dimanche: DEFAULT_SCHEDULE
  })
  const [is24_7, setIs24_7] = useState(isOpen24_7)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentSchedule) {
      try {
        const parsed = JSON.parse(currentSchedule)
        setSchedule(parsed)
      } catch (e) {
        console.error('Error parsing schedule:', e)
      }
    }
  }, [currentSchedule])

  const handleDayChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof Schedule],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: JSON.stringify(schedule),
          isOpen24_7: is24_7
        })
      })

      if (!response.ok) throw new Error('Failed to update schedule')

      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating schedule:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="text-purple-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Horaires d'ouverture</h2>
              <p className="text-sm text-gray-400">{clubName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Option 24/7 */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <h3 className="text-white font-medium">Ouvert 24h/24, 7j/7</h3>
              <p className="text-sm text-gray-400">Le club est toujours ouvert</p>
            </div>
            <button
              type="button"
              onClick={() => setIs24_7(!is24_7)}
              className="flex items-center gap-2"
            >
              {is24_7 ? (
                <ToggleRight className="text-green-400" size={32} />
              ) : (
                <ToggleLeft className="text-gray-500" size={32} />
              )}
            </button>
          </div>

          {/* Horaires par jour */}
          {!is24_7 && (
            <div className="space-y-3">
              {DAYS.map((day) => {
                const daySchedule = schedule[day as keyof Schedule]
                return (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
                  >
                    {/* Jour */}
                    <div className="w-24">
                      <span className="text-white font-medium capitalize">{day}</span>
                    </div>

                    {/* Fermé toggle */}
                    <button
                      type="button"
                      onClick={() => handleDayChange(day, 'closed', !daySchedule.closed)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        daySchedule.closed
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {daySchedule.closed ? 'Fermé' : 'Ouvert'}
                    </button>

                    {/* Horaires */}
                    {!daySchedule.closed && (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={daySchedule.open}
                          onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="time"
                          value={daySchedule.close}
                          onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
