import React from 'react';
import { formatRelativeTime } from '../utils/dateHelpers';

const STATUS_CONFIG = {
  idle: { color: 'text-gray-400', dot: 'bg-gray-300', label: 'Ready' },
  syncing: { color: 'text-blue-500', dot: 'bg-blue-400', label: 'Syncing...', animate: true },
  synced: { color: 'text-green-500', dot: 'bg-green-400', label: 'Synced' },
  error: { color: 'text-red-500', dot: 'bg-red-400', label: 'Sync error' },
  offline: { color: 'text-orange-500', dot: 'bg-orange-400', label: 'Offline' }
};

export default function SyncIndicator({ status, lastSync, onSync }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <button
      onClick={onSync}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border touch-target ${config.color}`}
      title={`Sync status: ${config.label}${lastSync ? ` | Last sync: ${formatRelativeTime(lastSync)}` : ''}`}
      aria-label={`Sync status: ${config.label}. Click to sync now.`}
    >
      <span
        className={`w-2 h-2 rounded-full ${config.dot} ${config.animate ? 'animate-pulse' : ''}`}
      />
      <span className="hidden sm:inline font-medium">{config.label}</span>
    </button>
  );
}
