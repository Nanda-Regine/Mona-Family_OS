import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, USERS, USER_NAMES } from '../utils/constants';

const TABS = [
  { id: 'schedule', label: 'Schedule', emoji: '⏰' },
  { id: 'school', label: 'School', emoji: '🎓' },
  { id: 'health', label: 'Health Goals', emoji: '🥗' },
  { id: 'accessibility', label: 'Accessibility', emoji: '♿' },
  { id: 'rotation', label: 'Rotation', emoji: '🔄' },
  { id: 'wellness', label: 'Wellness', emoji: '💚' }
];

export default function ParentCustomizer({ currentUser }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [users, setUsers] = useState({});
  const [rotation, setRotation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [selectedUser, setSelectedUser] = useState('phawu');
  const [healthGoals, setHealthGoals] = useState({
    dietaryFocus: 'less starch, more vegetables',
    allergies: '',
    targetCalories: 2000
  });
  const [schedule, setSchedule] = useState({
    workDays: 'Monday-Friday',
    workHours: '09:00-17:00',
    preferredChoreTime: 'morning',
    availabilityNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersRes, rotRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/customization/users`),
        axios.get(`${API_BASE_URL}/rotation`)
      ]);
      setUsers(usersRes.data.users || {});
      setRotation(rotRes.data.rotation);
    } catch (err) {
      console.error('Failed to load parent data:', err);
    }
  }

  async function saveSchedule() {
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/customization/schedule`, {
        userId: currentUser,
        ...schedule
      });
      setSaved('schedule');
      setTimeout(() => setSaved(''), 2000);
    } catch (err) {
      console.error('Failed to save schedule:', err);
    } finally {
      setSaving(false);
    }
  }

  async function saveHealthGoals() {
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/customization/user/${selectedUser}/preferences`, {
        healthGoals: {
          ...healthGoals,
          allergies: healthGoals.allergies ? healthGoals.allergies.split(',').map((a) => a.trim()) : []
        }
      });
      setSaved('health');
      setTimeout(() => setSaved(''), 2000);
    } catch (err) {
      console.error('Failed to save health goals:', err);
    } finally {
      setSaving(false);
    }
  }

  const selectedUserData = users[selectedUser] || {};

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 min-h-touch ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800">My Schedule</h3>
          {[
            { key: 'workDays', label: 'Work Days', placeholder: 'e.g. Monday-Friday' },
            { key: 'workHours', label: 'Work Hours', placeholder: 'e.g. 09:00-17:00' },
            { key: 'availabilityNotes', label: 'Availability Notes', placeholder: 'When can you do chores?' }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 font-medium">{label}</label>
              <input
                type="text"
                value={schedule[key] || ''}
                onChange={(e) => setSchedule((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 font-medium">Preferred Chore Time</label>
            <select
              value={schedule.preferredChoreTime || 'morning'}
              onChange={(e) => setSchedule((p) => ({ ...p, preferredChoreTime: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            >
              {['morning', 'afternoon', 'evening'].map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
          {saved === 'schedule' && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">✅ Schedule saved!</div>}
          <button
            onClick={saveSchedule}
            disabled={saving}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 min-h-touch"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      )}

      {/* School Calendar Tab */}
      {activeTab === 'school' && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800">Phawu's School Calendar</h3>
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            <p><strong>School:</strong> Hudson Park High School</p>
            <p><strong>Sports schedule:</strong></p>
            <ul className="list-disc list-inside mt-1 text-xs">
              <li>Monday: Debating 15:30-17:00</li>
              <li>Tuesday: Soccer 15:30-17:15</li>
              <li>Wednesday: Tennis 15:30-17:00</li>
              <li>Thursday: Debating 15:30-17:00</li>
              <li>Friday: Free</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">
            Add exam dates, school holidays, and special events to automatically reduce chore load during busy times.
          </p>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 min-h-touch"
            onClick={() => alert('School calendar management - add events via the API')}
          >
            📅 Manage School Events
          </button>
        </div>
      )}

      {/* Health Goals Tab */}
      {activeTab === 'health' && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800">Health Goals</h3>
          <div>
            <label className="text-xs text-gray-500 font-medium">Set goals for</label>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                const u = users[e.target.value];
                if (u?.healthGoals) {
                  setHealthGoals({
                    dietaryFocus: u.healthGoals.dietaryFocus || '',
                    allergies: (u.healthGoals.allergies || []).join(', '),
                    targetCalories: u.healthGoals.targetCalories || 2000
                  });
                }
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            >
              {USERS.map((u) => <option key={u} value={u}>{USER_NAMES[u]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Dietary Focus</label>
            <input
              type="text"
              value={healthGoals.dietaryFocus}
              onChange={(e) => setHealthGoals((p) => ({ ...p, dietaryFocus: e.target.value }))}
              placeholder="e.g. less starch, more vegetables"
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Allergies/Restrictions (comma separated)</label>
            <input
              type="text"
              value={healthGoals.allergies}
              onChange={(e) => setHealthGoals((p) => ({ ...p, allergies: e.target.value }))}
              placeholder="e.g. nuts, dairy"
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Daily Calorie Target</label>
            <input
              type="number"
              value={healthGoals.targetCalories}
              onChange={(e) => setHealthGoals((p) => ({ ...p, targetCalories: Number(e.target.value) }))}
              min={1000} max={4000}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 min-h-touch"
            />
          </div>
          {saved === 'health' && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">✅ Health goals saved!</div>}
          <button
            onClick={saveHealthGoals}
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 min-h-touch"
          >
            {saving ? 'Saving...' : 'Save Health Goals'}
          </button>
        </div>
      )}

      {/* Accessibility Tab */}
      {activeTab === 'accessibility' && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Accessibility for Each Member</h3>
          {USERS.map((userId) => {
            const u = users[userId];
            const acc = u?.accessibility || {};
            return (
              <div key={userId} className="border-b last:border-b-0 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-700">{USER_NAMES[userId]}</div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">{acc.fontSize || '16px'}</span>
                    {acc.contrast === 'high' && <span className="bg-gray-900 text-white px-2 py-1 rounded">High contrast</span>}
                    {acc.largeButtons && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Large buttons</span>}
                    {acc.voiceEnabled && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🔊 Voice</span>}
                  </div>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-gray-400 mt-3">
            Each family member can customize their own accessibility settings from their profile.
          </p>
        </div>
      )}

      {/* Rotation Tab */}
      {activeTab === 'rotation' && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800">Chore Rotation Rules</h3>
          {rotation ? (
            <div className="space-y-3">
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">🍳 Cooking</div>
                <p className="text-sm text-gray-600">
                  Current: <strong>{USER_NAMES[rotation.cooking?.current] || rotation.cooking?.current}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Next: <strong>{USER_NAMES[rotation.cooking?.next] || rotation.cooking?.next}</strong>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">🍽️ Dishes</div>
                <p className="text-sm text-gray-600">
                  Current: <strong>{USER_NAMES[rotation.dishes?.current] || rotation.dishes?.current}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Next: <strong>{USER_NAMES[rotation.dishes?.next] || rotation.dishes?.next}</strong>
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Use the rotation controls on the Today page to advance rotation.
              </p>
            </div>
          ) : (
            <p className="text-gray-400">Loading rotation data...</p>
          )}
        </div>
      )}

      {/* Wellness Tab */}
      {activeTab === 'wellness' && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800">Family Wellness Settings</h3>
          <div className="space-y-2">
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800">
              <p className="font-medium">💚 Wellness Features Active:</p>
              <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                <li>Daily gratitude journaling</li>
                <li>Mood tracking for all members</li>
                <li>Stress detection and recommendations</li>
                <li>Meditation reminders</li>
                <li>AI-powered wellness suggestions</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              Wellness data is private per user. Parents can view family trend summaries in Analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
