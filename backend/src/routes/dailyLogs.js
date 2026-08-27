const express = require("express");

const router = express.Router();

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured");
  }
  return require("../supabaseClient");
}

const DEFAULT_TASKS = {
  dsa: { target: 5, completed: 0 },
  interview_java: { target: 20, completed: 0 },
  interview_springboot: { target: 10, completed: 0 },
  interview_systemdesign: { target: 5, completed: 0 },
  system_design_deepdive: { target: 1, completed: 0, notes: "" },
  design_patterns: { target: 2, completed: 0, notes: "" },
  watch_videos: { target: 1, completed: 0, notes: "" },
  workout: { target_min: 30, target_max: 45, completed_minutes: 0 },
  jobs_applied_counter: { start: 30, remaining: 30 },
  coding_practice: { target: 1, completed: 0, notes: "" },
};

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function logDateIso(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function isPastDate(logDate, today) {
  return logDateIso(logDate) < today;
}

function nowIso() {
  return new Date().toISOString();
}

function mergeTasks(existing, incoming) {
  const base = { ...existing };
  if (!incoming || typeof incoming !== "object") return base;
  for (const [key, value] of Object.entries(incoming)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      base[key] = { ...base[key], ...value };
    } else {
      base[key] = value;
    }
  }
  return base;
}

function jobsAppliedTodayCount(tasks) {
  const counter = (tasks && tasks.jobs_applied_counter) || {};
  const start = Number(counter.start) || 0;
  const remaining = Number(counter.remaining) || 0;
  return start - remaining;
}

function withTodayFields(row) {
  return {
    ...row,
    jobs_applied_today_count: jobsAppliedTodayCount(row.tasks),
  };
}

async function finalizePastLogs(supabase, today) {
  const { error } = await supabase
    .from("daily_logs")
    .update({ is_finalized: true, updated_at: nowIso() })
    .lt("log_date", today)
    .eq("is_finalized", false);
  if (error) throw error;
}

async function finalizeRowIfPast(supabase, row, today) {
  if (!row) return row;
  if (isPastDate(row.log_date, today) && !row.is_finalized) {
    const { data, error } = await supabase
      .from("daily_logs")
      .update({ is_finalized: true, updated_at: nowIso() })
      .eq("id", row.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return row;
}

async function getTodayRow(supabase, today) {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("log_date", today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createTodayRow(supabase, today) {
  const payload = {
    log_date: today,
    is_finalized: false,
    tasks: DEFAULT_TASKS,
    updated_at: nowIso(),
  };
  const { data, error } = await supabase
    .from("daily_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    const existing = await getTodayRow(supabase, today);
    if (existing) return existing;
    throw error;
  }
  return data;
}

router.get("/today", async (req, res) => {
  try {
    const supabase = getSupabase();
    const today = todayIso();
    await finalizePastLogs(supabase, today);

    let row = await getTodayRow(supabase, today);
    if (!row) {
      row = await createTodayRow(supabase, today);
    }
    row = await finalizeRowIfPast(supabase, row, today);
    return res.json(withTodayFields(row));
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load today's log" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const supabase = getSupabase();
    const today = todayIso();
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("is_finalized", true)
      .lt("log_date", today)
      .order("log_date", { ascending: false })
      .limit(60);
    if (error) throw error;
    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load history" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const today = todayIso();
    const { id } = req.params;
    const incomingTasks = (req.body && req.body.tasks) || {};

    const { data: row, error: lookupError } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!row) {
      return res.status(404).json({ error: "Daily log not found" });
    }

    const past = isPastDate(row.log_date, today);
    if (past && !row.is_finalized) {
      await supabase
        .from("daily_logs")
        .update({ is_finalized: true, updated_at: nowIso() })
        .eq("id", id);
    }

    if (row.is_finalized || past) {
      return res.status(403).json({
        error: "This day is finalized and cannot be edited.",
      });
    }

    const mergedTasks = mergeTasks(row.tasks || {}, incomingTasks);
    const { data: updated, error: updateError } = await supabase
      .from("daily_logs")
      .update({
        tasks: mergedTasks,
        updated_at: nowIso(),
      })
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw updateError;
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update daily log" });
  }
});

module.exports = router;
