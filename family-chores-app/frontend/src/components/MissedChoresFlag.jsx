import React from 'react';
import { formatRelativeTime } from '../utils/dateHelpers';
import { USER_NAMES, USER_COLORS } from '../utils/constants';

export default function MissedChoresFlag({ missedTasks, onDismiss }) {
  if (!missedTasks || missedTasks.length === 0) return null;

  // Group by user
  const byUser = {};
  missedTasks.forEach((task) => {
    const userId = task.assignedTo || 'unassigned';
    if (!byUser[userId]) byUser[userId] = [];
    byUser[userId].push(task);
  });

  return (
    <div
      className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4 animate-fade-in"
      role="alert"
      aria-live="polite"
      aria-label={`${missedTasks.length} overdue task${missedTasks.length === 1 ? '' : 's'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <div>
            <h3 className="font-bold text-red-700 text-lg">
              {missedTasks.length} Overdue {missedTasks.length === 1 ? 'Task' : 'Tasks'}
            </h3>
            <p className="text-red-600 text-sm">These tasks were not completed on time</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 touch-target p-1"
            aria-label="Dismiss overdue tasks alert"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {Object.entries(byUser).map(([userId, tasks]) => {
          const color = USER_COLORS[userId] || '#EF4444';
          const name = USER_NAMES[userId] || userId;
          return (
            <div key={userId} className="bg-white rounded-lg p-3 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-gray-800">{name}</span>
                <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded-full">
                  {tasks.length} overdue
                </span>
              </div>
              <ul className="space-y-1">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{task.title}</span>
                    <span className="text-red-500 text-xs">
                      {task.dueDate ? formatRelativeTime(task.dueDate) : 'No date'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-red-500 mt-2 font-medium">
        Please complete or reschedule these tasks
      </p>
    </div>
  );
}
