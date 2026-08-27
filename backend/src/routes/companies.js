const express = require("express");
const {
  getSupabase,
  todayIso,
  decrementJobsRemaining,
} = require("../lib/dailyLogStore");

const router = express.Router();

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

router.post("/", async (req, res) => {
  try {
    const companyName = String((req.body && req.body.company_name) || "").trim();
    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    let fields;
    try {
      fields = normalizeFields(req.body && req.body.fields);
    } catch (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    const logDate = String((req.body && req.body.log_date) || "").trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(logDate) ? logDate : todayIso();

    const supabase = getSupabase();
    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        company_name: companyName,
        log_date: date,
        fields,
      })
      .select()
      .single();
    if (error) throw error;

    await decrementJobsRemaining(supabase);
    return res.status(201).json(company);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to save application" });
  }
});

module.exports = router;
