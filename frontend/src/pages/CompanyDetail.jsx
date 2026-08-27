import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { usePageTitle } from "../components/layout/PageTitleContext";
import { deleteCompany, fetchCompany, updateCompany } from "../api/companies";
import {
  cleanFieldsForSave,
  formatAppliedDate,
  newFieldRow,
} from "../lib/companyFields";
import { DetailSkeleton, PageLoadError } from "../components/ui/PageStatus";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setOverrideTitle } = usePageTitle();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftFields, setDraftFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setLoadError(false);
      setEditing(false);
      try {
        const data = await fetchCompany(id);
        if (!cancelled) {
          setCompany(data);
          setDraftName(data.company_name || "");
          setDraftFields(
            (data.fields || []).map((field) => newFieldRow(field))
          );
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  useEffect(() => {
    setOverrideTitle(company?.company_name || null);
    return () => setOverrideTitle(null);
  }, [company, setOverrideTitle]);

  function startEdit() {
    setDraftName(company.company_name || "");
    setDraftFields((company.fields || []).map((field) => newFieldRow(field)));
    if ((company.fields || []).length === 0) {
      setDraftFields([newFieldRow()]);
    }
    setEditing(true);
    setError("");
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
    setDraftName(company.company_name || "");
    setDraftFields((company.fields || []).map((field) => newFieldRow(field)));
  }

  async function saveChanges() {
    setError("");
    const name = draftName.trim();
    if (!name) {
      setError("Company name is required.");
      return;
    }
    const cleaned = cleanFieldsForSave(draftFields);
    if (cleaned.error) {
      setError(cleaned.error);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCompany(id, {
        company_name: name,
        fields: cleaned.fields,
      });
      setCompany(updated);
      setDraftName(updated.company_name || "");
      setDraftFields((updated.fields || []).map((field) => newFieldRow(field)));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmAndDelete() {
    setDeleting(true);
    setError("");
    try {
      await deleteCompany(id);
      navigate("/companies");
    } catch (err) {
      setDeleting(false);
      setConfirmDelete(false);
      setError(err.response?.data?.error || "Failed to delete application.");
    }
  }

  if (loading && !company) {
    return <DetailSkeleton />;
  }

  if (loadError && !company) {
    return (
      <PageLoadError onRetry={() => setReloadToken((value) => value + 1)} />
    );
  }

  if (!company) {
    return (
      <PageLoadError onRetry={() => setReloadToken((value) => value + 1)} />
    );
  }

  return (
    <div className="company-detail-page">
      {error ? (
        <div className="daily-banner" role="alert">
          {error}
        </div>
      ) : null}

      <p className="company-detail-subtitle">
        Applied on {formatAppliedDate(company.log_date)}
      </p>

      <Card className="company-detail-card">
        {editing ? (
          <>
            <label className="form-field">
              <span>Company Name</span>
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </label>
            <div className="details-section">
              <div className="details-head">
                <h3>Details</h3>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setDraftFields((current) => [...current, newFieldRow()])
                  }
                >
                  + Add Field
                </Button>
              </div>
              <div className="field-rows">
                {draftFields.map((row) => (
                  <div key={row.id} className="field-row">
                    <input
                      type="text"
                      placeholder="Field name (e.g. Role, Expected CTC, Job Link)"
                      value={row.key}
                      onChange={(event) =>
                        setDraftFields((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, key: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={row.value}
                      onChange={(event) =>
                        setDraftFields((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, value: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="field-remove"
                      aria-label="Remove field"
                      onClick={() =>
                        setDraftFields((current) =>
                          current.filter((item) => item.id !== row.id)
                        )
                      }
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="kv-list">
            {(company.fields || []).length === 0 ? (
              <p className="daily-status">No details logged.</p>
            ) : (
              (company.fields || []).map((field, index) => (
                <div key={`${field.key}-${index}`} className="kv-row">
                  <div className="kv-key">{field.key}</div>
                  <div className={field.value ? "kv-value" : "kv-value is-empty"}>
                    {field.value ? field.value : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      <div className="form-actions">
        {editing ? (
          <>
            <Button variant="primary" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={startEdit}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </>
        )}
      </div>

      {confirmDelete ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <Card className="modal-card">
            <p>Delete this application? This cannot be undone.</p>
            <div className="form-actions">
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmAndDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
