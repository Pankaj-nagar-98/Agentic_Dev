/**
 * analyticsUtils.js
 * Pure JavaScript utility functions for TaskFlow Advanced Analytics.
 * Zero external dependencies. Fully compatible with React 19.
 */

export const SESSIONS_STORAGE_KEY = 'taskflow_analytics_sessions';

/**
 * Curated palette for category color assignment in charts and legends
 */
export const CATEGORY_COLORS = [
  '#6366f1', // Indigo / Primary
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

/**
 * Formats seconds into a human-readable duration (e.g., "2h 45m" or "35m")
 */
export function formatDuration(seconds = 0) {
  if (!seconds || seconds <= 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Formats a date timestamp into "YYYY-MM-DD" local calendar date
 */
export function toLocalDateKey(timestamp) {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates an array of contiguous dates [YYYY-MM-DD] for the past N days up to today
 */
export function getContiguousDateRange(daysCount) {
  const result = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    result.push({
      dateKey: toLocalDateKey(d),
      shortLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekdayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      timestamp: d.getTime(),
    });
  }
  return result;
}

/**
 * Filter tasks and sessions by time range ('7days' | '30days' | 'all')
 */
export function filterByTimeRange(items, rangeType = '7days', getTimestampFn) {
  if (rangeType === 'all') return items;
  const days = rangeType === '30days' ? 30 : 7;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    const ts = getTimestampFn(item);
    return ts && ts >= cutoff;
  });
}

/**
 * 1. Computes HourlyProductivityBucket[] across 24 hours (0-23)
 * Groups completedAt timestamps and focus session intervals into their respective hours.
 */
export function computePeakHours(tasks = [], sessions = []) {
  // Initialize 24 buckets
  const buckets = Array.from({ length: 24 }, (_, hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      hour,
      hourLabel: `${displayHour} ${period}`,
      completedTasksCount: 0,
      focusMinutesTotal: 0,
    };
  });

  // Group completed tasks by completion hour
  tasks.forEach((task) => {
    if (task.completed && task.completedAt) {
      const completionHour = new Date(task.completedAt).getHours();
      if (completionHour >= 0 && completionHour < 24) {
        buckets[completionHour].completedTasksCount += 1;
      }
    }
  });

  // Group focus sessions by start hour
  sessions.forEach((session) => {
    if (session.startTime && session.durationSeconds) {
      const sessionHour = new Date(session.startTime).getHours();
      if (sessionHour >= 0 && sessionHour < 24) {
        buckets[sessionHour].focusMinutesTotal += Math.round(session.durationSeconds / 60);
      }
    }
  });

  return buckets;
}

/**
 * 2. Computes DailyVelocityPoint[] for tasks created vs completed over time
 * and calculates average cycle time: (completedAt - createdAt) / (1000 * 60 * 60) in hours.
 */
export function computeVelocityData(tasks = [], sessions = [], rangeType = '7days') {
  const daysCount = rangeType === '30days' ? 30 : rangeType === 'all' ? 14 : 7;
  const calendarDays = getContiguousDateRange(daysCount);

  // Index tasks by creation and completion dates
  const createdByDate = {};
  const completedByDate = {};
  const cycleTimesByDate = {};

  tasks.forEach((task) => {
    if (task.createdAt) {
      const cKey = toLocalDateKey(task.createdAt);
      createdByDate[cKey] = (createdByDate[cKey] || 0) + 1;
    }

    if (task.completed && task.completedAt) {
      const compKey = toLocalDateKey(task.completedAt);
      completedByDate[compKey] = (completedByDate[compKey] || 0) + 1;

      // Cycle time calculation: (completedAt - createdAt) in hours
      if (task.completedAt >= task.createdAt) {
        const cycleHours = (task.completedAt - task.createdAt) / (1000 * 60 * 60);
        if (!cycleTimesByDate[compKey]) {
          cycleTimesByDate[compKey] = [];
        }
        cycleTimesByDate[compKey].push(cycleHours);
      }
    }
  });

  // Index session focus time by date
  const focusMinutesByDate = {};
  sessions.forEach((s) => {
    if (s.startTime && s.durationSeconds) {
      const sKey = toLocalDateKey(s.startTime);
      focusMinutesByDate[sKey] = (focusMinutesByDate[sKey] || 0) + s.durationSeconds / 60;
    }
  });

  // Merge into sequential points
  return calendarDays.map((day) => {
    const created = createdByDate[day.dateKey] || 0;
    const completed = completedByDate[day.dateKey] || 0;
    const cycles = cycleTimesByDate[day.dateKey] || [];
    const avgCycle = cycles.length > 0 
      ? Number((cycles.reduce((acc, v) => acc + v, 0) / cycles.length).toFixed(1))
      : 0;
    const focusHours = Number(((focusMinutesByDate[day.dateKey] || 0) / 60).toFixed(1));

    return {
      date: day.dateKey,
      dayLabel: daysCount <= 7 ? day.weekdayLabel : day.shortLabel,
      fullDateLabel: day.shortLabel,
      tasksCreated: created,
      tasksCompleted: completed,
      totalFocusHours: focusHours,
      avgCycleTimeHours: avgCycle,
    };
  });
}

