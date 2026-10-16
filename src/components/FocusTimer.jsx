import React, { useState, useEffect, useRef } from 'react';
import { SESSIONS_STORAGE_KEY } from '../utils/analyticsUtils';

const MODES = {
  pomodoro: { label: 'Pomodoro', duration: 25 * 60, type: 'pomodoro' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, type: 'break' },
  longBreak: { label: 'Long Break', duration: 15 * 60, type: 'break' },
  stopwatch: { label: 'Stopwatch', duration: 0, type: 'stopwatch' },
};

/**
 * FocusTimer Component
 * Built-in Pomodoro & Stopwatch with zero-latency local tick state and
 * debounced storage persistence (saves only on pause, completion, or unmount).
 */
export default function FocusTimer({
  task,
  onUpdateTask,
  onSaveSession,
  onClose,
  onShowToast,
}) {
  const [mode, setMode] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(MODES.pomodoro.duration);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // References for tracking time accurately without drifting
  const sessionStartRef = useRef(null);
  const intervalRef = useRef(null);
  const accumulatedSecondsRef = useRef(0);

  // Keep latest prop references to prevent unnecessary timer restarts
  const taskRef = useRef(task);
  const onUpdateTaskRef = useRef(onUpdateTask);
  const onSaveSessionRef = useRef(onSaveSession);
  const onShowToastRef = useRef(onShowToast);
  const modeRef = useRef(mode);

  useEffect(() => {
    taskRef.current = task;
    onUpdateTaskRef.current = onUpdateTask;
    onSaveSessionRef.current = onSaveSession;
    onShowToastRef.current = onShowToast;
    modeRef.current = mode;
  });

  const initialDuration = MODES[mode].duration;
  const isStopwatch = mode === 'stopwatch';

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Persist session to LocalStorage and update task focus time
  const persistSession = useCallback((isCompleted = false) => {
    const currentElapsed = accumulatedSecondsRef.current;
    if (currentElapsed <= 0) return;

    const currentTask = taskRef.current;
    const currentMode = modeRef.current;
    const now = Date.now();

    const sessionEntry = {
      id: `sess_${now}_${Math.random().toString(36).slice(2, 7)}`,
      taskId: currentTask?.id || 'unassigned',
      taskTitle: currentTask?.title || 'General Focus Session',
      category: currentTask?.category || 'General',
      startTime: sessionStartRef.current || (now - currentElapsed * 1000),
      endTime: now,
      durationSeconds: currentElapsed,
      type: currentMode === 'stopwatch' ? 'stopwatch' : 'pomodoro',
      completedCycle: isCompleted || (currentMode === 'pomodoro' && currentElapsed >= 25 * 60),
    };

    // 1. Storage Emergency Rule: Atomic save to LocalStorage only on completion/pause
    try {
      const existing = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
      existing.unshift(sessionEntry);
      // Keep up to 200 sessions to avoid unbounded storage
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(existing.slice(0, 200)));
    } catch (e) {
      console.error('Failed to save focus session', e);
    }

    // 2. Update parent state
    if (currentTask && onUpdateTaskRef.current) {
      onUpdateTaskRef.current(currentTask.id, {
        totalFocusSeconds: (currentTask.totalFocusSeconds || 0) + currentElapsed,
        pomodoroCount: (currentTask.pomodoroCount || 0) + (isCompleted && currentMode === 'pomodoro' ? 1 : 0),
        lastWorkedAt: now,
        status: 'in_progress',
      });
    }

    onSaveSessionRef.current?.(sessionEntry);
    accumulatedSecondsRef.current = 0;
  }, []);

  // Switch timer mode
  const handleSwitchMode = (newMode) => {
    if (isRunning) {
      persistSession(false);
    }
    setMode(newMode);
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedSecondsRef.current = 0;
    setSecondsRemaining(MODES[newMode].duration);
    sessionStartRef.current = null;
  };

  // Main Timer Tick Effect
  useEffect(() => {
    if (isRunning) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          accumulatedSecondsRef.current += 1;
          return next;
        });

        if (!isStopwatch) {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              setIsRunning(false);
              persistSession(true);
              onShowToastRef.current?.({
                message: mode === 'pomodoro' ? '🍅 Pomodoro completed! Take a break.' : 'Break finished!',
                type: 'success',
              });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isStopwatch, mode, persistSession]);

  // Clean unmount persistence
  useEffect(() => {
    return () => {
      if (accumulatedSecondsRef.current > 0) {
        persistSession(false);
      }
    };
  }, [persistSession]);

  // Toggle start / pause
  const toggleRunning = () => {
    if (isRunning) {
      // Pausing: persist accrued time
      persistSession(false);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  // Reset timer
  const handleReset = () => {
    if (accumulatedSecondsRef.current > 0) {
      persistSession(false);
    }
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedSecondsRef.current = 0;
    setSecondsRemaining(initialDuration);
    sessionStartRef.current = null;
  };

  // SVG Progress Ring Geometry
  const radius = 86;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  let progressRatio = 0;
  if (!isStopwatch && initialDuration > 0) {
    progressRatio = Math.min(1, Math.max(0, (initialDuration - secondsRemaining) / initialDuration));
  } else if (isStopwatch) {
    // Loop ring every 60 seconds
    progressRatio = (elapsedSeconds % 60) / 60;
  }
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="focus-timer-card">
      {/* Header with Mode Toggles */}
      <div className="timer-header">
        <div className="timer-task-info">
          <span className="timer-target-tag">
            {task ? `Focus: ${task.title}` : 'General Focus Timer'}
          </span>
          {task?.category && (
            <span className="category-pill-compact">{task.category}</span>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            className="btn-timer-close"
            onClick={() => {
              if (accumulatedSecondsRef.current > 0) persistSession(false);
              onClose();
            }}
            title="Minimize Timer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mode Selector Buttons */}
      <div className="timer-mode-pills">
        {Object.entries(MODES).map(([key, info]) => (
          <button
            key={key}
            type="button"
            className={`mode-pill-btn ${mode === key ? 'active' : ''}`}
            onClick={() => handleSwitchMode(key)}
          >
            {info.label}
          </button>
        ))}
      </div>

      {/* Circular Progress Ring with Digital Readout */}
      <div className="timer-display-wrap">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="timer-progress-svg"
        >
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="var(--track-bg)"
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={mode === 'pomodoro' ? 'var(--primary)' : '#06b6d4'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>

        <div className="timer-time-overlay">
          <div className="timer-digits">
            {isStopwatch ? formatTime(elapsedSeconds) : formatTime(secondsRemaining)}
          </div>
          <span className="timer-status-text">
            {isRunning ? 'FOCUSING' : elapsedSeconds > 0 ? 'PAUSED' : 'READY'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls-row">
        <button
          type="button"
          className={`btn-timer-main ${isRunning ? 'pause' : 'start'}`}
          onClick={toggleRunning}
        >
          {isRunning ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
              <span>Pause</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>{elapsedSeconds > 0 ? 'Resume' : 'Start Focus'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-timer-secondary"
          onClick={handleReset}
          title="Reset Timer"
          disabled={!isRunning && elapsedSeconds === 0 && secondsRemaining === initialDuration}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
