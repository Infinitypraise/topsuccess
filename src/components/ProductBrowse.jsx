import { useState, useMemo } from 'react';
import { useRecommendation } from '../context/RecommendationContext';
import FilterSidebar from './FilterSidebar';
import ProductCard from './ProductCard';

const SORT_OPTIONS = [
  { value: 'relevance',   label: 'Sort: Relevance' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'name-asc',    label: 'Name: A to Z' },
];

export default function ProductBrowse() {
  const { scoredProducts, products } = useRecommendation();

  const baseProducts = scoredProducts.length > 0 ? scoredProducts : products;
  const maxProductPrice = Math.max(0, ...products.map(p => p.price));

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands,     setSelectedBrands]     = useState([]);
  const [priceRange,         setPriceRange]         = useState([0, maxProductPrice]);
  const [sortOrder,          setSortOrder]          = useState('relevance');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [showFilters,        setShowFilters]        = useState(false);

  const displayedProducts = useMemo(() => {
    let filtered = [...baseProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortOrder) {
      case 'relevance':
        filtered.sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [baseProducts, searchQuery, selectedCategories, selectedBrands, priceRange, sortOrder]);

   return (
    <div className='py-6'>
      <h1 className='text-3xl font-bold text-navy mb-6'>Browse All Products</h1>

      {/* Search bar */}
      <div className='mb-6'>
        <input type='search'
          placeholder='Search products, brands, or features...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='w-full px-4 py-3 rounded-xl border border-slate-200
                     focus:outline-none focus:ring-2 focus:ring-red-400 bg-white'
          aria-label='Search products'
        />
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Mobile filters toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='lg:hidden mb-2 px-4 py-2 bg-red-800 text-white rounded-lg
                     font-semibold hover:bg-red-900 transition-colors text-sm'
          aria-label='Toggle filters'
        >
          {showFilters ? '✕ Hide Filters' : '☰ Show Filters'}
        </button>

        {/* Filter sidebar — hidden on mobile by default, always visible on lg */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <FilterSidebar
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            selectedBrands={selectedBrands}
            onBrandChange={setSelectedBrands}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            maxPrice={maxProductPrice}
          />
        </div>

        {/* Main content */}
        <main className='flex-1 min-w-0'>
          {/* Sort dropdown + result count */}
          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-gray-500'>
              {displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''} found
            </p>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className='border border-slate-200 rounded-lg px-3 py-1.5 text-sm
                         bg-white focus:outline-none focus:ring-2 focus:ring-red-400'
              aria-label='Sort order'
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Product grid */}
          {displayedProducts.length === 0 ? (
            <div className='text-center py-16 text-gray-400'>
              <p className='text-lg mb-2'>No products match your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedBrands([]);
                  setPriceRange([0, maxProductPrice]);
                  setSearchQuery('');
                }}
                className='text-red-700 hover:underline text-sm'
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}