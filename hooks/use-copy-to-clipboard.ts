"use client"

import { useState, useCallback } from "react"

interface UseCopyToClipboardProps {
  timeout?: number
}

export function useCopyToClipboard({ timeout = 2000 }: UseCopyToClipboardProps = {}) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    (text: string) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
        setCopied(true)
        
        const timer = setTimeout(() => {
          setCopied(false)
        }, timeout)
        
        return () => clearTimeout(timer)
      }
    },
    [timeout]
  )

  return { copied, copy }
} 