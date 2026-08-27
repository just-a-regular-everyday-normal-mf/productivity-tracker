import client from "./client";

const MOCK_KEY = "daily_log_today_mock";

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDefaultDailyLog() {
  return {
    log_date: todayIso(),
    is_finalized: false,
    tasks: {
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
    },
  };
}

function readMock() {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return createDefaultDailyLog();
    const parsed = JSON.parse(raw);
    if (parsed.log_date !== todayIso()) {
      return createDefaultDailyLog();
    }
    return {
      ...createDefaultDailyLog(),
      ...parsed,
      tasks: { ...createDefaultDailyLog().tasks, ...parsed.tasks },
    };
  } catch {
    return createDefaultDailyLog();
  }
}

function writeMock(log) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(log));
}

export async function fetchTodayLog() {
  try {
    const { data } = await client.get("/api/daily-log/today");
    return data;
  } catch {
    return readMock();
  }
}

export async function patchTodayLog(log) {
  writeMock(log);
  try {
    await client.patch("/api/daily-log/today", {
      log_date: log.log_date,
      is_finalized: log.is_finalized,
      tasks: log.tasks,
    });
  } catch {
    // Stub until the backend is wired in a later prompt.
  }
}
