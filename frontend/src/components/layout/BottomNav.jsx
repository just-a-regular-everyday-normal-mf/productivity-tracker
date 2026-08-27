import { NavLink } from "react-router-dom";
import { Building2, History, Target } from "lucide-react";

const NAV_ITEMS = [
  { to: "/daily", label: "Daily", icon: Target, end: true },
  { to: "/companies", label: "Companies", icon: Building2, end: false },
  { to: "/history", label: "History", icon: History, end: true },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            ["bottom-nav-link", isActive ? "is-active" : ""]
              .filter(Boolean)
              .join(" ")
          }
          aria-label={label}
        >
          <Icon size={22} strokeWidth={1.8} />
        </NavLink>
      ))}
    </nav>
  );
}
