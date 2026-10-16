import React from 'react';

export default function ProgressBar({ total, completed }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-section" aria-label="Task completion progress">
      <div className="progress-header">
        <span className="progress-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Productivity Progress</span>
        </span>
        <span className="progress-percentage">{percentage}%</span>
      </div>

      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      <div className="progress-footer">
        <span>{completed} of {total} {total === 1 ? 'task' : 'tasks'} completed</span>
        {percentage === 100 && total > 0 && (
          <span className="all-done-badge">All caught up! 🎉</span>
        )}
      </div>
    </div>
  );
}
