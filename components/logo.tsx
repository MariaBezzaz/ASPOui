import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 124, height = 47 }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image src="/logo.svg" alt="Aspo Logo" width={width} height={height} className="h-auto" priority />
    </Link>
  )
}
