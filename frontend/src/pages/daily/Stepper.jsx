import { useEffect, useState } from "react";

export default function Stepper({
  completed,
  target,
  onCompletedChange,
  onTargetChange,
  targetMin,
  targetMax,
  disabled = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(target));

  useEffect(() => {
    setDraft(String(target));
  }, [target]);

  function commitTarget() {
    let next = Number(draft);
    if (!Number.isFinite(next)) next = target;
    if (targetMin != null) next = Math.max(targetMin, next);
    if (targetMax != null) next = Math.min(targetMax, next);
    next = Math.max(1, Math.round(next));
    onTargetChange(next);
    setEditing(false);
  }

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        disabled={disabled || completed <= 0}
        onClick={() => onCompletedChange(Math.max(0, completed - 1))}
        aria-label="Decrease completed"
      >
        −
      </button>
      <div className="stepper-readout">
        <span>{completed}</span>
        <span className="stepper-slash"> / </span>
        {editing && !disabled ? (
          <input
            className="stepper-target-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitTarget}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitTarget();
              if (event.key === "Escape") {
                setDraft(String(target));
                setEditing(false);
              }
            }}
            aria-label="Edit target"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="stepper-target"
            disabled={disabled}
            onClick={() => setEditing(true)}
            aria-label="Edit target"
          >
            {target}
          </button>
        )}
      </div>
      <button
        type="button"
        className="stepper-btn"
        disabled={disabled || completed >= target}
        onClick={() => onCompletedChange(Math.min(target, completed + 1))}
        aria-label="Increase completed"
      >
        +
      </button>
    </div>
  );
}
