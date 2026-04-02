import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, CATEGORIES, CATEGORY_EMOJIS } from '../utils/constants';
import { calculateHealthScore, getStarchWarning, suggestSwaps } from '../utils/healthyEating';
import { useAccessibility } from '../App';

export default function GroceryListManager({ currentUser }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const { isHighContrast } = useAccessibility();

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const response = await axios.get(`${API_BASE_URL}/groceries`);
      setItems(response.data.items || []);
    } catch (err) {
      console.error('Failed to load groceries:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    if (!newItem.trim()) return;

    setAdding(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/groceries`, {
        name: newItem.trim(),
        category: newCategory
      });
      setItems((prev) => [...prev, response.data.item]);
      setNewItem('');
    } catch (err) {
      console.error('Failed to add item:', err);
    } finally {
      setAdding(false);
    }
  }

  async function toggleCheck(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
    try {
      await axios.post(`${API_BASE_URL}/groceries/${id}/check`);
    } catch (err) {
      await loadItems();
    }
  }

  async function deleteItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await axios.delete(`${API_BASE_URL}/groceries/${id}`);
    } catch (err) {
      await loadItems();
    }
  }

  async function clearChecked() {
    const checkedCount = items.filter((i) => i.checked).length;
    if (!checkedCount) return;
    if (!window.confirm(`Remove ${checkedCount} checked items?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/groceries/clear/checked`);
      setItems((prev) => prev.filter((i) => !i.checked));
    } catch (err) {
      await loadItems();
    }
  }

  const healthScore = calculateHealthScore(items);
  const starchWarning = getStarchWarning(items);
  const swaps = suggestSwaps(items);

  const filteredItems = filter === 'all' ? items :
    filter === 'unchecked' ? items.filter((i) => !i.checked) :
    items.filter((i) => i.category === filter);

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredItems.filter((i) => i.category === cat);
    return acc;
  }, { other: [] });

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800">Health Score</h3>
          <span
            className={`text-2xl font-bold ${
              healthScore >= 7 ? 'text-green-600' :
              healthScore >= 4 ? 'text-yellow-500' :
              'text-red-500'
            }`}
          >
            {healthScore}/10
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              healthScore >= 7 ? 'bg-green-500' :
              healthScore >= 4 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${healthScore * 10}%` }}
          />
        </div>

        {/* Starch warning */}
        {starchWarning && (
          <div className={`mt-2 p-2 rounded-lg text-sm ${
            starchWarning.color === 'red' ? 'bg-red-50 text-red-700' :
            starchWarning.color === 'orange' ? 'bg-orange-50 text-orange-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>
            ⚠️ {starchWarning.message}
          </div>
        )}

        {/* Swap suggestions */}
        {swaps.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-600 mb-1">Healthy Swaps:</p>
            {swaps.slice(0, 2).map((swap, i) => (
              <p key={i} className="text-xs text-green-700 bg-green-50 p-1 rounded mb-1">
                💡 Replace <strong>{swap.original}</strong> with <strong>{swap.swap}</strong>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3">Add Item</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Item name..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-touch"
            aria-label="New grocery item name"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm min-h-touch"
            aria-label="Item category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_EMOJIS[cat]} {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={adding || !newItem.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 min-h-touch"
            aria-label="Add grocery item"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {['all', 'unchecked', ...CATEGORIES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 min-h-touch ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? `All (${items.length})` :
             f === 'unchecked' ? `Needed (${items.filter((i) => !i.checked).length})` :
             `${CATEGORY_EMOJIS[f]} ${f}`}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {items.filter((i) => filter === 'all' || filter === 'unchecked' ? (filter === 'unchecked' ? !i.checked : true) : i.category === filter).length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🛒</div>
            <p>No items {filter !== 'all' ? `in ${filter}` : ''}</p>
          </div>
        ) : (
          <ul role="list">
            {items
              .filter((i) => filter === 'all' ? true : filter === 'unchecked' ? !i.checked : i.category === filter)
              .map((item, idx) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 p-3 border-b last:border-b-0 transition-colors ${
                    item.checked ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggleCheck(item.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 touch-target ${
                      item.checked
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                    aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                  >
                    {item.checked && '✓'}
                  </button>

                  <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {CATEGORY_EMOJIS[item.category] || '🛒'} {item.name}
                  </span>

                  {item.quantity && item.quantity !== 1 && (
                    <span className="text-xs text-gray-400">×{item.quantity}</span>
                  )}

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 touch-target p-1 flex-shrink-0"
                    aria-label={`Remove ${item.name} from list`}
                  >
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Clear checked */}
      {items.some((i) => i.checked) && (
        <button
          onClick={clearChecked}
          className="w-full py-3 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 touch-target"
          aria-label="Remove all checked items from the list"
        >
          🗑️ Clear {items.filter((i) => i.checked).length} checked items
        </button>
      )}
    </div>
  );
}
