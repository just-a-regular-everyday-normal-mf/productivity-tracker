import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { createCompany } from "../api/companies";

function newFieldRow() {
  return {
    id: crypto.randomUUID(),
    key: "",
    value: "",
  };
}

export default function NewCompany() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [fields, setFields] = useState(() => [
    newFieldRow(),
    newFieldRow(),
    newFieldRow(),
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(id, patch) {
    setFields((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function removeField(id) {
    setFields((current) => current.filter((row) => row.id !== id));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const name = companyName.trim();
    if (!name) {
      setError("Company name is required.");
      return;
    }

    const populated = fields.filter(
      (row) => row.key.trim() !== "" || row.value.trim() !== ""
    );
    const missingKey = populated.find(
      (row) => row.key.trim() === "" && row.value.trim() !== ""
    );
    if (missingKey) {
      setError("Field names cannot be empty when a value is set.");
      return;
    }

    const kept = populated
      .filter((row) => row.key.trim() !== "")
      .map((row) => ({
        key: row.key.trim(),
        value: row.value,
      }));

    const seen = new Set();
    for (const row of kept) {
      const normalized = row.key.toLowerCase();
      if (seen.has(normalized)) {
        setError("Field names must be unique.");
        return;
      }
      seen.add(normalized);
    }

    setSaving(true);
    try {
      await createCompany({ company_name: name, fields: kept });
      navigate("/companies", { state: { toast: "Application logged." } });
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to save application.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="company-form-page">
      <form className="company-form" onSubmit={handleSubmit}>
        {error ? (
          <div className="daily-banner" role="alert">
            {error}
          </div>
        ) : null}

        <Card className="company-form-card">
          <label className="form-field">
            <span>Company Name</span>
            <input
              type="text"
              name="company_name"
              required
              placeholder="e.g. Google"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </label>

          <div className="details-section">
            <div className="details-head">
              <h3>Details</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFields((current) => [...current, newFieldRow()])}
              >
                + Add Field
              </Button>
            </div>

            <div className="field-rows">
              {fields.map((row) => (
                <div key={row.id} className="field-row">
                  <input
                    type="text"
                    placeholder="Field name (e.g. Role, Expected CTC, Job Link)"
                    value={row.key}
                    onChange={(event) =>
                      updateField(row.id, { key: event.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={row.value}
                    onChange={(event) =>
                      updateField(row.id, { value: event.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="field-remove"
                    aria-label="Remove field"
                    onClick={() => removeField(row.id)}
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : "Save Application"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/companies")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
