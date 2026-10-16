import React, { useState, useMemo } from 'react';
import DayPickerHeader from './repetitive/DayPickerHeader';
import RepetitiveTaskCard from './repetitive/RepetitiveTaskCard';
import RepetitiveTaskModal from './repetitive/RepetitiveTaskModal';
import {
  getTodayDateKey,
  isGoalMet,
  calculateTaskAdherence,
} from '../utils/repetitiveUtils';

/**
 * RepetitiveDashboard Component
 * Container view managing daily repetitive tasks (habits/routines) and date-specific execution logs.
 */
export default function RepetitiveDashboard({
  tasks = [],
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateLog,
  categories = ['Health', 'Work', 'Study', 'Personal', 'Finance'],
  onAddCategory,
  onBackToTasks,
  onShowToast,
}) {
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateKey());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Filter tasks by category
  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return tasks;
    return tasks.filter((t) => t.category === selectedCategory);
  }, [tasks, selectedCategory]);

  // Daily Scorecard for selected date
  const dailySummary = useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    tasks.forEach((t) => {
      const entry = (t.history || {})[selectedDate];
      if (isGoalMet(t, entry)) {
        completed += 1;
      }
    });

    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Overall 7-day adherence across all routines
    const overallAdherenceList = tasks.map((t) => calculateTaskAdherence(t, 7, selectedDate).percentage);
    const avgAdherence = overallAdherenceList.length > 0
      ? Math.round(overallAdherenceList.reduce((a, b) => a + b, 0) / overallAdherenceList.length)
      : 0;

    return {
      total,
      completed,
      completionPercent,
      avgAdherence,
    };
  }, [tasks, selectedDate]);

  // Handlers for modal
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveModal = (formData) => {
    if (taskToEdit) {
      onUpdateTask(taskToEdit.id, formData);
      onShowToast?.({ message: 'Routine updated successfully', type: 'info' });
    } else {
      const newTask = {
        ...formData,
        id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
        history: {},
      };
      onAddTask(newTask);
      onShowToast?.({ message: 'New routine task added! ✨', type: 'success' });
    }
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleDelete = (id) => {
    onDeleteTask(id);
    setIsModalOpen(false);
    setTaskToEdit(null);
    onShowToast?.({ message: 'Routine removed', type: 'alert' });
  };

  return (
    <div className="repetitive-dashboard-page">
      {/* Top Header */}
      <div className="repetitive-top-header">
        <div className="header-breadcrumbs">
          <button
            type="button"
            className="btn-back-tasks"
            onClick={onBackToTasks}
            title="Return to Tasks list"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back to Tasks</span>
          </button>
          <div className="rep-title-box">
            <h1 className="rep-main-heading">Daily Repetitive Tasks & Routines</h1>
            <span className="rep-sub-heading">Track habits, time goals, and daily consistency matrix</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-create-routine-trigger"
          onClick={handleOpenCreateModal}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Routine Task</span>
        </button>
      </div>

      {/* Global Day Picker Navigation */}
      <DayPickerHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Daily Progress & Adherence Scorecard */}
      <div className="rep-scorecard-bar">
        <div className="scorecard-metric">
          <span className="scorecard-label">Daily Goal Completion</span>
          <div className="scorecard-val-row">
            <span className="scorecard-big-num">
              {dailySummary.completed} / {dailySummary.total}
            </span>
            <span className="scorecard-sub-num">({dailySummary.completionPercent}%)</span>
          </div>
          <div className="scorecard-progress-track">
            <div
              className="scorecard-progress-fill"
              style={{ width: `${dailySummary.completionPercent}%` }}
            />
          </div>
        </div>

        <div className="scorecard-metric adherence-metric">
          <span className="scorecard-label">7-Day Consistency Matrix</span>
          <div className="scorecard-val-row">
            <span className="scorecard-big-num">{dailySummary.avgAdherence}%</span>
            <span className="scorecard-sub-num">Avg Adherence</span>
          </div>
          <span className="scorecard-meta-text">Target compliance over rolling week</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="rep-category-filter-bar">
        <button
          type="button"
          className={`category-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Routines ({tasks.length})
        </button>
        {categories.map((cat) => {
          const count = tasks.filter((t) => t.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="rep-empty-card">
          <div className="rep-empty-icon">🌱</div>
          <h3 className="rep-empty-title">
            {selectedCategory === 'all'
              ? 'No repetitive tasks configured yet'
              : `No routines under category "${selectedCategory}"`}
          </h3>
          <p className="rep-empty-subtitle">
            Create recurring daily habits such as hydration, reading, or exercise drills to build unstoppable momentum.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenCreateModal}
          >
            Create Your First Routine
          </button>
        </div>
      ) : (
        <div className="rep-cards-grid">
          {filteredTasks.map((task) => (
            <RepetitiveTaskCard
              key={task.id}
              task={task}
              selectedDate={selectedDate}
              onUpdateLog={onUpdateLog}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <RepetitiveTaskModal
          key={taskToEdit ? taskToEdit.id : 'new-rep-task'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveModal}
          onDelete={handleDelete}
          taskToEdit={taskToEdit}
          availableCategories={categories}
          onAddCategory={onAddCategory}
        />
      )}
    </div>
  );
}
