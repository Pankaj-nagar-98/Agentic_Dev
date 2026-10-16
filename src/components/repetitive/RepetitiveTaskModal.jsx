import React, { useState, useEffect, useRef } from 'react';

/**
 * RepetitiveTaskModal
 * Modal form for creating and editing daily repetitive tasks with dynamic goal fields.
 * Supports: 'time' (particular time), 'duration' (target minutes), and 'count' (target reps/quantity).
 */
export default function RepetitiveTaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  taskToEdit = null,
  availableCategories = ['Health', 'Work', 'Study', 'Personal', 'Finance'],
  onAddCategory,
}) {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [category, setCategory] = useState(taskToEdit?.category || 'Health');
  const [targetType, setTargetType] = useState(taskToEdit?.targetType || 'count'); // 'time' | 'duration' | 'count'

  // Dynamic Goal States
  const [targetTime, setTargetTime] = useState(taskToEdit?.targetTime || '08:00');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(taskToEdit?.targetDurationMinutes || 30);
  const [targetCount, setTargetCount] = useState(taskToEdit?.targetCount || 5);
  const [targetUnit, setTargetUnit] = useState(taskToEdit?.targetUnit || 'reps');

  // Custom Category State
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [error, setError] = useState('');

  const titleInputRef = useRef(null);

  // Autofocus title input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide a title for the repetitive task');
      return;
    }

    const payload = {
      title: trimmedTitle,
      category,
      targetType,
      targetTime: targetType === 'time' ? targetTime : undefined,
      targetDurationMinutes: targetType === 'duration' ? Number(targetDurationMinutes) || 1 : undefined,
      targetCount: targetType === 'count' ? Number(targetCount) || 1 : undefined,
      targetUnit: targetType === 'count' ? (targetUnit.trim() || 'reps') : undefined,
    };

    onSave(payload);
  };

  const handleAddNewCategory = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (trimmed) {
      onAddCategory?.(trimmed);
      setCategory(trimmed);
      setNewCatInput('');
      setIsAddingCategory(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content repetitive-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {taskToEdit ? 'Edit Routine Task' : 'New Repetitive Task'}
            </h2>
            <span className="modal-subtitle">
              Configure daily goals, tracking units, and habits
            </span>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && <div className="alert-danger modal-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="rep-task-title" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="rep-task-title"
              type="text"
              className="form-input"
              placeholder="e.g., Morning Hydration, 50 Pushups, Reading"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="rep-task-category" className="form-label">
                Category
              </label>
              <button
                type="button"
                className="btn-text-action"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
              >
                {isAddingCategory ? 'Cancel' : '+ New Category'}
              </button>
            </div>

            {isAddingCategory ? (
              <div className="new-category-inline-box">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Category name..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-chip-action save"
                  onClick={handleAddNewCategory}
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                id="rep-task-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Target Type Selector */}
          <div className="form-group">
            <label className="form-label">Goal Target Type</label>
            <div className="target-type-selector-grid">
              <button
                type="button"
                className={`target-type-option ${targetType === 'time' ? 'active' : ''}`}
                onClick={() => setTargetType('time')}
              >
                <span className="type-icon">⏰</span>
                <div className="type-meta">
                  <span className="type-title">Particular Time</span>
                  <span className="type-desc">Log exact check-in time</span>
                </div>
              </button>

              <button
                type="button"
                className={`target-type-option ${targetType === 'duration' ? 'active' : ''}`}
                onClick={() => setTargetType('duration')}
              >
                <span className="type-icon">⏱️</span>
                <div className="type-meta">
                  <span className="type-title">Duration</span>
                  <span className="type-desc">Target minutes of focus</span>
                </div>
              </button>

              <button
                type="button"
                className={`target-type-option ${targetType === 'count' ? 'active' : ''}`}
                onClick={() => setTargetType('count')}
              >
                <span className="type-icon">🎯</span>
                <div className="type-meta">
                  <span className="type-title">Count</span>
                  <span className="type-desc">Reps, glasses, pages</span>
                </div>
              </button>
            </div>
          </div>

          {/* DYNAMIC GOAL PARAMETERS */}
          <div className="dynamic-goal-box">
            {targetType === 'time' && (
              <div className="form-group dynamic-field-fade">
                <label htmlFor="rep-target-time" className="form-label">
                  Target Time of Day
                </label>
                <input
                  id="rep-target-time"
                  type="time"
                  className="form-input time-picker-input"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  required
                />
                <span className="field-hint-text">
                  Checking this off will log your exact execution time against this target.
                </span>
              </div>
            )}

            {targetType === 'duration' && (
              <div className="form-group dynamic-field-fade">
                <label htmlFor="rep-target-duration" className="form-label">
                  Target Duration (Minutes)
                </label>
                <div className="duration-input-row">
                  <input
                    id="rep-target-duration"
                    type="number"
                    min="1"
                    max="1440"
                    className="form-input duration-number-input"
                    value={targetDurationMinutes}
                    onChange={(e) => setTargetDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                  <div className="duration-presets-wrap">
                    {[15, 30, 45, 60, 90].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-pill ${targetDurationMinutes === preset ? 'active' : ''}`}
                        onClick={() => setTargetDurationMinutes(preset)}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                </div>
                <span className="field-hint-text">
                  Set daily target minutes. You can type or increment progress throughout the day.
                </span>
              </div>
            )}

            {targetType === 'count' && (
              <div className="dynamic-field-fade">
                <div className="form-grid-row">
                  <div className="form-group">
                    <label htmlFor="rep-target-count" className="form-label">
                      Target Quantity (Goal)
                    </label>
                    <input
                      id="rep-target-count"
                      type="number"
                      min="1"
                      max="10000"
                      className="form-input"
                      value={targetCount}
                      onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rep-target-unit" className="form-label">
                      Unit Label
                    </label>
                    <input
                      id="rep-target-unit"
                      type="text"
                      className="form-input"
                      placeholder="e.g. reps, glasses, pages"
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                    />
                  </div>
                </div>
                <span className="field-hint-text">
                  Daily counter widget with [-] and [+] buttons will track reps up to this target.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-actions-row">
            {taskToEdit && onDelete && (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => {
                  if (window.confirm(`Delete repetitive task "${taskToEdit.title}"?`)) {
                    onDelete(taskToEdit.id);
                  }
                }}
              >
                Delete Routine
              </button>
            )}

            <div className="right-action-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-modal"
              >
                {taskToEdit ? 'Save Changes' : 'Create Routine'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
