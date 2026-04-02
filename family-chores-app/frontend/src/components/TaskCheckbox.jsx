import React, { useState } from 'react';
import { useAccessibility } from '../App';
import { speak } from '../utils/accessibilityConfig';

export default function TaskCheckbox({ task, onComplete, disabled }) {
  const [animating, setAnimating] = useState(false);
  const { user } = useAccessibility();

  async function handleComplete() {
    if (task.completed || disabled || animating) return;

    setAnimating(true);

    // Voice feedback if enabled
    if (user?.accessibility?.voiceEnabled) {
      speak(`${task.title} completed!`);
    }

    try {
      await onComplete(task.id);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }

    setTimeout(() => setAnimating(false), 600);
  }

  const sizeClass = user?.accessibility?.largeButtons
    ? 'w-8 h-8 text-xl'
    : 'w-6 h-6 text-base';

  return (
    <button
      onClick={handleComplete}
      disabled={task.completed || disabled}
      className={`
        flex items-center justify-center rounded-full border-2 transition-all
        min-w-touch min-h-touch touch-target
        ${task.completed
          ? 'bg-green-500 border-green-500 text-white'
          : 'border-gray-300 hover:border-green-400 hover:bg-green-50 active:scale-95'
        }
        ${animating ? 'scale-125' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={task.completed ? `${task.title} - completed` : `Mark "${task.title}" as complete`}
      aria-checked={task.completed}
      role="checkbox"
    >
      {task.completed && (
        <span
          className={`${sizeClass} ${animating ? 'animate-bounce' : ''}`}
          aria-hidden="true"
        >
          ✓
        </span>
      )}
    </button>
  );
}
