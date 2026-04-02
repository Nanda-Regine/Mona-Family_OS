import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, USER_NAMES, USER_COLORS } from '../utils/constants';
import { getTodaysCook, getTodaysDishes, getNextCook, getNextDishes } from '../utils/rotationLogic';

export default function RotationTracker({ currentUser }) {
  const [rotation, setRotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);

  useEffect(() => {
    loadRotation();
  }, []);

  async function loadRotation() {
    try {
      const response = await axios.get(`${API_BASE_URL}/rotation`);
      setRotation(response.data.rotation);
    } catch (err) {
      console.error('Failed to load rotation:', err);
    } finally {
      setLoading(false);
    }
  }

  async function advance(type) {
    setAdvancing(type);
    try {
      const response = await axios.post(`${API_BASE_URL}/rotation/advance`, { type });
      setRotation(response.data.rotation);
    } catch (err) {
      console.error('Failed to advance rotation:', err);
    } finally {
      setAdvancing(null);
    }
  }

  const isParent = ['mom', 'dad'].includes(currentUser);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    );
  }

  const cookId = getTodaysCook(rotation);
  const dishesId = getTodaysDishes(rotation);
  const nextCookId = getNextCook(rotation);
  const nextDishesId = getNextDishes(rotation);

  const cookColor = USER_COLORS[cookId] || '#6B7280';
  const dishesColor = USER_COLORS[dishesId] || '#6B7280';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
        <span aria-hidden="true">🔄</span> Today's Rotation
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Cooking */}
        <div
          className="rounded-lg p-3 border-2 text-center"
          style={{ borderColor: cookColor, backgroundColor: `${cookColor}10` }}
        >
          <div className="text-2xl mb-1" aria-hidden="true">🍳</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cooking</div>
          <div
            className="text-lg font-bold mt-1"
            style={{ color: cookColor }}
            aria-label={`${USER_NAMES[cookId] || cookId} is cooking today`}
          >
            {USER_NAMES[cookId] || cookId}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Next: {USER_NAMES[nextCookId] || nextCookId}
          </div>
          {isParent && (
            <button
              onClick={() => advance('cooking')}
              disabled={advancing === 'cooking'}
              className="mt-2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 touch-target w-full"
              aria-label="Advance cooking rotation"
            >
              {advancing === 'cooking' ? '...' : 'Advance →'}
            </button>
          )}
        </div>

        {/* Dishes */}
        <div
          className="rounded-lg p-3 border-2 text-center"
          style={{ borderColor: dishesColor, backgroundColor: `${dishesColor}10` }}
        >
          <div className="text-2xl mb-1" aria-hidden="true">🍽️</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dishes</div>
          <div
            className="text-lg font-bold mt-1"
            style={{ color: dishesColor }}
            aria-label={`${USER_NAMES[dishesId] || dishesId} does dishes today`}
          >
            {USER_NAMES[dishesId] || dishesId}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Next: {USER_NAMES[nextDishesId] || nextDishesId}
          </div>
          {isParent && (
            <button
              onClick={() => advance('dishes')}
              disabled={advancing === 'dishes'}
              className="mt-2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 touch-target w-full"
              aria-label="Advance dishes rotation"
            >
              {advancing === 'dishes' ? '...' : 'Advance →'}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Rotation updates daily
      </p>
    </div>
  );
}
