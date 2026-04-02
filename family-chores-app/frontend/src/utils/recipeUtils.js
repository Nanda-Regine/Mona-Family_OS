/**
 * Parse AI recipe responses from various formats.
 */
export function parseRecipeResponse(aiText) {
  if (!aiText) return [];

  // If it's already an object/array, return as-is
  if (typeof aiText === 'object') {
    return Array.isArray(aiText) ? aiText : [aiText];
  }

  // Try JSON parse first
  try {
    const parsed = JSON.parse(aiText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Try to extract JSON from text
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Try object match
    const objMatch = aiText.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return [JSON.parse(objMatch[0])];
      } catch {}
    }

    // Parse text format as fallback
    return parseTextRecipes(aiText);
  }
}

function parseTextRecipes(text) {
  const recipes = [];
  const sections = text.split(/\n#{1,3}\s+/);

  sections.forEach((section) => {
    if (!section.trim()) return;

    const lines = section.split('\n');
    const name = lines[0]?.trim() || 'Recipe';

    const ingredients = [];
    const instructions = [];
    let inIngredients = false;
    let inInstructions = false;

    lines.slice(1).forEach((line) => {
      const l = line.toLowerCase().trim();
      if (l.includes('ingredient')) { inIngredients = true; inInstructions = false; return; }
      if (l.includes('instruction') || l.includes('direction') || l.includes('method')) {
        inInstructions = true; inIngredients = false; return;
      }

      if (inIngredients && line.trim()) {
        ingredients.push(line.replace(/^[-*•]\s*/, '').trim());
      }
      if (inInstructions && line.trim()) {
        instructions.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    });

    if (name && (ingredients.length > 0 || instructions.length > 0)) {
      recipes.push({ name, ingredients, instructions, notes: '' });
    }
  });

  return recipes.length > 0 ? recipes : [{ name: 'Recipe', raw: text }];
}

/**
 * Format recipe for display in the UI.
 */
export function formatRecipeDisplay(recipe) {
  if (!recipe) return null;

  return {
    id: recipe.id || `recipe-${Date.now()}`,
    name: recipe.name || 'Unnamed Recipe',
    ingredients: normalizeIngredients(recipe.ingredients),
    instructions: normalizeInstructions(recipe.instructions),
    prepTime: recipe.prepTime || recipe.prep_time || 'Not specified',
    calories: recipe.calories || recipe.cal || null,
    healthScore: recipe.healthScore || recipe.health_score || null,
    notes: recipe.notes || '',
    tags: recipe.tags || [],
    generatedAt: recipe.generatedAt || new Date().toISOString()
  };
}

function normalizeIngredients(ingredients) {
  if (!ingredients) return [];
  if (typeof ingredients === 'string') return ingredients.split('\n').filter(Boolean);
  if (Array.isArray(ingredients)) {
    return ingredients.map((i) => {
      if (typeof i === 'string') return i;
      if (i.name) return `${i.quantity || ''} ${i.unit || ''} ${i.name}`.trim();
      return String(i);
    });
  }
  return [];
}

function normalizeInstructions(instructions) {
  if (!instructions) return [];
  if (typeof instructions === 'string') return instructions.split('\n').filter(Boolean);
  if (Array.isArray(instructions)) {
    return instructions.map((i) => {
      if (typeof i === 'string') return i;
      if (i.step) return i.step;
      if (i.instruction) return i.instruction;
      return String(i);
    });
  }
  return [];
}

/**
 * Calculate a basic health score for a recipe based on ingredients.
 */
export function calculateRecipeHealthScore(ingredients) {
  if (!ingredients || ingredients.length === 0) return 5;

  const ingredientStr = ingredients.join(' ').toLowerCase();
  let score = 5;

  // Positive: vegetables, fruits, lean proteins
  const healthy = ['vegetable', 'spinach', 'kale', 'broccoli', 'carrot', 'chicken', 'fish', 'legume', 'bean', 'lentil', 'fruit', 'berry', 'olive oil'];
  healthy.forEach((word) => {
    if (ingredientStr.includes(word)) score += 0.5;
  });

  // Negative: high starch, processed
  const unhealthy = ['white rice', 'white bread', 'sugar', 'butter', 'cream', 'processed', 'deep fried', 'potato chip'];
  unhealthy.forEach((word) => {
    if (ingredientStr.includes(word)) score -= 0.5;
  });

  return Math.min(10, Math.max(1, Math.round(score)));
}
