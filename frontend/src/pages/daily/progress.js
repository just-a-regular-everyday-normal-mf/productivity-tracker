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

export function ratio(completed, target) {
  const done = Number(completed) || 0;
  const goal = Number(target) || 0;
  if (goal <= 0) return done > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, done / goal));
}

export function interviewFraction(tasks) {
  const rows = [
    tasks.interview_java,
    tasks.interview_springboot,
    tasks.interview_systemdesign,
  ];
  return (
    rows.reduce((sum, row) => sum + ratio(row.completed, row.target), 0) /
    rows.length
  );
}

export function taskFraction(id, tasks) {
  switch (id) {
    case "dsa":
      return ratio(tasks.dsa.completed, tasks.dsa.target);
    case "interview":
      return interviewFraction(tasks);
    case "system_design_deepdive":
      return ratio(
        tasks.system_design_deepdive.completed,
        tasks.system_design_deepdive.target
      );
    case "design_patterns":
      return ratio(tasks.design_patterns.completed, tasks.design_patterns.target);
    case "watch_videos":
      return ratio(tasks.watch_videos.completed, tasks.watch_videos.target);
    case "workout": {
      const min = tasks.workout.target_min || 30;
      return Math.min(1, Math.max(0, (tasks.workout.completed_minutes || 0) / min));
    }
    case "jobs_applied_counter": {
      const { start, remaining } = tasks.jobs_applied_counter;
      if (remaining <= 0) return 1;
      if (!start) return 0;
      return Math.min(1, Math.max(0, (start - remaining) / start));
    }
    case "coding_practice":
      return ratio(tasks.coding_practice.completed, tasks.coding_practice.target);
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

export function parseTags(notes) {
  if (!notes) return [];
  return notes
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinTags(tags) {
  return tags.join(", ");
}
