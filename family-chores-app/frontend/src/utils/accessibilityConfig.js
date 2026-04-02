/**
 * Accessibility configuration helpers.
 * Used throughout the app to apply user-specific accessibility settings.
 */

/**
 * Get CSS font size class for a user.
 */
export function getFontSizeClass(user) {
  const fontSize = user?.accessibility?.fontSize;
  if (fontSize === '20px') return 'font-xl';
  if (fontSize === '18px') return 'font-large';
  return 'font-normal-accessible';
}

/**
 * Get inline font size style for a user.
 */
export function getFontSize(user) {
  const fontSize = user?.accessibility?.fontSize;
  return fontSize || '16px';
}

/**
 * Get contrast CSS class for a user.
 */
export function getContrastClass(user) {
  const contrast = user?.accessibility?.contrast;
  if (contrast === 'high') return 'high-contrast';
  return '';
}

/**
 * Check if user has large buttons enabled.
 */
export function hasLargeButtons(user) {
  return user?.accessibility?.largeButtons === true;
}

/**
 * Get button size class based on user settings.
 */
export function getButtonSize(user) {
  if (hasLargeButtons(user)) return 'large-button';
  return '';
}

/**
 * Check if voice is enabled for user.
 */
export function isVoiceEnabled(user) {
  return user?.accessibility?.voiceEnabled === true;
}

/**
 * Check if simplified UI is requested.
 */
export function isSimplifiedUI(user) {
  return user?.accessibility?.simplifyUI === true;
}

/**
 * Speak text using Web Speech API.
 */
export function speak(text, options = {}) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // Stop any current speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  utterance.lang = options.lang || 'en-ZA';

  window.speechSynthesis.speak(utterance);
}

/**
 * Build accessibility class string for a component.
 */
export function buildAccessibilityClasses(user) {
  const classes = [];

  const fontSize = user?.accessibility?.fontSize;
  if (fontSize === '20px') classes.push('font-xl');
  else if (fontSize === '18px') classes.push('font-large');

  if (user?.accessibility?.contrast === 'high') classes.push('high-contrast');
  if (user?.accessibility?.largeButtons) classes.push('large-button');
  if (user?.accessibility?.simplifyUI) classes.push('simplify-ui');

  return classes.join(' ');
}

/**
 * Get accessible label for common actions.
 */
export function getAccessibleLabel(action, context = '') {
  const labels = {
    complete: `Mark "${context}" as complete`,
    delete: `Delete "${context}"`,
    edit: `Edit "${context}"`,
    add: `Add ${context}`,
    close: 'Close dialog',
    menu: 'Open navigation menu',
    sync: 'Sync with server',
    generateRecipe: 'Generate recipes using AI',
    logMood: 'Log your mood for today',
    logGratitude: 'Add gratitude entry'
  };

  return labels[action] || `${action} ${context}`.trim();
}
