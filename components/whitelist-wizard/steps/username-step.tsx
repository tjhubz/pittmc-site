"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, User, Check, AlertCircle, InfoIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWhitelist } from "../whitelist-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface WhitelistResponse {
  success?: boolean;
  error?: string;
  message?: string;
  status?: string;
}

interface UsernameValidationResponse {
  valid: boolean;
  message?: string;
}

export function UsernameStep() {
  const { 
    username, 
    setUsername, 
    device,
    edition,
    token,
    setCurrentStep, 
    isSubmitting, 
    setIsSubmitting, 
    error, 
    setError,
    setStatusMessage,
    setIsSuccess,
    setStatusType
  } = useWhitelist()

  const { toast } = useToast()
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    setUsernameAvailable(null)
    setError('')
  }

  const checkUsername = async () => {
    if (!username || username.trim() === '') {
      setError('Please enter your Minecraft username')
      toast({
        title: "Missing Username",
        description: "Please enter your Minecraft username",
        variant: "destructive"
      })
      return
    }
    
    setCheckingUsername(true)
    
    try {
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(),
          edition
        }),
      })

      const data = await response.json() as UsernameValidationResponse
      
      if (response.ok && data.valid) {
        setUsernameAvailable(true)
        toast({
          title: "Username Valid",
          description: "Your Minecraft username is valid",
          variant: "default"
        })
      } else {
        setUsernameAvailable(false)
        setError(data.message || 'This username could not be validated')
        toast({
          title: "Invalid Username",
          description: data.message || 'This username could not be validated',
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error checking username:", err)
      setError('Error validating username. Please try again.')
      toast({
        title: "Validation Error",
        description: "Error validating username. Please try again.",
        variant: "destructive"
      })
      setUsernameAvailable(false)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username) {
      setError('Please enter your Minecraft username')
      toast({
        title: "Missing Username",
        description: "Please enter your Minecraft username",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      // Send whitelist request
      const response = await fetch('/api/whitelist-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          edition,
          token,
          device
        }),
      })

      const data = await response.json() as WhitelistResponse
      
      if (!response.ok) {
        const errorMessage = data.error || 'Failed to submit whitelist request';
        console.error("Whitelist request failed:", errorMessage);
        setError(errorMessage);
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive"
        });
        setStatusType("error");
        setIsSubmitting(false);
        return;
      }
      
      // Use the status from the API if available, otherwise infer it from the message
      if (data.status) {
        // Direct mapping from backend status
        setStatusType(data.status as "success" | "warning" | "error");
        setStatusMessage(data.message || '');
        setIsSuccess(data.status !== "error");
      } else if (data.message && edition === 'bedrock' && 
          data.message.includes("Bedrock whitelist requests cannot be verified")) {
        // Set warning status for Bedrock users who can't be verified
        setStatusType("warning");
        setStatusMessage(data.message);
        setIsSuccess(true); // It's still a success, just with a warning
      } else if (data.message && data.message.includes("already whitelisted")) {
        // Handle "already whitelisted" as a warning
        setStatusType("warning");
        setStatusMessage(data.message);
        setIsSuccess(true);
      } else {
        // Regular success
        setStatusType("success");
        setStatusMessage(data.message || 'Your whitelist request has been submitted successfully!');
        setIsSuccess(true);
      }
      
      setIsSubmitting(false);
      setCurrentStep(5);
      
    } catch (err) {
      console.error("Error submitting whitelist request:", err);
      
      // Check if it's a network connectivity issue
      if (err instanceof Error && (
        err.message.includes('Failed to fetch') || 
        err.message.includes('Network connection lost') ||
        err.message.includes('network')
      )) {
        setError('Unable to connect to the whitelist server. Please try again later.');
        toast({
          title: "Connection Error",
          description: "Unable to connect to the whitelist server. Please try again later.",
          variant: "destructive"
        });
      } else {
        setError('An error occurred. Please try again.');
        toast({
          title: "Error",
          description: "An error occurred. Please try again.",
          variant: "destructive"
        });
      }
      
      setStatusType("error");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <User className="mx-auto h-12 w-12 rounded-full bg-primary/10 p-2 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Enter Your Minecraft Username</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We need your exact in-game username to whitelist you
        </p>
      </div>

      <div className="mb-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            {edition === 'java' 
              ? "Enter your Java Edition in-game username (not your email)" 
              : "Enter your Xbox/Microsoft gamertag (the name you see in-game)"}
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 space-y-2">
          <div className="rounded-md border p-3">
            <h3 className="font-medium text-sm mb-2">
              {edition === 'java' 
                ? "Where to find your Java username:" 
                : "Where to find your Bedrock username:"}
            </h3>
            <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
              {edition === 'java' ? (
                <>
                  <li>Open the Minecraft Launcher</li>
                  <li>Look at the top-right corner of the launcher</li>
                  <li>Your username appears under your character's head</li>
                </>
              ) : device === 'mobile' ? (
                <>
                  <li>Open Minecraft on your phone/tablet</li>
                  <li>Tap on Settings</li>
                  <li>Your gamertag is typically shown above your avatar in the minecraft homescreen. You may need to sign in with a Microsoft account for this to work.</li>
                </>
              ) : device === 'console' ? (
                <>
                  <li>Open Minecraft on your console</li>
                  <li>Go to Settings</li>
                  <li>Your gamertag is shown with your profile, typically above your avatar in the homescreen.</li>
                </>
              ) : (
                <>
                  <li>Open Minecraft (Windows 10/11 Edition)</li>
                  <li>Go to Settings</li>
                  <li>Your gamertag is your Xbox username. It's displayed above your avatar in the homescreen.</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>
      
      <div className="mb-6 space-y-3">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="username">Your Minecraft Username</Label>
          <div className="flex space-x-2">
            <Input
              id="username"
              placeholder={edition === 'java' ? "MyJavaUsername" : "MyXboxGamertag"}
              value={username}
              onChange={handleUsernameChange}
              className={
                usernameAvailable === true 
                  ? "border-green-500 focus-visible:ring-green-500" 
                  : usernameAvailable === false 
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
              }
              disabled={isSubmitting}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={checkUsername}
              disabled={checkingUsername || !username || isSubmitting}
            >
              {checkingUsername ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : usernameAvailable === true ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
          {usernameAvailable === true && (
            <p className="text-xs text-green-500 flex items-center">
              <Check className="h-3 w-3 mr-1" /> Username is valid
            </p>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(3)}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="mr-2">Submitting...</span>
              <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin rounded-full" />
            </span>
          ) : (
            <span className="flex items-center">
              Submit Request
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  )
} 