// src/ui/components/ProgressTrack.tsx
// 6-step mission progress track displaying step numbers, archetypes, and completion status.
// Strictly follows PRESENTATION.md section 5.

import React from 'react';

export interface StepInfo {
  index: number;
  name: string;
  archetype: 'travel' | 'deploy' | 'drill' | 'experiment' | 'repair' | 'uplink';
}

export const DEFAULT_MISSION_STEPS: StepInfo[] = [
  { index: 1, name: 'Recon & Travel', archetype: 'travel' },
  { index: 2, name: 'Array Deployment', archetype: 'deploy' },
  { index: 3, name: 'Regolith Drilling', archetype: 'drill' },
  { index: 4, name: 'Sample Experiment', archetype: 'experiment' },
  { index: 5, name: 'System Repair', archetype: 'repair' },
  { index: 6, name: 'Telemetry Uplink', archetype: 'uplink' },
];

export interface ProgressTrackProps {
  currentStep: number;
  totalSteps?: number;
  steps?: StepInfo[];
}

export const ProgressTrack: React.FC<ProgressTrackProps> = ({
  currentStep,
  totalSteps = 6,
  steps = DEFAULT_MISSION_STEPS,
}) => {
  const activeStep = steps.find((s) => s.index === currentStep) ?? steps[0];

  return (
    <div
      data-testid="progress-track"
      role="region"
      aria-label="Mission Progress"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Current Step Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          data-testid="progress-step-counter"
          style={{
            fontSize: 'var(--text-xs, 12px)',
            fontWeight: 800,
            color: 'var(--air, #4fd8ff)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Step {currentStep}/{totalSteps}
        </span>
        <span
          data-testid="progress-step-name"
          style={{
            fontSize: 'var(--text-sm, 14px)',
            fontWeight: 600,
            color: 'var(--ink, #f1f5f9)',
          }}
        >
          • {activeStep?.name ?? 'Mission Step'}
        </span>
      </div>

      {/* 6 Step Indicators Track */}
      <ol
        data-testid="progress-steps-list"
        aria-label="Mission steps"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let background = 'var(--surface-subpanel, rgba(15, 23, 42, 0.72))';
          let border = '1px solid var(--border-subpanel, rgba(148, 163, 184, 0.14))';
          let textColor = 'var(--ink-muted, #64748b)';

          if (isCompleted) {
            background = 'rgba(79, 216, 255, 0.2)';
            border = '1px solid var(--air, #4fd8ff)';
            textColor = 'var(--air, #4fd8ff)';
          } else if (isActive) {
            background = 'var(--air, #4fd8ff)';
            border = '1px solid var(--air, #4fd8ff)';
            textColor = 'var(--ink-inverse, #020617)';
          }

          return (
            <li
              key={stepNumber}
              data-testid={`step-node-${stepNumber}`}
              data-status={isCompleted ? 'completed' : isActive ? 'active' : 'upcoming'}
              aria-current={isActive ? 'step' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '24px',
                borderRadius: 'var(--radius-sm, 8px)',
                background,
                border,
                color: textColor,
                fontSize: '11px',
                fontWeight: 800,
                transition: 'all var(--transition-fast, 150ms ease-out)',
                boxShadow: isActive ? '0 0 10px rgba(79, 216, 255, 0.5)' : 'none',
              }}
            >
              {isCompleted ? '✓' : stepNumber}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProgressTrack;
