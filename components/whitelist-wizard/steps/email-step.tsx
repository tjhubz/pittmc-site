"use client"

import { useState } from "react"
import { ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWhitelist } from "../whitelist-context"
import { useToast } from "@/hooks/use-toast"

interface VerificationResponse {
  success?: boolean;
  error?: string;
}

export function EmailStep() {
  const { 
    email, 
    setEmail, 
    setCurrentStep, 
    isSubmitting, 
    setIsSubmitting, 
    error, 
    setError 
  } = useWhitelist()
  
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate email
    if (!email.trim().endsWith("@pitt.edu")) {
      setError("Please enter a valid @pitt.edu email address")
      toast({
        title: "Invalid Email",
        description: "Please enter a valid @pitt.edu email address",
        variant: "destructive"
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Send verification email using API
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json() as VerificationResponse;

      if (!response.ok) {
        setError(data.error || "Failed to send verification email")
        toast({
          title: "Verification Failed",
          description: data.error || "Failed to send verification email",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      // Proceed to next step
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox for the verification code",
      })
      setIsSubmitting(false)
      setCurrentStep(2)
    } catch (err) {
      console.error("Error sending verification email:", err)
      setError("An error occurred. Please try again later.")
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure we're directly updating the state with the input value
    setEmail(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Enter your Pitt Email</h2>
      
      <div className="mb-4">
        <Label htmlFor="email">Pitt Email Address</Label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="panther@pitt.edu"
            className="pl-10"
            value={email}
            onChange={handleEmailChange}
            disabled={isSubmitting}
            required
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <p className="text-xs text-muted-foreground mt-2">
          We'll send a verification code to this email
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="mr-2">Sending code...</span>
              <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
            </span>
          ) : (
            <span className="flex items-center">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
} 