export default function StatNumber({ value, label }) {
  return (
    <div className="stat-number">
      <div className="stat-number-value">{value}</div>
      {label ? <div className="stat-number-label">{label}</div> : null}
    </div>
  );
}
