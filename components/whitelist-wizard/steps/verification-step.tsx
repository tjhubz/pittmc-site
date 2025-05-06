"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, ArrowRight, Mail, ExternalLink, Check, RefreshCw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWhitelist } from "../whitelist-context"
import { useToast } from "@/hooks/use-toast"

interface VerificationResponse {
  success?: boolean;
  error?: string;
  token?: string;
  verified?: boolean;
}

interface InitializeResponse {
  success?: boolean;
  error?: string;
  sessionId?: string;
  message?: string;
}

export function VerificationStep() {
  const { 
    email,
    setToken,
    setCurrentStep, 
    isSubmitting, 
    setIsSubmitting, 
    error, 
    setError,
  } = useWhitelist()

  const { toast } = useToast()
  const [sessionId, setSessionId] = useState("")
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const [emailSent, setEmailSent] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  
  // Handle cooldown timer for check status button
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  // Initialize the session when component mounts
  useEffect(() => {
    if (email && !sessionId) {
      initializeSession()
    }
  }, [email])

  // Initialize the verification session
  const initializeSession = async () => {
    setIsSubmitting(true)
    setError("")
    
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email
        }),
      });

      const data = await response.json() as InitializeResponse;

      if (!response.ok) {
        setError(data.error || "Failed to initialize verification");
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data.error || "Failed to initialize verification"
        });
        setIsSubmitting(false);
        return;
      }

      setSessionId(data.sessionId || "");
      setIsSubmitting(false);
      setEmailSent(true);
    } catch (err) {
      console.error("Error initializing verification:", err);
      setError("An error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again."
      });
      setIsSubmitting(false);
    }
  }

  // Check verification status
  const checkVerificationStatus = async () => {
    // Don't check if already checking or cooldown is active
    if (checkingStatus || cooldownRemaining > 0) return;
    
    setCheckingStatus(true);
    setLastCheckTime(Date.now());
    setError("");

    try {
      const response = await fetch('/api/check-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          sessionId
        }),
      });

      const data = await response.json() as VerificationResponse;

      if (!response.ok) {
        setError(data.error || "Failed to check verification status");
        toast({
          variant: "destructive",
          title: "Status Check Failed",
          description: data.error || "Failed to check verification status"
        });
        setCheckingStatus(false);
        setCooldownRemaining(10); // 10-second cooldown
        return;
      }

      // If verified, store token and proceed
      if (data.verified && data.token) {
        setToken(data.token);
        toast({
          title: "Verification Successful",
          description: "Your email has been verified"
        });
        setCheckingStatus(false);
        setCurrentStep(3);
        return;
      } 
      
      // Not yet verified
      toast({
        title: "Not Yet Verified",
        description: "We haven't received your verification email yet"
      });
      
      setCheckingStatus(false);
      setCooldownRemaining(10); // 10-second cooldown
    } catch (err) {
      console.error("Error checking verification status:", err);
      setError("An error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again."
      });
      setCheckingStatus(false);
      setCooldownRemaining(10); // 10-second cooldown
    }
  }

  const handleStartOver = () => {
    setSessionId("");
    setEmailSent(false);
    initializeSession();
  }

  const openMailClient = () => {
    window.open(`mailto:verify@pittmc.com?subject=Verify PittMC Account&body=This email verifies my PittMC account.%0A%0ASent from ${email}`, '_blank');
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <Mail className="mx-auto h-12 w-12 rounded-full bg-primary/10 p-2 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Verify Your Email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please verify your Pitt email: <span className="font-medium break-all">{email}</span>
        </p>
      </div>
      
      <div className="space-y-4">
        {!emailSent ? (
          <div className="flex justify-center">
            <Button 
              onClick={initializeSession} 
              disabled={isSubmitting}
              className="w-full max-w-[320px]"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="mr-2">Initializing...</span>
                  <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
                </span>
              ) : (
                <span className="flex items-center">
                  Begin Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-primary/10 border border-primary/20">
              <div className="space-y-2">
                <p className="font-medium">Verification Instructions:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Send an email from your <strong>@pitt.edu</strong> address to <strong>verify@pittmc.com</strong></li>
                  <li>Wait a few seconds after sending</li>
                  <li>Click "Check Verification Status" below</li>
                </ol>
              </div>
            </Alert>
            
            <div className="flex flex-col gap-3 items-center">
              <div className="w-full max-w-[320px]">
                <Button
                  className="w-full gap-2"
                  onClick={checkVerificationStatus}
                  disabled={checkingStatus || cooldownRemaining > 0}
                >
                  {checkingStatus ? (
                    <span className="flex items-center">
                      <span className="mr-2">Checking...</span>
                      <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
                    </span>
                  ) : cooldownRemaining > 0 ? (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Check Again in {cooldownRemaining}s
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Check Verification Status
                    </>
                  )}
                </Button>
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  You can check every 10 seconds
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="w-full"
          disabled={isSubmitting || checkingStatus}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Email
        </Button>
      </div>
    </div>
  )
} 