export {
  TASK_IDS,
  interviewFraction,
  isTaskComplete,
  overallPercent,
  percent,
  ratio,
  taskFraction,
  taskPercents,
} from "../../utils/progress";

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
