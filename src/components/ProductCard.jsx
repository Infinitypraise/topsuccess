import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const matchPercent = product.similarityScore != null
    ? Math.round(product.similarityScore * 100)
    : null;

  const categoryColours = {
    smartphone: 'bg-red-100 text-red-800',
    laptop:     'bg-purple-100 text-purple-800',
    audio:      'bg-green-100 text-green-800',
    tv:         'bg-orange-100 text-orange-800',
    accessory:  'bg-slate-100 text-slate-700',
  };

  return (
    <article className='bg-white rounded-xl shadow-sm border border-slate-100
                        hover:shadow-md transition-shadow p-4 flex flex-col gap-3'>

      {/* Category badge */}
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start capitalize
                        ${categoryColours[product.category] ?? 'bg-slate-100 text-slate-700'}`}
      >
        {product.category}
      </span>

      {/* Product name */}
      <h3 className='font-bold text-navy text-sm leading-tight'>{product.name}</h3>

      {/* Brand */}
      <p className='text-xs text-gray-400 -mt-2'>{product.brand}</p>

      {/* Price */}
      <p className='text-base font-bold text-navy'>
        &#8358;{product.price.toLocaleString()}
      </p>

      {/* Match score badge — only shown if preferences exist */}
      {matchPercent !== null && (
        <div className={`self-start text-xs font-bold px-2 py-1 rounded-full text-white
                         ${matchPercent >= 75 ? 'bg-green-600'
                           : matchPercent >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
        >
          {matchPercent}% match
        </div>
      )}

      {/* Description excerpt */}
      <p className='text-xs text-gray-500 line-clamp-2 flex-1'>
        {product.description}
      </p>

      {/* Link to detail page */}
      <Link to={`/product/${product.id}`}
        className='mt-auto block text-center py-2 bg-red-800 text-white rounded-lg
                   text-sm font-semibold hover:bg-red-900 transition-colors'
      >
        View Details
      </Link>
    </article>
  );
}