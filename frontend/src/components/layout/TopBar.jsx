import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Button from "../ui/Button";
import { usePageTitle } from "./PageTitleContext";

function pageTitle(pathname) {
  if (pathname === "/daily") return "Daily";
  if (pathname === "/companies") return "Applications";
  if (pathname === "/companies/new") return "Log a New Application";
  if (pathname.startsWith("/companies/")) return "Company";
  if (pathname === "/history") return "History";
  return "OPS LOG";
}

function formatDeckDate(date = new Date()) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = String(date.getDate());
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { overrideTitle } = usePageTitle();

  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <header className="topbar">
        <h2 className="page-title">{overrideTitle || pageTitle(pathname)}</h2>
      <p className="topbar-date">{formatDeckDate()}</p>
      <div className="topbar-actions">
        <ThemeToggle />
        <Button variant="ghost" className="logout-button" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </header>
  );
}
