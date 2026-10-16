import React, { useState } from 'react';
import { formatDuration } from '../../utils/analyticsUtils';

/**
 * CategoryDonutChart
 * Pure SVG Donut Chart showing time distribution and task breakdown across categories.
 * Features an SVG circular stroke-dasharray donut and a clean, responsive HTML legend.
 */
export default function CategoryDonutChart({ data = [] }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-card category-chart-card empty">
        <h3 className="chart-title">Category Distribution</h3>
        <p className="chart-empty-text">No category data recorded yet</p>
      </div>
    );
  }

  // Calculate totals
  const totalFocusSeconds = data.reduce((acc, d) => acc + (d.totalFocusMinutes || 0) * 60, 0);
  const totalTasks = data.reduce((acc, d) => acc + (d.totalTasks || 0), 0);

  // SVG Donut geometry
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each slice
  const { slices } = data.reduce(
    (acc, item) => {
      const percent = Math.max(0, item.percentageOfTime || 0);
      const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((acc.offset / 100) * circumference);
      return {
        slices: [
          ...acc.slices,
          {
            ...item,
            strokeDasharray,
            strokeDashoffset,
          },
        ],
        offset: acc.offset + percent,
      };
    },
    { slices: [], offset: 0 }
  );

  return (
    <div className="chart-card category-chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <h3 className="chart-title">Category Breakdown</h3>
          <span className="chart-subtitle">Focus Time & Task Allocation</span>
        </div>
      </div>

      <div className="donut-chart-layout">
        {/* SVG Donut Visual */}
        <div className="svg-donut-wrapper">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="svg-donut-graphic"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--track-bg)"
              strokeWidth={strokeWidth - 4}
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredCategory === slice.category;
              return (
                <circle
                  key={slice.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredCategory && !isHovered ? 0.45 : 1,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredCategory(slice.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Central Summary Counter */}
          <div className="donut-center-content">
            <span className="donut-center-value">
              {totalFocusSeconds > 0 ? formatDuration(totalFocusSeconds) : totalTasks}
            </span>
            <span className="donut-center-label">
              {totalFocusSeconds > 0 ? 'Focus Time' : 'Total Tasks'}
            </span>
          </div>
        </div>

        {/* Clean Responsive Legend */}
        <div className="donut-legend-list">
          {data.map((item) => {
            const isHovered = hoveredCategory === item.category;
            return (
              <div
                key={item.category}
                className={`donut-legend-item ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="legend-label-group">
                  <span
                    className="category-color-swatch"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="legend-category-name">{item.category}</span>
                </div>

                <div className="legend-values-group">
                  <span className="legend-task-count">
                    {item.completedTasks}/{item.totalTasks} done
                  </span>
                  <span className="legend-percentage-pill" style={{ color: item.color }}>
                    {item.percentageOfTime}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
