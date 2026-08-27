import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import { fetchTodayLog, patchTodayLog } from "../api/dailyLog";
import {
  interviewFraction,
  isTaskComplete,
  joinTags,
  overallPercent,
  parseTags,
  ratio,
  taskFraction,
} from "./daily/progress";
import ReadinessGauge from "./daily/ReadinessGauge";
import Stepper from "./daily/Stepper";
import ToggleSwitch from "./daily/ToggleSwitch";
import TagInput from "./daily/TagInput";

function percent(fraction) {
  return Math.round(fraction * 100);
}

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
  const logRef = useRef(null);
  const saveTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchTodayLog();
      if (!cancelled) {
        setLog(data);
        logRef.current = data;
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        if (logRef.current) patchTodayLog(logRef.current);
      }
    };
  }, []);

  function scheduleSave(next, immediate) {
    logRef.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const fire = () => patchTodayLog(logRef.current);
    if (immediate) fire();
    else saveTimer.current = setTimeout(fire, 500);
  }

  function setTasks(mutator, immediate) {
    setLog((prev) => {
      const next = {
        ...prev,
        tasks: mutator({ ...prev.tasks }),
      };
      scheduleSave(next, immediate);
      return next;
    });
  }

  function patchTask(key, patch, immediate) {
    setTasks((tasks) => ({
      ...tasks,
      [key]: { ...tasks[key], ...patch },
    }), immediate);
  }

  function changeCount(key, completed, immediate = true) {
    patchTask(key, { completed: Math.max(0, completed) }, immediate);
  }

  function changeTarget(key, target, immediate = false) {
    setTasks((tasks) => {
      const current = tasks[key];
      const nextTarget = Math.max(1, target);
      return {
        ...tasks,
        [key]: {
          ...current,
          target: nextTarget,
          completed: Math.min(current.completed, nextTarget),
        },
      };
    }, immediate);
  }

  async function refresh() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      if (logRef.current) await patchTodayLog(logRef.current);
    }
    setLoading(true);
    const data = await fetchTodayLog();
    setLog(data);
    logRef.current = data;
    setLoading(false);
  }

  if (!log) {
    return <p className="daily-status">Loading today's log…</p>;
  }

  const { tasks, is_finalized: finalized } = log;
  const locked = Boolean(finalized);
  const readiness = overallPercent(tasks);
  const workoutDone = isTaskComplete("workout", tasks);

  return (
    <div className={["daily-page", locked ? "is-locked" : ""].join(" ")}>
      {locked ? (
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
