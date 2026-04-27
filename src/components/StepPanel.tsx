import React from 'react';
import { Scenario } from '../types';

interface StepPanelProps {
  scenario: Scenario;
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick: (stepIndex: number) => void;
}

export const StepPanel: React.FC<StepPanelProps> = ({
  scenario,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="p-4">
      <h2 className="font-heading font-semibold text-sm text-[#1F2328] mb-1">
        {scenario.title}
      </h2>
      <p className="text-xs text-[#656D76] mb-4">{scenario.subtitle}</p>
      <div className="space-y-1">
        {scenario.steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = completedSteps.has(step.id);
          const isLocked = !isDone && !isActive;

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && onStepClick(idx)}
              disabled={isLocked}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                isActive ? 'bg-[#FFF0EB] text-accent font-semibold' : '',
                isDone ? 'text-[#2DA44E]' : '',
                isLocked ? 'text-[#959DA5] cursor-not-allowed' : 'hover:bg-[#F6F8FA]',
              ].join(' ')}
            >
              <span
                className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0',
                  isActive ? 'bg-accent text-white' : '',
                  isDone ? 'bg-[#2DA44E] text-white' : '',
                  isLocked ? 'bg-[#E8ECF0] text-[#959DA5]' : '',
                  !isActive && !isDone && !isLocked ? 'bg-[#E8ECF0] text-[#656D76]' : '',
                ].join(' ')}
              >
                {isDone ? '✓' : idx + 1}
              </span>
              <span className="text-sm truncate">{step.instruction}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
