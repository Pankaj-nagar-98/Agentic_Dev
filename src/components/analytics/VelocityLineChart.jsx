import React, { useState } from 'react';

/**
 * VelocityLineChart
 * Pure SVG responsive line chart overlaying tasks created vs completed over time.
 * Zero external libraries. 100% vector-based with theme-adaptive CSS variables.
 */
export default function VelocityLineChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No velocity data available for this range</p>
      </div>
    );
  }

  // Chart dimensions & margins
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 25, bottom: 35, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Maximum value for scaling (min 4 for visual appeal)
  const maxVal = Math.max(
    4,
    ...data.map((d) => Math.max(d.tasksCreated || 0, d.tasksCompleted || 0))
  );

  // Compute X and Y coordinates
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth / 2;
  const getX = (index) => padding.left + (data.length > 1 ? index * stepX : chartWidth / 2);
  const getY = (val) => padding.top + chartHeight - (val / maxVal) * chartHeight;

  // Generate SVG path strings
  const createdPoints = data.map((d, i) => `${getX(i)},${getY(d.tasksCreated || 0)}`).join(' ');
  const completedPoints = data.map((d, i) => `${getX(i)},${getY(d.tasksCompleted || 0)}`).join(' ');

  // Area path for subtle shaded fill under completed tasks
  const completedArea = `
    M ${getX(0)} ${getY(0)}
    L ${data.map((d, i) => `${getX(i)} ${getY(d.tasksCompleted || 0)}`).join(' L ')}
    L ${getX(data.length - 1)} ${getY(0)}
    Z
  `;

  // Horizontal grid lines
  const gridLevels = [0, 0.5, 1];

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="chart-card velocity-chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <h3 className="chart-title">Completion Velocity</h3>
          <span className="chart-subtitle">Tasks Created vs Completed Throughput</span>
        </div>
        <div className="chart-legend-row">
          <div className="legend-indicator">
            <span className="legend-dot completed-dot" />
            <span>Completed</span>
          </div>
          <div className="legend-indicator">
            <span className="legend-dot created-dot" />
            <span>Created</span>
          </div>
        </div>
      </div>

      <div className="svg-chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="responsive-svg-chart"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft gradient fill under completed line */}
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing line filter */}
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--primary)" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines & Y-Axis labels */}
          {gridLevels.map((lvl) => {
            const y = padding.top + chartHeight - lvl * chartHeight;
            const valLabel = Math.round(lvl * maxVal);
            return (
              <g key={lvl} className="chart-grid-group">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray={lvl === 0 ? 'none' : '4 4'}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="inherit"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Completed Area Gradient */}
          <path d={completedArea} fill="url(#completedGrad)" />

          {/* Created Line (Cyan / Secondary) */}
          <polyline
            points={createdPoints}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.2"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Completed Line (Primary Theme Color) */}
          <polyline
            points={completedPoints}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEffect)"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data Points and Hover Target Zones */}
          {data.map((d, i) => {
            const x = getX(i);
            const yComp = getY(d.tasksCompleted || 0);
            const yCreat = getY(d.tasksCreated || 0);
            const isHovered = hoveredIndex === i;

            return (
              <g key={d.date} className="chart-point-group">
                {/* Vertical hover guide bar */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="var(--card-border)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Completed Point */}
                <circle
                  cx={x}
                  cy={yComp}
                  r={isHovered ? 6 : 4}
                  fill="var(--primary)"
                  stroke="var(--card-bg)"
                  strokeWidth="2"
                  className="chart-data-point"
                />

                {/* Created Point */}
                <circle
                  cx={x}
                  cy={yCreat}
                  r={isHovered ? 5 : 3}
                  fill="#06b6d4"
                  stroke="var(--card-bg)"
                  strokeWidth="2"
                  className="chart-data-point"
                />

                {/* X-Axis Date Label */}
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`chart-axis-label ${isHovered ? 'active' : ''}`}
                  fill={isHovered ? 'var(--text-main)' : 'var(--text-muted)'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                  fontFamily="inherit"
                >
                  {d.dayLabel}
                </text>

                {/* Transparent hit target for hover */}
                <rect
                  x={x - stepX / 2}
                  y={padding.top}
                  width={stepX}
                  height={chartHeight + padding.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredItem && (
          <div
            className="chart-floating-tooltip"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
              top: '15px',
            }}
          >
            <div className="tooltip-date">{hoveredItem.fullDateLabel || hoveredItem.date}</div>
            <div className="tooltip-metric">
              <span className="dot completed" />
              <span>Completed: <strong>{hoveredItem.tasksCompleted}</strong></span>
            </div>
            <div className="tooltip-metric">
              <span className="dot created" />
              <span>Created: <strong>{hoveredItem.tasksCreated}</strong></span>
            </div>
            {hoveredItem.avgCycleTimeHours > 0 && (
              <div className="tooltip-metric cycle-time">
                <span>Avg Cycle: <strong>{hoveredItem.avgCycleTimeHours}h</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
