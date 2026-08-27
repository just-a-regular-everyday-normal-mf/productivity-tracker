function normalizeFields(fields) {
  if (!Array.isArray(fields)) return [];
  const cleaned = [];
  const seen = new Set();

  for (const item of fields) {
    if (!item || typeof item !== "object") continue;
    const key = String(item.key || "").trim();
    if (!key) continue;
    const normalized = key.toLowerCase();
    if (seen.has(normalized)) {
      const error = new Error("Field names must be unique");
      error.status = 400;
      throw error;
    }
    seen.add(normalized);
    cleaned.push({
      key,
      value: item.value == null ? "" : String(item.value),
    });
  }

  return cleaned;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function distinctKeysOldestFirst(companies) {
  const oldestFirst = [...companies].sort((a, b) => {
    const aTime = new Date(a.created_at || a.log_date || 0).getTime();
    const bTime = new Date(b.created_at || b.log_date || 0).getTime();
    return aTime - bTime;
  });

  const keys = [];
  const seen = new Set();
  for (const company of oldestFirst) {
    for (const field of company.fields || []) {
      const key = String(field.key || "").trim();
      if (!key) continue;
      const token = key.toLowerCase();
      if (seen.has(token)) continue;
      seen.add(token);
      keys.push(key);
    }
  }
  return keys;
}

function fieldValueForKey(company, headerKey) {
  const fields = company.fields || [];
  const match = fields.find(
    (field) => String(field.key || "").trim().toLowerCase() === headerKey.toLowerCase()
  );
  return match && match.value != null ? String(match.value) : "";
}

function buildCompaniesCsv(companies) {
  const keys = distinctKeysOldestFirst(companies);
  const newestFirst = [...companies].sort((a, b) => {
    const aTime = new Date(a.created_at || a.log_date || 0).getTime();
    const bTime = new Date(b.created_at || b.log_date || 0).getTime();
    return bTime - aTime;
  });

  const header = ["Company Name", "Date Applied", ...keys].map(csvEscape).join(",");
  const rows = newestFirst.map((company) => {
    const cells = [
      company.company_name || "",
      company.log_date || "",
      ...keys.map((key) => fieldValueForKey(company, key)),
    ];
    return cells.map(csvEscape).join(",");
  });
  return [header, ...rows].join("\n");
}

module.exports = {
  normalizeFields,
  buildCompaniesCsv,
  distinctKeysOldestFirst,
};
