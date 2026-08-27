import client from "./client";

export async function fetchTodayLog() {
  const { data } = await client.get("/api/daily-log/today");
  return data;
}

export async function patchDailyLog(id, tasks) {
  const { data } = await client.patch(`/api/daily-log/${id}`, { tasks });
  return data;
}

export async function fetchDailyLogHistory() {
  const { data } = await client.get("/api/daily-log/history");
  return data;
}
