import React from 'react';
import { Icon } from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Shared TopAppBar - ported 1:1 from the Stitch dashboard/code.html markup
 * (floating glass header, 64px tall, brand mark + notification bell).
 */
export function TopNavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-surface/10 border-b border-white/20 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-gutter h-[64px] max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
            {user?.avatarUrl ? (
              <img className="w-full h-full object-cover" src={user.avatarUrl} alt={user.fullName} />
            ) : (
              <Icon name="person" className="text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-primary">WardrobeWise</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 duration-200"
            aria-label="Notifications"
          >
            notifications
          </button>
        </div>
      </div>
    </header>
  );
}
