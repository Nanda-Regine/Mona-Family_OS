import React, { useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { useChores } from '../hooks/useChores';
import { formatDate } from '../utils/dateHelpers';

export default function TodayView({ currentUser }) {
  const { tasks, routines, users, loading, error, loadState, completeTask } = useChores();

  useEffect(() => {
    loadState();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !tasks.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="font-bold text-gray-700 mb-2">Could not connect to server</h2>
        <p className="text-sm text-gray-500 mb-4">
          Working in offline mode. Data will sync when connected.
        </p>
        <button
          onClick={loadState}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-touch"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <Dashboard
      currentUser={currentUser}
      users={users}
      tasks={tasks}
      routines={routines}
      onTaskComplete={completeTask}
    />
  );
}
