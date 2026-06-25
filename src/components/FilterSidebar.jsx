const CATEGORY_OPTIONS = ['smartphone', 'laptop', 'audio', 'tv', 'accessory'];
const BRAND_OPTIONS    = ['Samsung','Apple','HP','Dell','Lenovo','Sony',
                           'JBL','Tecno','Itel','Anker','LG','TCL'];

function toggle(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export default function FilterSidebar({
  selectedCategories, onCategoryChange,
  selectedBrands,     onBrandChange,
  priceRange,         onPriceChange,
  maxPrice,
}) {
  return (
    <aside className='w-full lg:w-52 flex-shrink-0'>
      <div className='bg-white rounded-xl shadow-sm border border-slate-100 p-4
                      lg:sticky lg:top-24 custom-scroll overflow-y-auto lg:max-h-[80vh]'>

        <h2 className='font-bold text-navy mb-4 text-sm uppercase tracking-wide'>
          Filters
        </h2>

        {/* ── Category filter ─────────────────────────────────────── */}
        <div className='mb-5'>
          <h3 className='font-semibold text-xs text-gray-500 uppercase mb-2'>
            Category
          </h3>
          {CATEGORY_OPTIONS.map(cat => (
            <label key={cat}
              className='flex items-center gap-2 py-1 cursor-pointer capitalize text-sm'
            >
              <input type='checkbox'
                checked={selectedCategories.includes(cat)}
                onChange={() => onCategoryChange(toggle(selectedCategories, cat))}
                className='accent-blue-700'
              />
              {cat}
            </label>
          ))}
        </div>

        {/* ── Brand filter ─────────────────────────────────────────── */}
        <div className='mb-5'>
          <h3 className='font-semibold text-xs text-gray-500 uppercase mb-2'>
            Brand
          </h3>
          {BRAND_OPTIONS.map(brand => (
            <label key={brand}
              className='flex items-center gap-2 py-1 cursor-pointer text-sm'
            >
              <input type='checkbox'
                checked={selectedBrands.includes(brand)}
                onChange={() => onBrandChange(toggle(selectedBrands, brand))}
                className='accent-blue-700'
              />
              {brand}
            </label>
          ))}
        </div>

        {/* ── Price range slider ──────────────────────────────────── */}
        <div>
          <h3 className='font-semibold text-xs text-gray-500 uppercase mb-2'>
            Max Price
          </h3>
          <p className='text-sm font-semibold text-red-700 mb-2'>
            Up to &#8358;{priceRange[1].toLocaleString()}
          </p>
          {/* Single-handle slider for max price */}
          <input type='range' min={0} max={maxPrice ?? 1000000} step={10000}
            value={priceRange[1]}
            onChange={e => onPriceChange([0, parseInt(e.target.value, 10)])}
            className='w-full accent-blue-700'
            aria-label='Maximum price'
          />
          <div className='flex justify-between text-xs text-gray-400 mt-1'>
            <span>&#8358;0</span>
            <span>&#8358;{(maxPrice ?? 1000000).toLocaleString()}</span>
          </div>
        </div>

        {/* Clear all filters button */}
        <button
          onClick={() => {
            onCategoryChange([]);
            onBrandChange([]);
            onPriceChange([0, maxPrice ?? 1000000]);
          }}
          className='mt-5 w-full text-xs text-red-700 hover:underline text-center py-1'
        >
          Clear all filters
        </button>
      </div>
    </aside>
  );
}