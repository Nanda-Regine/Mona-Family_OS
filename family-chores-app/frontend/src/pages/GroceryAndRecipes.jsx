import React, { useState, useEffect } from 'react';
import { API_BASE_URL, CATEGORIES, CATEGORY_EMOJIS, USER_NAMES } from '../utils/constants';
import { useAccessibility } from '../App';

export default function GroceryAndRecipes({ currentUser }) {
  const { isHighContrast } = useAccessibility();
  const [activeTab, setActiveTab] = useState('grocery');
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingRecipes, setGeneratingRecipes] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'units', category: 'other' });
  const [addingItem, setAddingItem] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);

  useEffect(() => {
    loadGroceries();
    loadCachedRecipes();
  }, []);

  async function loadGroceries() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/groceries`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  }

  async function loadCachedRecipes() {
    try {
      const res = await fetch(`${API_BASE_URL}/recipes/cached`);
      if (res.ok) setRecipes(await res.json());
    } catch (e) {}
  }

  async function addItem() {
    if (!newItem.name.trim()) return;
    setAddingItem(true);
    try {
      const res = await fetch(`${API_BASE_URL}/groceries/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, addedBy: currentUser })
      });
      if (res.ok) {
        setNewItem({ name: '', quantity: 1, unit: 'units', category: 'other' });
        setShowAddForm(false);
        loadGroceries();
      }
    } catch (e) {
      alert('Could not add item. Try again.');
    } finally {
      setAddingItem(false);
    }
  }

  async function toggleItem(id, checked) {
    try {
      await fetch(`${API_BASE_URL}/groceries/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked })
      });
      setItems(prev => prev.map(item => item.id === id ? { ...item, checked } : item));
    } catch (e) {}
  }

  async function deleteItem(id) {
    try {
      await fetch(`${API_BASE_URL}/groceries/items/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {}
  }

  async function generateRecipes() {
    setGeneratingRecipes(true);
    try {
      const groceryNames = items.filter(i => !i.checked).map(i => i.name);
      const res = await fetch(`${API_BASE_URL}/recipes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groceries: groceryNames, healthGoals: 'less starch, more vegetables', servings: 4 })
      });
      const data = await res.json();
      setRecipes(data.recipes || []);
      setActiveTab('recipes');
    } catch (e) {
      alert('Could not generate recipes. Check your internet connection.');
    } finally {
      setGeneratingRecipes(false);
    }
  }

  async function generateMealPlan() {
    setGeneratingPlan(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recipes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'mealplan', days: 7, healthGoals: 'less starch, more vegetables' })
      });
      const data = await res.json();
      setMealPlan(data.mealPlan);
      setActiveTab('mealplan');
    } catch (e) {
      alert('Could not generate meal plan.');
    } finally {
      setGeneratingPlan(false);
    }
  }

  async function analyzeBudget() {
    try {
      const res = await fetch(`${API_BASE_URL}/nutrition/analysis`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setBudgetAnalysis(data);
    } catch (e) {}
  }

  const cardClass = isHighContrast
    ? 'bg-white border-2 border-black rounded-xl p-4 mb-3'
    : 'bg-white rounded-xl shadow p-4 mb-3';

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  const tabs = [
    { id: 'grocery', label: 'Groceries', emoji: '🛒' },
    { id: 'recipes', label: 'Recipes', emoji: '🍳' },
    { id: 'mealplan', label: 'Meal Plan', emoji: '📅' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🛒 Food & Recipes</h1>
          <p className="text-gray-500 text-sm">Less starch, more vegetables</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Grocery Tab */}
      {activeTab === 'grocery' && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold"
              style={{ minHeight: '50px' }}
            >
              + Add Item
            </button>
            <button
              onClick={generateRecipes}
              disabled={generatingRecipes || items.filter(i => !i.checked).length === 0}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              style={{ minHeight: '50px' }}
            >
              {generatingRecipes ? 'Generating...' : 'AI Recipes'}
            </button>
          </div>

          {showAddForm && (
            <div className={cardClass}>
              <h3 className="font-semibold mb-3">Add Grocery Item</h3>
              <input
                type="text"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Item name"
                className="w-full border rounded-lg px-3 py-2 mb-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                style={{ minHeight: '44px' }}
                onKeyPress={e => e.key === 'Enter' && addItem()}
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className="w-20 border rounded-lg px-2 py-2 text-base"
                  min="1"
                  style={{ minHeight: '44px' }}
                />
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="unit"
                  className="w-24 border rounded-lg px-2 py-2 text-base"
                  style={{ minHeight: '44px' }}
                />
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  className="flex-1 border rounded-lg px-2 py-2 text-base"
                  style={{ minHeight: '44px' }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_EMOJIS[cat]} {cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addItem}
                disabled={addingItem || !newItem.name.trim()}
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {addingItem ? 'Adding...' : 'Add to List'}
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading groceries...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-gray-500">Grocery list is empty. Add some items!</p>
            </div>
          ) : (
            <div>
              {CATEGORIES.filter(cat => grouped[cat]?.length > 0).map(cat => (
                <div key={cat} className={cardClass}>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {CATEGORY_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h3>
                  {grouped[cat].map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <input
                        type="checkbox"
                        checked={item.checked || false}
                        onChange={e => toggleItem(item.id, e.target.checked)}
                        className="w-6 h-6 rounded accent-orange-500"
                        style={{ minWidth: '24px', minHeight: '24px' }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                          {item.quantity} {item.unit}
                        </span>
                        {item.starchLevel > 7 && (
                          <span className="ml-2 text-xs text-orange-500">⚠️ High starch</span>
                        )}
                        {item.healthScore >= 9 && (
                          <span className="ml-2 text-xs text-green-500">💪 Healthy</span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                        aria-label="Delete item"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={analyzeBudget}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold"
                  style={{ minHeight: '50px' }}
                >
                  Budget Analysis
                </button>
                <button
                  onClick={generateMealPlan}
                  disabled={generatingPlan}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                  style={{ minHeight: '50px' }}
                >
                  {generatingPlan ? 'Planning...' : '7-Day Plan'}
                </button>
              </div>
              {budgetAnalysis && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
                  <h3 className="font-semibold text-blue-800 mb-2">Budget Analysis</h3>
                  <p className="text-blue-700 text-sm whitespace-pre-line">{budgetAnalysis.analysis || JSON.stringify(budgetAnalysis, null, 2)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={generateRecipes}
              disabled={generatingRecipes}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              style={{ minHeight: '50px' }}
            >
              {generatingRecipes ? 'Generating...' : 'Generate New Recipes'}
            </button>
          </div>
          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🍳</div>
              <p className="text-gray-500">No recipes yet. Add groceries and click "Generate Recipes"!</p>
            </div>
          ) : (
            recipes.map((recipe, i) => (
              <div key={i} className={cardClass}>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{recipe.title}</h3>
                {recipe.nutrition && (
                  <div className="flex gap-3 mb-3 text-xs text-gray-500">
                    {recipe.nutrition.protein && <span>Protein: {recipe.nutrition.protein}</span>}
                    {recipe.nutrition.carbs && <span>Carbs: {recipe.nutrition.carbs}</span>}
                    {recipe.nutrition.calories && <span>Cal: {recipe.nutrition.calories}</span>}
                  </div>
                )}
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Ingredients:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(recipe.ingredients || []).map((ing, j) => (
                      <li key={j}>• {typeof ing === 'object' ? `${ing.amount || ''} ${ing.name || ing}` : ing}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm mb-1">Instructions:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    {(recipe.instructions || []).map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Meal Plan Tab */}
      {activeTab === 'mealplan' && (
        <div>
          <button
            onClick={generateMealPlan}
            disabled={generatingPlan}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold mb-4 disabled:opacity-50"
            style={{ minHeight: '50px' }}
          >
            {generatingPlan ? 'Creating your 7-day plan...' : 'Generate 7-Day Meal Plan'}
          </button>
          {!mealPlan ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-gray-500">Click to generate a healthy 7-day meal plan focused on less starch, more vegetables.</p>
            </div>
          ) : (
            <div>
              {(mealPlan.days || []).map((day, i) => (
                <div key={i} className={cardClass}>
                  <h3 className="font-bold text-gray-800 mb-2">{day.day}</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {['breakfast', 'lunch', 'dinner'].map(meal => (
                      <div key={meal} className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400 font-medium">{meal}</p>
                        <p className="text-gray-700 mt-0.5">{day[meal] || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {day.notes && <p className="text-xs text-gray-400 mt-2">{day.notes}</p>}
                </div>
              ))}
              {mealPlan.summary && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-1">Weekly Summary</h4>
                  <p className="text-green-700 text-sm">{mealPlan.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
