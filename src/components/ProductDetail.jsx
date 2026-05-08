import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';

const SPEC_ROWS = [
  { label: 'Category',     key: 'category' },
  { label: 'Brand',        key: 'brand' },
  { label: 'Price',        key: 'price', format: v => `\u20A6${v.toLocaleString()}` },
  { label: 'Price Tier',   key: 'priceTier', format: v => `${v}/5` },
  { label: 'Battery',      key: 'batteryScore', format: v => `${Math.round(v*100)}%` },
  { label: 'Display',      key: 'displayScore', format: v => `${Math.round(v*100)}%` },
  { label: 'Processor',    key: 'processorTier', format: v => `Tier ${v}/5` },
  { label: 'Connectivity', key: 'connectivityScore', format: v => `${Math.round(v*100)}%` },
  { label: 'Portability',  key: 'portabilityScore', format: v => `${Math.round(v*100)}%` },
  { label: 'Value',        key: 'valueTier', format: v => `${Math.round(v*100)}%` },
  { label: 'Use Cases',    key: 'useCases', format: v => v.join(', ') },
];

export default function ProductDetail() {
  const { id }      = useParams();           
  const navigate    = useNavigate();
  const { scoredProducts, products } = useRecommendation();

  const pool = scoredProducts.length > 0 ? scoredProducts : products;

  const product = pool.find(p => p.id === id);

  if (!product) {
    return (
      <div className='text-center py-20'>
        <p className='text-gray-400 mb-4'>Product not found.</p>
        <button onClick={() => navigate('/browse')}
          className='px-4 py-2 bg-red-800 text-white rounded-lg font-semibold'
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const matchPercent = product.similarityScore != null
    ? Math.round(product.similarityScore * 100)
    : null;

  const relatedProducts = pool
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  return (
    <div className='py-6'>

      {/* Breadcrumb navigation */}
      <nav className='text-sm text-gray-400 mb-6' aria-label='Breadcrumb'>
        <Link to='/' className='hover:text-red-700'>Home</Link>
        {' > '}
        <Link to='/browse' className='hover:text-red-700 capitalize'>
          {product.category}s
        </Link>
        {' > '}
        <span className='text-gray-600'>{product.name}</span>
      </nav>

      {/* Main product information layout */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10'>

        {/* Left column: image placeholder */}
        <div className='bg-slate-100 rounded-2xl flex items-center justify-center
                        min-h-64 text-gray-300 text-6xl'>
          {product.category === 'smartphone' ? '📱'
          : product.category === 'laptop' ? '💻'
          : product.category === 'audio' ? '🎧'
          : product.category === 'tv' ? '📺' : '🔌'}
        </div>

        {/* Right column: product info */}
        <div>
          <span className='text-xs font-semibold text-red-700 uppercase tracking-wide'>
            {product.brand}
          </span>
          <h1 className='text-2xl font-bold text-navy mt-1 mb-3'>
            {product.name}
          </h1>
          <p className='text-3xl font-bold text-navy mb-4'>
            &#8358;{product.price.toLocaleString()}
          </p>

          {/* Similarity match bar — only shown if prefs exist */}
          {matchPercent !== null && (
            <div className='mb-5'>
              <div className='flex justify-between text-sm mb-1'>
                <span className='font-semibold text-gray-700'>Your Match</span>
                <span className='font-bold text-red-700'>{matchPercent}%</span>
              </div>
              <div className='h-3 bg-slate-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-red-700 rounded-full transition-all'
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <p className='text-gray-600 mb-5 leading-relaxed'>{product.description}</p>

          {/* Key use cases */}
          <div className='flex flex-wrap gap-2 mb-5'>
            {product.useCases?.map(uc => (
              <span key={uc}
                className='text-xs px-3 py-1 bg-red-50 text-red-700 rounded-full capitalize'
              >
                {uc.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className='flex gap-3'>
            <button className='flex-1 py-3 bg-red-800 text-white rounded-xl
                               font-bold hover:bg-red-900 transition-colors'>
              Add to Cart
            </button>
            <Link to='/setup'
              className='px-4 py-3 border-2 border-red-800 text-red-800 rounded-xl
                         font-semibold hover:bg-red-50 transition-colors text-sm'
            >
              Adjust Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* Full specifications table */}
      <section className='mb-10'>
        <h2 className='text-xl font-bold text-navy mb-4'>Full Specifications</h2>
        <div className='bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden'>
          {SPEC_ROWS.map(({ label, key, format }, i) => (
            <div key={key}
              className={`flex gap-4 px-5 py-3 text-sm
                          ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
            >
              <span className='w-36 font-semibold text-gray-600 flex-shrink-0'>
                {label}
              </span>
              <span className='text-gray-800 capitalize'>
                {format ? format(product[key]) : String(product[key])}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Attribute match breakdown */}
      {product.attributeScores && (
        <section className='mb-10'>
          <h2 className='text-xl font-bold text-navy mb-4'>
            Why This Product Matches You
          </h2>
          <div className='bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-3'>
            {Object.entries(product.attributeScores).map(([attr, score]) => (
              <div key={attr}>
                <div className='flex justify-between text-sm mb-1'>
                  <span className='font-medium text-gray-700'>{attr}</span>
                  <span className='text-red-700 font-semibold'>
                    {Math.round(score * 100)}% match
                  </span>
                </div>
                <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-red-700 rounded-full'
                    style={{ width: `${Math.round(score * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className='text-xl font-bold text-navy mb-4'>Related Products</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
            {relatedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`}
                className='bg-white rounded-xl p-3 shadow-sm border border-slate-100
                           hover:shadow-md transition-shadow text-center'
              >
                <p className='text-xs font-bold text-navy leading-tight mb-1'>{p.name}</p>
                <p className='text-xs text-gray-400'>{p.brand}</p>
                <p className='text-sm font-bold text-red-800 mt-1'>
                  &#8358;{p.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}