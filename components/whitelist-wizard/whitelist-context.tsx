"use client"

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react'

export type DeviceType = 'windows' | 'mac' | 'mobile' | 'console' | ''
export type EditionType = 'java' | 'bedrock' | ''
export type StatusType = 'success' | 'warning' | 'error' | ''

interface WhitelistContextType {
  // Form state
  currentStep: number
  email: string
  verificationCode: string
  token: string
  device: DeviceType
  edition: EditionType
  username: string
  statusMessage: string
  isSuccess: boolean
  statusType: StatusType
  
  // Loading and error states
  isSubmitting: boolean
  error: string
  
  // State setters
  setCurrentStep: (step: number) => void
  setEmail: (email: string) => void
  setVerificationCode: (code: string) => void
  setToken: (token: string) => void
  setDevice: (device: DeviceType) => void
  setEdition: (edition: EditionType) => void
  setUsername: (username: string) => void
  setStatusMessage: (message: string) => void
  setIsSuccess: (isSuccess: boolean) => void
  setStatusType: (statusType: StatusType) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  setError: (error: string) => void
  
  // Reset function
  resetForm: () => void
}

const WhitelistContext = createContext<WhitelistContextType | undefined>(undefined)

export function WhitelistProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [token, setToken] = useState('')
  const [device, setDevice] = useState<DeviceType>('')
  const [edition, setEdition] = useState<EditionType>('')
  const [username, setUsername] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [statusType, setStatusType] = useState<StatusType>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Create a wrapped setEmail function that logs changes
  const handleSetEmail = useCallback((value: string) => {
    console.log("Setting email to:", value)
    setEmail(value)
  }, [])

  const resetForm = useCallback(() => {
    console.log("Resetting form")
    setCurrentStep(1)
    setEmail('')
    setVerificationCode('')
    setToken('')
    setDevice('')
    setEdition('')
    setUsername('')
    setStatusMessage('')
    setIsSuccess(false)
    setStatusType('')
    setIsSubmitting(false)
    setError('')
  }, [])

  return (
    <WhitelistContext.Provider
      value={{
        currentStep,
        email,
        verificationCode,
        token,
        device,
        edition,
        username,
        statusMessage,
        isSuccess,
        statusType,
        isSubmitting,
        error,
        setCurrentStep,
        setEmail: handleSetEmail,
        setVerificationCode,
        setToken,
        setDevice,
        setEdition,
        setUsername,
        setStatusMessage,
        setIsSuccess,
        setStatusType,
        setIsSubmitting,
        setError,
        resetForm
      }}
    >
      {children}
    </WhitelistContext.Provider>
  )
}

export function useWhitelist() {
  const context = useContext(WhitelistContext)
  if (context === undefined) {
    throw new Error('useWhitelist must be used within a WhitelistProvider')
  }
  return context
} 