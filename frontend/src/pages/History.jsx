import { useEffect, useMemo, useState } from "react";
import { fetchDailyLogHistory } from "../api/dailyLog";
import HistoryDayCard from "./history/HistoryDayCard";

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDailyLogHistory();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || "Failed to load history.");
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
    return rows.filter((row) => {
      const date = String(row.log_date || "").slice(0, 10);
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    });
  }, [rows, fromDate, toDate]);

  return (
    <div className="history-page">
      {error ? (
        <div className="daily-banner" role="alert">
          {error}
        </div>
      ) : null}

      <div className="history-filters">
        <label className="form-field">
          <span>From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>To</span>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <p className="daily-status">Loading history…</p>
      ) : rows.length === 0 ? (
        <div className="history-empty">
          No finalized days yet — check back after your first full day.
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">No days in this range.</div>
      ) : (
        <div className="history-list">
          {filtered.map((log) => (
            <HistoryDayCard
              key={log.id || log.log_date}
              log={log}
              expanded={openId === (log.id || log.log_date)}
              onToggle={() =>
                setOpenId((current) => {
                  const id = log.id || log.log_date;
                  return current === id ? null : id;
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
