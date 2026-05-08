import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';
import RecommendationCard from './RecommendationCard';

export default function RecommendationDisplay() {
  const { recommendations, prefs, isReady } = useRecommendation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && !prefs) {
      navigate('/setup', { replace: true });
    }
  }, [isReady, prefs, navigate]);

  if (!isReady) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center'>
        <div className='w-12 h-12 border-4 border-red-800 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-500'>Computing your recommendations...</p>
        </div>
      </div>
    );
  }

  const category = prefs?.preferredCategory ?? 'electronics';

  return (
    <div className='py-6'>

      {/* Page header */}
      <div className='flex items-start justify-between mb-2 flex-wrap gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-navy'>
            Your Personalised Picks
          </h1>
          <p className='text-gray-500 mt-1 capitalize'>
            Based on your preferences for{' '}
            <span className='font-semibold text-red-700'>{category}</span>
          </p>
        </div>
        {/* Update preferences link */}
        <Link to='/setup'
          className='text-sm px-4 py-2 border border-red-800 text-red-800
                     rounded-lg hover:bg-red-50 transition-colors font-medium'
        >
          Update Preferences
        </Link>
      </div>

      {/* Preference summary chips */}
      <div className='flex flex-wrap gap-2 mb-8'>
        <span className='text-xs px-3 py-1 bg-red-100 text-red-800
                         rounded-full font-medium capitalize'>
          {category}
        </span>
        {prefs?.priceTier && (
          <span className='text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full'>
            Price Tier: {prefs.priceTier}/5
          </span>
        )}
        {prefs?.preferredBrands?.length > 0 && (
          <span className='text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full'>
            Preferred: {prefs.preferredBrands.join(', ')}
          </span>
        )}
      </div>

      {/* Recommendation cards grid */}
      {recommendations.length === 0 ? (
        <div className='text-center py-16'>
          <p className='text-gray-400 text-lg mb-4'>
            No recommendations found for your current preferences.
          </p>
          <Link to='/setup'
            className='px-5 py-2 bg-red-800 text-white rounded-lg font-semibold'
          >
            Adjust Preferences
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5'>
          {recommendations.map((product, index) => (
            // Pass the 1-based rank to RecommendationCard for display
            <RecommendationCard key={product.id} product={product} rank={index + 1} />
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className='mt-10 text-center'>
        <Link to='/browse'
          className='text-red-700 hover:underline text-sm font-medium'
        >
          Browse the full catalogue instead
        </Link>
      </div>
    </div>
  );
}