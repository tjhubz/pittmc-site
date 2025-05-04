"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, ArrowRight, Mail, AlertCircle, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWhitelist } from "../whitelist-context"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Progress } from "@/components/ui/progress"
import { useOTPDetection } from "@/hooks/use-otp-detection"
import { useToast } from "@/hooks/use-toast"

interface VerificationResponse {
  success?: boolean;
  error?: string;
  token?: string;
}

export function VerificationStep() {
  const { 
    verificationCode, 
    setVerificationCode, 
    email,
    setToken,
    setCurrentStep, 
    isSubmitting, 
    setIsSubmitting, 
    error, 
    setError,
    otpTimeLeft,
    canResendOtp,
    resetOtpTimer
  } = useWhitelist()

  const { toast } = useToast()
  const [resending, setResending] = useState(false)
  const [progressValue, setProgressValue] = useState(100)
  const [otpDetectionSupported, setOtpDetectionSupported] = useState(false)
  
  // Check if OTP detection is supported
  useEffect(() => {
    const isOTPSupported = typeof window !== 'undefined' && 'OTPCredential' in window
    setOtpDetectionSupported(isOTPSupported)
  }, [])
  
  // Update progress bar based on timer
  useEffect(() => {
    // Map otpTimeLeft to a percentage (300 seconds = 100%, 0 seconds = 0%)
    const percentage = (otpTimeLeft / 300) * 100
    setProgressValue(percentage)
  }, [otpTimeLeft])
  
  // Handler for OTP auto-detection
  const handleOTPReceived = useCallback((code: string) => {
    if (code && code.length === 6) {
      setVerificationCode(code)
    }
  }, [setVerificationCode])
  
  // Use OTP detection hook
  useOTPDetection({ onOTPReceived: handleOTPReceived })

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
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code"
      })
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
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data.error || "Invalid verification code"
        });
        setIsSubmitting(false);
        return;
      }

      // Store the token and move to next step
      if (data.token) {
        setToken(data.token);
        setIsSubmitting(false);
        setCurrentStep(3);
      } else {
        setError("Verification failed: No token received");
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "No token received"
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      setError("An error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again."
      });
      setIsSubmitting(false);
    }
  }

  const handleResendCode = async () => {
    if (!canResendOtp) return;
    
    setResending(true);
    setError("");
    
    try {
      // Resend verification email
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const resendData = await response.json() as VerificationResponse;
      
      if (response.ok) {
        // Reset timer
        resetOtpTimer();
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email"
        });
      } else {
        setError(resendData.error || "Failed to resend verification code");
        toast({
          variant: "destructive",
          title: "Failed to Resend",
          description: resendData.error || "Failed to resend verification code"
        });
      }
    } catch (err) {
      console.error("Error resending code:", err);
      setError("Failed to resend verification code");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend verification code"
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <Mail className="mx-auto h-12 w-12 rounded-full bg-primary/10 p-2 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Verify Your Email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="mx-auto max-w-[320px] flex justify-center">
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={setVerificationCode}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, index) => (
                  <InputOTPSlot 
                    key={index} 
                    {...slot} 
                    className="h-14 w-14 text-center text-2xl border-[1px] border-input rounded-md focus-visible:ring-1 focus-visible:ring-ring"
                  />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center text-sm">
            <span className="mr-2 text-muted-foreground">Code expires in:</span>
            <span className={`font-semibold ${otpTimeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
              {formatTime(otpTimeLeft)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Please check your spam/junk folder if you don't see the email.
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || verificationCode.length !== 6}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="mr-2">Verifying...</span>
              <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
            </span>
          ) : (
            <span className="flex items-center">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="mt-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Email
        </Button>
      </div>
    </form>
  )
} 