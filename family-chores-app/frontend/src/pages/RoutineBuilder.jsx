import React, { useState, useEffect } from 'react';
import { useChores } from '../hooks/useChores';
import { USERS, USER_NAMES, USER_COLORS, DAY_NAMES } from '../utils/constants';
import { isRoutineActiveToday } from '../utils/routineGenerator';
import { formatRelativeTime } from '../utils/dateHelpers';

const RECURRENCE_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays only' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'weekly', label: 'Specific days' },
  { value: 'custom', label: 'Custom days' }
];

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (6-12)' },
  { value: 'afternoon', label: 'Afternoon (12-17)' },
  { value: 'evening', label: 'Evening (17-21)' },
  { value: 'anytime', label: 'Any time' }
];

const initialForm = {
  title: '',
  assignedTo: '',
  recurrence: 'daily',
  days: [],
  timeSlot: 'anytime',
  category: 'general',
  estimatedMinutes: 15,
  active: true
};

export default function RoutineBuilder({ currentUser }) {
  const { routines, loading, addRoutine, updateRoutine, deleteRoutine } = useChores();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateRoutine(editingId, form);
      } else {
        await addRoutine(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
    } catch (err) {
      console.error('Failed to save routine:', err);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(routine) {
    setForm({
      title: routine.title,
      assignedTo: routine.assignedTo || '',
      recurrence: routine.recurrence || 'daily',
      days: routine.days || [],
      timeSlot: routine.timeSlot || 'anytime',
      category: routine.category || 'general',
      estimatedMinutes: routine.estimatedMinutes || 15,
      active: routine.active !== false
    });
    setEditingId(routine.id);
    setShowForm(true);
  }

  function toggleDay(day) {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day]
    }));
  }

  const filteredRoutines = filter === 'all' ? routines :
    filter === 'active' ? routines.filter((r) => r.active !== false) :
    filter === 'today' ? routines.filter((r) => isRoutineActiveToday(r, new Date())) :
    routines.filter((r) => r.assignedTo === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">📋 Routines</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(initialForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 min-h-touch"
          aria-expanded={showForm}
        >
          {showForm ? '✕ Cancel' : '+ New Routine'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm space-y-3 animate-slide-up">
          <h3 className="font-bold text-gray-800">{editingId ? 'Edit Routine' : 'New Routine'}</h3>

          <div>
            <label className="text-xs text-gray-500 font-medium" htmlFor="routine-title">
              Title *
            </label>
            <input
              id="routine-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Morning dishes, Vacuum living room"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 font-medium">Assigned to</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
              >
                <option value="">Everyone</option>
                {USERS.map((u) => <option key={u} value={u}>{USER_NAMES[u]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Time slot</label>
              <select
                value={form.timeSlot}
                onChange={(e) => setForm((p) => ({ ...p, timeSlot: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
              >
                {TIME_SLOTS.map((ts) => <option key={ts.value} value={ts.value}>{ts.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 font-medium">Recurrence</label>
              <select
                value={form.recurrence}
                onChange={(e) => setForm((p) => ({ ...p, recurrence: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
              >
                {RECURRENCE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Duration (min)</label>
              <input
                type="number"
                value={form.estimatedMinutes}
                onChange={(e) => setForm((p) => ({ ...p, estimatedMinutes: Number(e.target.value) }))}
                min={5} max={240}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
              />
            </div>
          </div>

          {/* Day selector for weekly/custom */}
          {['weekly', 'custom'].includes(form.recurrence) && (
            <div>
              <label className="text-xs text-gray-500 font-medium">Days</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {DAY_NAMES.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2 py-1 rounded text-xs font-medium border touch-target ${
                      form.days.includes(day)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-600'
                    }`}
                    aria-pressed={form.days.includes(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={form.active}
              aria-label="Toggle routine active status"
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-gray-600">{form.active ? 'Active' : 'Paused'}</span>
          </div>

          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 min-h-touch"
          >
            {saving ? 'Saving...' : editingId ? 'Update Routine' : 'Create Routine'}
          </button>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {[
          { value: 'all', label: `All (${routines.length})` },
          { value: 'active', label: 'Active' },
          { value: 'today', label: 'Today' },
          ...USERS.map((u) => ({ value: u, label: USER_NAMES[u] }))
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            role="tab"
            aria-selected={filter === f.value}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 min-h-touch ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Routines List */}
      {loading && routines.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>No routines yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRoutines.map((routine) => {
            const color = USER_COLORS[routine.assignedTo] || '#6B7280';
            const isActive = isRoutineActiveToday(routine, new Date());
            return (
              <div
                key={routine.id}
                className={`bg-white rounded-xl p-4 shadow-sm flex items-start justify-between gap-2 ${
                  routine.active === false ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{routine.title}</h3>
                    {isActive && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                    {routine.active === false && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Paused
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {routine.assignedTo && (
                      <span
                        className="text-xs font-medium"
                        style={{ color }}
                      >
                        {USER_NAMES[routine.assignedTo] || routine.assignedTo}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {RECURRENCE_OPTIONS.find((r) => r.value === routine.recurrence)?.label || routine.recurrence}
                    </span>
                    {routine.timeSlot && (
                      <span className="text-xs text-gray-400 capitalize">{routine.timeSlot}</span>
                    )}
                    {routine.estimatedMinutes && (
                      <span className="text-xs text-gray-400">{routine.estimatedMinutes} min</span>
                    )}
                    {Array.isArray(routine.days) && routine.days.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {routine.days.map((d) => d.slice(0, 3)).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(routine)}
                    className="text-gray-400 hover:text-blue-500 touch-target p-1 text-lg"
                    aria-label={`Edit ${routine.title}`}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${routine.title}"?`)) {
                        deleteRoutine(routine.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 touch-target p-1 text-lg"
                    aria-label={`Delete ${routine.title}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
