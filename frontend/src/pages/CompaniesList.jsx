import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";

export default function CompaniesList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(location.state?.toast || "");

  useEffect(() => {
    if (location.state?.toast) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  return (
    <div className="companies-page">
      {toast ? (
        <div className="daily-banner is-success" role="status">
          {toast}
        </div>
      ) : null}
      <Card>
        <div>Companies List</div>
      </Card>
    </div>
  );
}
