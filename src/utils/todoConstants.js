/**
 * todoConstants.js
 * Shared initial constants and storage keys for TaskFlow.
 */

export const TODOS_STORAGE_KEY = 'taskflow_todos';
export const CATEGORIES_STORAGE_KEY = 'taskflow_categories';

export const INITIAL_CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance'];

export const INITIAL_TODOS = [
  {
    id: '1',
    title: 'Review Agentic AI workflow & architecture documentation',
    text: 'Review Agentic AI workflow & architecture documentation',
    description: 'Ensure prompt engineering, state management, and tool integration align with requirements.',
    completed: true,
    completedAt: Date.now() - 3600000 * 2,
    archived: false,
    priority: 'high',
    category: 'Work',
    dueDate: '2026-10-20',
    createdAt: Date.now() - 86400000 * 2,
    totalFocusSeconds: 3000,
    pomodoroCount: 2,
    status: 'completed',
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
    completedAt: Date.now() - 3600000 * 4,
    archived: false,
    priority: 'medium',
    category: 'Work',
    dueDate: '2026-10-22',
    createdAt: Date.now() - 86400000 * 1,
    totalFocusSeconds: 4500,
    pomodoroCount: 3,
    status: 'completed',
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
    completedAt: null,
    archived: false,
    priority: 'low',
    category: 'Personal',
    dueDate: '2026-10-25',
    createdAt: Date.now() - 86400000 * 3,
    totalFocusSeconds: 1200,
    pomodoroCount: 0,
    status: 'todo',
    subtasks: [
      { id: 'st-5', title: 'Review savings account', completed: false },
      { id: 'st-6', title: 'Plan weekend goals', completed: false },
    ],
  },
  {
    id: '4',
    title: 'Study React 19 concurrent features & server components',
    text: 'Study React 19 concurrent features & server components',
    description: 'Deep dive into useActionState, useOptimistic, and zero-dependency SVG patterns.',
    completed: true,
    completedAt: Date.now() - 86400000 * 1 - 3600000 * 1,
    archived: false,
    priority: 'high',
    category: 'Study',
    dueDate: '2026-10-21',
    createdAt: Date.now() - 86400000 * 4,
    totalFocusSeconds: 2400,
    pomodoroCount: 2,
    status: 'completed',
    subtasks: [],
  },
];
