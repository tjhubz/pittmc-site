"use client"

import { useState } from "react"
import { ArrowRight, Mail, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWhitelist } from "../whitelist-context"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

    // No actual verification here - we'll just go to the next step
    // where the actual verification flow will begin
    setIsSubmitting(false)
    setCurrentStep(2)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure we're directly updating the state with the input value
    setEmail(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <Mail className="mx-auto h-12 w-12 rounded-full bg-primary/10 p-2 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Enter your Pitt Email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll verify that you're a Pitt student
        </p>
      </div>
      
      <div className="mb-6">
        <Label htmlFor="email" className="text-base font-medium">Pitt Email Address</Label>
        <div className="relative mt-2">
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
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-100">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-sm text-blue-700">
          On the next screen, you'll need to send an email from this address to <span className="font-medium">verify@pittmc.com</span> to complete verification.
        </AlertDescription>
      </Alert>

      <div className="mt-6">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="mr-2">Processing...</span>
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