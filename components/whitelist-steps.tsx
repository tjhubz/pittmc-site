interface WhitelistStepsProps {
  currentStep: number
  totalSteps?: number
}

export function WhitelistSteps({ currentStep, totalSteps = 5 }: WhitelistStepsProps) {
  const progress = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full mb-6">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#003594] transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Start</span>
        <span>Complete</span>
      </div>
    </div>
  )
}
