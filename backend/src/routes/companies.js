const express = require("express");
const {
  getSupabase,
  todayIso,
  nowIso,
  decrementJobsRemaining,
} = require("../lib/dailyLogStore");
const { normalizeFields, buildCompaniesCsv } = require("../lib/companyFields");

const router = express.Router();

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

router.get("/", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load companies" });
  }
});

router.get("/export", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    const csv = buildCompaniesCsv(data || []);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to export companies" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load company" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: existing, error: lookupError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!existing) {
      return res.status(404).json({ error: "Company not found" });
    }

    const updates = { updated_at: nowIso() };
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, "company_name")) {
      const companyName = String(req.body.company_name || "").trim();
      if (!companyName) {
        return res.status(400).json({ error: "Company name is required" });
      }
      updates.company_name = companyName;
    }
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, "fields")) {
      try {
        updates.fields = normalizeFields(req.body.fields);
      } catch (error) {
        return res.status(error.status || 400).json({ error: error.message });
      }
    }

    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update company" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("companies")
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Company not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to delete company" });
  }
});

module.exports = router;
