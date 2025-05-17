"use client"

import { useEffect } from "react"
import { WhitelistProvider, useWhitelist } from "./whitelist-context"
import { EmailStep, VerificationStep, DeviceStep, UsernameStep, StatusStep } from "./steps"
import { WhitelistSteps } from "@/components/whitelist-steps"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

function WizardContent() {
  const { currentStep, resetForm, email } = useWhitelist()

  // Reset form state only when component unmounts
  useEffect(() => {
    return () => {
      console.log("Wizard unmounting, resetting form")
      resetForm()
    }
  }, [resetForm])

  return (
    <div className="mx-auto w-full max-w-2xl relative z-10">
      <WhitelistSteps currentStep={currentStep} totalSteps={5} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <Card className="border shadow-md">
            <CardContent className="p-6 sm:p-8">
              {currentStep === 1 && <EmailStep />}
              {currentStep === 2 && <VerificationStep />}
              {currentStep === 3 && <DeviceStep />}
              {currentStep === 4 && <UsernameStep />}
              {currentStep === 5 && <StatusStep />}
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Need help? Contact{" "}
            <a href="mailto:help@pittmc.com" className="text-primary hover:underline">
              help@pittmc.com
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function WhitelistWizard() {
  return (
    <WhitelistProvider>
      <WizardContent />
    </WhitelistProvider>
  )
} 