"use client"

import { SiteHeader } from "@/components/site-header"

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1 w-full h-full flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="text-center p-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">Map Maintenance</h1>
          <p className="text-xl">The map is currently under maintenance. Please check back later.</p>
        </div>
      </div>
    </div>
  )
} 