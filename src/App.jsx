import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import TodoPage from './components/TodoPage';
import Toast from './components/Toast';
import { exportToJSON, exportToCSV } from './utils/exportUtils';

const USER_STORAGE_KEY = 'taskflow_user';
const THEME_STORAGE_KEY = 'taskflow_theme';

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

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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

  const handleExportRequest = useCallback((todos) => {
    currentTodosRef.current = todos;
  }, []);

  const handleExportJSON = () => {
    if (currentTodosRef.current.length === 0) {
      showToast({ message: 'No tasks to export', type: 'alert' });
      return;
    }
    exportToJSON(currentTodosRef.current);
    showToast({ message: 'JSON backup downloaded! 📁', type: 'success' });
  };

  const handleExportCSV = () => {
    if (currentTodosRef.current.length === 0) {
      showToast({ message: 'No tasks to export', type: 'alert' });
      return;
    }
    exportToCSV(currentTodosRef.current);
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
      />

      <main className="main-content">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <TodoPage
            user={user}
            onShowToast={showToast}
            onExportRequest={handleExportRequest}
          />
        )}
      </main>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
