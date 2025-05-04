"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, HelpCircle, User, Laptop, Apple, Smartphone, Gamepad } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WhitelistSteps } from "@/components/whitelist-steps"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WhitelistResponse {
  success?: boolean;
  message?: string;
  error?: string;
  email?: string;
  username?: string;
  edition?: string;
}

export default function UsernamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const edition = searchParams.get("edition") || ""
  const device = searchParams.get("device") || ""
  const token = searchParams.get("token") || "" // Get verification token from URL

  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect if missing required parameters
    if (!edition || !device || !token) {
      router.push("/whitelist")
    }
  }, [edition, device, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!username.trim()) {
      setError("Please enter your Minecraft username")
      setIsSubmitting(false)
      return
    }

    // Validate username based on edition
    if (edition === "java") {
      // Java usernames are 3-16 characters and only allow letters, numbers, and underscores
      if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
        setError("Java usernames must be 3-16 characters and only contain letters, numbers, and underscores")
        setIsSubmitting(false)
        return
      }
    } else if (edition === "bedrock") {
      // Bedrock/Microsoft account usernames
      // Allow spaces and check for Microsoft account naming rules
      // Min 3 characters, max 16 characters, allow alphanumeric, spaces, and some special characters
      if (username.length < 3 || username.length > 16) {
        setError("Minecraft usernames must be 3-16 characters")
        setIsSubmitting(false)
        return
      }
      
      // Microsoft gamertags can contain letters, numbers, spaces, and limited special characters
      // Check for invalid characters rather than limiting to a specific set
      if (/[^\w\s\-\.]/.test(username)) {
        setError("Your Xbox Gamertag contains invalid characters")
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Submit username to whitelist API
      const response = await fetch('/api/whitelist-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          username: username.trim(),
          edition
        }),
      });

      const data = await response.json() as WhitelistResponse;

      if (!response.ok) {
        setError(data.error || "Failed to whitelist username");
        setIsSubmitting(false);
        return;
      }

      // On success, redirect to status page with message from the API
      router.push(`/whitelist/status?device=${device}&edition=${edition}&username=${encodeURIComponent(username)}&success=true&message=${encodeURIComponent(data.message || "")}`);
    } catch (error) {
      console.error("Error whitelisting username:", error);
      setError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  }

  const getDeviceIcon = () => {
    switch (device) {
      case "windows":
        return <Laptop className="h-6 w-6 text-[#003594]" />
      case "mac":
        return <Apple className="h-6 w-6 text-[#003594]" />
      case "mobile":
        return <Smartphone className="h-6 w-6 text-[#003594]" />
      case "console":
        return <Gamepad className="h-6 w-6 text-[#003594]" />
      default:
        return <User className="h-6 w-6 text-[#003594]" />
    }
  }

  const getDeviceName = () => {
    switch (device) {
      case "windows":
        return "Windows PC"
      case "mac":
        return "Mac"
      case "mobile":
        return "Mobile Device"
      case "console":
        return "Console"
      default:
        return "Device"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8">
        <Link
          href="/whitelist/device"
          className="mb-6 flex items-center text-sm font-medium text-[#003594] hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Device Selection
        </Link>

        <WhitelistSteps currentStep={4} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-6 text-2xl font-bold text-[#003594]">Enter Your Username</h1>

            <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003594]/10">
                {getDeviceIcon()}
              </div>
              <div>
                <div className="font-medium">{getDeviceName()}</div>
                <div className="text-sm text-gray-500">{edition === "java" ? "Java Edition" : "Bedrock Edition"}</div>
              </div>
            </div>

            <p className="mb-6 text-gray-600">
              Please enter your Minecraft username for {edition === "java" ? "Java" : "Bedrock"} Edition.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="username" className="mb-1 block">
                  Minecraft Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder={edition === "java" ? "e.g., PittPanther123" : "e.g., Pitt Panther"}
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#003594] hover:bg-[#003594]/90" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="bg-[#003594]/5 border-b">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-[#003594]" />
                  <CardTitle>How to Find Your Username</CardTitle>
                </div>
                <CardDescription>Follow these instructions to locate your Minecraft username</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue={device} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 mb-4">
                    <TabsTrigger value={device === "windows" || device === "mac" ? device : "mobile"}>
                      {device === "windows" && "Windows PC"}
                      {device === "mac" && "Mac"}
                      {device === "mobile" && "Mobile"}
                      {device === "console" && "Console"}
                    </TabsTrigger>
                  </TabsList>

                  {/* Windows PC */}
                  <TabsContent value="windows" className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">For Windows PC:</h3>
                      {edition === "java" ? (
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft Java Edition</li>
                          <li>Your username is your Mojang/Microsoft account name</li>
                          <li>It's displayed in the top-right corner of the main menu</li>
                          <li>
                            You can also check at{" "}
                            <a
                              href="https://minecraft.net"
                              className="text-[#003594] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              minecraft.net
                            </a>{" "}
                            by logging in
                          </li>
                        </ol>
                      ) : (
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft for Windows from the Microsoft Store</li>
                          <li>Your username is your Xbox Gamertag/Microsoft account name</li>
                          <li>It's visible on the main menu or in settings</li>
                          <li>
                            You can also check by opening the Xbox app on your PC or visiting{" "}
                            <a
                              href="https://xbox.com"
                              className="text-[#003594] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              xbox.com
                            </a>
                          </li>
                        </ol>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Make sure you're entering the exact username as it appears in the game,
                        including any capitalization or special characters.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Mac */}
                  <TabsContent value="mac" className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">For Mac:</h3>
                      {edition === "java" ? (
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft Java Edition on your Mac</li>
                          <li>Your username is your Mojang/Microsoft account name</li>
                          <li>It's displayed in the top-right corner of the main menu</li>
                          <li>
                            You can also check at{" "}
                            <a
                              href="https://minecraft.net"
                              className="text-[#003594] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              minecraft.net
                            </a>{" "}
                            by logging in
                          </li>
                        </ol>
                      ) : (
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft Bedrock Edition on your Mac</li>
                          <li>Your username is your Xbox Gamertag/Microsoft account name</li>
                          <li>It's visible on the main menu or in settings</li>
                          <li>
                            You can also check by visiting{" "}
                            <a
                              href="https://xbox.com"
                              className="text-[#003594] hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              xbox.com
                            </a>{" "}
                            and signing in
                          </li>
                        </ol>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Make sure you're entering the exact username as it appears in the game,
                        including any capitalization or special characters.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Mobile */}
                  <TabsContent value="mobile" className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">For Mobile Devices:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Open the Minecraft app on your phone or tablet</li>
                        <li>Your username is your Xbox Gamertag/Microsoft account name</li>
                        <li>Tap on your profile icon or go to settings to view it</li>
                        <li>If you've signed in with a Microsoft account, this is your Xbox Gamertag</li>
                        <li>
                          You can also check by downloading the Xbox app on your mobile device or visiting{" "}
                          <a
                            href="https://xbox.com"
                            className="text-[#003594] hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            xbox.com
                          </a>
                        </li>
                      </ol>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> On mobile devices, Minecraft uses Bedrock Edition, which requires a
                        Microsoft account.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Console */}
                  <TabsContent value="console" className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">For Console:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Your username is your console's account name:</li>
                        <li>
                          <strong>Xbox:</strong> Your Xbox Gamertag
                        </li>
                        <li>
                          <strong>PlayStation:</strong> Your PSN Online ID
                        </li>
                        <li>
                          <strong>Nintendo Switch:</strong> Your Nintendo Account username
                        </li>
                        <li>This is the same name that appears when you play other online games</li>
                        <li>You can check this in your console's account settings</li>
                      </ol>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Important:</strong> Console players need to use their platform's online username, not
                        any in-game nickname.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Username Requirements Section based on edition */}
                <div className="mt-6 space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">
                      {edition === "java" ? "Java Edition Username Requirements:" : "Bedrock Edition Username Requirements:"}
                    </h3>
                    {edition === "java" ? (
                      <div>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Must be 3-16 characters long</li>
                          <li>Can only contain letters, numbers, and underscores</li>
                          <li>Cannot contain spaces or special characters</li>
                          <li>Case-sensitive (uppercase and lowercase letters matter)</li>
                        </ul>
                        <div className="bg-gray-50 p-4 rounded-lg mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Example:</strong> PittPanther_123
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>This is your Xbox Gamertag or Microsoft account name</li>
                          <li>Must be 3-16 characters long</li>
                          <li>Can contain spaces and some special characters (letters, numbers, spaces, hyphens, and periods)</li>
                          <li>Linked to your Microsoft account</li>
                        </ul>
                        <div className="bg-gray-50 p-4 rounded-lg mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Example:</strong> Pitt Panther 123
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-6">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} University of Pittsburgh Minecraft Server
          <p className="mt-4 text-center text-xs text-gray-500">
            Need help? Contact{" "}
            <a href="mailto:help@pittmc.com" className="text-[#003594] hover:underline">
              help@pittmc.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
