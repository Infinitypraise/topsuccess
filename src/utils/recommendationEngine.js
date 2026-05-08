// src/utils/recommendationEngine.js
// Core recommendation logic for the electronic retail recommender system.
// ALL functions are pure JavaScript with no React dependency.
// Implements content-based filtering (CBF) via cosine similarity,
// with rule-based cascade post-filtering.

import { buildPreferenceVector } from './dataManager';
import { RULES } from '../data/rules';


// ══════════════════════════════════════════════════════════════════════════
// SECTION 1: COSINE SIMILARITY
// ══════════════════════════════════════════════════════════════════════════

/**
 * Computes the cosine similarity between two numeric vectors.
 *
 * The formula is: sim(A, B) = (A · B) / (||A|| × ||B||)
 * where:
 *   A · B   = the dot product (sum of element-wise products)
 *   ||A||   = the L2 norm of A (square root of sum of squared elements)
 *   ||B||   = the L2 norm of B
 *
 * The result is a float in the range [0, 1].
 * A score of 1 means the vectors point in exactly the same direction
 * (perfect attribute alignment between user and product).
 * A score of 0 means no alignment at all.
 *
 * WHY COSINE SIMILARITY?
 * Cosine similarity is invariant to vector magnitude. This means a product
 * with all attribute values at 0.5 and a product with all values at 1.0 would
 * both score equally against a user whose preferences are also uniform.
 * This prevents products with high raw attribute values from being unfairly
 * boosted just because their numbers are larger.
 *
 * @param {number[]} vecA - User preference vector (length 7)
 * @param {number[]} vecB - Product attribute vector (length 7)
 * @returns {number} Cosine similarity score in [0, 1]
 */
export function cosineSimilarity(vecA, vecB) {
  // Step 1: Compute the dot product
  // reduce() walks through both arrays simultaneously using the index i
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);

  // Step 2: Compute the magnitude (L2 norm) of each vector
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  // Step 3: Guard against division by zero.
  // A zero-magnitude vector means all attribute values are 0, which would
  // make similarity undefined. We return 0 (no match) as a safe fallback.
  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  // Step 4: Compute and return the cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
}


// ══════════════════════════════════════════════════════════════════════════
// SECTION 2: PRODUCT VECTOR BUILDER
// ══════════════════════════════════════════════════════════════════════════

/**
 * Extracts the 7 numeric attribute values from a product object
 * and returns them as a vector in the canonical attribute order.
 *
 * CRITICAL: The attribute order here MUST match the order in
 * buildPreferenceVector() in dataManager.js.
 * If the orders differ, cosine similarity compares the wrong dimensions.
 *
 * priceTier (1-5) and processorTier (1-5) are divided by 5 to normalise
 * them to the [0, 1] range, matching the scale of all other attributes.
 *
 * @param {Object} product - A product object from products.js
 * @returns {number[]} Product attribute vector of length 7
 */
function buildProductVector(product) {
  return [
    product.priceTier         / 5,  // Normalise 1-5 → 0.2 to 1.0
    product.batteryScore,           // Already [0, 1]
    product.displayScore,           // Already [0, 1]
    product.processorTier     / 5,  // Normalise 1-5 → 0.2 to 1.0
    product.connectivityScore,      // Already [0, 1]
    product.portabilityScore,       // Already [0, 1]
    product.valueTier,              // Already [0, 1]
  ];
}


// ══════════════════════════════════════════════════════════════════════════
// SECTION 3: PER-ATTRIBUTE MATCH SCORES (for explainability panel)
// ══════════════════════════════════════════════════════════════════════════

/**
 * Computes individual attribute-level match scores between a product and
 * the user's preferences. These scores power the 'Why recommended?' panel.
 *
 * The formula for each attribute is: score = 1 - |productValue - prefValue|
 * A score of 1.0 means the product's attribute exactly matches the preference.
 * A score of 0.0 means they are as different as possible.
 *
 * @param {Object} product - A product object
 * @param {Object} prefs   - The user preference object
 * @returns {Object} Map of attribute name to match score in [0, 1]
 */
function buildAttributeMatchScores(product, prefs) {
  return {
    'Price Range': Math.max(0,
      1 - Math.abs((product.priceTier / 5) - (prefs.priceTier / 5))
    ),
    'Battery Life': Math.max(0,
      1 - Math.abs(product.batteryScore - prefs.batteryScore)
    ),
    'Display Quality': Math.max(0,
      1 - Math.abs(product.displayScore - prefs.displayScore)
    ),
    'Processing Power': Math.max(0,
      1 - Math.abs((product.processorTier / 5) - (prefs.processorTier / 5))
    ),
    'Connectivity': Math.max(0,
      1 - Math.abs(product.connectivityScore - prefs.connectivityScore)
    ),
    'Portability': Math.max(0,
      1 - Math.abs(product.portabilityScore - prefs.portabilityScore)
    ),
    'Value for Money': Math.max(0,
      1 - Math.abs(product.valueTier - prefs.valueTier)
    ),
  };
}


