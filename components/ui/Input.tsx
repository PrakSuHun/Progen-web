'use client'

import { formatPhone } from '@/lib/constants'

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phoneFormat) {
      const formatted = formatPhone(e.target.value)
      const syntheticEvent = Object.assign({}, e, {
        target: Object.assign({}, e.target, { value: formatted }),
      })
      onChange?.(syntheticEvent)
    } else {
      onChange?.(e)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#333] mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        value={value ?? ''}
        onChange={handleChange}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111] placeholder-[#aaa] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition text-base ${
          error ? 'border-red-400' : 'border-[#e0e0e0]'
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  )
}
