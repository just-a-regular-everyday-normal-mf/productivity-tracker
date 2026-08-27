import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={!isLight ? "is-active" : ""}
        onClick={() => setTheme("dark")}
        aria-pressed={!isLight}
        aria-label="Dark"
      >
        <Moon size={14} strokeWidth={2} />
        <span className="theme-toggle-label">Dark</span>
      </button>
      <button
        type="button"
        className={isLight ? "is-active" : ""}
        onClick={() => setTheme("light")}
        aria-pressed={isLight}
        aria-label="Light"
      >
        <Sun size={14} strokeWidth={2} />
        <span className="theme-toggle-label">Light</span>
      </button>
    </div>
  );
}
