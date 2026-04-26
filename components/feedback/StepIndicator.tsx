'use client'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
              i < currentStep
                ? 'bg-sky-600'
                : i === currentStep
                ? 'bg-sky-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-slate-400 text-sm">
        {currentStep} / {totalSteps}
      </p>
    </div>
  )
}
