import React from 'react';
import { formatDate } from '../utils/dateHelpers';
import { USERS } from '../utils/constants';
import UserCard from './UserCard';
import RotationTracker from './RotationTracker';
import MissedChoresFlag from './MissedChoresFlag';
import { useAccessibility } from '../App';

export default function Dashboard({ currentUser, users, tasks, routines, onTaskComplete }) {
  const { isHighContrast, fontSize } = useAccessibility();
  const today = new Date();
  const dateStr = formatDate(today);

  // Calculate overall family stats
  const allTasks = tasks || [];
  const todayTasks = allTasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).toDateString() === today.toDateString();
  });

  const completedToday = todayTasks.filter((t) => t.completed).length;
  const completionPct = todayTasks.length > 0
    ? Math.round((completedToday / todayTasks.length) * 100)
    : 0;

  // Get missed tasks
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const missed = allTasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < todayStart
  );

  // Show only the current user's card expanded, others compact
  const usersToShow = currentUser
    ? [currentUser, ...USERS.filter((u) => u !== currentUser)]
    : USERS;

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div
        className="bg-white rounded-xl p-4 shadow-sm"
        role="banner"
      >
        <h1
          className="font-bold text-gray-800 text-xl"
          style={{ fontSize: fontSize === '18px' ? '22px' : fontSize === '20px' ? '24px' : '20px' }}
        >
          {dateStr}
        </h1>
        {todayTasks.length > 0 && (
          <div className="mt-2 flex items-center gap-3">
            <div
              className="flex-1 bg-gray-100 rounded-full h-3"
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Family progress: ${completionPct}%`}
            >
              <div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600 flex-shrink-0">
              {completedToday}/{todayTasks.length}
            </span>
          </div>
        )}
        {completionPct === 100 && todayTasks.length > 0 && (
          <p className="text-green-600 font-bold mt-2 text-center animate-bounce">
            🎉 All family tasks complete today!
          </p>
        )}
      </div>

      {/* Missed chores alert */}
      {missed.length > 0 && (
        <MissedChoresFlag missedTasks={missed} />
      )}

      {/* Rotation Tracker */}
      <RotationTracker currentUser={currentUser} />

      {/* User Cards */}
      <section aria-label="Family task cards">
        <h2 className="sr-only">Family members' tasks</h2>
        <div className="space-y-3">
          {usersToShow.map((userId) => (
            <UserCard
              key={userId}
              userId={userId}
              users={users || {}}
              routines={routines || []}
              tasks={tasks || []}
              onTaskComplete={onTaskComplete}
              compact={userId !== currentUser}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
