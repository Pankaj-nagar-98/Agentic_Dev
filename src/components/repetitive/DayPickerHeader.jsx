import React, { useRef } from 'react';
import {
  formatDateKeyDisplay,
  getPreviousDateKey,
  getNextDateKey,
  getTodayDateKey,
} from '../../utils/repetitiveUtils';

/**
 * DayPickerHeader Component
 * Global day navigation selector with previous/next buttons, calendar picker, and 'Today' shortcut.
 */
export default function DayPickerHeader({
  selectedDate,
  onSelectDate,
}) {
  const dateInputRef = useRef(null);
  const todayKey = getTodayDateKey();
  const dateDisplay = formatDateKeyDisplay(selectedDate);
  const isToday = selectedDate === todayKey;

  const handlePrevDay = () => {
    onSelectDate(getPreviousDateKey(selectedDate));
  };

  const handleNextDay = () => {
    onSelectDate(getNextDateKey(selectedDate));
  };

  const handleJumpToday = () => {
    onSelectDate(todayKey);
  };

  return (
    <div className="day-picker-panel">
      <div className="day-picker-nav-group">
        {/* Previous Day */}
        <button
          type="button"
          className="btn-date-nav btn-prev-day"
          onClick={handlePrevDay}
          title="Previous day"
          aria-label="Previous day"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Date Display Card with Hidden Native Date Picker */}
        <div
          className={`date-display-trigger ${isToday ? 'current-day' : 'past-day'}`}
          onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
          title="Click to pick specific date"
        >
          <div className="date-icon-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <div className="date-text-col">
            <span className="date-main-text">{dateDisplay.main}</span>
            <span className="date-sub-text">{dateDisplay.sub}</span>
          </div>

          {/* Hidden native date picker input */}
          <input
            ref={dateInputRef}
            type="date"
            className="hidden-native-date-input"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                onSelectDate(e.target.value);
              }
            }}
          />
        </div>

        {/* Next Day */}
        <button
          type="button"
          className="btn-date-nav btn-next-day"
          onClick={handleNextDay}
          title="Next day"
          aria-label="Next day"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Jump to Today Button */}
      {!isToday && (
        <button
          type="button"
          className="btn-jump-today"
          onClick={handleJumpToday}
          title="Return to Today"
        >
          <span className="today-badge-dot" />
          <span>Jump to Today</span>
        </button>
      )}
    </div>
  );
}
