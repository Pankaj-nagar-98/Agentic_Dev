import React, { useState } from 'react';

export default function Navbar({
  user,
  onLogout,
  theme,
  onToggleTheme,
  onExportJSON,
  onExportCSV,
  activeView = 'tasks',
  onSelectView,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
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
        {/* Brand */}
        <div className="brand-group">
          <div className="brand" onClick={() => onSelectView?.('tasks')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span>TaskFlow</span>
          </div>
          <span className="version-tag">v2.0</span>
        </div>

        {/* View Switcher Tabs (Only if logged in) */}
        {user && onSelectView && (
          <nav className="nav-view-switcher" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-view-btn ${activeView === 'tasks' ? 'active' : ''}`}
              onClick={() => onSelectView('tasks')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>Tasks</span>
            </button>
            <button
              type="button"
              className={`nav-view-btn ${activeView === 'daily' ? 'active' : ''}`}
              onClick={() => onSelectView('daily')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Routines</span>
            </button>
            <button
              type="button"
              className={`nav-view-btn ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => onSelectView('analytics')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span>Analytics</span>
              <span className="nav-tab-badge">PRO</span>
            </button>
          </nav>
        )}

        {/* Actions & Utilities */}
        <div className="nav-actions">
          {/* Calendar Date Badge */}
          <div className="nav-date-badge" title="Today's Date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{todayDate}</span>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Export Menu (Only if logged in) */}
          {user && (
            <div className="export-dropdown-wrapper">
              <button
                type="button"
                className="btn-nav-export"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Export Data"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="export-menu-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      onExportJSON();
                      setShowExportMenu(false);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Export JSON Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportCSV();
                      setShowExportMenu(false);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="8" y1="13" x2="16" y2="13"/>
                      <line x1="8" y1="17" x2="16" y2="17"/>
                    </svg>
                    <span>Export CSV Spreadsheet</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User profile & Logout */}
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
