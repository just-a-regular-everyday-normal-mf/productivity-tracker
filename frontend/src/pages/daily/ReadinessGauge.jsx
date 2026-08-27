import { TASK_IDS, isTaskComplete } from "../../utils/progress";

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RING_R = 82;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

export default function ReadinessGauge({ percent, tasks }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const ringColor =
    clamped >= 100 ? "var(--accent-green)" : "var(--accent-amber)";

  return (
    <div className="readiness-gauge" aria-label={`Today's readiness ${clamped} percent`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <circle
          className="readiness-ring"
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        {TASK_IDS.map((id, index) => {
          const angle = ((index / TASK_IDS.length) * 360 - 90) * (Math.PI / 180);
          const inner = RING_R + STROKE / 2 + 6;
          const outer = inner + 8;
          const lit = isTaskComplete(id, tasks);
          return (
            <line
              key={id}
              x1={CX + Math.cos(angle) * inner}
              y1={CY + Math.sin(angle) * inner}
              x2={CX + Math.cos(angle) * outer}
              y2={CY + Math.sin(angle) * outer}
              stroke={lit ? "var(--accent-amber)" : "var(--border)"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="readiness-center">
        <div className="readiness-value">{clamped}%</div>
        <div className="readiness-label">TODAY'S READINESS</div>
      </div>
    </div>
  );
}
