import React from 'react';
import clsx from 'clsx';
import { FaRocket, FaCode, FaClock, FaTrophy, FaRedo } from 'react-icons/fa';

const phases = [
  { label: 'Pre-Drop', icon: FaRocket },
  { label: 'Drop Active', icon: FaCode },
  { label: 'Waiting for Draw', icon: FaClock },
  { label: 'Claim Window', icon: FaTrophy },
  { label: 'Rollover', icon: FaRedo },
];

const colorMap = {
  'Pre-Drop': 'from-pink-400 to-pink-600',
  'Drop Active': 'from-yellow-400 to-yellow-500',
  'Waiting for Draw': 'from-blue-400 to-blue-600',
  'Claim Window': 'from-green-400 to-green-600',
  'Rollover': 'from-purple-400 to-purple-600',
};

const PhaseStepper = ({ currentPhase, phaseProgress = 0 }) => {
  const activeIndex = phases.findIndex(p => p.label === currentPhase);

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 px-4">
      <div className="relative flex items-center justify-between">
        {/* Track line background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-yellow-300 to-purple-500 opacity-20 blur-md rounded-full -z-10" />

        {/* Phases */}
        {phases.map((phase, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const Icon = phase.icon;
          const color = colorMap[phase.label];

          return (
            <div key={phase.label} className="flex flex-col items-center flex-1 relative z-10">
              {/* Connector bar */}
              {index < phases.length - 1 && (
                <div className="absolute top-4 left-full w-full h-0.5 bg-gray-800 z-0">
                  {isActive && (
                    <div
                      className={clsx('h-full transition-all duration-500', `bg-gradient-to-r ${color}`)}
                      style={{ width: `${Math.min(100, Math.max(0, phaseProgress * 100))}%` }}
                    />
                  )}
                  {isCompleted && <div className="h-full w-full bg-pink-500" />}
                </div>
              )}

              {/* Phase icon + label */}
              <div
                className={clsx(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 mb-1',
                  isCompleted
                    ? 'bg-pink-500 text-black border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                    : isActive
                    ? `bg-gradient-to-br ${color} text-black border-white animate-pulse shadow-[0_0_16px_rgba(255,255,255,0.3)]`
                    : 'border-white/20 bg-black text-white/40'
                )}
              >
                <Icon className="text-lg" />
              </div>
              <span
                className={clsx(
                  'text-sm font-medium tracking-wide',
                  isActive ? 'text-white' : 'text-white/60'
                )}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Line */}
      <div className="w-full mt-4">
        <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-pink-500 transition-all duration-500"
            style={{
              width: `${(activeIndex + phaseProgress) / (phases.length - 1) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PhaseStepper;
