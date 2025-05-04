"use client"

import { useEffect } from 'react'

interface UseOTPDetectionProps {
  onOTPReceived: (code: string) => void
}

export function useOTPDetection({ onOTPReceived }: UseOTPDetectionProps) {
  useEffect(() => {
    // Feature detection for WebOTP API
    // This is a simplified version that works with modern browsers
    if (typeof window !== 'undefined' && 'OTPCredential' in window) {
      try {
        const abortController = new AbortController()
        const signal = abortController.signal
        
        // Using type assertion to bypass TypeScript's type checking for experimental API
        navigator.credentials.get({
          signal,
          ...({ otp: { transport: ['sms'] } } as unknown as CredentialRequestOptions)
        })
        .then(otp => {
          // @ts-ignore - code property exists on successful OTP retrieval
          if (otp?.code) {
            // @ts-ignore
            onOTPReceived(otp.code)
          }
        })
        .catch(err => {
          // Silence error - this is expected in browsers that don't fully support WebOTP
          console.log('OTP auto-detection failed or was canceled:', err.message)
        })
        
        return () => {
          abortController.abort()
        }
      } catch (error) {
        console.log('OTP detection not supported in this browser')
      }
    }
  }, [onOTPReceived])
} 