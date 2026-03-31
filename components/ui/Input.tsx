'use client'

import { formatPhone } from '@/lib/constants'
import { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  phoneFormat?: boolean
}

export function Input({
  label,
  error,
  phoneFormat = false,
  value,
  onChange,
  ...props
}: InputProps) {
  const [displayValue, setDisplayValue] = useState(value || '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    if (phoneFormat) {
      newValue = formatPhone(newValue)
    }

    setDisplayValue(newValue)
    onChange?.(e)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        value={displayValue}
        onChange={handleChange}
        className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition ${
          error
            ? 'border-red-500'
            : 'border-slate-600 focus:border-purple-500'
        }`}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
