import React, { useState, createContext, useContext, useEffect } from 'react';
import TodayView from './pages/TodayView';
import ParentDashboard from './pages/ParentDashboard';
import RoutineBuilder from './pages/RoutineBuilder';
import WellnessHub from './pages/WellnessHub';
import FamilyCelebrations from './pages/FamilyCelebrations';
import GroceryAndRecipes from './pages/GroceryAndRecipes';
import Analytics from './pages/Analytics';
import SyncIndicator from './components/SyncIndicator';
import { useSyncManager } from './hooks/useSyncManager';
import { USERS, USER_COLORS, USER_NAMES, CAN_CUSTOMIZE } from './utils/constants';
import { buildAccessibilityClasses } from './utils/accessibilityConfig';

// ─── Accessibility Context ─────────────────────────────────────────────────────
export const AccessibilityContext = createContext({
  user: null,
  accessibilityClasses: '',
  fontSize: '16px',
  isHighContrast: false,
  isLargeButtons: false
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

// ─── Navigation Items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'today', label: 'Today', emoji: '📅' },
  { id: 'grocery', label: 'Food', emoji: '🛒' },
  { id: 'wellness', label: 'Wellness', emoji: '💚' },
  { id: 'celebrations', label: 'Wins', emoji: '🏆' },
  { id: 'routines', label: 'Routines', emoji: '📋' },
  { id: 'analytics', label: 'Stats', emoji: '📊' },
  { id: 'parent', label: 'Manage', emoji: '⚙️' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('today');
  const [currentUser, setCurrentUser] = useState(null);
  const [serverUsers, setServerUsers] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const { syncStatus, lastSync, syncNow } = useSyncManager();

  // Load users from server on mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/sync/state`)
      .then((r) => r.json())
      .then(({ state }) => {
        if (state?.users) setServerUsers(state.users);
      })
      .catch(() => {});
  }, []);

  // Load saved user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('family-os-current-user');
    if (saved) setCurrentUser(saved);
  }, []);

  function selectUser(userId) {
    setCurrentUser(userId);
    localStorage.setItem('family-os-current-user', userId);
    setMenuOpen(false);
  }

  const user = currentUser ? (serverUsers[currentUser] || { id: currentUser, name: USER_NAMES[currentUser], accessibility: {} }) : null;
  const accessibilityClasses = user ? buildAccessibilityClasses(user) : '';
  const fontSize = user?.accessibility?.fontSize || '16px';
  const isHighContrast = user?.accessibility?.contrast === 'high';
  const isLargeButtons = user?.accessibility?.largeButtons === true;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mona Family OS</h1>
          <p className="text-gray-500 mb-8">Who are you today?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {USERS.map((userId) => {
              const color = USER_COLORS[userId];
              const name = USER_NAMES[userId];
              return (
                <button
                  key={userId}
                  onClick={() => selectUser(userId)}
                  className="flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 min-h-touch"
                  style={{ borderColor: color, backgroundColor: `${color}15` }}
                  aria-label={`Select ${name}`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
                    style={{ backgroundColor: color }}
                  >
                    {name[0]}
                  </div>
                  <span className="font-semibold text-gray-800">{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const color = USER_COLORS[currentUser] || '#6B7280';

  return (
    <AccessibilityContext.Provider value={{ user, accessibilityClasses, fontSize, isHighContrast, isLargeButtons }}>
      <div className={`min-h-screen bg-gray-50 ${accessibilityClasses}`} style={{ fontSize }}>
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="skip-link">Skip to main content</a>

        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40 safe-area-top">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-xl touch-target"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? '✕' : '☰'}
              </button>
              <span className="font-bold text-gray-800 text-lg">
                🏠 Family OS
              </span>
            </div>

            <div className="flex items-center gap-3">
              <SyncIndicator status={syncStatus} lastSync={lastSync} onSync={syncNow} />

              {/* User switcher */}
              <button
                onClick={() => setCurrentUser(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border touch-target"
                style={{ borderColor: color, backgroundColor: `${color}15` }}
                aria-label={`Switch user (currently ${USER_NAMES[currentUser]})`}
              >
                <div
                  className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {(USER_NAMES[currentUser] || 'U')[0]}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {USER_NAMES[currentUser]}
                </span>
              </button>
            </div>
          </div>

          {/* Slide-down navigation */}
          {menuOpen && (
            <nav className="border-t bg-white shadow-lg" role="navigation" aria-label="Main navigation">
              <div className="max-w-4xl mx-auto px-4 py-2 grid grid-cols-4 sm:grid-cols-7 gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id); setMenuOpen(false); }}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors touch-target ${
                      currentPage === item.id
                        ? 'bg-gray-100 font-semibold'
                        : 'hover:bg-gray-50'
                    }`}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-xs text-gray-600 mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}
        </header>

        {/* Main Content */}
        <main id="main-content" className="max-w-4xl mx-auto px-4 py-4 pb-24">
          {currentPage === 'today' && <TodayView currentUser={currentUser} />}
          {currentPage === 'grocery' && <GroceryAndRecipes currentUser={currentUser} />}
          {currentPage === 'wellness' && <WellnessHub currentUser={currentUser} />}
          {currentPage === 'celebrations' && <FamilyCelebrations currentUser={currentUser} />}
          {currentPage === 'routines' && <RoutineBuilder currentUser={currentUser} />}
          {currentPage === 'analytics' && <Analytics currentUser={currentUser} />}
          {currentPage === 'parent' && <ParentDashboard currentUser={currentUser} />}
        </main>

        {/* Bottom Navigation Bar */}
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg safe-area-bottom z-40"
          role="navigation"
          aria-label="Bottom navigation"
        >
          <div className="flex justify-around max-w-4xl mx-auto">
            {NAV_ITEMS.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex-1 flex flex-col items-center py-2 transition-colors touch-target ${
                  currentPage === item.id ? 'text-blue-600' : 'text-gray-500'
                }`}
                style={currentPage === item.id ? { color } : {}}
                aria-current={currentPage === item.id ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </AccessibilityContext.Provider>
  );
}
