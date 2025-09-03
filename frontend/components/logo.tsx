import Image from "next/image"
import logoPng from "../src/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <Image
      src={logoPng}
      alt="Shape AI Logo"
      width={size === "sm" ? 24 : size === "md" ? 32 : 48}
      height={size === "sm" ? 24 : size === "md" ? 32 : 48}
      className={`${sizeClasses[size]} ${className}`}
      priority
    />
  )
}
