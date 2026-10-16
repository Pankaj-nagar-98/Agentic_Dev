import React, { useState, useEffect, useMemo, useRef } from 'react';
import TodoItem from './TodoItem';
import TodoFilter from './TodoFilter';
import ProgressBar from './ProgressBar';
import TaskModal from './TaskModal';

const TODOS_STORAGE_KEY = 'taskflow_todos';
const CATEGORIES_STORAGE_KEY = 'taskflow_categories';

const INITIAL_CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance'];

const INITIAL_TODOS = [
  {
    id: '1',
    title: 'Review Agentic AI workflow & architecture documentation',
    text: 'Review Agentic AI workflow & architecture documentation',
    description: 'Ensure prompt engineering, state management, and tool integration align with requirements.',
    completed: true,
    archived: false,
    priority: 'high',
    category: 'Work',
    dueDate: '2026-10-20',
    createdAt: Date.now() - 3600000 * 3,
    subtasks: [
      { id: 'st-1', title: 'Check subagent flow', completed: true },
      { id: 'st-2', title: 'Verify tool declarations', completed: true },
    ],
  },
  {
    id: '2',
    title: 'Build modern TaskFlow React productivity suite',
    text: 'Build modern TaskFlow React productivity suite',
    description: 'Implement dark/light themes, subtasks, search, and CSV/JSON export.',
    completed: true,
    archived: false,
    priority: 'medium',
    category: 'Work',
    dueDate: '2026-10-22',
    createdAt: Date.now() - 3600000 * 2,
    subtasks: [
      { id: 'st-3', title: 'Theme system in CSS', completed: true },
      { id: 'st-4', title: 'Interactive task modal', completed: true },
    ],
  },
  {
    id: '3',
    title: 'Conduct weekly personal productivity and finance review',
    text: 'Conduct weekly personal productivity and finance review',
    description: 'Organize budget expenses and update learning milestones.',
    completed: false,
    archived: false,
    priority: 'low',
    category: 'Personal',
    dueDate: '2026-10-25',
    createdAt: Date.now() - 1800000,
    subtasks: [
      { id: 'st-5', title: 'Review savings account', completed: false },
      { id: 'st-6', title: 'Plan weekend goals', completed: false },
    ],
  },
];

