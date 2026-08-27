import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DailyTracker from "./pages/DailyTracker";
import CompaniesList from "./pages/CompaniesList";
import CompanyDetail from "./pages/CompanyDetail";
import NewCompany from "./pages/NewCompany";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/daily" element={<DailyTracker />} />
        <Route path="/companies/new" element={<NewCompany />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
