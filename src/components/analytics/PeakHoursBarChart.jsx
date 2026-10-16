import React, { useState, useMemo } from 'react';

/**
 * PeakHoursBarChart
 * Pure SVG column chart showing tasks completed & focus hours across 24 hours (0-23).
 * Identifies the user's golden productive hours with visual glow and tooltips.
 */
export default function PeakHoursBarChart({ data = [] }) {
  const [hoveredHour, setHoveredHour] = useState(null);

  // Compute peak hour with maximum activity
  const peakInfo = useMemo(() => {
    let best = null;
    let maxActivity = 0;
    data.forEach((b) => {
      const score = b.completedTasksCount * 2 + b.focusMinutesTotal / 15;
      if (score > maxActivity) {
        maxActivity = score;
        best = b;
      }
    });
    return best && maxActivity > 0 ? best : null;
  }, [data]);

  const maxVal = Math.max(
    3,
    ...data.map((b) => Math.max(b.completedTasksCount, Math.round(b.focusMinutesTotal / 30)))
  );

  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 15, bottom: 30, left: 25 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barSlotWidth = chartWidth / 24;
  const barWidth = Math.max(6, barSlotWidth * 0.65);

  const hoveredBucket = hoveredHour !== null ? data[hoveredHour] : null;

  return (
    <div className="chart-card peak-hours-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <h3 className="chart-title">Peak Productivity Hours</h3>
          <span className="chart-subtitle">Task completions across the 24-hour day</span>
        </div>
        {peakInfo && (
          <div className="peak-hour-badge" title="Most productive time of day">
            <span className="badge-flame">🔥</span>
            <span>Peak: <strong>{peakInfo.hourLabel}</strong></span>
          </div>
        )}
      </div>

      <div className="svg-chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="responsive-svg-chart"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="peakBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Baseline grid */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />

          {/* 24 Hour Columns */}
          {data.map((bucket, i) => {
            const count = bucket.completedTasksCount || 0;
            const barH = count > 0 ? Math.max(6, (count / maxVal) * chartHeight) : 2;
            const x = padding.left + i * barSlotWidth + (barSlotWidth - barWidth) / 2;
            const y = padding.top + chartHeight - barH;
            const isHovered = hoveredHour === i;
            const isPeak = peakInfo && peakInfo.hour === bucket.hour;

            // Show X-axis label only for every 4 hours (12AM, 4AM, 8AM, 12PM, 4PM, 8PM)
            const showLabel = i % 4 === 0;

            return (
              <g key={bucket.hour} className="hour-bar-group">
                {/* Column Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="3"
                  fill={isPeak ? 'url(#peakBarGrad)' : count > 0 ? 'url(#barGlow)' : 'var(--border-subtle)'}
                  opacity={isHovered ? 1 : count > 0 ? 0.9 : 0.4}
                  className="peak-bar-rect"
                />

                {/* X-axis milestone label */}
                {showLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="10"
                    fontFamily="inherit"
                  >
                    {bucket.hour === 0 ? '12A' : bucket.hour === 12 ? '12P' : bucket.hourLabel.replace(' ', '')}
                  </text>
                )}

                {/* Interactive hover zone */}
                <rect
                  x={padding.left + i * barSlotWidth}
                  y={padding.top}
                  width={barSlotWidth}
                  height={chartHeight + padding.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredHour(i)}
                  onMouseLeave={() => setHoveredHour(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredBucket && (
          <div
            className="chart-floating-tooltip"
            style={{
              left: `${((padding.left + hoveredHour * barSlotWidth + barSlotWidth / 2) / width) * 100}%`,
              top: '10px',
            }}
          >
            <div className="tooltip-date">{hoveredBucket.hourLabel}</div>
            <div className="tooltip-metric">
              <span className="dot completed" />
              <span>Completed: <strong>{hoveredBucket.completedTasksCount}</strong></span>
            </div>
            {hoveredBucket.focusMinutesTotal > 0 && (
              <div className="tooltip-metric">
                <span className="dot focus-dot" />
                <span>Focus: <strong>{hoveredBucket.focusMinutesTotal}m</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
