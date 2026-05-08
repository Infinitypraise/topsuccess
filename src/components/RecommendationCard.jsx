import { useState } from 'react';
import { Link } from 'react-router-dom';

function scoreToColour(score) {
  if (score >= 0.75) return 'bg-green-500';
  if (score >= 0.50) return 'bg-amber-400';
  return 'bg-slate-300';
}

export default function RecommendationCard({ product, rank }) {
  const [showExplanation, setShowExplanation] = useState(false);

  const matchPercent = Math.round(product.similarityScore * 100);

  const topAttributes = Object.entries(product.attributeScores ?? {})
    .sort(([, a], [, b]) => b - a)  // Sort by score descending
    .slice(0, 4);                    // Show only the top 4

  return (
    <article
      className='bg-white rounded-xl shadow-sm border border-slate-100
                 hover:shadow-md transition-shadow overflow-hidden'
      aria-label={`Recommendation ${rank}: ${product.name}`}
    >
      {/* ── Card header with rank badge ──────────────────────────── */}
      <div className='bg-gradient-to-r from-navy to-red-700 p-4 relative'>
        {/* Rank badge — top left corner */}
        <span className='absolute top-3 left-3 bg-white text-navy text-xs
                         font-bold px-2 py-1 rounded-full shadow'>
          #{rank}
        </span>
        {/* Product name and category */}
        <div className='pl-8'>
          <span className='text-red-200 text-xs uppercase tracking-wide font-medium'>
            {product.category}
          </span>
          <h3 className='text-white font-bold text-base leading-tight mt-0.5'>
            {product.name}
          </h3>
          <p className='text-red-200 text-sm'>{product.brand}</p>
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────────── */}
      <div className='p-4'>

        {/* Price and match percentage — side by side */}
        <div className='flex items-center justify-between mb-4'>
          <span className='text-xl font-bold text-navy'>
            &#8358;{product.price.toLocaleString()}
          </span>
          {/* Match percentage badge */}
          <div className={`px-3 py-1 rounded-full text-white text-sm font-bold
                           ${matchPercent >= 75 ? 'bg-green-600'
                             : matchPercent >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
          >
            {matchPercent}% match
          </div>
        </div>

        {/* Top 4 attribute match bars */}
        <div className='space-y-2 mb-4'>
          {topAttributes.map(([attrName, score]) => (
            <div key={attrName}>
              <div className='flex justify-between text-xs text-gray-500 mb-0.5'>
                <span>{attrName}</span>
                <span>{Math.round(score * 100)}%</span>
              </div>
              {/* Progress bar — width is inline because Tailwind can't
                  generate arbitrary width values from dynamic variables */}
              <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all ${scoreToColour(score)}`}
                  style={{ width: `${Math.round(score * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 'Why recommended?' expandable accordion */}
        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className='w-full text-left text-sm text-red-700 font-medium
                     hover:text-red-900 transition-colors py-2 border-t border-slate-100'
          aria-expanded={showExplanation}
        >
          {showExplanation ? '▲ Hide explanation' : '▼ Why recommended?'}
        </button>

        {/* Expanded explanation content */}
        {showExplanation && (
          <div className='mt-2 p-3 bg-red-50 rounded-lg space-y-1'>
            {Object.entries(product.attributeScores ?? {}).map(([attr, score]) => (
              <p key={attr} className='text-xs text-gray-600'>
                <span className='font-semibold text-navy'>{attr}:</span>{' '}
                {Math.round(score * 100)}% alignment with your preference
              </p>
            ))}
          </div>
        )}

        {/* View full details link */}
        <Link
          to={`/product/${product.id}`}
          className='mt-4 block w-full py-2 text-center bg-red-800 text-white
                     rounded-lg font-semibold hover:bg-red-900 transition-colors text-sm'
        >
          View Full Details
        </Link>
      </div>
    </article>
  );
}