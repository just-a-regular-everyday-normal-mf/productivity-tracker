export const TASK_IDS = [
  "dsa",
  "interview",
  "system_design_deepdive",
  "design_patterns",
  "watch_videos",
  "workout",
  "jobs_applied_counter",
  "coding_practice",
];

function pick(tasks, key) {
  return (tasks && tasks[key]) || {};
}

export function ratio(completed, target) {
  const done = Number(completed) || 0;
  const goal = Number(target) || 0;
  if (goal <= 0) return done > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, done / goal));
}

export function interviewFraction(tasks) {
  const rows = [
    pick(tasks, "interview_java"),
    pick(tasks, "interview_springboot"),
    pick(tasks, "interview_systemdesign"),
  ];
  return (
    rows.reduce((sum, row) => sum + ratio(row.completed, row.target), 0) /
    rows.length
  );
}

export function taskFraction(id, tasks) {
  switch (id) {
    case "dsa":
      return ratio(pick(tasks, "dsa").completed, pick(tasks, "dsa").target);
    case "interview":
      return interviewFraction(tasks);
    case "system_design_deepdive":
      return ratio(
        pick(tasks, "system_design_deepdive").completed,
        pick(tasks, "system_design_deepdive").target
      );
    case "design_patterns":
      return ratio(
        pick(tasks, "design_patterns").completed,
        pick(tasks, "design_patterns").target
      );
    case "watch_videos":
      return ratio(
        pick(tasks, "watch_videos").completed,
        pick(tasks, "watch_videos").target
      );
    case "workout": {
      const workout = pick(tasks, "workout");
      const min = workout.target_min || 30;
      return Math.min(1, Math.max(0, (workout.completed_minutes || 0) / min));
    }
    case "jobs_applied_counter": {
      const counter = pick(tasks, "jobs_applied_counter");
      const remaining = Number(counter.remaining);
      const start = Number(counter.start);
      if (remaining <= 0) return 1;
      if (!start) return 0;
      return Math.min(1, Math.max(0, (start - remaining) / start));
    }
    case "coding_practice":
      return ratio(
        pick(tasks, "coding_practice").completed,
        pick(tasks, "coding_practice").target
      );
    default:
      return 0;
  }
}

export function taskPercents(tasks) {
  return TASK_IDS.map((id) => Math.round(taskFraction(id, tasks) * 100));
}

export function overallPercent(tasks) {
  const total = TASK_IDS.reduce((sum, id) => sum + taskFraction(id, tasks), 0);
  return Math.round((total / TASK_IDS.length) * 100);
}

export function isTaskComplete(id, tasks) {
  return taskFraction(id, tasks) >= 1;
}

export function percent(fraction) {
  return Math.round(fraction * 100);
}

export function jobsAppliedLabel(tasks) {
  const counter = pick(tasks, "jobs_applied_counter");
  const start = Number(counter.start) || 0;
  const remaining = Number(counter.remaining) || 0;
  const applied = Math.max(0, start - remaining);
  return `${applied} / ${start} applied`;
}
