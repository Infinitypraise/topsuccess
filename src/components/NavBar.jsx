import { NavLink } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';

export default function NavBar() {
  const { prefs } = useRecommendation();

  const linkClass = ({ isActive }) =>
    isActive
      ? 'px-4 py-2 rounded-lg bg-red-800 text-white font-semibold text-sm'
      : 'px-4 py-2 rounded-lg text-gray-600 hover:bg-slate-100 text-sm transition-colors';

  return (
    <nav className='bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm'>
      <div className='max-w-6xl mx-auto px-4 py-3 flex items-center justify-between'>

        {/* Brand logo / home link */}
        <NavLink to='/' className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>T</span>
          </div>
          <span className='font-bold text-navy text-lg hidden sm:block'>
            TopSuccess
          </span>
        </NavLink>

        {/* Main navigation links */}
        <div className='flex items-center gap-1'>
          <NavLink to='/'              className={linkClass}>Home</NavLink>
          <NavLink to='/browse'        className={linkClass}>Browse</NavLink>

          {/* Only show the Recommendations link if the user has set preferences */}
          {prefs && (
            <NavLink to='/recommendations' className={linkClass}>
              My Picks
            </NavLink>
          )}

          {/* Setup link changes label based on whether prefs already exist */}
          <NavLink to='/setup' className={linkClass}>
            {prefs ? 'Update Preferences' : 'Get Started'}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}