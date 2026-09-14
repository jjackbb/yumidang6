import React from 'react';
import { Bell, ShieldCheck, UserCheck } from 'lucide-react';

import logoImg from '../assets/logo.jpg';
import { CurrentUser } from '../types';

interface HeaderProps {
  unreadCount?: number;
  pendingRequestCount?: number;
  onOpenNotifications: () => void;
  onOpenMatchRequests?: () => void;
  currentUser: CurrentUser | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadCount = 2,
  pendingRequestCount = 0,
  onOpenNotifications,
  onOpenMatchRequests,
  currentUser,
  onOpenAuth,
}) => {
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

      {/* Right Action: Auth button & Notification Bell */}
      <div className="flex items-center gap-1.5">
        {currentUser && currentUser.isLoggedIn ? (
          <div className="flex items-center gap-1 px-3 py-1 bg-[#f0edff] rounded-full text-xs font-bold text-[#6c2cf5] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6c2cf5]" />
            <span>{currentUser.maskedName}</span>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1 bg-[#6c2cf5] text-white text-xs font-bold rounded-lg hover:bg-[#5820d8] transition-colors shadow-xs"
          >
            로그인
          </button>
        )}

        {/* 1:1 Match Requests Inbox Button */}
        {onOpenMatchRequests && (
          <button
            id="btn-match-requests"
            onClick={onOpenMatchRequests}
            className="relative p-2 text-gray-700 hover:text-[#6c2cf5] hover:bg-gray-50 rounded-full transition-colors active:scale-95"
            aria-label="받은 동행 신청"
            title="받은 동행 신청함"
          >
            <UserCheck className="w-[22px] h-[22px] stroke-[2]" />
            {pendingRequestCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 bg-[#6c2cf5] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                {pendingRequestCount}
              </span>
            )}
          </button>
        )}

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

