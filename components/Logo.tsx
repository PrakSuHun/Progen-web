import Image from 'next/image'

type LogoMarkProps = {
  className?: string
  size?: number
  variant?: 'dark' | 'blue'
}

export function LogoMark({ className = '', size = 32, variant = 'dark' }: LogoMarkProps) {
  const src = variant === 'blue' ? '/logo-mark-blue.png' : '/logo-mark.png'
  return (
    <Image
      src={src}
      alt="PROGEN"
      width={405}
      height={352}
      priority
      className={className}
      style={{ width: 'auto', height: size }}
    />
  )
}

type LogoWordmarkProps = {
  className?: string
  height?: number
  variant?: 'dark' | 'blue'
}

export function LogoWordmark({ className = '', height = 22, variant = 'dark' }: LogoWordmarkProps) {
  const src = variant === 'blue' ? '/logo-wordmark-blue.png' : '/logo-wordmark.png'
  return (
    <Image
      src={src}
      alt="progen"
      width={993}
      height={166}
      priority
      className={className}
      style={{ width: 'auto', height }}
    />
  )
}

type LogoProps = {
  className?: string
  markSize?: number
  wordmarkHeight?: number
  variant?: 'dark' | 'blue'
  gap?: number
}

export function Logo({
  className = '',
  markSize = 32,
  wordmarkHeight = 22,
  variant = 'dark',
  gap = 10,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap }}>
      <LogoMark size={markSize} variant={variant} />
      <LogoWordmark height={wordmarkHeight} variant={variant} />
    </span>
  )
}
