import React, { useState } from 'react';

export default function Navbar({ user, onLogout }) {
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const [todayDate] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  );

  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="brand-group">
          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span>TaskFlow</span>
          </div>
          <span className="version-tag">v1.0.0</span>
        </div>

        <div className="nav-actions">
          <div className="nav-date-badge" title="Today's Date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{todayDate}</span>
          </div>

          {user && (
            <>
              <div className="user-badge" title={`Signed in as ${user.email}`}>
                <div className="user-avatar">{initial}</div>
                <span className="user-email">{user.email}</span>
              </div>

              <button 
                id="logout-btn" 
                className="btn-logout" 
                onClick={onLogout}
                title="Sign out of your account"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
