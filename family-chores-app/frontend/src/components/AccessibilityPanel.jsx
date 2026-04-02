import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { useAccessibility } from '../App';

export default function AccessibilityPanel({ userId }) {
  const { user } = useAccessibility();
  const [settings, setSettings] = useState({
    fontSize: user?.accessibility?.fontSize || '16px',
    contrast: user?.accessibility?.contrast || 'normal',
    voiceEnabled: user?.accessibility?.voiceEnabled || false,
    largeButtons: user?.accessibility?.largeButtons || false,
    simplifyUI: user?.accessibility?.simplifyUI || false
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/customization/accessibility`, {
        userId,
        ...settings
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error('Failed to save accessibility settings:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <span>♿</span> Accessibility Settings
      </h3>

      {/* Font Size */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Font Size</label>
        <div className="flex gap-2">
          {['16px', '18px', '20px'].map((size) => (
            <button
              key={size}
              onClick={() => setSettings((p) => ({ ...p, fontSize: size }))}
              className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all touch-target ${
                settings.fontSize === size
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
              style={{ fontSize: size }}
              aria-pressed={settings.fontSize === size}
            >
              {size === '16px' ? 'Normal' : size === '18px' ? 'Large' : 'Extra Large'}
            </button>
          ))}
        </div>
      </div>

      {/* Contrast */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Contrast</label>
        <div className="flex gap-2">
          {['normal', 'high'].map((c) => (
            <button
              key={c}
              onClick={() => setSettings((p) => ({ ...p, contrast: c }))}
              className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all touch-target capitalize ${
                settings.contrast === c
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
              aria-pressed={settings.contrast === c}
            >
              {c === 'high' ? '⬛ High Contrast' : '🔲 Normal'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Options */}
      {[
        { key: 'largeButtons', label: 'Large Buttons', emoji: '🔘', desc: 'Minimum 56px button height' },
        { key: 'voiceEnabled', label: 'Voice Feedback', emoji: '🔊', desc: 'Speak task completion aloud' },
        { key: 'simplifyUI', label: 'Simplified View', emoji: '✂️', desc: 'Hide advanced features' }
      ].map(({ key, label, emoji, desc }) => (
        <div key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
          <div>
            <div className="font-medium text-gray-700">{emoji} {label}</div>
            <div className="text-xs text-gray-400">{desc}</div>
          </div>
          <button
            onClick={() => setSettings((p) => ({ ...p, [key]: !p[key] }))}
            className={`relative w-12 h-6 rounded-full transition-colors touch-target ${
              settings[key] ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={settings[key]}
            aria-label={`Toggle ${label}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings[key] ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      ))}

      {saved && (
        <div className="text-green-600 text-sm bg-green-50 p-2 rounded" role="status">
          ✅ Settings saved! Reloading...
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 min-h-touch"
      >
        {saving ? 'Saving...' : 'Save Accessibility Settings'}
      </button>
    </div>
  );
}
