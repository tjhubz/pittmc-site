"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"

export default function WhitelistPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new wizard flow
    const redirectTimeout = setTimeout(() => {
      router.push("/whitelist-wizard")
    }, 1500)
    
    return () => clearTimeout(redirectTimeout)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8 items-center justify-center">
        <p className="text-center mb-2 text-xl font-semibold">Our whitelist system has been upgraded!</p>
        <p className="text-center mb-4">Redirecting to the new streamlined process...</p>
        <div className="h-8 w-8 border-4 border-[#003594] border-r-transparent animate-spin rounded-full" />
      </div>
    </div>
  )
}
