import React from 'react';
import {
  isGoalMet,
  calculateTaskAdherence,
  getCurrentTimeFormatted,
} from '../../utils/repetitiveUtils';

/**
 * RepetitiveTaskCard Component
 * Displays an individual recurring routine task and its dynamic interactive execution controls
 * for the currently selected calendar date.
 */
export default function RepetitiveTaskCard({
  task,
  selectedDate,
  onUpdateLog,
  onEdit,
  onDelete,
}) {
  const history = task.history || {};
  const currentEntry = history[selectedDate] || { completed: false, value: 0 };
  const goalMet = isGoalMet(task, currentEntry);

  // Adherence rating calculation over the past 7 days up to selected date
  const adherence = calculateTaskAdherence(task, 7, selectedDate);

  // Color code adherence rating
  const getAdherenceBadgeClass = (percent) => {
    if (percent >= 80) return 'adherence-high';
    if (percent >= 50) return 'adherence-mid';
    return 'adherence-low';
  };

  // --- Handlers for Dynamic Goal Controls ---

  // 1. Time Task Toggle
  const handleToggleTime = () => {
    const nextCompleted = !currentEntry.completed;
    onUpdateLog(task.id, selectedDate, {
      completed: nextCompleted,
      loggedTime: nextCompleted ? getCurrentTimeFormatted() : undefined,
      updatedAt: Date.now(),
    });
  };

  // 2. Duration Task Value Change
  const handleDurationChange = (newMins) => {
    const val = Math.max(0, parseInt(newMins) || 0);
    const target = task.targetDurationMinutes || 1;
    onUpdateLog(task.id, selectedDate, {
      value: val,
      completed: val >= target,
      updatedAt: Date.now(),
    });
  };

  const handleQuickAddDuration = (addedMins) => {
    const currentVal = Number(currentEntry.value) || 0;
    handleDurationChange(currentVal + addedMins);
  };

  // 3. Count Task Value Change
  const handleCountChange = (delta) => {
    const currentVal = Number(currentEntry.value) || 0;
    const nextVal = Math.max(0, currentVal + delta);
    const target = task.targetCount || 1;
    onUpdateLog(task.id, selectedDate, {
      value: nextVal,
      completed: nextVal >= target,
      updatedAt: Date.now(),
    });
  };

  // Progress percentage for Duration & Count tasks
  let progressRatio = 0;
  if (task.targetType === 'duration' && task.targetDurationMinutes > 0) {
    progressRatio = Math.min(1, (Number(currentEntry.value) || 0) / task.targetDurationMinutes);
  } else if (task.targetType === 'count' && task.targetCount > 0) {
    progressRatio = Math.min(1, (Number(currentEntry.value) || 0) / task.targetCount);
  } else if (task.targetType === 'time') {
    progressRatio = currentEntry.completed ? 1 : 0;
  }
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <div className={`repetitive-task-card ${goalMet ? 'goal-completed' : ''}`}>
      {/* Top Meta Header */}
      <div className="rep-card-header">
        <div className="rep-title-group">
          <div className="rep-title-row">
            <h3 className="rep-card-title">{task.title}</h3>
            {goalMet && (
              <span className="goal-met-pill" title="Target goal met for this date">
                ✓ Goal Met
              </span>
            )}
          </div>

          <div className="rep-badges-row">
            <span className="category-badge-compact">{task.category || 'General'}</span>

            {/* Target Type Goal Badge */}
            {task.targetType === 'time' && (
              <span className="target-goal-badge time">
                ⏰ Target: {task.targetTime || '08:00'}
              </span>
            )}
            {task.targetType === 'duration' && (
              <span className="target-goal-badge duration">
                ⏱️ Target: {task.targetDurationMinutes} mins
              </span>
            )}
            {task.targetType === 'count' && (
              <span className="target-goal-badge count">
                🎯 Target: {task.targetCount} {task.targetUnit || 'reps'}
              </span>
            )}

            {/* Adherence Rating */}
            <span
              className={`adherence-badge ${getAdherenceBadgeClass(adherence.percentage)}`}
              title={`${adherence.daysMet} of 7 days completed`}
            >
              {adherence.percentage}% Adherence
            </span>
          </div>
        </div>

        {/* Card Action Menu */}
        <div className="rep-actions-group">
          <button
            type="button"
            className="btn-item-action btn-edit"
            onClick={() => onEdit(task)}
            title="Edit routine configuration"
            aria-label="Edit routine"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="btn-item-action btn-delete"
            onClick={() => onDelete(task.id)}
            title="Delete routine"
            aria-label="Delete routine"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dynamic Interactive Execution Control Area */}
      <div className="rep-execution-control-panel">
        {/* 1. Time Goal Control */}
        {task.targetType === 'time' && (
          <div className="time-execution-row">
            <button
              type="button"
              className={`custom-checkbox rep-time-checkbox ${currentEntry.completed ? 'checked' : ''}`}
              onClick={handleToggleTime}
              title={currentEntry.completed ? 'Mark uncompleted' : 'Check off routine for this day'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>

            <div className="time-status-info">
              <span className="time-status-main">
                {currentEntry.completed ? 'Routine Completed' : 'Pending Check-in'}
              </span>
              {currentEntry.loggedTime && (
                <span className="time-logged-tag">
                  Logged at {currentEntry.loggedTime}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 2. Duration Goal Control */}
        {task.targetType === 'duration' && (
          <div className="duration-execution-panel">
            <div className="duration-control-top">
              <div className="duration-numeric-input-wrap">
                <input
                  type="number"
                  min="0"
                  max="1440"
                  className="duration-current-input"
                  value={currentEntry.value || 0}
                  onChange={(e) => handleDurationChange(e.target.value)}
                />
                <span className="duration-unit-label">
                  / {task.targetDurationMinutes} mins
                </span>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="quick-step-buttons">
                <button
                  type="button"
                  className="btn-quick-step"
                  onClick={() => handleQuickAddDuration(5)}
                >
                  +5m
                </button>
                <button
                  type="button"
                  className="btn-quick-step"
                  onClick={() => handleQuickAddDuration(15)}
                >
                  +15m
                </button>
                <button
                  type="button"
                  className="btn-quick-step"
                  onClick={() => handleQuickAddDuration(30)}
                >
                  +30m
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="rep-progress-track">
              <div
                className="rep-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Count Goal Control */}
        {task.targetType === 'count' && (
          <div className="count-execution-panel">
            <div className="count-control-top">
              {/* Stepper Widget */}
              <div className="counter-stepper-widget">
                <button
                  type="button"
                  className="btn-counter-step"
                  onClick={() => handleCountChange(-1)}
                  disabled={!currentEntry.value || currentEntry.value <= 0}
                  aria-label="Decrease count"
                >
                  −
                </button>
                <div className="counter-current-readout">
                  <span className="counter-val-big">{currentEntry.value || 0}</span>
                  <span className="counter-target-small">
                    of {task.targetCount} {task.targetUnit || 'reps'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-counter-step"
                  onClick={() => handleCountChange(1)}
                  aria-label="Increase count"
                >
                  +
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="rep-progress-track">
              <div
                className="rep-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