// ══════════════════════════════════════════════════════════════════════════
// SECTION 4: SCORE ALL PRODUCTS
// ══════════════════════════════════════════════════════════════════════════

/**
 * Computes cosine similarity between the user preference vector and
 * every product in the catalogue, then sorts results by descending score.
 *
 * This function also attaches attributeScores (per-attribute match data)
 * to each product object so the RecommendationCard can display explanations.
 *
 * Time complexity: O(n × d) where n = number of products, d = 7 (attributes).
 * For 50 products this is effectively O(1) and runs in < 5ms.
 *
 * @param {Object[]} products - Full product catalogue array from products.js
 * @param {Object}   prefs    - User preference object from localStorage
 * @returns {Object[]} Products augmented with similarityScore and attributeScores,
 *                    sorted by descending similarityScore
 */
export function scoreProducts(products, prefs) {
  // Build the user preference vector once, outside the loop, for efficiency
  const prefVector = buildPreferenceVector(prefs);

  return products
    .map(product => ({
      ...product,  // Spread all original product fields
      // Attach the overall cosine similarity score
      similarityScore: cosineSimilarity(prefVector, buildProductVector(product)),
      // Attach per-attribute scores for the explainability panel
      attributeScores: buildAttributeMatchScores(product, prefs),
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore); // Descending order
}


// ══════════════════════════════════════════════════════════════════════════
// SECTION 5: RULE-BASED POST-FILTER
// ══════════════════════════════════════════════════════════════════════════

/**
 * Applies the RULES configuration array to a scored product list.
 * Rules are evaluated in ascending priority order (priority 1 = applied first).
 *
 * BOOST rules: multiply the similarityScore of matching products by factor.
 * EXCLUDE rules: remove matching products from the candidate list.
 *
 * After all boost operations, the list is re-sorted so the updated scores
 * are reflected in the final ranking.
 *
 * @param {Object[]} scoredProducts - Output of scoreProducts()
 * @param {Object}   prefs          - User preference object
 * @returns {Object[]} Modified and re-sorted product list
 */
export function applyRules(scoredProducts, prefs) {
  // Sort rules by ascending priority so priority-1 rules always run first
  const orderedRules = [...RULES].sort((a, b) => a.priority - b.priority);

  // Work on a copy of the array to avoid mutating the input
  let result = [...scoredProducts];

  orderedRules.forEach(rule => {
    // Evaluate the rule's condition function against the user preferences.
    // If the condition returns false, skip this rule entirely.
    if (!rule.condition(prefs)) return;

    if (rule.action.type === 'boost') {
      // Multiply the similarityScore of any product whose target field
      // matches one of the rule's values
      result = result.map(product =>
        rule.action.values.includes(product[rule.action.target])
          ? {
              ...product,
              // Cap the boosted score at 1.0 so we never exceed 100% match
              similarityScore: Math.min(
                1.0,
                product.similarityScore * rule.action.factor
              ),
            }
          : product
      );
    } else if (rule.action.type === 'exclude') {
      // Remove products that match the exclusion target/values
      result = result.filter(product =>
        !rule.action.values.includes(product[rule.action.target])
      );
    }
  });

  // Re-sort after boosts may have changed the relative order of scores
  return result.sort((a, b) => b.similarityScore - a.similarityScore);
}


// ══════════════════════════════════════════════════════════════════════════
// SECTION 6: MASTER RECOMMENDATION FUNCTION
// ══════════════════════════════════════════════════════════════════════════

/**
 * The public entry point for the recommendation pipeline.
 * Calls scoreProducts(), then applyRules(), then slices to the top N.
 * This is the only function that React components need to call directly.
 *
 * @param {Object[]} products - Full product catalogue
 * @param {Object}   prefs    - User preference object from localStorage
 * @param {number}   n        - Number of recommendations to return (default: 8)
 * @returns {Object[]} Top N recommended products with scores and explanations
 */
export function getTopRecommendations(products, prefs, n = 8) {
  const scored   = scoreProducts(products, prefs);
  const filtered = applyRules(scored, prefs);
  return filtered.slice(0, n);
}