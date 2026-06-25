import { createContext, useContext, useEffect, useState, useCallback }
  from 'react';
import { products }                    from '../data/products';
import { loadPreferences }             from '../utils/dataManager';
import { scoreProducts,
         applyRules }                  from '../utils/recommendationEngine';

const RecommendationContext = createContext({
  products:         [],   // All 50 products (unscored)
  scoredProducts:   [],   // All 50 products with similarityScore attached
  filteredProducts: [],   // All scored products after recommendation rules
  recommendations:  [],   // Top 8 recommendations after rule filtering
  prefs:            null, // The current user preference object
  isReady:          false,// True once scoring has completed
  refreshScores:    () => {}, // Call this after updating preferences
});


/**

 * @param {React.ReactNode} children - All child components of the app
 */
export function RecommendationProvider({ children }) {
  const [prefs,           setPrefs]           = useState(null);
  const [scoredProducts,  setScoredProducts]  = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isReady,         setIsReady]         = useState(false);

   const runPipeline = useCallback((savedPrefs) => {
    if (!savedPrefs) return;

    const scored = scoreProducts(products, savedPrefs);
    setScoredProducts(scored);

    const filtered = applyRules(scored, savedPrefs);
    setFilteredProducts(filtered);
    setRecommendations(filtered.slice(0, 8));

    setIsReady(true);
  }, []);

  useEffect(() => {
    const savedPrefs = loadPreferences();
    if (savedPrefs) {
      setPrefs(savedPrefs);
      runPipeline(savedPrefs);
    }
    setIsReady(true);
  }, [runPipeline]);
  const refreshScores = useCallback(() => {
    const latestPrefs = loadPreferences();
    if (!latestPrefs) return;
    setPrefs(latestPrefs);
    runPipeline(latestPrefs);
  }, [runPipeline]);

  return (
    <RecommendationContext.Provider
      value={{
        products,
        scoredProducts,
        filteredProducts,
        recommendations,
        prefs,
        isReady,
        refreshScores,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
}



export const useRecommendation = () => useContext(RecommendationContext);