"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Laptop, Apple, Smartphone, Gamepad, HelpCircle, AlertCircle, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useWhitelist, DeviceType, EditionType } from "../whitelist-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"

export function DeviceStep() {
  const { 
    device, 
    setDevice, 
    edition, 
    setEdition, 
    setCurrentStep, 
    isSubmitting, 
    setIsSubmitting, 
    error, 
    setError 
  } = useWhitelist()
  
  const { toast } = useToast()
  const [showEditionOptions, setShowEditionOptions] = useState(false)

  // Initialize showEditionOptions based on device value
  useEffect(() => {
    setShowEditionOptions(device === 'windows')
  }, [device])

  const handleDeviceChange = (value: DeviceType) => {
    setDevice(value)
    setEdition('')
    setError('')
    
    // Only show edition options for Windows, auto-select Java for Mac
    if (value === 'mac') {
      setEdition('java')
      setShowEditionOptions(false)
    } else if (value === 'windows') {
      setShowEditionOptions(true)
    } else {
      setShowEditionOptions(false)
      if (value === 'mobile' || value === 'console') {
        setEdition('bedrock')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate selections
    if (!device) {
      setError("Please select a device")
      toast({
        title: "Missing Selection",
        description: "Please select a device",
        variant: "destructive"
      })
      return
    }
    
    if (device === 'windows' && !edition) {
      setError("Please select a Minecraft edition")
      toast({
        title: "Missing Selection",
        description: "Please select a Minecraft edition",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    // Determine final edition based on device
    const finalEdition: EditionType = 
      device === 'windows' ? edition :
      device === 'mac' ? 'java' :
      device === 'mobile' || device === 'console' ? 'bedrock' : 
      ''
    
    setEdition(finalEdition)
    
    // Proceed to next step
    setTimeout(() => {
      setIsSubmitting(false)
      setCurrentStep(4)
    }, 300)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <Laptop className="mx-auto h-12 w-12 rounded-full bg-primary/10 p-2 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Select Your Device</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We need to know your device and Minecraft edition to whitelist you correctly.
        </p>
      </div>
      
      <Alert className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Our server supports cross-play between Java and Bedrock editions!
        </AlertDescription>
      </Alert>
      
      <div className="mb-6">
        <Label className="mb-3 block">What device do you play Minecraft on?</Label>
        <div className="grid grid-cols-2 gap-3">
          <Label
            htmlFor="device-windows"
            className={`border-2 cursor-pointer transition-colors rounded-md ${device === 'windows' ? 'border-primary' : 'border-muted'}`}
          >
            <input
              type="radio"
              id="device-windows"
              name="device"
              value="windows"
              checked={device === 'windows'}
              onChange={() => handleDeviceChange('windows')}
              className="sr-only"
            />
            <div className="p-4 flex flex-col items-center">
              <Laptop className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Windows PC</span>
              <span className="text-xs text-muted-foreground">Java or Bedrock</span>
            </div>
          </Label>
          
          <Label
            htmlFor="device-mac"
            className={`border-2 cursor-pointer transition-colors rounded-md ${device === 'mac' ? 'border-primary' : 'border-muted'}`}
          >
            <input
              type="radio"
              id="device-mac"
              name="device"
              value="mac"
              checked={device === 'mac'}
              onChange={() => handleDeviceChange('mac')}
              className="sr-only"
            />
            <div className="p-4 flex flex-col items-center">
              <Apple className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Mac</span>
              <span className="text-xs text-muted-foreground">Java Edition</span>
            </div>
          </Label>
          
          <Label
            htmlFor="device-mobile"
            className={`border-2 cursor-pointer transition-colors rounded-md ${device === 'mobile' ? 'border-primary' : 'border-muted'}`}
          >
            <input
              type="radio"
              id="device-mobile"
              name="device"
              value="mobile"
              checked={device === 'mobile'}
              onChange={() => handleDeviceChange('mobile')}
              className="sr-only"
            />
            <div className="p-4 flex flex-col items-center">
              <Smartphone className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Mobile</span>
              <span className="text-xs text-muted-foreground">iOS/Android</span>
            </div>
          </Label>
          
          <Label
            htmlFor="device-console"
            className={`border-2 cursor-pointer transition-colors rounded-md ${device === 'console' ? 'border-primary' : 'border-muted'}`}
          >
            <input
              type="radio"
              id="device-console"
              name="device"
              value="console"
              checked={device === 'console'}
              onChange={() => handleDeviceChange('console')}
              className="sr-only"
            />
            <div className="p-4 flex flex-col items-center">
              <Gamepad className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Console</span>
              <span className="text-xs text-muted-foreground">Xbox/PlayStation/Switch</span>
            </div>
          </Label>
        </div>
      </div>
      
      {showEditionOptions && (
        <div className="mb-6 p-4 border rounded-md bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <Label className="text-base font-medium">Select your Minecraft edition</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p>Java is the original PC version purchased from minecraft.net</p>
                  <p>Bedrock is from the Microsoft Store as "Minecraft for Windows"</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-3">
            <Label
              htmlFor="edition-java"
              className={`flex items-start p-3 rounded-md border-2 cursor-pointer transition-colors ${edition === 'java' ? 'border-primary' : 'border-muted'}`}
            >
              <input
                type="radio"
                id="edition-java"
                name="edition"
                value="java"
                checked={edition === 'java'}
                onChange={() => setEdition('java')}
                className="mt-1"
              />
              <div className="ml-3">
                <span className="font-medium block">Java Edition</span>
                <p className="text-sm text-muted-foreground mt-1">
                  The original version purchased from minecraft.net or Minecraft Launcher
                </p>
              </div>
            </Label>
            
            <Label
              htmlFor="edition-bedrock"
              className={`flex items-start p-3 rounded-md border-2 cursor-pointer transition-colors ${edition === 'bedrock' ? 'border-primary' : 'border-muted'}`}
            >
              <input
                type="radio"
                id="edition-bedrock"
                name="edition"
                value="bedrock"
                checked={edition === 'bedrock'}
                onChange={() => setEdition('bedrock')}
                className="mt-1"
              />
              <div className="ml-3">
                <span className="font-medium block">Bedrock Edition</span>
                <p className="text-sm text-muted-foreground mt-1">
                  From Microsoft Store as "Minecraft for Windows" (not Java Edition)
                </p>
              </div>
            </Label>
          </div>
        </div>
      )}
      
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="info">
          <AccordionTrigger className="text-sm text-primary">
            What's the difference between Java and Bedrock?
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            <p className="mb-2"><strong>Java Edition:</strong> The original PC version with broader modding support. If you've played Minecraft on a computer for a while, you probably have this.</p>
            <p className="mb-2"><strong>Bedrock Edition:</strong> Available on mobile, console, and Windows 10/11. Uses Xbox/Microsoft accounts.</p>
            <p>Our server supports cross-play between both editions, so you can play with friends regardless of their edition!</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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