import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Home' },
  { to: '/wardrobe', icon: 'checkroom', label: 'Wardrobe' },
  { to: '/assistant', icon: 'smart_toy', label: 'Assistant' },
  { to: '/outfits', icon: 'auto_awesome', label: 'Outfits' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

/** Shared BottomNavBar - ported 1:1 from the Stitch dashboard/code.html markup. */
export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 w-full z-50 backdrop-blur-xl bg-surface/10 border-t border-white/20 shadow-[0px_-10px_30px_rgba(0,0,0,0.04)] rounded-t-lg">
      <div className="flex justify-around items-center px-4 py-2 w-full max-w-screen-xl mx-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center p-2 rounded-xl active:scale-90 transition-transform duration-200',
                isActive
                  ? 'text-primary font-bold bg-primary-container/20'
                  : 'text-tertiary-container hover:bg-white/10'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                >
                  {item.icon}
                </span>
                <span className="font-label-caps text-label-caps mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
