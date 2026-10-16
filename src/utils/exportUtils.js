/**
 * Data export utilities for TaskFlow (JSON and CSV)
 */

export function exportToJSON(todos) {
  const dataStr = JSON.stringify(todos, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.download = `taskflow_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(todos) {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Completed',
    'Archived',
    'Priority',
    'Category',
    'DueDate',
    'SubtasksCount',
    'CompletedSubtasks',
    'CreatedAt',
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const escaped = String(str).replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = todos.map((t) => {
    const subtasks = t.subtasks || [];
    const completedSubtasks = subtasks.filter((s) => s.completed).length;
    const createdAtStr = new Date(t.createdAt).toISOString();

    return [
      escapeCSV(t.id),
      escapeCSV(t.text || t.title),
      escapeCSV(t.description || ''),
      escapeCSV(t.completed ? 'Yes' : 'No'),
      escapeCSV(t.archived ? 'Yes' : 'No'),
      escapeCSV((t.priority || 'normal').toUpperCase()),
      escapeCSV(t.category || 'General'),
      escapeCSV(t.dueDate || ''),
      escapeCSV(subtasks.length),
      escapeCSV(completedSubtasks),
      escapeCSV(createdAtStr),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];

  const link = document.createElement('a');
  link.href = url;
  link.download = `taskflow_tasks_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
