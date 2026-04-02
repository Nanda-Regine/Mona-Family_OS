import React, { useState } from 'react';
import ParentCustomizer from '../components/ParentCustomizer';
import AccessibilityPanel from '../components/AccessibilityPanel';
import { USER_NAMES, CAN_CUSTOMIZE } from '../utils/constants';

export default function ParentDashboard({ currentUser }) {
  const [activeSection, setActiveSection] = useState('overview');
  // Nanda (eldest) has full customizer access alongside parents
  const canAccess = CAN_CUSTOMIZE(currentUser);

  if (!canAccess) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="font-bold text-gray-700 mb-2">Management Dashboard</h2>
        <p className="text-gray-500 text-sm">
          This section is for parents and Nanda (eldest) to customize the family app.
        </p>
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 mb-3">Your Accessibility Settings</h3>
          <AccessibilityPanel userId={currentUser} />
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'customize', label: 'Customize', emoji: '⚙️' },
    { id: 'accessibility', label: 'My Accessibility', emoji: '♿' }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl">👨‍👩‍👧</div>
          <div>
            <h1 className="font-bold text-gray-800 text-xl">Parent Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome, {USER_NAMES[currentUser]}! Manage your family's app settings.
            </p>
          </div>
        </div>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            role="tab"
            aria-selected={activeSection === s.id}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 min-h-touch ${
              activeSection === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '👨‍👩‍👧', label: 'Family Members', value: '5' },
              { emoji: '✅', label: 'Active Routines', value: '—' },
              { emoji: '🛒', label: 'Grocery Items', value: '—' },
              { emoji: '🏆', label: 'Achievements', value: '—' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl mb-1">{stat.emoji}</div>
                <div className="text-xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-bold text-blue-800 mb-2">Quick Tips for Parents</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use <strong>Customize</strong> to set schedules, health goals, and rotation rules</li>
              <li>• Check <strong>Analytics</strong> for family performance trends</li>
              <li>• Mom's accessibility is set to high contrast + large fonts by default</li>
              <li>• Phawu's school schedule and sports are pre-loaded</li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'customize' && <ParentCustomizer currentUser={currentUser} />}
      {activeSection === 'accessibility' && <AccessibilityPanel userId={currentUser} />}
    </div>
  );
}
