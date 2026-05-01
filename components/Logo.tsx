type LogoMarkProps = {
  className?: string
  bg?: string
  fg?: string
  rounded?: number
}

export function LogoMark({
  className,
  bg = '#0f1b2d',
  fg = '#1ab6f5',
  rounded = 36,
}: LogoMarkProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="200" height="200" rx={rounded} fill={bg} />
      <g fill={fg} transform="translate(60 50)">
        <rect x="0" y="0" width="22" height="100" />
        <path d="M 22 0 L 70 0 A 26 26 0 0 1 70 52 L 36 52 L 22 70 L 22 0 Z M 22 18 L 22 38 L 60 38 A 10 10 0 0 0 60 18 Z" fillRule="evenodd" />
      </g>
    </svg>
  )
}

type LogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
}

export function Logo({ className = '', markClassName = 'w-7 h-7', textClassName = 'text-black' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-black tracking-tight ${textClassName}`}>
        PRO<span className="text-sky-500">GEN</span>
      </span>
    </span>
  )
}
