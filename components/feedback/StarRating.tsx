'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
  labels?: string[]
}

export function StarRating({
  value,
  onChange,
  label,
  labels = ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-3">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="text-4xl transition-colors"
          >
            {star <= (hoverValue || value) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
      {(hoverValue || value) > 0 && (
        <p className="text-slate-400 text-sm">{labels[(hoverValue || value) - 1]}</p>
      )}
    </div>
  )
}
