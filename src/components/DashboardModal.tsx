import React from 'react';
import { X, Clock, MapPin, Share2, Calendar, MessageCircle, Star, Navigation } from 'lucide-react';
import { Appointment } from '../types';

interface DashboardModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onOpenChat,
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
            <h3 className="text-[17px] font-bold text-gray-900">참여 대시보드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          {/* Status & D-day Banner */}
          <div className="bg-gradient-to-r from-[#6c2cf5]/10 to-[#8b5cf6]/10 border border-[#e3dbfc] rounded-[18px] p-4 flex items-center justify-between">
            <div>
              <span className="text-[12px] font-bold text-[#6c2cf5] bg-[#6c2cf5]/15 px-2 py-0.5 rounded-full">
                {appointment.status}
              </span>
              <p className="text-[18px] font-extrabold text-gray-900 mt-1">
                약속까지 단 {appointment.dDay} 남았어요!
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#6c2cf5]">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Appointment Title */}
          <div>
            <h4 className="text-[20px] font-bold text-gray-900 leading-snug">
              {appointment.title}
            </h4>
          </div>

          {/* Date and Location Card */}
          <div className="bg-[#f8f9fc] rounded-[18px] p-4 space-y-3 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-[#6c2cf5] shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">약속 일시</p>
                <p className="text-[15px] font-bold text-gray-900">{appointment.dateTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-[#6c2cf5] shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">약속 장소</p>
                <p className="text-[15px] font-bold text-gray-900">{appointment.location}</p>
                <p className="text-xs text-gray-500 mt-0.5">{appointment.addressDetail}</p>
              </div>
            </div>
          </div>

          {/* Partner Profile Card */}
          <div className="border border-[#edf0f5] rounded-[18px] p-4">
            <div className="text-xs font-semibold text-gray-500 mb-2.5">함께할 이웃</div>
            <div className="flex items-center gap-3.5">
              <img
                src={appointment.partnerAvatar}
                alt={appointment.partnerName}
                className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[16px] text-gray-900">{appointment.partnerName}</span>
                  <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-amber-600 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{appointment.partnerRating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {appointment.partnerBio}
                </p>
              </div>
            </div>

            {/* Menu recommendation */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span className="text-gray-500">추천 식사 메뉴:</span>
              <span className="font-semibold text-gray-800">{appointment.menuRecommendation}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 pb-2">
            <button
              onClick={() => {
                onClose();
                onOpenChat();
              }}
              className="w-full py-3.5 px-4 bg-[#6c2cf5] hover:bg-[#5820d8] text-white rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-98 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>동행 대화방 바로가기</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert('약속 장소 길찾기 지도 앱으로 연결됩니다.')}
                className="py-3 px-3 border border-gray-200 hover:bg-gray-50 rounded-[14px] font-semibold text-[13px] text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4 text-gray-500" />
                <span>장소 길찾기</span>
              </button>
              <button
                onClick={() => alert('약속 링크가 클립보드에 복사되었습니다.')}
                className="py-3 px-3 border border-gray-200 hover:bg-gray-50 rounded-[14px] font-semibold text-[13px] text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-500" />
                <span>동행 공유하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
