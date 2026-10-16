import React from 'react';

export default function TodoFilter({
  currentFilter,
  onFilterChange,
  counts,
  remainingCount,
}) {
  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-btn ${currentFilter === f.key ? 'active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >
            <span>{f.label}</span>
            <span className="filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="items-left-text">
        <span className="items-left-highlight">{remainingCount}</span>{' '}
        {remainingCount === 1 ? 'task left' : 'tasks left'}
      </div>
    </div>
  );
}
