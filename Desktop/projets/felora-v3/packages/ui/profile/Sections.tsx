'use client'

import React, { useState } from 'react'

interface SectionProps {
  title: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

function Section({ title, children, collapsible = false, defaultExpanded = true }: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="glass-card mb-6">
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-700/50 ${
          collapsible ? 'cursor-pointer hover:bg-gray-800/20' : ''
        }`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {collapsible && (
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  )
}

interface AboutSectionProps {
  description?: string
  workingArea?: string
  age?: number
  practices?: string[]
}

export function AboutSection({ description, workingArea, age, practices }: AboutSectionProps) {
  if (!description && !workingArea && !age && (!practices || practices.length === 0)) {
    return null
  }

  return (
    <Section title="About">
      {description && (
        <div className="mb-4">
          <p className="text-gray-300 leading-relaxed">{description}</p>
        </div>
      )}
      
      {workingArea && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-blue-300 text-sm font-medium">Working Area:</span>
            <span className="text-gray-300 text-sm">{workingArea}</span>
          </div>
        </div>
      )}

      {practices && practices.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-medium mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-2">
            {practices.map((practice) => (
              <span
                key={practice}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
              >
                {practice}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

interface RatesSectionProps {
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  currency?: string
}

export function RatesSection({ rates, currency = 'CHF' }: RatesSectionProps) {
  if (!rates || Object.values(rates).every(rate => !rate)) {
    return null
  }

  const rateItems = [
    { label: '1 Hour', value: rates.hour },
    { label: '2 Hours', value: rates.twoHours },
    { label: 'Half Day', value: rates.halfDay },
    { label: 'Full Day', value: rates.fullDay },
    { label: 'Overnight', value: rates.overnight }
  ].filter(item => item.value)

  return (
    <Section title="Rates" collapsible defaultExpanded={false}>
      <div className="space-y-3">
        {rateItems.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-b-0">
            <span className="text-gray-300">{label}</span>
            <span className="text-white font-semibold">
              {value!.toLocaleString()} {currency}
            </span>
          </div>
        ))}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Rates are indicative and may vary. Please contact for exact pricing.
          </p>
        </div>
      </div>
    </Section>
  )
}

interface AvailabilitySectionProps {
  availability?: {
    incall?: boolean
    outcall?: boolean
    available?: boolean
    schedule?: string
  }
  workingHours?: string
}

export function AvailabilitySection({ availability, workingHours }: AvailabilitySectionProps) {
  if (!availability && !workingHours) {
    return null
  }

  return (
    <Section title="Availability">
      <div className="space-y-3">
        {availability && (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">Status</span>
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-sm ${
                availability.available 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${availability.available ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {availability.available ? 'Available' : 'Not Available'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${
                  availability.incall ? 'bg-green-500 border-green-500' : 'border-gray-600'
                }`}>
                  {availability.incall && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">Incall</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${
                  availability.outcall ? 'bg-green-500 border-green-500' : 'border-gray-600'
                }`}>
                  {availability.outcall && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">Outcall</span>
              </div>
            </div>
          </>
        )}

        {workingHours && (
          <div className="py-2 border-t border-gray-700/30">
            <span className="text-gray-300">Working Hours:</span>
            <div className="text-white mt-1">{workingHours}</div>
          </div>
        )}
      </div>
    </Section>
  )
}

