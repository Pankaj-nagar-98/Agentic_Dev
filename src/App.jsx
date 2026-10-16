import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import TodoPage from './components/TodoPage';
import { TODOS_STORAGE_KEY, INITIAL_TODOS } from './utils/todoConstants';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import RepetitiveDashboard from './components/RepetitiveDashboard';
import Toast from './components/Toast';
import { exportToJSON, exportToCSV } from './utils/exportUtils';
import { SESSIONS_STORAGE_KEY } from './utils/analyticsUtils';
import {
  REPETITIVE_STORAGE_KEY,
  INITIAL_REPETITIVE_TASKS,
} from './utils/repetitiveUtils';

const USER_STORAGE_KEY = 'taskflow_user';
const THEME_STORAGE_KEY = 'taskflow_theme';

const ONE_HOUR = 3600000;
const ONE_DAY = 86400000;

const INITIAL_DEMO_SESSIONS = [
  {
    id: 'sess_1',
    taskId: '1',
    taskTitle: 'Review Agentic AI workflow & architecture documentation',
    category: 'Work',
    startTime: Date.now() - ONE_DAY * 1 - ONE_HOUR * 3,
    endTime: Date.now() - ONE_DAY * 1 - ONE_HOUR * 2.5,
    durationSeconds: 1800,
    type: 'pomodoro',
    completedCycle: true,
  },
  {
    id: 'sess_2',
    taskId: '2',
    taskTitle: 'Build modern TaskFlow React productivity suite',
    category: 'Work',
    startTime: Date.now() - ONE_DAY * 2 - ONE_HOUR * 5,
    endTime: Date.now() - ONE_DAY * 2 - ONE_HOUR * 4.25,
    durationSeconds: 2700,
    type: 'pomodoro',
    completedCycle: true,
  },
  {
    id: 'sess_3',
    taskId: '3',
    taskTitle: 'Conduct weekly personal productivity and finance review',
    category: 'Personal',
    startTime: Date.now() - ONE_DAY * 3 - ONE_HOUR * 2,
    endTime: Date.now() - ONE_DAY * 3 - ONE_HOUR * 1.5,
    durationSeconds: 1800,
    type: 'pomodoro',
    completedCycle: true,
  },
  {
    id: 'sess_4',
    taskId: '2',
    taskTitle: 'Build modern TaskFlow React productivity suite',
    category: 'Work',
    startTime: Date.now() - ONE_HOUR * 2,
    endTime: Date.now() - ONE_HOUR * 1.5,
    durationSeconds: 1800,
    type: 'stopwatch',
    completedCycle: false,
  },
  {
    id: 'sess_5',
    taskId: '4',
    taskTitle: 'Study React 19 concurrent features & server components',
    category: 'Study',
    startTime: Date.now() - ONE_DAY * 4 - ONE_HOUR * 4,
    endTime: Date.now() - ONE_DAY * 4 - ONE_HOUR * 3.33,
    durationSeconds: 2400,
    type: 'pomodoro',
    completedCycle: true,
  },
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return savedTheme === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to document element and body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  // View state: 'tasks' | 'daily' | 'analytics'
  const [activeView, setActiveView] = useState('tasks');

  // Shared Todos state
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(TODOS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load todos from localStorage', e);
    }
    return INITIAL_TODOS;
  });

  // Save todos to localStorage on mutation
  useEffect(() => {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to persist todos', e);
    }
  }, [todos]);

  // Shared Focus Sessions state
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
    }
    return INITIAL_DEMO_SESSIONS;
  });

  // Save sessions to localStorage on mutation
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to persist focus sessions', e);
    }
  }, [sessions]);

  // Repetitive Tasks state
  const [repetitiveTasks, setRepetitiveTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(REPETITIVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load repetitive tasks', e);
    }
    return INITIAL_REPETITIVE_TASKS;
  });

  // Save repetitive tasks on mutation
  useEffect(() => {
    try {
      localStorage.setItem(REPETITIVE_STORAGE_KEY, JSON.stringify(repetitiveTasks));
    } catch (e) {
      console.error('Failed to persist repetitive tasks', e);
    }
  }, [repetitiveTasks]);

  // Repetitive Task Handlers
  const handleAddRepetitiveTask = useCallback((newTask) => {
    setRepetitiveTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleUpdateRepetitiveTask = useCallback((taskId, updates) => {
    setRepetitiveTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const handleDeleteRepetitiveTask = useCallback((taskId) => {
    setRepetitiveTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handleUpdateRepetitiveLog = useCallback((taskId, dateKey, logEntry) => {
    setRepetitiveTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedHistory = {
            ...(t.history || {}),
            [dateKey]: {
              ...((t.history || {})[dateKey] || {}),
              ...logEntry,
            },
          };
          return { ...t, history: updatedHistory };
        }
        return t;
      })
    );
  }, []);

  // Handle saving new focus session
  const handleSaveSession = useCallback((newSession) => {
    setSessions((prev) => [newSession, ...prev]);
  }, []);

  // Handle updating a task's analytics / focus fields
  const handleUpdateTask = useCallback((taskId, updates) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ message, type = 'info' }) => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
    showToast({ message: `Welcome, ${userData.name || userData.email}! 👋`, type: 'success' });
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove user from localStorage', e);
    }
    showToast({ message: 'Signed out successfully', type: 'info' });
  };

  // Export handlers
  const currentTodosRef = useRef([]);

  const handleExportRequest = useCallback((currentList) => {
    currentTodosRef.current = currentList;
  }, []);

  const handleExportJSON = () => {
    if (todos.length === 0) {
      showToast({ message: 'No tasks to export', type: 'alert' });
      return;
    }
    exportToJSON(todos);
    showToast({ message: 'JSON backup downloaded! 📁', type: 'success' });
  };

  const handleExportCSV = () => {
    if (todos.length === 0) {
      showToast({ message: 'No tasks to export', type: 'alert' });
      return;
    }
    exportToCSV(todos);
    showToast({ message: 'CSV spreadsheet downloaded! 📊', type: 'success' });
  };

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      <main className="main-content">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : activeView === 'analytics' ? (
          <AnalyticsDashboard
            tasks={todos}
            sessions={sessions}
            onUpdateTask={handleUpdateTask}
            onSaveSession={handleSaveSession}
            onBackToTasks={() => setActiveView('tasks')}
            onShowToast={showToast}
          />
        ) : activeView === 'daily' ? (
          <RepetitiveDashboard
            tasks={repetitiveTasks}
            onAddTask={handleAddRepetitiveTask}
            onUpdateTask={handleUpdateRepetitiveTask}
            onDeleteTask={handleDeleteRepetitiveTask}
            onUpdateLog={handleUpdateRepetitiveLog}
            onBackToTasks={() => setActiveView('tasks')}
            onShowToast={showToast}
          />
        ) : (
          <TodoPage
            user={user}
            onShowToast={showToast}
            onExportRequest={handleExportRequest}
            todos={todos}
            setTodos={setTodos}
            onSaveSession={handleSaveSession}
            onNavigateToAnalytics={() => setActiveView('analytics')}
          />
        )}
      </main>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
