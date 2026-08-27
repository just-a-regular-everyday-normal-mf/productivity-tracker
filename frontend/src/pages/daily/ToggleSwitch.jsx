export default function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <label className={["toggle-row", disabled ? "is-disabled" : ""].join(" ")}>
      <button
        type="button"
        className={["toggle-switch", checked ? "is-on" : ""].join(" ")}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
      <span>{label}</span>
    </label>
  );
}
