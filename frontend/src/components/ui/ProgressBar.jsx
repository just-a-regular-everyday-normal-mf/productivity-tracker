export default function ProgressBar({ value = 0, color }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  const fillColor =
    color || (clamped >= 100 ? "var(--accent-green)" : "var(--accent-amber)");

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-bar-fill"
        style={{ width: `${clamped}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}
