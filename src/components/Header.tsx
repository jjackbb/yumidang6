import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  unreadCount?: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ unreadCount = 2, onOpenNotifications }) => {
  return (
    <header className="sticky top-0 z-30 bg-white px-5 py-3.5 flex items-center justify-between border-b border-transparent transition-all">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        {/* Stylized YouMeDang Mascot Icon */}
        <div className="w-9 h-9 rounded-full bg-[#6c2cf5] flex items-center justify-center shadow-sm text-white relative flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-6 h-6 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
            {/* Mascot Character Head */}
            <circle cx="18" cy="18" r="11" />
            {/* Smiling Eyes */}
            <path d="M14 16.5c.5-.8 1.5-.8 2 0" />
            <path d="M20 16.5c.5-.8 1.5-.8 2 0" />
            {/* Friendly Smile */}
            <path d="M15 21.5c1 1.2 5 1.2 6 0" />
            {/* Little antennas / hair tuft on top */}
            <path d="M18 7V4" />
            <circle cx="18" cy="4" r="1" fill="white" />
          </svg>
        </div>

        <span className="text-[22px] font-extrabold tracking-tight text-[#6c2cf5]">
          유미당
        </span>
      </div>

      {/* Right Action: Notification Bell */}
      <div className="flex items-center">
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 text-gray-800 hover:text-[#6c2cf5] hover:bg-gray-50 rounded-full transition-colors active:scale-95"
          aria-label="알림"
        >
          <Bell className="w-[23px] h-[23px] stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff6b35] rounded-full border-2 border-white" />
          )}
        </button>
      </div>
    </header>
  );
};
