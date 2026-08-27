import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { PageTitleProvider } from "./PageTitleContext";

export default function AppShell() {
  return (
    <PageTitleProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main-column">
          <TopBar />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </PageTitleProvider>
  );
}
