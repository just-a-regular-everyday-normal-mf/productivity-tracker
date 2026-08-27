import { NavLink, useNavigate } from "react-router-dom";
import { Building2, History, Target } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Button from "../ui/Button";

const NAV_ITEMS = [
  { to: "/daily", label: "Daily", icon: Target, end: true },
  { to: "/companies", label: "Companies", icon: Building2, end: false },
  { to: "/history", label: "History", icon: History, end: true },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>OPS LOG</h1>
        <p>daily execution tracker</p>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              ["nav-link", isActive ? "is-active" : ""].filter(Boolean).join(" ")
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
        <Button variant="ghost" className="logout-button" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </aside>
  );
}
