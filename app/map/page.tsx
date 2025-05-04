"use client"

import { SiteHeader } from "@/components/site-header"

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1 w-full h-full">
        <iframe 
          src="https://map.pittmc.com" 
          className="w-full h-full"
          style={{ height: "calc(100vh - 4rem)" }}
          title="PittMC Map"
          allow="fullscreen"
        />
      </div>
    </div>
  )
} 