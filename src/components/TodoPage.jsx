import React, { useState, useEffect, useMemo } from 'react';
import TodoItem from './TodoItem';
import TodoFilter from './TodoFilter';

const TODOS_STORAGE_KEY = 'taskflow_todos';

const INITIAL_TODOS = [
  {
    id: '1',
    text: 'Review Agentic AI workflow & implementation plan',
    completed: true,
    priority: 'high',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: '2',
    text: 'Build React components for Login & Todo views',
    completed: true,
    priority: 'medium',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: '3',
    text: 'Professionalize repository structure and README documentation',
    completed: false,
    priority: 'high',
    createdAt: Date.now() - 1800000,
  },
  {
    id: '4',
    text: 'Verify filter states, inline editing, and local storage sync',
    completed: false,
    priority: 'normal',
    createdAt: Date.now() - 600000,
  },
];

export default function TodoPage({ user, onShowToast }) {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(TODOS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse todos from localStorage', e);
    }
    return INITIAL_TODOS;
  });

  const [inputVal, setInputVal] = useState('');
  const [priority, setPriority] = useState('normal');
  const [filter, setFilter] = useState('all');

  // Time-aware greeting state
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: '☀️' };
    if (hour < 18) return { text: 'Good afternoon', icon: '🌤️' };
    return { text: 'Good evening', icon: '🌙' };
  });

  const displayName = useMemo(() => {
    if (!user?.email) return 'Student';
    const namePart = user.email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }, [user]);

  // Save to localStorage whenever todos change
  useEffect(() => {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }
  }, [todos]);

  // Add Todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const newTodo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      priority: priority,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputVal('');
    setPriority('normal');
    onShowToast?.({ message: 'Task added successfully!', type: 'success' });
  };

  // Toggle Todo completion
  const handleToggle = (id) => {
    setTodos(
      todos.map((t) => {
        if (t.id === id) {
          const updatedState = !t.completed;
          if (updatedState) {
            onShowToast?.({ message: 'Task marked as completed! 🎉', type: 'info' });
          }
          return { ...t, completed: updatedState };
        }
        return t;
      })
    );
  };

  // Update Todo Text (Inline Edit)
  const handleUpdateText = (id, newText) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
    onShowToast?.({ message: 'Task updated successfully', type: 'info' });
  };

  // Delete Todo
  const handleDelete = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
    onShowToast?.({ message: 'Task removed', type: 'alert' });
  };

  // Clear all completed todos
  const handleClearCompleted = () => {
    const count = todos.filter((t) => t.completed).length;
    if (count === 0) return;
    setTodos(todos.filter((t) => !t.completed));
    onShowToast?.({ message: `Cleared ${count} completed ${count === 1 ? 'task' : 'tasks'}`, type: 'info' });
  };

  // Filter calculations
  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const counts = {
    all: totalCount,
    active: activeCount,
    completed: completedCount,
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="todo-container">
      {/* Top Welcome / Dashboard Card */}
      <div className="todo-header-card">
        <div>
          <h1 className="greeting-title">
            {greeting.text}, {displayName}! {greeting.icon}
          </h1>
          <p className="greeting-subtitle">
            Organize priorities and track your daily productivity
          </p>
        </div>

        <div className="todo-stats">
          <div className="stat-pill">
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>
              {activeCount}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-pill">
            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              {completedCount}
            </div>
            <div className="stat-label">Done</div>
          </div>
        </div>
      </div>

      {/* Main Todo Card */}
      <div className="todo-main-card">
        {/* Add Input Form */}
        <div className="add-todo-section">
          <form className="todo-form" onSubmit={handleAddTodo}>
            <div className="todo-input-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <input
                id="new-todo-input"
                type="text"
                className="todo-input"
                placeholder="What needs to be done? Press Enter to add..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>

            {/* Priority Selector */}
            <div className="priority-select-wrap">
              <select
                id="task-priority-select"
                className={`priority-select priority-${priority}`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                title="Select Task Priority"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button id="add-todo-btn" type="submit" className="btn-add">
              <span>Add Task</span>
            </button>
          </form>
        </div>

        {/* Filter Navigation & Counter */}
        <TodoFilter
          currentFilter={filter}
          onFilterChange={setFilter}
          counts={counts}
          remainingCount={activeCount}
        />

        {/* Todo List */}
        <ul className="todo-list-container">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdateText={handleUpdateText}
              />
            ))
          ) : (
            <li className="empty-state">
              <div className="empty-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p className="empty-title">
                {filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? 'All tasks completed! You are all caught up.'
                  : 'Your todo list is empty'}
              </p>
              <p className="empty-subtitle">
                {filter === 'all'
                  ? 'Add your first task above to get started.'
                  : 'Switch filters or add new tasks.'}
              </p>
            </li>
          )}
        </ul>

        {/* Footer with Clear Completed */}
        {completedCount > 0 && (
          <div className="todo-footer">
            <button
              id="clear-completed-btn"
              type="button"
              className="btn-clear-completed"
              onClick={handleClearCompleted}
            >
              Clear completed ({completedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
