import React from 'react';

export default function Navbar({ user, onLogout }) {
  // Extract initial or demo letter for avatar
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span>TaskFlow</span>
        </div>

        {user && (
          <div className="nav-actions">
            <div className="user-badge" title={`Logged in as ${user.email}`}>
              <div className="user-avatar">{initial}</div>
              <span className="user-email">{user.email}</span>
            </div>

            <button 
              id="logout-btn" 
              className="btn-logout" 
              onClick={onLogout}
              title="Sign out of your account"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
