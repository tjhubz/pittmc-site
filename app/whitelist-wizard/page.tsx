"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { WhitelistWizard } from "@/components/whitelist-wizard/whitelist-wizard"

export default function WhitelistWizardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container mx-auto flex max-w-2xl flex-1 flex-col px-4 py-4">
        <div className="mb-4">
        </div>
        
        <WhitelistWizard />
      </div>
    </div>
  )
} 