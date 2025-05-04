"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { WhitelistSteps } from "@/components/whitelist-steps"
import { SiteHeader } from "@/components/site-header"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

// Add the interface for API response type
interface VerificationResponse {
  success?: boolean;
  message?: string;
  error?: string;
  token?: string;
}

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [verificationCode, setVerificationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    if (!email) {
      setRedirect(true)
    }
  }, [email])

  useEffect(() => {
    if (redirect) {
      router.push("/whitelist")
    }
  }, [redirect, router])

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate code format
    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code")
      setIsSubmitting(false)
      return
    }

    try {
      // Verify the code using API
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code: verificationCode 
        }),
      });

      const data = await response.json() as VerificationResponse;

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        setIsSubmitting(false);
        return;
      }

      // Store the token in local state or session storage for future API calls
      if (data.token) {
        // Save token securely in sessionStorage
        sessionStorage.setItem('whitelist_token', data.token);
        
        // Proceed to next step with token
        router.push(`/whitelist/device?token=${encodeURIComponent(data.token)}`)
      } else {
        setError("Verification failed: No token received");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  const handleResendCode = async () => {
    try {
      // Resend verification email
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const resendData = await response.json() as { success?: boolean; error?: string };
      
      if (response.ok) {
        // Reset timer
        setTimeLeft(300);
      } else {
        setError(resendData.error || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setError("Failed to resend verification code");
    }
  }

  if (redirect) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8">
        <Link href="/whitelist" className="mb-8 flex items-center text-sm font-medium text-[#003594] hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Email
        </Link>

        <WhitelistSteps currentStep={2} />

        <motion.div
          className="mx-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-center text-2xl font-bold text-[#003594]">Verify Your Email</h1>

          <p className="mb-6 text-center text-gray-600">
            We've sent a verification code to <strong>{email}</strong>. Please check your inbox and enter the code
            below.
          </p>
          <p className="mb-6 text-center text-sm text-gray-500">
            Please check your spam/junk folder if you don't see the email in your inbox.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Verification Code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
            </div>

            <Button type="submit" className="w-full bg-[#003594] hover:bg-[#003594]/90" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify Code"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Code expires in <span className="font-medium">{formatTime(timeLeft)}</span>
            </p>
            <button
              onClick={handleResendCode}
              disabled={timeLeft > 0}
              className="mt-2 text-sm font-medium text-[#003594] hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              Resend Code
            </button>
          </div>
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
