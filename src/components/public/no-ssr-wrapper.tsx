"use client"
import { ReactNode, useEffect, useState } from "react"

export default function NoSSRWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Retornamos um espaço vazio ou loader que bate exatamente com o servidor
    return <div className="min-h-[200px]" />
  }

  return <>{children}</>
}