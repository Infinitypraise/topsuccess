// src/utils/dataManager.js
// Centralised module for all data persistence and retrieval operations.
// IMPORTANT: This file has NO React imports. It is pure JavaScript.
// This makes it independently testable and reusable outside of React components.

// The localStorage key used for all preference storage.
// Using a namespaced key prevents clashes with other apps on the same domain.
const PREFS_KEY = 'retailRecommender_v1_userPreferences';

// ── SAVE PREFERENCES ──────────────────────────────────────────────────────
/**
 * Serialises a preference object to JSON and saves it to localStorage.
 * Wrapped in try/catch because localStorage can fail in private browsing
 * mode on some browsers (especially Safari), and we should fail gracefully.
 *
 * @param {Object} prefs - The complete user preference object
 */
export function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    // If storage is unavailable, log a warning but do not crash the app.
    // The app will still work — it just won't remember preferences on next visit.
    console.warn('[dataManager] Could not save preferences:', err.message);
  }
}

// ── LOAD PREFERENCES ──────────────────────────────────────────────────────
/**
 * Retrieves and deserialises the user preference object from localStorage.
 * Returns null if no preferences have been saved yet (first-time visitor).
 * A null return value tells the app to redirect the user to /setup.
 *
 * @returns {Object|null} The saved preference object, or null
 */
export function loadPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    // JSON.parse(null) would throw, so we guard against it explicitly
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupted localStorage data — treat as if no preferences exist
    return null;
  }
}

// ── CLEAR PREFERENCES ─────────────────────────────────────────────────────
/**
 * Removes preference data from localStorage.
 * Called when the user clicks 'Reset Preferences' in the settings.
 */
export function clearPreferences() {
  try {
    localStorage.removeItem(PREFS_KEY);
  } catch (err) {
    console.warn('[dataManager] Could not clear preferences:', err.message);
  }
}

// ── BUILD PREFERENCE VECTOR ───────────────────────────────────────────────
/**
 * Converts a user preference object into a numeric vector for cosine similarity.
 *
 * The vector has exactly 8 elements, one per attribute dimension plus a
 * category-match signal, in this order:
 * [priceTier, batteryScore, displayScore, processorTier,
 *  connectivityScore, portabilityScore, valueTier, categoryMatch]
 *
 * Each attribute value is multiplied by its corresponding weight from
 * attributeWeights. The final category dimension uses categoryWeight so the
 * selected shopping category contributes directly to the similarity score.
 *
 * IMPORTANT: This order must exactly match buildProductVector() in
 * recommendationEngine.js — if they differ, similarity scores are meaningless.
 *
 * @param {Object} prefs - User preference object from localStorage
 * @returns {number[]} Weighted preference vector of length 8
 */
export function buildPreferenceVector(prefs) {
  // The seven attribute dimensions, in the canonical order
  const ATTR_KEYS = [
    'priceTier',
    'batteryScore',
    'displayScore',
    'processorTier',
    'connectivityScore',
    'portabilityScore',
    'valueTier',
  ];

  const vector = ATTR_KEYS.map(attr => {
    // Fallback to 0 if the attribute is missing (defensive coding)
    const value  = prefs?.[attr] ?? 0;
    // Fallback to 1.0 (neutral weight) if weights are not set
    const weight = prefs?.attributeWeights?.[attr] ?? 1.0;
    return value * weight;
  });

  const categoryWeight = prefs?.categoryWeight ?? 3.0;
  const categoryMatch  = prefs?.preferredCategory ? categoryWeight : 0;

  return [...vector, categoryMatch];
}