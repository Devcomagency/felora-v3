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
                <span className={`text-sm ${availability.incall ? 'text-white' : 'text-gray-400'}`}>
                  Incall
                </span>
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
                <span className={`text-sm ${availability.outcall ? 'text-white' : 'text-gray-400'}`}>
                  Outcall
                </span>
              </div>
            </div>
          </>
        )}

        {(workingHours || availability?.schedule) && (
          <div className="mt-4">
            <h4 className="text-white font-medium mb-2">Schedule</h4>
            <p className="text-gray-300 text-sm">
              {workingHours || availability?.schedule}
            </p>
          </div>
        )}
      </div>
    </Section>
  )
}

interface PhysicalDetailsSectionProps {
  physical?: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
  }
}

export function PhysicalDetailsSection({ physical }: PhysicalDetailsSectionProps) {
  if (!physical || Object.values(physical).every(value => !value)) {
    return null
  }

  const details = [
    { label: 'Height', value: physical.height ? `${physical.height} cm` : null },
    { label: 'Body Type', value: physical.bodyType },
    { label: 'Hair Color', value: physical.hairColor },
    { label: 'Eye Color', value: physical.eyeColor }
  ].filter(item => item.value)

  if (details.length === 0) return null

  return (
    <Section title="Physical Details" collapsible defaultExpanded={false}>
      <div className="grid grid-cols-2 gap-4">
        {details.map(({ label, value }) => (
          <div key={label} className="space-y-1">
            <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              {label}
            </div>
            <div className="text-white text-sm">{value}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

interface ClubLocationSectionProps {
  location?: {
    address?: string
    coordinates?: { lat: number; lng: number }
  }
  contact?: {
    phone?: string
    website?: string
    email?: string
  }
}

export function ClubLocationSection({ location, contact }: ClubLocationSectionProps) {
  if (!location && !contact) {
    return null
  }

  return (
    <Section title="Location & Contact">
      <div className="space-y-4">
        {location?.address && (
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-white font-medium">Address</div>
              <div className="text-gray-300 text-sm">{location.address}</div>
              {location.coordinates && (
                <div className="mt-2">
                  <a
                    href={`/map?center=${location.coordinates.lat},${location.coordinates.lng}&zoom=14`}
                    className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                    Voir sur la carte
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {contact && (
          <div className="space-y-3">
            {contact.phone && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <div className="text-white font-medium">Phone</div>
                  <a href={`tel:${contact.phone}`} className="text-green-300 text-sm hover:underline">
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            {contact.website && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="text-white font-medium">Website</div>
                  <a 
                    href={contact.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-300 text-sm hover:underline"
                  >
                    {contact.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <div className="text-white font-medium">Email</div>
                  <a href={`mailto:${contact.email}`} className="text-blue-300 text-sm hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}

interface AmenitiesSectionProps {
  amenities?: string[]
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  if (!amenities || amenities.length === 0) {
    return null
  }

  return (
    <Section title="Amenities">
      <div className="grid grid-cols-2 gap-2">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center gap-2 py-1">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-300 text-sm">{amenity}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
