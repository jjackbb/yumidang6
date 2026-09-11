import React from 'react';
import { Bell } from 'lucide-react';

import logoImg from '../assets/logo.jpg';

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
        <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm flex-shrink-0 bg-[#6c2cf5] flex items-center justify-center">
          <img src={logoImg} alt="유미당 로고" className="w-full h-full object-cover" />
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
