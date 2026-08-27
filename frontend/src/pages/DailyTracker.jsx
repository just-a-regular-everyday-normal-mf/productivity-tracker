import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { fetchTodayLog, fetchDailyLogHistory, patchDailyLog } from "../api/dailyLog";
import {
  interviewFraction,
  isTaskComplete,
  overallPercent,
  percent,
  ratio,
  taskFraction,
} from "../utils/progress";
import { joinTags, parseTags } from "./daily/progress";
import ReadinessGauge from "./daily/ReadinessGauge";
import Stepper from "./daily/Stepper";
import ToggleSwitch from "./daily/ToggleSwitch";
import TagInput from "./daily/TagInput";

function Field({ label, children }) {
  return (
    <label className="task-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function DailyTracker() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [finalizedNotice, setFinalizedNotice] = useState("");
  const logRef = useRef(null);
  const serverLogRef = useRef(null);
  const saveTimers = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [data] = await Promise.all([
          fetchTodayLog(),
          fetchDailyLogHistory().catch(() => []),
        ]);
        if (!cancelled) {
          setLog(data);
          logRef.current = data;
          serverLogRef.current = data;
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load today's log.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      Object.values(saveTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  async function persistTask(key) {
    const current = logRef.current;
    if (!current?.id) return;
    const snapshot = serverLogRef.current;
    try {
      const updated = await patchDailyLog(current.id, {
        [key]: current.tasks[key],
      });
      const next = {
        ...updated,
        jobs_applied_today_count:
          updated.jobs_applied_today_count ?? current.jobs_applied_today_count,
      };
      serverLogRef.current = next;
      logRef.current = next;
      setLog(next);
    } catch (error) {
      if (error.response?.status === 403) {
        setFinalizedNotice(
          "This day has been finalized — changes were not saved."
        );
        const reverted = snapshot
          ? { ...snapshot, is_finalized: true }
          : current;
        serverLogRef.current = reverted;
        logRef.current = reverted;
        setLog(reverted);
      }
    }
  }

  function scheduleSave(key, immediate) {
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
    const fire = () => persistTask(key);
    if (immediate) fire();
    else saveTimers.current[key] = setTimeout(fire, 500);
  }

  function patchTask(key, patch, immediate) {
    setLog((prev) => {
      const next = {
        ...prev,
        tasks: {
          ...prev.tasks,
          [key]: { ...prev.tasks[key], ...patch },
        },
      };
      logRef.current = next;
      return next;
    });
    scheduleSave(key, immediate);
  }

  function changeCount(key, completed, immediate = true) {
    patchTask(key, { completed: Math.max(0, completed) }, immediate);
  }

  function changeTarget(key, target, immediate = false) {
    setLog((prev) => {
      const current = prev.tasks[key];
      const nextTarget = Math.max(1, target);
      const next = {
        ...prev,
        tasks: {
          ...prev.tasks,
          [key]: {
            ...current,
            target: nextTarget,
            completed: Math.min(current.completed, nextTarget),
          },
        },
      };
      logRef.current = next;
      return next;
    });
    scheduleSave(key, immediate);
  }

  async function refresh() {
    Object.values(saveTimers.current).forEach((timer) => clearTimeout(timer));
    setLoading(true);
    try {
      const data = await fetchTodayLog();
      setLog(data);
      logRef.current = data;
      serverLogRef.current = data;
      setFinalizedNotice("");
    } catch {
      setLoadError("Could not load today's log.");
    } finally {
      setLoading(false);
    }
  }

  if (!log) {
    return (
      <p className="daily-status">
        {loadError || "Loading today's log…"}
      </p>
    );
  }

  const { tasks, is_finalized: finalized } = log;
  const locked = Boolean(finalized);
  const readiness = overallPercent(tasks);
  const workoutDone = isTaskComplete("workout", tasks);

  return (
    <div className={["daily-page", locked ? "is-locked" : ""].join(" ")}>
      {finalizedNotice ? (
        <div className="daily-banner" role="status">
          {finalizedNotice}
        </div>
      ) : locked ? (
        <div className="daily-banner" role="status">
          This day is finalized and can no longer be edited.
        </div>
      ) : null}

      <ReadinessGauge percent={readiness} tasks={tasks} />

      <div className="task-grid">
        <Card className="task-card">
          <header className="task-card-head">
            <h3>DSA Questions</h3>
            <p>5–10 based on complexity</p>
          </header>
          <ProgressBar value={percent(taskFraction("dsa", tasks))} />
          <Stepper
            completed={tasks.dsa.completed}
            target={tasks.dsa.target}
            targetMin={5}
            targetMax={10}
            disabled={locked}
            onCompletedChange={(value) => changeCount("dsa", value, true)}
            onTargetChange={(value) => changeTarget("dsa", value, false)}
          />
          <Button
            variant="ghost"
            className="mark-done"
            disabled={locked}
            onClick={() => changeCount("dsa", tasks.dsa.target, true)}
          >
            Mark Done
          </Button>
        </Card>

        <Card className="task-card">
          <header className="task-card-head">
            <h3>Interview Questions</h3>
            <p>Java · Spring Boot · System Design</p>
          </header>
          <ProgressBar value={percent(interviewFraction(tasks))} />
          {[
            ["interview_java", "Java"],
            ["interview_springboot", "Spring Boot"],
            ["interview_systemdesign", "System Design"],
          ].map(([key, label]) => (
            <div key={key} className="mini-row">
              <p className="mini-row-label">
                {label} (target {tasks[key].target})
              </p>
              <Stepper
                completed={tasks[key].completed}
                target={tasks[key].target}
                disabled={locked}
                onCompletedChange={(value) => changeCount(key, value, true)}
                onTargetChange={(value) => changeTarget(key, value, false)}
              />
              <ProgressBar
                className="progress-bar-mini"
                value={percent(ratio(tasks[key].completed, tasks[key].target))}
              />
            </div>
          ))}
        </Card>

        <Card className="task-card">
          <header className="task-card-head">
            <h3>System Design Deep-Dive</h3>
            <p>1 well-known platform, end to end</p>
          </header>
          <ProgressBar value={percent(taskFraction("system_design_deepdive", tasks))} />
          <ToggleSwitch
            label="Completed today"
            disabled={locked}
            checked={tasks.system_design_deepdive.completed >= tasks.system_design_deepdive.target}
            onChange={(on) =>
              changeCount(
                "system_design_deepdive",
                on ? tasks.system_design_deepdive.target : 0,
                true
              )
            }
          />
          <Field label="Which platform?">
            <input
              type="text"
              disabled={locked}
              placeholder="e.g. Design a URL shortener like Bitly"
              value={tasks.system_design_deepdive.notes}
              onChange={(event) =>
                patchTask("system_design_deepdive", { notes: event.target.value }, false)
              }
            />
          </Field>
        </Card>

        <Card className="task-card">
          <header className="task-card-head">
            <h3>Design Patterns</h3>
            <p>2 patterns, in depth</p>
          </header>
          <ProgressBar value={percent(taskFraction("design_patterns", tasks))} />
          <Stepper
            completed={tasks.design_patterns.completed}
            target={tasks.design_patterns.target}
            disabled={locked}
            onCompletedChange={(value) => changeCount("design_patterns", value, true)}
            onTargetChange={(value) => changeTarget("design_patterns", value, false)}
          />
          <Field label="Patterns">
            <TagInput
              disabled={locked}
              placeholder="Type a pattern and press Enter"
              tags={parseTags(tasks.design_patterns.notes)}
              onChange={(tags) =>
                patchTask("design_patterns", { notes: joinTags(tags) }, true)
              }
            />
          </Field>
        </Card>

        <Card className="task-card">
          <header className="task-card-head">
            <h3>Watch &amp; Learn</h3>
            <p>Interview or system design videos</p>
          </header>
          <ProgressBar value={percent(taskFraction("watch_videos", tasks))} />
          <ToggleSwitch
            label="Watched something today"
            disabled={locked}
            checked={tasks.watch_videos.completed >= tasks.watch_videos.target}
            onChange={(on) =>
              changeCount("watch_videos", on ? tasks.watch_videos.target : 0, true)
            }
          />
          <Field label="What did you watch?">
            <input
              type="text"
              disabled={locked}
              value={tasks.watch_videos.notes}
              onChange={(event) =>
                patchTask("watch_videos", { notes: event.target.value }, false)
              }
            />
          </Field>
        </Card>

        <Card className={`task-card ${workoutDone ? "is-complete" : ""}`}>
          <header className="task-card-head">
            <h3>Workout</h3>
            <p>30–45 minutes</p>
          </header>
          <ProgressBar value={percent(taskFraction("workout", tasks))} />
          <Field label="Minutes done">
            <input
              className="minutes-input"
              type="number"
              min="0"
              max="180"
              disabled={locked}
              value={tasks.workout.completed_minutes}
              onChange={(event) =>
                patchTask(
                  "workout",
                  { completed_minutes: Math.max(0, Number(event.target.value) || 0) },
                  false
                )
              }
            />
          </Field>
        </Card>

        <Card className="task-card">
          <header className="task-card-head">
            <h3>Jobs Applied Today</h3>
            <p>Starts at 30, ticks down as you log companies</p>
          </header>
          <ProgressBar value={percent(taskFraction("jobs_applied_counter", tasks))} />
          <div className="jobs-countdown">
            {tasks.jobs_applied_counter.remaining} / {tasks.jobs_applied_counter.start}
          </div>
          <p className="jobs-note">
            Log applications from the Companies page — this updates automatically.
          </p>
          <Button variant="secondary" className="jobs-link" onClick={() => navigate("/companies")}>
            Go to Companies →
          </Button>
        </Card>

        <Card className="task-card">
          <header className="task-card-head">
            <h3>Coding Practice</h3>
            <p>Project building or DSA grind</p>
          </header>
          <ProgressBar value={percent(taskFraction("coding_practice", tasks))} />
          <ToggleSwitch
            label="Did I code today?"
            disabled={locked}
            checked={tasks.coding_practice.completed >= tasks.coding_practice.target}
            onChange={(on) =>
              changeCount(
                "coding_practice",
                on ? tasks.coding_practice.target : 0,
                true
              )
            }
          />
          <Field label="What did you work on?">
            <input
              type="text"
              disabled={locked}
              value={tasks.coding_practice.notes}
              onChange={(event) =>
                patchTask("coding_practice", { notes: event.target.value }, false)
              }
            />
          </Field>
        </Card>
      </div>

      <div className="daily-footer">
        <p>Day locks automatically at midnight — today's entries are editable until then.</p>
        <Button variant="ghost" onClick={refresh} disabled={loading}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
