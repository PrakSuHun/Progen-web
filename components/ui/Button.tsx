'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-bold rounded-full transition-all duration-200 disabled:opacity-50'

  const variantClasses = {
    primary: 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20',
    secondary: 'bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333] border border-[#e0e0e0]',
  }

  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-base',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
