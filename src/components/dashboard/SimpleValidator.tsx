'use client'

import { useState, useEffect } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'

interface ValidationRule {
  field: string
  label: string
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
}

interface SimpleValidatorProps {
  data: Record<string, any>
  rules: ValidationRule[]
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}

export default function SimpleValidator({ data, rules, onValidationChange }: SimpleValidatorProps) {
  const [validationResults, setValidationResults] = useState<Record<string, { valid: boolean, message: string }>>({})
  const [overallValid, setOverallValid] = useState(false)

  useEffect(() => {
    const results: Record<string, { valid: boolean, message: string }> = {}
    const errors: string[] = []

    rules.forEach(rule => {
      const value = data[rule.field]
      let valid = true
      let message = ''

      // Vérification si requis
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        valid = false
        message = `${rule.label} est requis`
        errors.push(message)
      }
      // Vérification longueur minimum
      else if (rule.minLength && value && value.length < rule.minLength) {
        valid = false
        message = `${rule.label} doit contenir au moins ${rule.minLength} caractères`
        errors.push(message)
      }
      // Vérification longueur maximum
      else if (rule.maxLength && value && value.length > rule.maxLength) {
        valid = false
        message = `${rule.label} ne peut pas dépasser ${rule.maxLength} caractères`
        errors.push(message)
      }
      // Vérification pattern
      else if (rule.pattern && value && !rule.pattern.test(value)) {
        valid = false
        message = `Format de ${rule.label} invalide`
        errors.push(message)
      }
      // Vérification custom
      else if (rule.custom && value && !rule.custom(value)) {
        valid = false
        message = `${rule.label} n'est pas valide`
        errors.push(message)
      }

      results[rule.field] = { valid, message: valid ? `${rule.label} valide` : message }
    })

    setValidationResults(results)
    const isOverallValid = Object.values(results).every(result => result.valid)
    setOverallValid(isOverallValid)

    if (onValidationChange) {
      onValidationChange(isOverallValid, errors)
    }
  }, [data, rules, onValidationChange])

  const getStatusIcon = (valid: boolean) => {
    if (valid) {
      return <Check size={16} className="text-green-400" />
    }
    return <X size={16} className="text-red-400" />
  }

  const getStatusColor = (valid: boolean) => {
    if (valid) {
      return 'text-green-400 border-green-500/30 bg-green-500/10'
    }
    return 'text-red-400 border-red-500/30 bg-red-500/10'
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle size={18} className="text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Validation du Profil</h3>
      </div>

      <div className="space-y-3">
        {rules.map(rule => {
          const result = validationResults[rule.field]
          if (!result) return null

          return (
            <div
              key={rule.field}
              className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.valid)}`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.valid)}
                <span className="text-sm font-medium">{rule.label}</span>
              </div>
              <div className="text-xs opacity-75">
                {result.message}
              </div>
            </div>
          )
        })}
      </div>

      <div className={`mt-4 p-3 rounded-lg border ${overallValid ? getStatusColor(true) : getStatusColor(false)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallValid)}
            <span className="font-medium">
              {overallValid ? 'Profil valide' : 'Profil incomplet'}
            </span>
          </div>
          <div className="text-sm opacity-75">
            {Object.values(validationResults).filter(r => r.valid).length} / {rules.length} critères
          </div>
        </div>
      </div>
    </div>
  )
}