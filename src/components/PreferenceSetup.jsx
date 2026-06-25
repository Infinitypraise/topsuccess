import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePreferences, loadPreferences } from '../utils/dataManager';
import { useRecommendation } from '../context/RecommendationContext';

const CATEGORIES = ['smartphone', 'laptop', 'audio', 'tv', 'accessory'];

const BRANDS = [
  'Samsung', 'Apple', 'HP', 'Dell', 'Lenovo',
  'Sony', 'JBL', 'Tecno', 'Itel', 'Anker', 'LG', 'TCL',
  'OnePlus', 'Google', 'Oppo', 'Xiaomi',
];

const DEFAULT_PREFS = {
  preferredCategory:  'smartphone',
  preferredBrands:    [],
  priceTier:          3,  
  batteryScore:       0.5,
  displayScore:       0.5,
  processorTier:      3,
  connectivityScore:  0.5,
  portabilityScore:   0.5,
  valueTier:          0.5,
  attributeWeights: {
    priceTier: 1.0, batteryScore: 1.0, displayScore: 1.0,
    processorTier: 1.0, connectivityScore: 1.0,
    portabilityScore: 1.0, valueTier: 1.0,
  },
};

const SLIDERS = [
  { key: 'batteryScore',      label: 'Battery Life',      icon: '🔋', min:0, max:1, step:0.1 },
  { key: 'displayScore',      label: 'Display Quality',   icon: '🖥️', min:0, max:1, step:0.1 },
  { key: 'processorTier',     label: 'Processing Power',  icon: '⚡', min:1, max:5, step:1   },
  { key: 'connectivityScore', label: 'Connectivity',      icon: '📶', min:0, max:1, step:0.1 },
  { key: 'portabilityScore',  label: 'Portability',       icon: '🎒', min:0, max:1, step:0.1 },
  { key: 'valueTier',         label: 'Value for Money',   icon: '💰', min:0, max:1, step:0.1 },
];


const PRICE_LABELS = {
  1: 'Under ₦100,000',
  2: '₦100,000 – ₦250,000',
  3: '₦250,000 – ₦500,000',
  4: '₦500,000 – ₦800,000',
  5: 'Above ₦800,000',
};


export default function PreferenceSetup() {
  const navigate = useNavigate();
  const { refreshScores } = useRecommendation();


  const [prefs, setPrefs] = useState(() => {
    const saved = loadPreferences();
    return saved ? { ...DEFAULT_PREFS, ...saved } : { ...DEFAULT_PREFS };
  });


 
   const handleChange = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const toggleBrand = (brand) => {
    setPrefs(prev => ({
      ...prev,
      preferredBrands: prev.preferredBrands.includes(brand)
        ? prev.preferredBrands.filter(b => b !== brand)  // deselect
        : [...prev.preferredBrands, brand],              // select
    }));
  };

  const handleSubmit = () => {
      savePreferences({ ...prefs, lastUpdated: new Date().toISOString() });
    refreshScores();
    navigate('/recommendations');
  };


  return (
    <div className='max-w-2xl mx-auto py-8'>
      <h1 className='text-3xl font-bold text-navy mb-2'>
        Tell Us What You&apos;re Looking For
      </h1>
      <p className='text-gray-500 mb-8'>
        Your preferences stay on your device and are never sent anywhere.
      </p>

      {/* ── SECTION 1: Category ─────────────────────────────────────── */}
      <section className='bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-5'>
        <h2 className='font-bold text-lg text-navy mb-4'>
          What are you shopping for?
        </h2>
        <div className='flex flex-wrap gap-3'>
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => handleChange('preferredCategory', cat)}
              className={`px-5 py-2 rounded-full border-2 capitalize font-medium transition-all
                ${prefs.preferredCategory === cat
                  ? 'bg-red-800 text-white border-red-800'
                  : 'border-slate-300 text-gray-600 hover:border-red-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: Budget ───────────────────────────────────────── */}
      <section className='bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-5'>
        <h2 className='font-bold text-lg text-navy mb-2'>What is your budget?</h2>
        <p className='text-sm text-red-700 font-semibold mb-4'>
          Selected: {PRICE_LABELS[prefs.priceTier]}
        </p>
        {/* priceTier slider — maps 1-5 to budget categories */}
        <input type='range' min={1} max={5} step={1}
          value={prefs.priceTier}
          onChange={e => handleChange('priceTier', parseInt(e.target.value, 10))}
          className='w-full accent-red-700'
          aria-label='Budget range'
        />
        {/* Budget range labels */}
        <div className='flex justify-between text-xs text-gray-400 mt-1'>
          <span>Budget</span>
          <span>Mid-range</span>
          <span>Premium</span>
        </div>
      </section>

      {/* ── SECTION 3: Feature priorities ───────────────────────────── */}
      <section className='bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-5'>
        <h2 className='font-bold text-lg text-navy mb-4'>
          What matters most to you?
        </h2>
        <div className='space-y-4'>
          {SLIDERS.map(({ key, label, icon, min, max, step }) => (
            <div key={key} className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <span className='text-xl w-6'>{icon}</span>
              <label className='w-full sm:w-40 text-sm text-gray-700 font-medium'>{label}</label>
              <input type='range' min={min} max={max} step={step}
                value={prefs[key]}
                onChange={e => handleChange(
                  key,
                  key === 'processorTier'
                    ? parseInt(e.target.value, 10)
                    : parseFloat(e.target.value)
                )}
                className='flex-1 accent-red-700'
                aria-label={label}
              />
              {/* Display a score out of 10 for floats, out of 5 for processorTier */}
              <span className='w-full sm:w-10 text-sm text-gray-600 text-right font-mono'>
                {key === 'processorTier'
                  ? `${prefs[key]}/5`
                  : `${Math.round(prefs[key] * 10)}/10`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: Brand preferences ────────────────────────────── */}
      <section className='bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8'>
        <h2 className='font-bold text-lg text-navy mb-2'>Any brand preferences?</h2>
        <p className='text-sm text-gray-400 mb-4'>
          Select all that apply. Leave empty to consider all brands equally.
        </p>
        <div className='flex flex-wrap gap-2'>
          {BRANDS.map(brand => (
            <button key={brand}
              onClick={() => toggleBrand(brand)}
              className={`px-4 py-1.5 rounded-full text-sm border-2 transition-all font-medium
                ${prefs.preferredBrands.includes(brand)
                  ? 'bg-red-800 text-white border-red-800'
                  : 'border-slate-300 text-gray-600 hover:border-red-400'}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </section>

      {/* ── SUBMIT BUTTON ──────────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        className='w-full py-4 bg-red-800 text-white rounded-xl font-bold text-lg
                   hover:bg-red-900 transition-colors shadow-md'
      >
        Show My Recommendations
      </button>
    </div>
  );
}