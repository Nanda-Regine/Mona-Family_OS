const HIGH_STARCH = ['white rice', 'white bread', 'pasta', 'potato', 'chips', 'crackers', 'white flour', 'corn starch', 'white tortilla'];
const VEGETABLES = ['spinach', 'kale', 'broccoli', 'carrot', 'cucumber', 'tomato', 'pepper', 'onion', 'garlic', 'celery', 'lettuce', 'cabbage', 'cauliflower', 'zucchini', 'mushroom', 'asparagus', 'peas', 'green bean'];
const HEALTHY_PROTEINS = ['chicken', 'fish', 'salmon', 'tuna', 'tofu', 'lentil', 'bean', 'egg', 'turkey'];

/**
 * Calculate health score for grocery items (0-10).
 */
export function calculateHealthScore(items) {
  if (!items || items.length === 0) return 5;

  let score = 5;
  const names = items.map((i) => (i.name || i).toLowerCase());
  const combined = names.join(' ');

  // Points for vegetables and healthy items
  let vegCount = 0;
  VEGETABLES.forEach((veg) => {
    if (combined.includes(veg)) {
      score += 0.3;
      vegCount++;
    }
  });

  // Bonus for variety of vegetables
  if (vegCount >= 5) score += 1;

  // Points for lean proteins
  let proteinCount = 0;
  HEALTHY_PROTEINS.forEach((protein) => {
    if (combined.includes(protein)) {
      score += 0.2;
      proteinCount++;
    }
  });

  // Deduct for high starch items
  let starchCount = 0;
  HIGH_STARCH.forEach((starch) => {
    if (combined.includes(starch)) {
      score -= 0.4;
      starchCount++;
    }
  });

  return Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));
}

/**
 * Get starch warning level for grocery items.
 */
export function getStarchWarning(items) {
  if (!items || items.length === 0) return null;

  const names = items.map((i) => (i.name || i).toLowerCase());
  const combined = names.join(' ');

  const starchItems = HIGH_STARCH.filter((starch) => combined.includes(starch));

  if (starchItems.length === 0) return null;

  if (starchItems.length >= 4) {
    return {
      level: 'high',
      message: `High starch in your list: ${starchItems.slice(0, 3).join(', ')}. Consider swapping some for vegetables.`,
      items: starchItems,
      color: 'red'
    };
  }

  if (starchItems.length >= 2) {
    return {
      level: 'moderate',
      message: `Moderate starch detected: ${starchItems.join(', ')}. Balance with more vegetables.`,
      items: starchItems,
      color: 'orange'
    };
  }

  return {
    level: 'low',
    message: `A little starch (${starchItems[0]}) - keep it balanced!`,
    items: starchItems,
    color: 'yellow'
  };
}

/**
 * Suggest healthy swaps for high-starch or unhealthy items.
 */
export function suggestSwaps(items) {
  const swaps = {
    'white rice': 'brown rice or cauliflower rice',
    'white bread': 'whole grain bread or lettuce wraps',
    'pasta': 'zucchini noodles or whole wheat pasta',
    'potato': 'sweet potato or turnip',
    'chips': 'carrot sticks or cucumber slices',
    'white flour': 'almond flour or whole wheat flour',
    'crackers': 'rice cakes or vegetable sticks'
  };

  const suggestions = [];
  const names = items.map((i) => (i.name || i).toLowerCase());

  names.forEach((name) => {
    Object.keys(swaps).forEach((starch) => {
      if (name.includes(starch)) {
        suggestions.push({
          original: name,
          swap: swaps[starch],
          reason: 'Lower in starch, higher in nutrients'
        });
      }
    });
  });

  return suggestions;
}

/**
 * Categorize items by health level.
 */
export function categorizeByHealth(items) {
  const categories = {
    great: [], // Vegetables, fruits, lean proteins
    good: [], // Whole grains, dairy
    okay: [], // Moderate starch
    limit: [] // High starch, processed
  };

  items.forEach((item) => {
    const name = (item.name || item).toLowerCase();
    const isVeg = VEGETABLES.some((v) => name.includes(v));
    const isProtein = HEALTHY_PROTEINS.some((p) => name.includes(p));
    const isHighStarch = HIGH_STARCH.some((s) => name.includes(s));

    if (isVeg || name.includes('fruit') || name.includes('berry')) {
      categories.great.push(item);
    } else if (isProtein) {
      categories.good.push(item);
    } else if (isHighStarch) {
      categories.limit.push(item);
    } else {
      categories.okay.push(item);
    }
  });

  return categories;
}
