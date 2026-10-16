import { useMemo } from 'react';
import {
  computePeakHours,
  computeVelocityData,
  computeCategoryBreakdown,
  computeKPIMetrics,
  filterByTimeRange,
} from '../utils/analyticsUtils';

/**
 * Custom hook for computing all analytics aggregations.
 * Ingests Task[] and FocusSession[], filtering by selected range ('7days' | '30days' | 'all')
 *
 * @param {Array} tasks - Array of Task objects
 * @param {Array} sessions - Array of FocusSession objects
 * @param {string} timeRange - '7days' | '30days' | 'all'
 */
export function useTaskAnalytics(tasks = [], sessions = [], timeRange = '7days') {
  // 1. Filtered data slices based on active range
  const filteredTasks = useMemo(() => {
    return filterByTimeRange(tasks, timeRange, (t) => t.completedAt || t.createdAt);
  }, [tasks, timeRange]);

  const filteredSessions = useMemo(() => {
    return filterByTimeRange(sessions, timeRange, (s) => s.startTime);
  }, [sessions, timeRange]);

  // 2. Peak Hours (0-23 hours distribution)
  const peakHours = useMemo(() => {
    return computePeakHours(filteredTasks, filteredSessions);
  }, [filteredTasks, filteredSessions]);

  // 3. Velocity Data (Daily timeline with tasks created, completed & cycle times)
  const velocityData = useMemo(() => {
    return computeVelocityData(tasks, sessions, timeRange);
  }, [tasks, sessions, timeRange]);

  // 4. Category Breakdown (Distribution of focus time and tasks)
  const categoryBreakdown = useMemo(() => {
    return computeCategoryBreakdown(filteredTasks, filteredSessions);
  }, [filteredTasks, filteredSessions]);

  // 5. KPI Summary Metrics
  const kpiMetrics = useMemo(() => {
    return computeKPIMetrics(filteredTasks, filteredSessions);
  }, [filteredTasks, filteredSessions]);

  return {
    filteredTasks,
    filteredSessions,
    peakHours,
    velocityData,
    categoryBreakdown,
    kpiMetrics,
  };
}
