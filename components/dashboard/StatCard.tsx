'use client'

interface StatCardProps {
  label: string
  value: number | string
  icon?: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
}

export function StatCard({
  label,
  value,
  icon = '📊',
  variant = 'primary',
}: StatCardProps) {
  const variantClasses = {
    primary: 'bg-sky-900 border-sky-700',
    secondary: 'bg-blue-900 border-blue-700',
    success: 'bg-green-900 border-green-700',
    danger: 'bg-red-900 border-red-700',
  }

  return (
    <div className={`${variantClasses[variant]} border p-6 rounded-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-2">{label}</p>
          <p className="text-4xl font-bold text-white">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
