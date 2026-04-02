import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskCheckbox from './TaskCheckbox';
import { USER_COLORS, USER_NAMES, API_BASE_URL } from '../utils/constants';
import { getTodayUserTasks } from '../utils/routineGenerator';
import { getSchoolAlert } from '../utils/schoolHelper';
import { formatTime } from '../utils/dateHelpers';
import { useAccessibility } from '../App';

export default function UserCard({ userId, users, routines, tasks, onTaskComplete, compact }) {
  const user = users[userId];
  const { isHighContrast } = useAccessibility();
  const color = USER_COLORS[userId] || '#6B7280';
  const name = USER_NAMES[userId] || userId;

  const todayTasks = getTodayUserTasks(routines || [], tasks || [], userId, new Date());
  const completed = todayTasks.filter((t) => t.completed).length;
  const total = todayTasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // School alerts for Phawu
  const alerts = user?.role === 'student' ? getSchoolAlert(userId, new Date(), users) : [];

  if (!user) return null;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${compact ? '' : 'mb-3'}`}
      style={{ borderLeftColor: color }}
      aria-label={`${name}'s tasks for today`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            {name[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{name}</h3>
            <span className="text-xs text-gray-400 capitalize">{user.role}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="text-right">
          <div
            className="text-xl font-bold"
            style={{ color }}
            aria-label={`${completed} of ${total} tasks complete`}
          >
            {completed}/{total}
          </div>
          <div className="text-xs text-gray-400">
            {pct}% done
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div
          className="w-full bg-gray-100 rounded-full h-2 mb-3"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of tasks completed`}
        >
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      )}

      {/* School alerts */}
      {alerts.length > 0 && (
        <div className="mb-3 space-y-1">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${
                alert.type === 'exam' ? 'bg-red-50 text-red-600' :
                alert.type === 'sports' ? 'bg-blue-50 text-blue-600' :
                'bg-yellow-50 text-yellow-700'
              }`}
            >
              <span>{alert.type === 'exam' ? '📝' : alert.type === 'sports' ? '⚽' : 'ℹ️'}</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tasks */}
      {compact ? (
        <div className="text-sm text-gray-600">
          {total === 0 ? (
            <p className="italic text-gray-400">No tasks today</p>
          ) : pct === 100 ? (
            <p className="text-green-600 font-medium">All tasks done! 🎉</p>
          ) : (
            <p>{total - completed} task{total - completed !== 1 ? 's' : ''} remaining</p>
          )}
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {todayTasks.length === 0 ? (
            <li className="text-gray-400 text-sm italic text-center py-2">No tasks for today</li>
          ) : (
            todayTasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  task.completed ? 'bg-green-50 opacity-70' : 'bg-gray-50'
                }`}
              >
                <TaskCheckbox task={task} onComplete={onTaskComplete} />
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                  >
                    {task.title}
                  </span>
                  {task.timeSlot && (
                    <div className="text-xs text-gray-400">{task.timeSlot}</div>
                  )}
                  {task.estimatedMinutes && (
                    <div className="text-xs text-gray-400">{task.estimatedMinutes} min</div>
                  )}
                </div>
                {task.completed && (
                  <span className="text-green-500 text-sm flex-shrink-0" aria-hidden="true">✓</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Streaks (for Phawu) */}
      {user.streaks && Object.keys(user.streaks).length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {Object.entries(user.streaks).map(([key, count]) => (
            count > 0 ? (
              <span
                key={key}
                className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 font-medium"
              >
                🔥 {count}d {key} streak
              </span>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}
