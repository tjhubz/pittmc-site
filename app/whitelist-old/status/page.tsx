"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, AlertCircle, User, Laptop, Apple, Smartphone, Gamepad } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WhitelistSteps } from "@/components/whitelist-steps"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const username = searchParams.get("username") || ""
  const device = searchParams.get("device") || ""
  const edition = searchParams.get("edition") || ""
  const success = searchParams.get("success") === "true"
  const message = searchParams.get("message") || ""

  const [progress, setProgress] = useState(30)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!username || !device || !edition) {
      router.push("/whitelist")
      return
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [countdown, username, device, edition, router])

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
          href="/whitelist/username"
          className="mb-6 flex items-center text-sm font-medium text-[#003594] hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Username
        </Link>

        <WhitelistSteps currentStep={5} />

        <motion.div
          className="mx-auto w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-orange-500" />
            )}
            <h1 className="mt-4 text-2xl font-bold text-[#003594]">
              {success ? "Whitelist Request Successful" : "Request Submitted with Warning"}
            </h1>
          </div>

          <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
            <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003594]/10">
              {getDeviceIcon()}
            </div>
            <div>
              <div className="font-medium">{getDeviceName()}</div>
              <div className="text-sm text-gray-500">{edition === "java" ? "Java Edition" : "Bedrock Edition"}</div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <p className="mb-2 text-gray-600">
              Username: <span className="font-semibold">{username}</span>
            </p>
            {message ? (
              <p className="mt-4 text-gray-600">{message}</p>
            ) : success ? (
              <p className="mt-4 text-gray-600">
                Your username has been successfully whitelisted. You can now join the server.
              </p>
            ) : (
              <p className="mt-4 text-gray-600">
                Your request has been submitted, but there may be a delay in whitelisting. 
                Please check your email for further instructions.
              </p>
            )}
          </div>

          <div className="rounded-lg bg-[#003594]/5 p-4 mb-6">
            <h3 className="font-semibold mb-2">Server Information</h3>
            <p className="text-sm">
              <strong>Server Address:</strong> play.pittmc.com
            </p>
            <p className="text-sm mt-1">
              <strong>Version:</strong> {edition === "java" ? "Java 1.21.5" : "Bedrock Latest"}
            </p>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-[#003594] hover:bg-[#003594]/90 w-full"
            >
              Return to Home
            </Button>

            <p className="mt-4 text-xs text-gray-500">
              Please wait a few minutes before trying to join the server.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Need help? Contact{" "}
              <a href="mailto:help@pittmc.com" className="text-[#003594] hover:underline">
                help@pittmc.com
              </a>
            </p>
          </div>
        </motion.div>

        {progress >= 100 && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  How to Join the Server
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue={device} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value={device}>{getDeviceName()}</TabsTrigger>
                    <TabsTrigger value={edition}>
                      {edition === "java" ? "Java Edition" : "Bedrock Edition"}
                    </TabsTrigger>
                  </TabsList>

                  {/* Windows PC */}
                  <TabsContent value="windows" className="space-y-4">
                    {edition === "java" ? (
                      <div className="space-y-4">
                        <h3 className="font-medium">Joining with Java Edition on Windows:</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft Java Edition</li>
                          <li>Click on "Multiplayer"</li>
                          <li>Click "Add Server"</li>
                          <li>
                            Server Name: <span className="font-medium">Pitt Minecraft</span>
                          </li>
                          <li>
                            Server Address: <span className="font-mono font-medium">mc.pitt.edu</span>
                          </li>
                          <li>Click "Done" and then connect to the server</li>
                        </ol>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Tip:</strong> Make sure you're running the latest version of Minecraft Java
                            Edition.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-medium">Joining with Bedrock Edition on Windows:</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft for Windows (Bedrock Edition)</li>
                          <li>Click on "Play" and then "Servers" tab</li>
                          <li>Scroll down and click "Add Server"</li>
                          <li>
                            Server Name: <span className="font-medium">Pitt Minecraft</span>
                          </li>
                          <li>
                            Server Address: <span className="font-mono font-medium">mc.pitt.edu</span>
                          </li>
                          <li>
                            Port: <span className="font-mono font-medium">19132</span>
                          </li>
                          <li>Click "Save" and then connect to the server</li>
                        </ol>
                      </div>
                    )}
                  </TabsContent>

                  {/* Mac */}
                  <TabsContent value="mac" className="space-y-4">
                    {edition === "java" ? (
                      <div className="space-y-4">
                        <h3 className="font-medium">Joining with Java Edition on Mac:</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft Java Edition</li>
                          <li>Click on "Multiplayer"</li>
                          <li>Click "Add Server"</li>
                          <li>
                            Server Name: <span className="font-medium">Pitt Minecraft</span>
                          </li>
                          <li>
                            Server Address: <span className="font-mono font-medium">mc.pitt.edu</span>
                          </li>
                          <li>Click "Done" and then connect to the server</li>
                        </ol>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Tip:</strong> Make sure you're running the latest version of Minecraft Java
                            Edition.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-medium">Joining with Bedrock Edition on Mac:</h3>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Open Minecraft Bedrock Edition</li>
                          <li>Click on "Play" and then "Servers" tab</li>
                          <li>Scroll down and click "Add Server"</li>
                          <li>
                            Server Name: <span className="font-medium">Pitt Minecraft</span>
                          </li>
                          <li>
                            Server Address: <span className="font-mono font-medium">mc.pitt.edu</span>
                          </li>
                          <li>
                            Port: <span className="font-mono font-medium">19132</span>
                          </li>
                          <li>Click "Save" and then connect to the server</li>
                        </ol>
                      </div>
                    )}
                  </TabsContent>

                  {/* Mobile */}
                  <TabsContent value="mobile" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Joining on Mobile Devices:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Open Minecraft on your mobile device</li>
                        <li>Tap on "Play" and then "Servers" tab</li>
                        <li>Scroll down and tap "Add Server"</li>
                        <li>
                          Server Name: <span className="font-medium">Pitt Minecraft</span>
                        </li>
                        <li>
                          Server Address: <span className="font-mono font-medium">mc.pitt.edu</span>
                        </li>
                        <li>
                          Port: <span className="font-mono font-medium">19132</span>
                        </li>
                        <li>Tap "Save" and then connect to the server</li>
                      </ol>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Note:</strong> Make sure your Minecraft app is updated to the latest version.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Console */}
                  <TabsContent value="console" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Joining on Console:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Open Minecraft on your console</li>
                        <li>Go to "Play" and then "Servers"</li>
                        <li>Select "Add Server" (if available on your console)</li>
                        <li>
                          Server Name: <span className="font-medium">Pitt Minecraft</span>
                        </li>
                        <li>
                          Server Address: <span className="font-mono font-medium">mc.pitt.edu</span>
                        </li>
                        <li>
                          Port: <span className="font-mono font-medium">19132</span>
                        </li>
                      </ol>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <p className="text-sm text-yellow-800">
                          <strong>Console Note:</strong> Some consoles may require additional steps to connect to
                          external servers. Check our Discord for console-specific guides.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Java Edition */}
                  <TabsContent value="java" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Java Edition Connection Details:</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Server Address:</span>
                            <span className="font-mono">mc.pitt.edu</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Version:</span>
                            <span>1.20.x (Latest)</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Java Edition players can connect directly using the server address without needing to specify
                        a port.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Bedrock Edition */}
                  <TabsContent value="bedrock" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Bedrock Edition Connection Details:</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Server Address:</span>
                            <span className="font-mono">mc.pitt.edu</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Port:</span>
                            <span className="font-mono">19132</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Version:</span>
                            <span>Latest</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Bedrock Edition players must specify both the server address and port number when connecting.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-6">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PittMC
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
