"use client"
import { motion } from 'framer-motion'

type Step = { id: number; label: string }

export default function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map((s, i) => {
        const active = s.id === current
        const done = s.id < current
        return (
          <div key={s.id} className="flex items-center gap-2">
            <motion.div
              initial={false}
              animate={{ scale: active ? 1.05 : 1, backgroundColor: active ? 'rgba(255,107,157,0.2)' : done ? 'rgba(79,209,199,0.2)' : 'rgba(255,255,255,0.08)' }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm ${active ? 'border-pink-400 text-pink-300' : done ? 'border-teal-400 text-teal-300' : 'border-white/20 text-white/70'}`}
            >
              {s.id}
            </motion.div>
            <span className="text-sm text-white/80 hidden sm:block">{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}
