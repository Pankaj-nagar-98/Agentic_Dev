import React from 'react';

export default function TodoFilter({
  currentFilter = 'all',
  onFilterChange,
  counts = { all: 0, active: 0, completed: 0, archived: 0 },
  searchQuery = '',
  onSearchChange,
  sortBy = 'created_desc',
  onSortChange,
  selectedCategory = 'all',
  onCategoryChange,
  availableCategories = [],
  remainingCount = 0,
}) {
  const safeCategories = Array.isArray(availableCategories) ? availableCategories : [];

  const statusTabs = [
    { key: 'all', label: 'All', count: counts.all ?? 0 },
    { key: 'active', label: 'Active', count: counts.active ?? 0 },
    { key: 'completed', label: 'Completed', count: counts.completed ?? 0 },
    { key: 'archived', label: 'Archived', count: counts.archived ?? 0 },
  ];

  return (
    <div className="filter-and-controls-panel">
      {/* Top Controls: Search Bar & Sort Dropdown */}
      <div className="search-and-sort-row">
        {/* Search Bar */}
        <div className="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="search-tasks-input"
            type="text"
            className="search-input"
            placeholder="Search tasks, descriptions, or tags... (Press / to focus)"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => onSearchChange?.('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="sort-select-wrap">
          <label htmlFor="sort-tasks-select" className="sort-label">Sort:</label>
          <select
            id="sort-tasks-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="priority_desc">Priority (High → Low)</option>
            <option value="due_date_asc">Due Date (Earliest)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="category-filter-row">
        <span className="category-filter-label">Categories:</span>
        <div className="category-pills-scroll">
          <button
            type="button"
            className={`category-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange?.('all')}
          >
            All Categories
          </button>
          {safeCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange?.(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Status Tabs & Remaining Count */}
      <div className="status-tabs-row">
        <div className="filter-group">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`filter-btn ${currentFilter === tab.key ? 'active' : ''}`}
              onClick={() => onFilterChange?.(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="filter-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="items-left-text">
          <span className="items-left-highlight">{remainingCount}</span>{' '}
          {remainingCount === 1 ? 'task remaining' : 'tasks remaining'}
        </div>
      </div>
    </div>
  );
}
