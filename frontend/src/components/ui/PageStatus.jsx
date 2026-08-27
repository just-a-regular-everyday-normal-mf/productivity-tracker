export function Skeleton({ className = "", style }) {
  return <div className={["skeleton", className].filter(Boolean).join(" ")} style={style} />;
}

export function PageLoadError({ onRetry }) {
  return (
    <div className="daily-banner" role="alert">
      Something went wrong loading this page.{" "}
      <button type="button" className="retry-link" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export function DailySkeleton() {
  return (
    <div className="daily-page" aria-busy="true">
      <div className="skeleton-gauge">
        <Skeleton className="skeleton-circle" />
      </div>
      <div className="task-grid">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="card task-card">
            <Skeleton style={{ height: 18, width: "55%" }} />
            <Skeleton style={{ height: 12, width: "40%" }} />
            <Skeleton style={{ height: 8, width: "100%" }} />
            <Skeleton style={{ height: 32, width: "70%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="company-list-card card" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton-list-row">
          <div>
            <Skeleton style={{ height: 16, width: 140 }} />
            <Skeleton style={{ height: 12, width: 100, marginTop: 8 }} />
          </div>
          <Skeleton style={{ height: 12, width: 64 }} />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="company-detail-page" aria-busy="true">
      <Skeleton style={{ height: 14, width: 180 }} />
      <div className="card company-detail-card">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton-kv">
            <Skeleton style={{ height: 14, width: 90 }} />
            <Skeleton style={{ height: 14, width: "70%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="history-list" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="card history-day">
          <div className="skeleton-history-row">
            <Skeleton style={{ height: 14, width: 150 }} />
            <Skeleton style={{ height: 8, flex: 1 }} />
            <Skeleton style={{ height: 14, width: 36 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
