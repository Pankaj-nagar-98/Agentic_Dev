import React, { useState, useMemo } from 'react';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onArchive,
  onToggleSubtask,
}) {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const subtasks = todo.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  const [today] = useState(() => new Date());

  // Memoized due date status calculation
  const dueInfo = useMemo(() => {
    if (!todo.dueDate) return null;
    const due = new Date(todo.dueDate + 'T23:59:59');
    const isOverdue = due < today;
    const isToday = due.toDateString() === today.toDateString();

    const formatted = new Date(todo.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (isOverdue && !todo.completed) {
      return { text: `Overdue: ${formatted}`, status: 'overdue' };
    }
    if (isToday) {
      return { text: `Due Today`, status: 'today' };
    }
    return { text: `Due: ${formatted}`, status: 'future' };
  }, [todo.dueDate, todo.completed, today]);

  const priority = todo.priority || 'medium';
  const category = todo.category || 'General';

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.archived ? 'archived' : ''} priority-border-${priority}`}>
      <div className="todo-item-main-row">
        {/* Completion checkbox */}
        <button
          type="button"
          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? 'Mark task as active' : 'Mark task as completed'}
          title={todo.completed ? 'Mark as active' : 'Mark as completed'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        {/* Content Area */}
        <div className="todo-content-col">
          <div className="todo-header-row">
            <span className="todo-text">{todo.text || todo.title}</span>

            {/* Badges: Priority, Category, Due Status */}
            <div className="todo-badges-wrap">
              <span className={`priority-badge ${priority}`}>
                {priority.toUpperCase()}
              </span>

              <span className="category-badge">{category}</span>

              {dueInfo && (
                <span className={`due-badge ${dueInfo.status}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{dueInfo.text}</span>
                </span>
              )}
            </div>
          </div>

          {/* Optional Description */}
          {todo.description && (
            <p className="todo-description-text">{todo.description}</p>
          )}

          {/* Subtasks summary toggle */}
          {subtasks.length > 0 && (
            <div className="subtasks-summary-bar">
              <button
                type="button"
                className="btn-toggle-subtasks"
                onClick={() => setShowSubtasks(!showSubtasks)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showSubtasks ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>
                  Subtasks ({completedSubtasksCount}/{subtasks.length})
                </span>
              </button>
            </div>
          )}

          {/* Subtasks list expanded */}
          {showSubtasks && subtasks.length > 0 && (
            <ul className="item-subtask-list">
              {subtasks.map((st) => (
                <li key={st.id} className={`item-subtask-row ${st.completed ? 'completed' : ''}`}>
                  <label className="subtask-checkbox-label">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask(todo.id, st.id)}
                    />
                    <span>{st.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="todo-item-actions">
          {/* Edit button */}
          <button
            type="button"
            className="btn-item-action btn-edit"
            onClick={() => onEdit(todo)}
            title="Edit task details"
            aria-label="Edit task"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>

          {/* Archive / Unarchive button */}
          <button
            type="button"
            className={`btn-item-action ${todo.archived ? 'btn-unarchive' : 'btn-archive'}`}
            onClick={() => onArchive(todo.id)}
            title={todo.archived ? 'Restore from archive' : 'Archive task'}
            aria-label={todo.archived ? 'Restore task' : 'Archive task'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
          </button>

          {/* Delete permanently button */}
          <button
            type="button"
            className="btn-item-action btn-delete"
            onClick={() => onDelete(todo.id)}
            title="Delete task permanently"
            aria-label={`Delete task: ${todo.text || todo.title}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}
