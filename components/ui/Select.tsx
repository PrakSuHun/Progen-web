'use client'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }> | string[]
}

export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  const optionArray = Array.isArray(options)
    ? options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
    : options

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#333] mb-2">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition appearance-none cursor-pointer text-base ${
          error ? 'border-red-400' : 'border-[#e0e0e0]'
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '36px',
        }}
      >
        <option value="">선택해주세요</option>
        {optionArray.map((option) => (
          <option
            key={typeof option === 'string' ? option : option.value}
            value={typeof option === 'string' ? option : option.value}
          >
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  )
}
