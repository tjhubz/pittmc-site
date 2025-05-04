"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Copy, Link, AlertCircle, ClipboardCopy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWhitelist } from "../whitelist-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

export function StatusStep() {
  const { 
    isSuccess, 
    statusMessage,
    statusType,
    device,
    edition,
    username,
    resetForm
  } = useWhitelist()

  const { copy, copied } = useCopyToClipboard({ timeout: 2000 })
  
  const serverAddress = 'play.pittmc.com'
  const discordLink = 'https://discord.com/invite/MNcFhkjJcW'
  
  const handleCopyAddress = () => {
    copy(serverAddress)
  }
  
  const handleCopyDiscord = () => {
    copy(discordLink)
  }
  
  const getDeviceInstructions = () => {
    if (edition === 'java') {
      return (
        <div className="space-y-3">
          <ol className="list-decimal text-sm text-muted-foreground ml-5 space-y-2">
            <li>Open Minecraft Java Edition</li>
            <li>Click on "Multiplayer"</li>
            <li>Click "Add Server"</li>
            <li>Enter "<strong>PittMC</strong>" as the server name</li>
            <li>Enter "<strong>{serverAddress}</strong>" as the server address</li>
            <li>Click "Done" and then select the server and click "Join Server"</li>
          </ol>
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs text-blue-700">
              If you encounter any issues connecting, make sure you're running the latest version of Minecraft Java Edition.
            </AlertDescription>
          </Alert>
        </div>
      )
    } else if (device === 'mobile') {
      return (
        <div className="space-y-3">
          <ol className="list-decimal text-sm text-muted-foreground ml-5 space-y-2">
            <li>Open Minecraft on your mobile device</li>
            <li>Tap on "Play" then select the "Servers" tab</li>
            <li>Scroll down to the bottom and tap "Add Server"</li>
            <li>Enter the following information:
              <ul className="list-disc ml-5 mt-1">
                <li>Server Name: <strong>PittMC</strong></li>
                <li>Server Address: <strong>{serverAddress}</strong></li>
                <li>Port: <strong>19132</strong> (leave as default)</li>
              </ul>
            </li>
            <li>Tap "Save"</li>
            <li>Your server should now appear in the list - tap on it to join</li>
          </ol>
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs text-blue-700">
              Make sure your Minecraft app is updated to the latest version for best compatibility.
            </AlertDescription>
          </Alert>
        </div>
      )
    } else if (device === 'console') {
      return (
        <div className="text-sm text-muted-foreground space-y-3">
          <p>Console players need to use BedrockConnect to join custom servers like ours:</p>
          <ol className="list-decimal ml-5 space-y-2">
            <li>In Minecraft, go to "Play" then the "Friends" tab</li>
            <li>Click "Add Friend" or "Find Cross-Platform Friends"</li>
            <li>Search for <strong>BCMain</strong> (or try <strong>BCMain1</strong> if BCMain is offline/not working)</li>
            <li>Add this user as a friend</li>
            <li>Return to the Minecraft main menu and wait about 20 seconds</li>
            <li>Go back to "Play" and the "Friends" tab</li>
            <li>Look for the ability to join BCMain/BCMain1 as a friend</li>
            <li>Join this instance - after a while, it should open the server list</li>
            <li>In the server list, click "Add Server" and enter our server information:
              <ul className="list-disc ml-5 mt-1">
                <li>Name (optional): <strong>PittMC</strong></li>
                <li>Address: <strong>{serverAddress}</strong></li>
                <li>Port: <strong>19132</strong></li>
              </ul>
            </li>
            <li>Save the server and connect to it from the server list</li>
          </ol>
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs text-blue-700">
              Console connection requires this special method. If you need help, please join our Discord for detailed assistance.
            </AlertDescription>
          </Alert>
        </div>
      )
    } else {
      // Windows Bedrock or other platforms
      return (
        <div className="space-y-3">
          <ol className="list-decimal text-sm text-muted-foreground ml-5 space-y-2">
            <li>Open Minecraft Bedrock Edition</li>
            <li>Click on "Play" then select the "Servers" tab</li>
            <li>Scroll down to the bottom and click "Add Server"</li>
            <li>Enter the following information:
              <ul className="list-disc ml-5 mt-1">
                <li>Server Name: <strong>PittMC</strong></li>
                <li>Server Address: <strong>{serverAddress}</strong></li>
                <li>Port: <strong>19132</strong> (leave as default)</li>
              </ul>
            </li>
            <li>Click "Save"</li>
            <li>Your server should now appear in the list - click on it to join</li>
          </ol>
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs text-blue-700">
              Make sure your Minecraft is updated to the latest version for best compatibility.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  }

  // Determine icon and title based on status
  const getStatusIcon = () => {
    if (statusType === "error") {
      return <XCircle className="mx-auto h-12 w-12 rounded-full bg-red-50 p-2 text-red-500" />
    } else if (statusType === "warning") {
      return <AlertCircle className="mx-auto h-12 w-12 rounded-full bg-yellow-50 p-2 text-yellow-500" />
    } else {
      return <CheckCircle2 className="mx-auto h-12 w-12 rounded-full bg-green-50 p-2 text-green-500" />
    }
  }

  const getStatusTitle = () => {
    if (statusType === "error") {
      return "Submission Failed"
    } else if (statusType === "warning") {
      return "Request Processed With Notes"
    } else {
      return "Whitelist Request Processed"
    }
  }

  const getStatusAlert = () => {
    if (statusType === "error") {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error processing your request. Please try again or contact our support team for assistance.
          </AlertDescription>
        </Alert>
      )
    } else if (statusType === "warning" && edition === "bedrock") {
      return (
        <Alert className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            <span className="font-medium">Your request was processed</span>, but Bedrock whitelist requests 
            can't be verified by our system. Please try joining the server. If you have trouble connecting, 
            contact us via Discord or email.
          </AlertDescription>
        </Alert>
      )
    } else if (statusType === "warning") {
      return (
        <Alert className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            <span className="font-medium">Your username is already whitelisted!</span> You can join the server right away.
            If you're having trouble connecting, please contact us for assistance.
          </AlertDescription>
        </Alert>
      )
    } else {
      return (
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            <span className="font-medium">Success!</span> Your username has been whitelisted. You can now join the server.
          </AlertDescription>
        </Alert>
      )
    }
  }

  // Only show "What's Next" content for success or warning statuses
  const showNextSteps = statusType === "success" || statusType === "warning"

  return (
    <div>
      <div className="mb-6 text-center">
        {getStatusIcon()}
        <h2 className="mt-4 text-xl font-semibold">
          {getStatusTitle()}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {statusType === "error" 
            ? "There was an error submitting your whitelist request. Please try again or contact us for assistance."
            : statusType === "warning" && edition === "bedrock" 
              ? "Your whitelist request has been processed, but requires verification. Please try joining the server."
              : statusType === "warning"
                ? "Your username is already on our whitelist. You can join the server right away."
                : "Your whitelist request has been successfully processed. Follow the instructions below to join our server."
          }
        </p>
      </div>
      
      {(statusType === "success" || statusType === "warning") && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Whitelist Status</CardTitle>
              <CardDescription>
                {statusType === "warning" && edition === "bedrock" 
                  ? "Your request was processed, but requires verification" 
                  : statusType === "warning"
                    ? "Your username is already on our whitelist"
                    : "Your whitelist request has been successfully processed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                {getStatusAlert()}
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-base font-medium">What's Next?</h3>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Server Address:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">{serverAddress}</code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleCopyAddress}
                    className="h-8 w-8"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Join our Discord:</span>
                <div className="flex items-center gap-2">
                  <a 
                    href={discordLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center"
                  >
                    Discord Server <Link className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="connect">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connect">Connection Instructions</TabsTrigger>
              <TabsTrigger value="help">Help & Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect" className="p-4 border rounded-md mt-2">
              <h4 className="font-medium mb-2">
                How to Connect ({device} • {edition === 'java' ? 'Java' : 'Bedrock'})
              </h4>
              {getDeviceInstructions()}
              
              {statusType === "warning" && edition === "bedrock" && (
                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-xs text-yellow-700">
                    <span className="font-medium">Note for Bedrock players:</span> After adding the server, 
                    try connecting. If you can't join, please contact us via Discord or email at help@pittmc.com.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="help" className="p-4 border rounded-md mt-2">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Join our Discord for immediate assistance</li>
                <li>• Email <a href="mailto:help@pittmc.com" className="text-primary hover:underline">help@pittmc.com</a></li>
                <li>• If your username changed, you'll need to request whitelisting again</li>
                {edition === "bedrock" && (
                  <li className="font-medium text-yellow-600">• Bedrock users: If you can't connect after following the instructions, please contact us for manual assistance</li>
                )}
              </ul>
            </TabsContent>
          </Tabs>
          
          <div className="pt-4 text-center">
            <Button onClick={resetForm}>
              Start a New Request
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {statusType === "error" && (
        <div className="mt-6 text-center space-y-4">
          {getStatusAlert()}
          
          <Button onClick={resetForm}>
            Try Again
            <RefreshCw className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 