/**
 * 3. Computes CategoryBreakdown[] calculating totalFocusMinutes, task counts, and percentageOfTime
 */
export function computeCategoryBreakdown(tasks = [], sessions = []) {
  const categoryMap = {};

  // Initialize from tasks
  tasks.forEach((t) => {
    const cat = t.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        totalTasks: 0,
        completedTasks: 0,
        totalFocusSeconds: 0,
      };
    }
    categoryMap[cat].totalTasks += 1;
    if (t.completed) {
      categoryMap[cat].completedTasks += 1;
    }
    if (t.totalFocusSeconds) {
      categoryMap[cat].totalFocusSeconds += t.totalFocusSeconds;
    }
  });

  // Complement with direct session records (in case tasks were deleted or sessions have categories)
  sessions.forEach((s) => {
    const cat = s.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        totalTasks: 0,
        completedTasks: 0,
        totalFocusSeconds: 0,
      };
    }
    // Only add if not already captured by task totalFocusSeconds
    if (!tasks.some((t) => t.id === s.taskId)) {
      categoryMap[cat].totalFocusSeconds += s.durationSeconds || 0;
    }
  });

  const rawList = Object.values(categoryMap);
  const grandTotalSeconds = rawList.reduce((acc, item) => acc + item.totalFocusSeconds, 0);
  const grandTotalTasks = rawList.reduce((acc, item) => acc + item.totalTasks, 0);

  return rawList.map((item, index) => {
    const totalFocusMinutes = Math.round(item.totalFocusSeconds / 60);
    // If total focus time exists, use time percentage; otherwise, fall back to task count percentage
    let percentageOfTime = 0;
    if (grandTotalSeconds > 0) {
      percentageOfTime = Math.round((item.totalFocusSeconds / grandTotalSeconds) * 100);
    } else if (grandTotalTasks > 0) {
      percentageOfTime = Math.round((item.totalTasks / grandTotalTasks) * 100);
    }

    return {
      category: item.category,
      totalTasks: item.totalTasks,
      completedTasks: item.completedTasks,
      totalFocusMinutes,
      percentageOfTime,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  }).sort((a, b) => (b.totalFocusMinutes - a.totalFocusMinutes) || (b.totalTasks - a.totalTasks));
}

/**
 * 4. Computes High-level KPI summary metrics
 */
export function computeKPIMetrics(tasks = [], sessions = []) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total Focus time
  const totalSessionSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalTaskFocusSeconds = tasks.reduce((acc, t) => acc + (t.totalFocusSeconds || 0), 0);
  const maxFocusSeconds = Math.max(totalSessionSeconds, totalTaskFocusSeconds);

  // Overall Average Cycle Time
  const completedWithTimestamps = tasks.filter((t) => t.completed && t.completedAt && t.createdAt);
  const totalCycleHours = completedWithTimestamps.reduce(
    (acc, t) => acc + Math.max(0, (t.completedAt - t.createdAt) / (1000 * 60 * 60)),
    0
  );
  const avgCycleTimeHours = completedWithTimestamps.length > 0
    ? Number((totalCycleHours / completedWithTimestamps.length).toFixed(1))
    : 0;

  // Pomodoro sessions completed
  const pomodoroCount = sessions.filter((s) => s.completedCycle || s.type === 'pomodoro').length 
    || tasks.reduce((acc, t) => acc + (t.pomodoroCount || 0), 0);

  // Milestone streak calculation (consecutive calendar days with at least 1 completed task)
  const completedDateKeys = new Set(
    tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => toLocalDateKey(t.completedAt))
  );

  let currentStreak = 0;
  const checkDate = new Date();
  
  // Check if today has a completion; if not, check from yesterday
  const todayKey = toLocalDateKey(checkDate);
  let startOffset = completedDateKeys.has(todayKey) ? 0 : 1;

  for (let i = startOffset; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toLocalDateKey(d);
    if (completedDateKeys.has(key)) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    totalTasks,
    completedTasks,
    completionRate,
    totalFocusSeconds: maxFocusSeconds,
    totalFocusFormatted: formatDuration(maxFocusSeconds),
    avgCycleTimeHours,
    pomodoroCount,
    currentStreak,
  };
}
