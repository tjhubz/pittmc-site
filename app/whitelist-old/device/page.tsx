"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Laptop, Apple, Smartphone, Gamepad } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { WhitelistSteps } from "@/components/whitelist-steps"
import { SiteHeader } from "@/components/site-header"

// Fallback component during loading
function DevicePageFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8 items-center justify-center">
        <p>Loading...</p>
      </div>
    </div>
  );
}

// Main component that uses client-side data
function DevicePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  
  const [device, setDevice] = useState<string>("")
  const [edition, setEdition] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEditionOptions, setShowEditionOptions] = useState(false)

  useEffect(() => {
    // If no token, redirect back to whitelist start
    if (!token) {
      router.push("/whitelist")
    }
  }, [token, router])

  const handleDeviceChange = (value: string) => {
    setDevice(value)
    setEdition("")
    
    // Only show edition options for Windows, auto-select Java for Mac
    if (value === "mac") {
      setEdition("java")
      setShowEditionOptions(false)
    } else if (value === "windows") {
      setShowEditionOptions(true)
    } else {
      setShowEditionOptions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Determine edition based on device
    const finalEdition =
      device === "windows" || device === "mac" ? edition : device === "mobile" || device === "console" ? "bedrock" : ""

    // Proceed to username page with token
    setTimeout(() => {
      setIsSubmitting(false)
      router.push(`/whitelist/username?device=${device}&edition=${finalEdition}&token=${encodeURIComponent(token)}`)
    }, 800)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8">
        <Link
          href="/whitelist/verify"
          className="mb-6 flex items-center text-sm font-medium text-[#003594] hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Verification
        </Link>

        <WhitelistSteps currentStep={3} />

        <motion.div
          className="mx-auto w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-center text-2xl font-bold text-[#003594]">Select Your Device</h1>

          <p className="mb-6 text-center text-gray-600">Choose the device you'll be playing Minecraft on.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <RadioGroup
                value={device}
                onValueChange={handleDeviceChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <RadioGroupItem value="windows" id="windows" className="border-[#003594] text-[#003594]" />
                  <Label htmlFor="windows" className="flex flex-1 cursor-pointer items-center">
                    <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#003594]/10">
                      <Laptop className="h-6 w-6 text-[#003594]" />
                    </div>
                    <div>
                      <div className="font-medium">Windows PC</div>
                      <div className="text-sm text-gray-500">Windows 10/11 or older</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <RadioGroupItem value="mac" id="mac" className="border-[#003594] text-[#003594]" />
                  <Label htmlFor="mac" className="flex flex-1 cursor-pointer items-center">
                    <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#003594]/10">
                      <Apple className="h-6 w-6 text-[#003594]" />
                    </div>
                    <div>
                      <div className="font-medium">Mac</div>
                      <div className="text-sm text-gray-500">macOS computer</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <RadioGroupItem value="mobile" id="mobile" className="border-[#003594] text-[#003594]" />
                  <Label htmlFor="mobile" className="flex flex-1 cursor-pointer items-center">
                    <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#003594]/10">
                      <Smartphone className="h-6 w-6 text-[#003594]" />
                    </div>
                    <div>
                      <div className="font-medium">Mobile</div>
                      <div className="text-sm text-gray-500">iOS or Android device</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <RadioGroupItem value="console" id="console" className="border-[#003594] text-[#003594]" />
                  <Label htmlFor="console" className="flex flex-1 cursor-pointer items-center">
                    <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#003594]/10">
                      <Gamepad className="h-6 w-6 text-[#003594]" />
                    </div>
                    <div>
                      <div className="font-medium">Console</div>
                      <div className="text-sm text-gray-500">Xbox, PlayStation, or Nintendo Switch</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {showEditionOptions && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-4 text-lg font-medium text-[#003594]">Select Edition</h2>
                <RadioGroup value={edition} onValueChange={setEdition} className="space-y-4">
                  <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                    <RadioGroupItem value="java" id="java" className="border-[#003594] text-[#003594]" />
                    <Label htmlFor="java" className="flex flex-1 cursor-pointer items-center">
                      <div>
                        <div className="font-medium">Java Edition</div>
                        <div className="text-sm text-gray-500">Original PC version</div>
                      </div>
                    </Label>
                  </div>

                  {device === "windows" && (
                    <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                      <RadioGroupItem value="bedrock" id="bedrock" className="border-[#003594] text-[#003594]" />
                      <Label htmlFor="bedrock" className="flex flex-1 cursor-pointer items-center">
                        <div>
                          <div className="font-medium">Bedrock Edition</div>
                          <div className="text-sm text-gray-500">Windows 10/11 version from Microsoft Store</div>
                        </div>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#003594] hover:bg-[#003594]/90"
              disabled={!device || (device === "windows" && !edition) || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            Need help? Contact{" "}
            <a href="mailto:help@pittmc.com" className="text-[#003594] hover:underline">
              help@pittmc.com
            </a>
          </p>
        </motion.div>
      </div>

      <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-6">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} University of Pittsburgh Minecraft Server
        </div>
      </footer>
    </div>
  )
}

// Export the default component with Suspense boundary
export default function DevicePage() {
  return (
    <Suspense fallback={<DevicePageFallback />}>
      <DevicePageContent />
    </Suspense>
  )
}