export default function TodoPage({ user, onShowToast, onExportRequest }) {
  // Load Todos
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

  // Load Custom Categories
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CATEGORIES;
  });

  // Filter & Search & Sort states
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Quick task input state
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickCategory, setQuickCategory] = useState('Work');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const quickInputRef = useRef(null);

  // Time-aware greeting
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

  // Persist todos
  useEffect(() => {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos', e);
    }
  }, [todos]);

  // Persist categories
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // N key: focus new task or open modal
      if ((e.key === 'n' || e.key === 'N') && !isInputFocused && !isModalOpen) {
        e.preventDefault();
        quickInputRef.current?.focus();
      }

      // / key: focus search
      if (e.key === '/' && !isInputFocused && !isModalOpen) {
        e.preventDefault();
        document.getElementById('search-tasks-input')?.focus();
      }

      // Escape key: close modal
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setTaskToEdit(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Provide current todos to export handler
  useEffect(() => {
    onExportRequest?.(todos);
  }, [todos, onExportRequest]);

  // Add custom category
  const handleAddCategory = (newCat) => {
    if (!categories.includes(newCat)) {
      setCategories([...categories, newCat]);
      onShowToast?.({ message: `Added category "${newCat}"`, type: 'info' });
    }
  };

  // Quick Add Task
  const handleQuickAdd = (e) => {
    e.preventDefault();
    const trimmed = quickInput.trim();
    if (!trimmed) return;

    const newTask = {
      id: Date.now().toString(),
      title: trimmed,
      text: trimmed,
      description: '',
      completed: false,
      archived: false,
      priority: quickPriority,
      category: quickCategory,
      dueDate: '',
      createdAt: Date.now(),
      subtasks: [],
    };

    setTodos([newTask, ...todos]);
    setQuickInput('');
    onShowToast?.({ message: 'Task added successfully!', type: 'success' });
  };

  // Save Task from Modal (Create or Edit)
  const handleSaveModalTask = (taskData) => {
    if (taskToEdit) {
      // Edit existing
      setTodos(
        todos.map((t) => (t.id === taskToEdit.id ? { ...t, ...taskData } : t))
      );
      onShowToast?.({ message: 'Task updated successfully', type: 'info' });
    } else {
      // Create new
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        completed: false,
        archived: false,
        createdAt: Date.now(),
      };
      setTodos([newTask, ...todos]);
      onShowToast?.({ message: 'New task created!', type: 'success' });
    }
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  // Toggle Completion
  const handleToggle = (id) => {
    setTodos(
      todos.map((t) => {
        if (t.id === id) {
          const updatedState = !t.completed;
          if (updatedState) {
            onShowToast?.({ message: 'Task completed! 🎉', type: 'info' });
          }
          return { ...t, completed: updatedState };
        }
        return t;
      })
    );
  };

  // Toggle Subtask
  const handleToggleSubtask = (taskId, subtaskId) => {
    setTodos(
      todos.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  // Archive / Restore Task
  const handleArchive = (id) => {
    setTodos(
      todos.map((t) => {
        if (t.id === id) {
          const newArchived = !t.archived;
          onShowToast?.({
            message: newArchived ? 'Task archived' : 'Task restored to list',
            type: 'info',
          });
          return { ...t, archived: newArchived };
        }
        return t;
      })
    );
  };

  // Delete Task permanently
  const handleDelete = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
    onShowToast?.({ message: 'Task permanently deleted', type: 'alert' });
  };

  // Clear completed (only active/completed list, not archived)
  const handleClearCompleted = () => {
    const count = todos.filter((t) => t.completed && !t.archived).length;
    if (count === 0) return;
    setTodos(todos.filter((t) => !(t.completed && !t.archived)));
    onShowToast?.({
      message: `Cleared ${count} completed ${count === 1 ? 'task' : 'tasks'}`,
      type: 'info',
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Filter & Search & Sort Calculations
  const nonArchivedTodos = useMemo(() => todos.filter((t) => !t.archived), [todos]);
  const archivedTodos = useMemo(() => todos.filter((t) => t.archived), [todos]);

  const totalActiveUnarchived = nonArchivedTodos.filter((t) => !t.completed).length;
  const totalCompletedUnarchived = nonArchivedTodos.filter((t) => t.completed).length;

  const counts = {
    all: nonArchivedTodos.length,
    active: totalActiveUnarchived,
    completed: totalCompletedUnarchived,
    archived: archivedTodos.length,
  };

  // Filtered & Sorted task list
  const filteredAndSortedTodos = useMemo(() => {
    // 1. Status Filter
    let list = todos;
    if (filter === 'archived') {
      list = todos.filter((t) => t.archived);
    } else if (filter === 'active') {
      list = todos.filter((t) => !t.archived && !t.completed);
    } else if (filter === 'completed') {
      list = todos.filter((t) => !t.archived && t.completed);
    } else {
      // 'all'
      list = todos.filter((t) => !t.archived);
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const titleMatch = (t.text || t.title || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch;
      });
    }

    // 4. Sorting
    const sorted = [...list];
    if (sortBy === 'created_desc') {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'created_asc') {
      sorted.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'priority_desc') {
      const rank = { high: 3, medium: 2, low: 1, normal: 2 };
      sorted.sort((a, b) => (rank[b.priority] || 2) - (rank[a.priority] || 2));
    } else if (sortBy === 'due_date_asc') {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }

    return sorted;
  }, [todos, filter, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="todo-container">
      {/* Top Welcome / Dashboard Card */}
      <div className="todo-header-card">
        <div className="header-greeting-col">
          <h1 className="greeting-title">
            {greeting.text}, {displayName}! {greeting.icon}
          </h1>
          <p className="greeting-subtitle">
            Manage projects, due dates, priority levels, and subtasks
          </p>
        </div>

        <div className="todo-header-actions">
          <button
            type="button"
            className="btn-create-modal-trigger"
            onClick={handleOpenCreateModal}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Detailed Task</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Component */}
      <ProgressBar
        total={nonArchivedTodos.length}
        completed={totalCompletedUnarchived}
      />

      {/* Main Todo Card */}
      <div className="todo-main-card">
        {/* Quick Add Bar */}
        <div className="add-todo-section">
          <form className="todo-form" onSubmit={handleQuickAdd}>
            <div className="todo-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <input
                ref={quickInputRef}
                id="new-todo-input"
                type="text"
                className="todo-input"
                placeholder="Quick add task... (Press 'N' anywhere to focus)"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
              />
            </div>

            {/* Quick Priority */}
            <div className="priority-select-wrap">
              <select
                className={`priority-select priority-${quickPriority}`}
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value)}
                title="Select Task Priority"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Quick Category */}
            <div className="priority-select-wrap">
              <select
                className="category-quick-select"
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                title="Select Category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button id="add-todo-btn" type="submit" className="btn-add">
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Filter Navigation, Search, Sort & Categories */}
        <TodoFilter
          currentFilter={filter}
          onFilterChange={setFilter}
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          availableCategories={categories}
          remainingCount={totalActiveUnarchived}
        />

        {/* Todo List */}
        <ul className="todo-list-container">
          {filteredAndSortedTodos.length > 0 ? (
            filteredAndSortedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
                onArchive={handleArchive}
                onToggleSubtask={handleToggleSubtask}
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
                {searchQuery
                  ? `No tasks matching "${searchQuery}"`
                  : filter === 'archived'
                  ? 'No archived tasks'
                  : filter === 'completed'
                  ? 'No completed tasks yet'
                  : filter === 'active'
                  ? 'All tasks completed! You are all caught up.'
                  : 'Your task list is empty'}
              </p>
              <p className="empty-subtitle">
                {searchQuery
                  ? 'Try clearing your search keyword or switching categories.'
                  : filter === 'all'
                  ? 'Add your first task above or press N.'
                  : 'Switch filter tabs or create new tasks.'}
              </p>
            </li>
          )}
        </ul>

        {/* Footer with Clear Completed */}
        {totalCompletedUnarchived > 0 && filter !== 'archived' && (
          <div className="todo-footer">
            <button
              id="clear-completed-btn"
              type="button"
              className="btn-clear-completed"
              onClick={handleClearCompleted}
            >
              Clear completed ({totalCompletedUnarchived})
            </button>
          </div>
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      {isModalOpen && (
        <TaskModal
          key={taskToEdit ? taskToEdit.id : 'new-task'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveModalTask}
          taskToEdit={taskToEdit}
          availableCategories={categories}
          onAddCategory={handleAddCategory}
        />
      )}
    </div>
  );
}
