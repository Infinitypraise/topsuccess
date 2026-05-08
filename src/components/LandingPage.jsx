import { Link } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Personalised Picks',
    desc: 'Get product recommendations tailored to your exact preferences and budget.',
  },
  {
    icon: '🔒',
    title: 'Your Data Stays Private',
    desc: 'All preferences are stored only on your device. Nothing is sent to any server.',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Recommendations are generated in milliseconds — no waiting, no loading.',
  },
  {
    icon: '💡',
    title: 'Explained Recommendations',
    desc: 'Every suggestion tells you exactly which of your priorities it matches.',
  },
];

export default function LandingPage() {
  const { prefs } = useRecommendation();

  return (
    <div className='py-8'>

      {/* Hero section */}
      <section className='text-center mb-14'>
        <h1 className='text-4xl font-bold text-navy mb-4 leading-tight'>
          Find the Right Electronics,
          <span className='text-red-700'> Instantly.</span>
        </h1>
        <p className='text-gray-500 text-lg max-w-xl mx-auto mb-8'>
          Our recommender system learns what matters to you and surfaces
          the most relevant products from our catalogue — no account required.
        </p>

        {/* Primary CTA buttons */}
        <div className='flex gap-4 justify-center flex-wrap'>
          {/* Primary CTA: set up or update preferences */}
          <Link to='/setup'
            className='px-6 py-3 bg-red-800 text-white rounded-xl font-semibold
                       hover:bg-red-900 transition-colors shadow-md'
          >
            {prefs ? 'Update My Preferences' : 'Get My Recommendations'}
          </Link>

          {/* Secondary CTA: skip setup and browse the catalogue */}
          <Link to='/browse'
            className='px-6 py-3 border-2 border-red-800 text-red-800 rounded-xl
                       font-semibold hover:bg-red-50 transition-colors'
          >
            Browse All Products
          </Link>
        </div>
      </section>

      {/* Feature cards grid */}
      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12'>
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title}
            className='bg-white rounded-xl p-5 shadow-sm border border-slate-100
                       hover:shadow-md transition-shadow'
          >
            <div className='text-3xl mb-3'>{icon}</div>
            <h3 className='font-bold text-navy mb-2'>{title}</h3>
            <p className='text-gray-500 text-sm leading-relaxed'>{desc}</p>
          </div>
        ))}
      </section>

      {/* Quick-start prompt if no preferences set */}
      {!prefs && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-6 text-center'>
          <p className='text-red-800 font-semibold mb-3'>
            Ready to find your perfect electronics?
          </p>
          <Link to='/setup'
            className='inline-block px-5 py-2 bg-red-800 text-white rounded-lg
                       font-semibold hover:bg-red-900 transition-colors'
          >
            Start in 60 seconds
          </Link>
        </div>
      )}
    </div>
  );
}