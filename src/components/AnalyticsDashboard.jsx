import React, { useState } from 'react';
import { useTaskAnalytics } from '../hooks/useTaskAnalytics';
import VelocityLineChart from './analytics/VelocityLineChart';
import PeakHoursBarChart from './analytics/PeakHoursBarChart';
import CategoryDonutChart from './analytics/CategoryDonutChart';
import FocusTimer from './FocusTimer';
import { formatDuration } from '../utils/analyticsUtils';

/**
 * AnalyticsDashboard Component
 * Container view integrating KPI cards, time range filter pills,
 * and the three responsive custom SVG chart widgets.
 */
export default function AnalyticsDashboard({
  tasks = [],
  sessions = [],
  onUpdateTask,
  onSaveSession,
  onBackToTasks,
  onShowToast,
}) {
  const [timeRange, setTimeRange] = useState('7days');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState(null);

  const {
    peakHours,
    velocityData,
    categoryBreakdown,
    kpiMetrics,
    filteredSessions,
  } = useTaskAnalytics(tasks, sessions, timeRange);

  // Compute daily throughput velocity rate
  const rangeDaysCount = timeRange === '30days' ? 30 : timeRange === 'all' ? 60 : 7;
  const velocityRate = (kpiMetrics.completedTasks / rangeDaysCount).toFixed(1);

  // Recent focus sessions list (top 6)
  const recentSessions = [...filteredSessions]
    .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
    .slice(0, 6);

  return (
    <div className="analytics-dashboard-page">
      {/* Top Action Header */}
      <div className="analytics-top-header">
        <div className="header-breadcrumbs">
          <button
            type="button"
            className="btn-back-tasks"
            onClick={onBackToTasks}
            title="Return to Tasks list"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Back to Tasks</span>
          </button>
          <div className="analytics-title-group">
            <h1 className="analytics-main-title">Productivity & Working Patterns</h1>
            <span className="analytics-subtitle">Time tracking, velocity, and focus analytics</span>
          </div>
        </div>

        <div className="header-controls-group">
          {/* Time Range Selector */}
          <div className="range-filter-pill-group">
            <button
              type="button"
              className={`range-pill ${timeRange === '7days' ? 'active' : ''}`}
              onClick={() => setTimeRange('7days')}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`range-pill ${timeRange === '30days' ? 'active' : ''}`}
              onClick={() => setTimeRange('30days')}
            >
              30 Days
            </button>
            <button
              type="button"
              className={`range-pill ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
          </div>

          {/* Launch Focus Timer Button */}
          <button
            type="button"
            className="btn-launch-timer"
            onClick={() => {
              // Select first uncompleted task as default, or general focus
              const defaultTask = tasks.find((t) => !t.completed);
              setActiveTimerTask(defaultTask || null);
              setIsTimerOpen(!isTimerOpen);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{isTimerOpen ? 'Close Timer' : 'Focus Timer'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Focus Timer Widget */}
      {isTimerOpen && (
        <div className="dashboard-timer-section">
          <FocusTimer
            task={activeTimerTask}
            onUpdateTask={onUpdateTask}
            onSaveSession={onSaveSession}
            onClose={() => setIsTimerOpen(false)}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="kpi-cards-grid">
        {/* KPI 1: Velocity Rate */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap velocity-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Completion Velocity</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{velocityRate}</span>
              <span className="kpi-unit">tasks/day</span>
            </div>
            <span className="kpi-subtext">{kpiMetrics.completedTasks} completed in range</span>
          </div>
        </div>

        {/* KPI 2: Total Focus Time */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap focus-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Focus Time</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpiMetrics.totalFocusFormatted}</span>
            </div>
            <span className="kpi-subtext">{filteredSessions.length} sessions logged</span>
          </div>
        </div>

        {/* KPI 3: Avg Cycle Time */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap cycle-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Avg Lead / Cycle Time</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpiMetrics.avgCycleTimeHours || 0}</span>
              <span className="kpi-unit">hours</span>
            </div>
            <span className="kpi-subtext">Creation to check-off</span>
          </div>
        </div>

        {/* KPI 4: Streak */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap streak-icon">
            <span className="streak-flame">🔥</span>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Productive Streak</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpiMetrics.currentStreak}</span>
              <span className="kpi-unit">days</span>
            </div>
            <span className="kpi-subtext">Consecutive daily output</span>
          </div>
        </div>

        {/* KPI 5: Pomodoros Completed */}
        <div className="kpi-card">
          <div className="kpi-icon-wrap pomodoro-icon">
            <span className="pomodoro-emoji">🍅</span>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Completed Pomodoros</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpiMetrics.pomodoroCount}</span>
              <span className="kpi-unit">cycles</span>
            </div>
            <span className="kpi-subtext">25-min deep focus blocks</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="charts-main-grid">
        {/* Velocity Chart (Left 2/3) */}
        <div className="chart-grid-col-2">
          <VelocityLineChart data={velocityData} />
        </div>

        {/* Category Donut (Right 1/3) */}
        <div className="chart-grid-col-1">
          <CategoryDonutChart data={categoryBreakdown} />
        </div>

        {/* Peak Hours Timeline (Full Width) */}
        <div className="chart-grid-col-full">
          <PeakHoursBarChart data={peakHours} />
        </div>
      </div>

      {/* Recent Focus Session Logs */}
      <div className="sessions-history-card">
        <div className="sessions-header">
          <div className="chart-title-wrap">
            <h3 className="chart-title">Recent Focus Sessions</h3>
            <span className="chart-subtitle">Recorded deep work intervals</span>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <div className="sessions-empty-state">
            <p>No focus sessions recorded yet. Click "Focus Timer" to log your first session!</p>
          </div>
        ) : (
          <div className="sessions-table-wrapper">
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Task / Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => {
                  const dateStr = new Date(s.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr key={s.id}>
                      <td className="session-task-cell">
                        <span className="session-task-title">{s.taskTitle}</span>
                      </td>
                      <td>
                        <span className="category-badge-compact">{s.category}</span>
                      </td>
                      <td className="session-duration-cell">
                        <strong>{formatDuration(s.durationSeconds)}</strong>
                      </td>
                      <td>
                        <span className={`session-type-pill ${s.type}`}>
                          {s.type === 'pomodoro' ? '🍅 Pomodoro' : '⏱️ Stopwatch'}
                        </span>
                      </td>
                      <td className="session-time-cell">{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
