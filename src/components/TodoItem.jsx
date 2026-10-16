import React, { useState, useRef, useEffect } from 'react';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdateText,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (todo.completed) return; // Don't edit completed tasks
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdateText(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const formattedDate = new Date(todo.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const priority = todo.priority || 'normal';

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''} priority-${priority}`}>
      <div className="todo-item-left">
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

        <div className="todo-content-col">
          {isEditing ? (
            <div className="inline-edit-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="inline-edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
              />
              <button
                type="button"
                className="btn-edit-action save"
                onClick={handleSaveEdit}
                title="Save changes (Enter)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
              <button
                type="button"
                className="btn-edit-action cancel"
                onClick={() => {
                  setEditText(todo.text);
                  setIsEditing(false);
                }}
                title="Cancel (Esc)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="todo-row-main" onDoubleClick={handleStartEdit} title="Double-click to edit">
              <span className="todo-text">{todo.text}</span>
              <span className={`priority-tag ${priority}`}>{priority}</span>
            </div>
          )}

          <div className="todo-meta-row">
            <span className="todo-date">{formattedDate}</span>
            {!todo.completed && !isEditing && (
              <span className="edit-hint-text">&bull; double-click to edit</span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-item-actions">
        {!todo.completed && !isEditing && (
          <button
            type="button"
            className="btn-item-action btn-edit"
            onClick={handleStartEdit}
            title="Edit task text"
            aria-label="Edit task"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        )}

        <button
          type="button"
          className="btn-item-action btn-delete"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete task: ${todo.text}`}
          title="Delete task"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </li>
  );
}
