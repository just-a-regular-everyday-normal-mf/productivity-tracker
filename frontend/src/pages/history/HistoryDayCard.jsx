import { ChevronDown } from "lucide-react";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import {
  interviewFraction,
  jobsAppliedLabel,
  overallPercent,
  percent,
  ratio,
  taskFraction,
} from "../../utils/progress";

function formatHistoryDate(logDate) {
  const date = new Date(`${String(logDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(logDate);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = String(date.getDate());
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

function Readout({ completed, target }) {
  return (
    <div className="history-readout">
      {completed ?? 0} / {target ?? 0}
    </div>
  );
}

function Note({ label, text }) {
  if (!text) return null;
  return (
    <p className="history-note">
      <span>{label}</span> {text}
    </p>
  );
}

export default function HistoryDayCard({ log, expanded, onToggle }) {
  const tasks = log.tasks || {};
  const readiness = overallPercent(tasks);
  const dsa = tasks.dsa || {};
  const java = tasks.interview_java || {};
  const spring = tasks.interview_springboot || {};
  const sys = tasks.interview_systemdesign || {};
  const deep = tasks.system_design_deepdive || {};
  const patterns = tasks.design_patterns || {};
  const videos = tasks.watch_videos || {};
  const workout = tasks.workout || {};
  const jobs = tasks.jobs_applied_counter || {};
  const coding = tasks.coding_practice || {};

  return (
    <Card className={`history-day ${expanded ? "is-open" : ""}`}>
      <button type="button" className="history-day-header" onClick={onToggle}>
        <div className="history-day-date">{formatHistoryDate(log.log_date)}</div>
        <div className="history-day-meter">
          <ProgressBar className="progress-bar-compact" value={readiness} />
          <span className="history-day-percent">{readiness}%</span>
        </div>
        <ChevronDown
          className="history-day-chevron"
          size={18}
          strokeWidth={1.8}
        />
      </button>

      {expanded ? (
        <div className="history-day-body">
          <div className="history-task-grid">
            <div className="history-task">
              <h4>DSA Questions</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("dsa", tasks))} />
              <Readout completed={dsa.completed} target={dsa.target} />
            </div>

            <div className="history-task">
              <h4>Interview Questions</h4>
              <ProgressBar className="progress-bar-mini" value={percent(interviewFraction(tasks))} />
              <div className="history-mini-row">
                <span>Java</span>
                <Readout completed={java.completed} target={java.target} />
                <ProgressBar className="progress-bar-mini" value={percent(ratio(java.completed, java.target))} />
              </div>
              <div className="history-mini-row">
                <span>Spring Boot</span>
                <Readout completed={spring.completed} target={spring.target} />
                <ProgressBar className="progress-bar-mini" value={percent(ratio(spring.completed, spring.target))} />
              </div>
              <div className="history-mini-row">
                <span>System Design</span>
                <Readout completed={sys.completed} target={sys.target} />
                <ProgressBar className="progress-bar-mini" value={percent(ratio(sys.completed, sys.target))} />
              </div>
            </div>

            <div className="history-task">
              <h4>System Design Deep-Dive</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("system_design_deepdive", tasks))} />
              <Readout completed={deep.completed} target={deep.target} />
              <Note label="Platform" text={deep.notes} />
            </div>

            <div className="history-task">
              <h4>Design Patterns</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("design_patterns", tasks))} />
              <Readout completed={patterns.completed} target={patterns.target} />
              <Note label="Patterns" text={patterns.notes} />
            </div>

            <div className="history-task">
              <h4>Watch &amp; Learn</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("watch_videos", tasks))} />
              <Readout completed={videos.completed} target={videos.target} />
              <Note label="Watched" text={videos.notes} />
            </div>

            <div className="history-task">
              <h4>Workout</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("workout", tasks))} />
              <Readout completed={workout.completed_minutes} target={workout.target_min || 30} />
            </div>

            <div className="history-task">
              <h4>Jobs Applied</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("jobs_applied_counter", tasks))} />
              <div className="history-readout">{jobsAppliedLabel(tasks)}</div>
              <p className="history-note">
                Remaining {jobs.remaining ?? 0} of {jobs.start ?? 0}
              </p>
            </div>

            <div className="history-task">
              <h4>Coding Practice</h4>
              <ProgressBar className="progress-bar-mini" value={percent(taskFraction("coding_practice", tasks))} />
              <Readout completed={coding.completed} target={coding.target} />
              <Note label="Worked on" text={coding.notes} />
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
