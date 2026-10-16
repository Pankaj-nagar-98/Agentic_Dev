import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance'];

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit = null,
  availableCategories = DEFAULT_CATEGORIES,
  onAddCategory,
}) {
  const [title, setTitle] = useState(() => (taskToEdit ? taskToEdit.text || taskToEdit.title || '' : ''));
  const [description, setDescription] = useState(() => (taskToEdit ? taskToEdit.description || '' : ''));
  const [priority, setPriority] = useState(() => taskToEdit?.priority || 'medium');
  const [category, setCategory] = useState(() => taskToEdit?.category || 'Work');
  const [dueDate, setDueDate] = useState(() => taskToEdit?.dueDate || '');
  const [subtasks, setSubtasks] = useState(() => (taskToEdit?.subtasks ? [...taskToEdit.subtasks] : []));
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [errors, setErrors] = useState({});

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      titleInputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add a subtask
  const handleAddSubtask = (e) => {
    e.preventDefault();
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;

    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        title: trimmed,
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  // Toggle subtask in modal
  const handleToggleSubtask = (id) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  // Delete subtask
  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Add custom category
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      onAddCategory?.(trimmed);
      setCategory(trimmed);
      setNewCategoryInput('');
      setIsAddingCategory(false);
    }
  };

  // Submit modal form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Task title is required' });
      return;
    }

    const taskData = {
      ...(taskToEdit || {}),
      text: title.trim(),
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      subtasks,
    };

    onSave(taskData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {taskToEdit ? (
                  <>
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </>
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </>
                )}
              </svg>
            </div>
            <h2>{taskToEdit ? 'Edit Task Details' : 'Create New Task'}</h2>
          </div>

          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Prepare quarterly engineering review"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
            />
            {errors.title && <span className="field-error-text">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description (Optional)
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Add key notes, links, or context about this task..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Row: Priority & Due Date */}
          <div className="form-grid-row">
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <div className="priority-options-row">
                {[
                  { value: 'high', label: 'High', color: 'red' },
                  { value: 'medium', label: 'Medium', color: 'yellow' },
                  { value: 'low', label: 'Low', color: 'blue' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`priority-chip-btn ${p.value} ${priority === p.value ? 'selected' : ''}`}
                    onClick={() => setPriority(p.value)}
                  >
                    <span className="priority-dot" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                className="form-input date-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <div className="label-with-action">
              <label className="form-label">Category / Project</label>
              {!isAddingCategory && (
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={() => setIsAddingCategory(true)}
                >
                  + New Tag
                </button>
              )}
            </div>

            {isAddingCategory ? (
              <div className="inline-add-category">
                <input
                  type="text"
                  className="form-input category-new-input"
                  placeholder="New category name..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-chip-action save"
                  onClick={handleCreateCategory}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn-chip-action cancel"
                  onClick={() => setIsAddingCategory(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="categories-chips-wrap">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="form-group">
            <label className="form-label">
              Subtasks Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>

            <div className="subtask-add-row">
              <input
                type="text"
                className="form-input subtask-new-input"
                placeholder="Add subtask step and press Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn-add-subtask"
                onClick={handleAddSubtask}
              >
                + Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <ul className="modal-subtask-list">
                {subtasks.map((st) => (
                  <li key={st.id} className={`modal-subtask-item ${st.completed ? 'completed' : ''}`}>
                    <label className="subtask-check-label">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                      />
                      <span>{st.title}</span>
                    </label>
                    <button
                      type="button"
                      className="btn-subtask-delete"
                      onClick={() => handleDeleteSubtask(st.id)}
                      title="Remove subtask"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-modal">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
