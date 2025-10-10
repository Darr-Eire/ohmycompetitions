import React from 'react'

const PHASES = [
  { key: 'code-active', label: 'Code Live' },
  { key: 'waiting-draw', label: 'Waiting for Draw' },
  { key: 'claim-window', label: 'Claim Window' },
  { key: 'rollover', label: 'Rollover' },
]

export default function PhaseStepper({ currentPhase }) {
  return (
    <div className="flex items-center justify-between gap-2 w-full max-w-xl mx-auto mt-6">
      {PHASES.map((step, index) => {
        const isActive = step.key === currentPhase
        const isPast = PHASES.findIndex(p => p.key === currentPhase) > index

        return (
          <div key={step.key} className="flex-1 text-center relative">
            <div
              className={`w-4 h-4 mx-auto rounded-full ${
                isActive
                  ? 'bg-cyan-400 shadow-md shadow-cyan-300'
                  : isPast
                  ? 'bg-cyan-800'
                  : 'bg-gray-600'
              }`}
            ></div>
            <div className="text-xs text-white mt-1">{step.label}</div>
            {index < PHASES.length - 1 && (
              <div className="absolute top-2 left-1/2 w-full h-px bg-gradient-to-r from-cyan-500 to-transparent z-0"></div>
            )}
          </div>
        )
      })}
    </div>
  )
}
