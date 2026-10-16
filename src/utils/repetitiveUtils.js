/**
 * repetitiveUtils.js
 * Pure utility functions and seed data for Daily Repetitive Tasks & Tracking Matrix.
 * Zero external dependencies.
 */

export const REPETITIVE_STORAGE_KEY = 'taskflow_repetitive_tasks';

/**
 * Returns today's date formatted as "YYYY-MM-DD" in local time
 */
export function getTodayDateKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human-friendly display label for a date key
 * e.g., "Today • Friday, Oct 16" or "Yesterday • Oct 15"
 */
export function formatDateKeyDisplay(dateKey) {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const todayKey = getTodayDateKey();

  const isToday = dateKey === todayKey;

  // Check yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = dateKey === getTodayDateKeyOffset(-1);

  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isToday) {
    return { main: 'Today', sub: `${weekday}, ${monthDay}`, isToday: true };
  }
  if (isYesterday) {
    return { main: 'Yesterday', sub: `${weekday}, ${monthDay}`, isToday: false };
  }
  return { main: `${weekday}, ${monthDay}`, sub: dateKey, isToday: false };
}

/**
 * Helper to get dateKey offset by N days from today
 */
export function getTodayDateKeyOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets previous day dateKey from a given dateKey
 */
export function getPreviousDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

/**
 * Gets next day dateKey from a given dateKey
 */
export function getNextDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

/**
 * Format current local time as "HH:MM AM/PM"
 */
export function getCurrentTimeFormatted() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Checks if a specific daily log entry satisfies the target criteria of a task
 */
export function isGoalMet(task, logEntry) {
  if (!logEntry) return false;
  if (task.targetType === 'time') {
    return Boolean(logEntry.completed);
  }
  if (task.targetType === 'duration') {
    const loggedMins = Number(logEntry.value) || 0;
    const targetMins = Number(task.targetDurationMinutes) || 1;
    return loggedMins >= targetMins;
  }
  if (task.targetType === 'count') {
    const loggedCount = Number(logEntry.value) || 0;
    const targetCount = Number(task.targetCount) || 1;
    return loggedCount >= targetCount;
  }
  return Boolean(logEntry.completed);
}

/**
 * Computes Adherence Rating (%) for a task across the past N days up to referenceDateKey
 */
export function calculateTaskAdherence(task, daysCount = 7, referenceDateKey = getTodayDateKey()) {
  if (!task) return { percentage: 0, daysMet: 0, totalDays: daysCount };
  const history = task.history || {};

  const [year, month, day] = referenceDateKey.split('-').map(Number);
  let daysMet = 0;

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${dt}`;

    const entry = history[key];
    if (isGoalMet(task, entry)) {
      daysMet += 1;
    }
  }

  const percentage = Math.round((daysMet / daysCount) * 100);
  return {
    percentage,
    daysMet,
    totalDays: daysCount,
  };
}

/**
 * Seed Repetitive Tasks with realistic historical entries
 */
export const INITIAL_REPETITIVE_TASKS = [
  {
    id: 'rep_1',
    title: 'Morning Sunlight & Hydration',
    category: 'Health',
    targetType: 'count',
    targetCount: 4,
    targetUnit: 'glasses',
    createdAt: Date.now() - 86400000 * 10,
    history: {
      [getTodayDateKeyOffset(-3)]: { completed: true, value: 4, updatedAt: Date.now() - 86400000 * 3 },
      [getTodayDateKeyOffset(-2)]: { completed: true, value: 4, updatedAt: Date.now() - 86400000 * 2 },
      [getTodayDateKeyOffset(-1)]: { completed: true, value: 3, updatedAt: Date.now() - 86400000 * 1 },
      [getTodayDateKey()]: { completed: false, value: 2, updatedAt: Date.now() },
    },
  },
  {
    id: 'rep_2',
    title: 'Daily Deep Coding & Architecture Study',
    category: 'Study',
    targetType: 'duration',
    targetDurationMinutes: 45,
    createdAt: Date.now() - 86400000 * 10,
    history: {
      [getTodayDateKeyOffset(-3)]: { completed: true, value: 45, updatedAt: Date.now() - 86400000 * 3 },
      [getTodayDateKeyOffset(-2)]: { completed: true, value: 60, updatedAt: Date.now() - 86400000 * 2 },
      [getTodayDateKeyOffset(-1)]: { completed: true, value: 45, updatedAt: Date.now() - 86400000 * 1 },
      [getTodayDateKey()]: { completed: true, value: 45, updatedAt: Date.now() },
    },
  },
  {
    id: 'rep_3',
    title: 'Morning Standup & Task Alignment',
    category: 'Work',
    targetType: 'time',
    targetTime: '09:30',
    createdAt: Date.now() - 86400000 * 10,
    history: {
      [getTodayDateKeyOffset(-2)]: { completed: true, loggedTime: '09:28 AM', updatedAt: Date.now() - 86400000 * 2 },
      [getTodayDateKeyOffset(-1)]: { completed: true, loggedTime: '09:30 AM', updatedAt: Date.now() - 86400000 * 1 },
      [getTodayDateKey()]: { completed: true, loggedTime: '09:25 AM', updatedAt: Date.now() },
    },
  },
  {
    id: 'rep_4',
    title: 'Evening Physical Workout / Stretching',
    category: 'Health',
    targetType: 'duration',
    targetDurationMinutes: 30,
    createdAt: Date.now() - 86400000 * 10,
    history: {
      [getTodayDateKeyOffset(-2)]: { completed: true, value: 30, updatedAt: Date.now() - 86400000 * 2 },
      [getTodayDateKeyOffset(-1)]: { completed: true, value: 35, updatedAt: Date.now() - 86400000 * 1 },
      [getTodayDateKey()]: { completed: false, value: 0, updatedAt: Date.now() },
    },
  },
];
