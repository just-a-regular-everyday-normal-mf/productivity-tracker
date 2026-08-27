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

function nowIso() {
  return new Date().toISOString();
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

async function ensureTodayLog(supabase) {
  const today = todayIso();
  let row = await getTodayRow(supabase, today);
  if (!row) {
    row = await createTodayRow(supabase, today);
  }
  return row;
}

async function decrementJobsRemaining(supabase) {
  const row = await ensureTodayLog(supabase);
  const tasks = { ...(row.tasks || {}) };
  const counter = { ...(tasks.jobs_applied_counter || { start: 30, remaining: 30 }) };
  const remaining = Number(counter.remaining) || 0;
  if (remaining > 0) {
    counter.remaining = remaining - 1;
    tasks.jobs_applied_counter = counter;
    const { error } = await supabase
      .from("daily_logs")
      .update({ tasks, updated_at: nowIso() })
      .eq("id", row.id);
    if (error) throw error;
  }
  return row;
}

module.exports = {
  DEFAULT_TASKS,
  getSupabase,
  todayIso,
  nowIso,
  getTodayRow,
  createTodayRow,
  ensureTodayLog,
  decrementJobsRemaining,
};
