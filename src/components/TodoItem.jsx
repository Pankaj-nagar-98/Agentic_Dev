import React from 'react';

export default function TodoItem({ todo, onToggle, onDelete }) {
  // Format creation timestamp
  const formattedDate = new Date(todo.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-item-left">
        <button
          type="button"
          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? 'Mark task active' : 'Mark task completed'}
          title={todo.completed ? 'Mark as active' : 'Mark as completed'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        <div className="todo-content-col">
          <span className="todo-text">{todo.text}</span>
          <span className="todo-date">{formattedDate}</span>
        </div>
      </div>

      <button
        type="button"
        className="btn-delete"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete task: ${todo.text}`}
        title="Delete task"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </li>
  );
}
