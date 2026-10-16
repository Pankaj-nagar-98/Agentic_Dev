import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import TodoPage from './components/TodoPage';

const USER_STORAGE_KEY = 'taskflow_user';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove user from localStorage', e);
    }
  };

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-content">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <TodoPage user={user} />
        )}
      </main>
    </div>
  );
}
