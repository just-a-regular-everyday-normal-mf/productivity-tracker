export function formatAppliedDate(logDate) {
  if (!logDate) return "";
  const date = new Date(`${String(logDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(logDate);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function newFieldRow(field = {}) {
  return {
    id: crypto.randomUUID(),
    key: field.key || "",
    value: field.value || "",
  };
}

export function cleanFieldsForSave(fields) {
  const populated = fields.filter(
    (row) => row.key.trim() !== "" || row.value.trim() !== ""
  );
  const missingKey = populated.find(
    (row) => row.key.trim() === "" && row.value.trim() !== ""
  );
  if (missingKey) {
    return { error: "Field names cannot be empty when a value is set." };
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
      return { error: "Field names must be unique." };
    }
    seen.add(normalized);
  }

  return { fields: kept };
}

export function fieldCountLabel(count) {
  return `${count} ${count === 1 ? "field" : "fields"}`;
}
