import { createContext, useContext, useEffect, useState, useCallback }
  from 'react';
import { products }                    from '../data/products';
import { loadPreferences }             from '../utils/dataManager';
import { getTopRecommendations,
         scoreProducts }               from '../utils/recommendationEngine';

const RecommendationContext = createContext({
  products:         [],   // All 50 products (unscored)
  scoredProducts:   [],   // All 50 products with similarityScore attached
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
  const [recommendations, setRecommendations] = useState([]);
  const [isReady,         setIsReady]         = useState(false);

   const runPipeline = useCallback((savedPrefs) => {
    if (!savedPrefs) return;

    const scored = scoreProducts(products, savedPrefs);
    setScoredProducts(scored);

    const topN = getTopRecommendations(products, savedPrefs, 8);
    setRecommendations(topN);

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