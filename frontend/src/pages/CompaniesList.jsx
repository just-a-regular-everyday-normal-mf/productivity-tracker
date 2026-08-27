import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { downloadCompaniesCsv, fetchCompanies } from "../api/companies";
import { fieldCountLabel, formatAppliedDate } from "../lib/companyFields";

export default function CompaniesList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(location.state?.toast || "");
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (location.state?.toast) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCompanies();
        if (!cancelled) setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || "Failed to load applications.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter((company) =>
      String(company.company_name || "").toLowerCase().includes(needle)
    );
  }, [companies, query]);

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await downloadCompaniesCsv();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to download CSV.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="companies-page">
      {toast ? (
        <div className="daily-banner is-success" role="status">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="daily-banner" role="alert">
          {error}
        </div>
      ) : null}

      <div className="companies-toolbar">
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? "Downloading…" : "Download CSV"}
        </Button>
        <Link to="/companies/new" className="btn btn-primary">
          + New Application
        </Link>
      </div>

      <input
        className="companies-search"
        type="search"
        placeholder="Search by company name..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {loading ? (
        <p className="daily-status">Loading applications…</p>
      ) : companies.length === 0 ? (
        <div className="companies-empty">
          <p>No applications logged yet.</p>
          <Link to="/companies/new" className="btn btn-primary">
            Log your first one
          </Link>
        </div>
      ) : (
        <Card className="company-list-card">
          {filtered.length === 0 ? (
            <p className="company-list-empty-filter">No applications match.</p>
          ) : (
            filtered.map((company) => {
              const count = Array.isArray(company.fields) ? company.fields.length : 0;
              return (
                <Link
                  key={company.id}
                  to={`/companies/${company.id}`}
                  className="company-row"
                >
                  <div className="company-row-main">
                    <div className="company-row-name">{company.company_name}</div>
                    <div className="company-row-date">
                      Applied {formatAppliedDate(company.log_date)}
                    </div>
                  </div>
                  <div className="company-row-count">{fieldCountLabel(count)}</div>
                  <span className="company-row-chevron">
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </span>
                </Link>
              );
            })
          )}
        </Card>
      )}
    </div>
  );
}
