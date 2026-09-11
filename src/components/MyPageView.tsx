import React from 'react';
import { User, Heart, Calendar, ShieldCheck, ChevronRight, Settings, Star, Award } from 'lucide-react';
import { Appointment } from '../types';

interface MyPageViewProps {
  currentAppointment: Appointment;
  onOpenDashboard: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({ currentAppointment, onOpenDashboard }) => {
  return (
    <div className="px-5 pt-3 pb-24 text-left space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-[22px] p-5 border border-gray-150 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="내 프로필"
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[17px] font-bold text-gray-900">다정한이웃</h3>
                <span className="text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                  인증회원
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">서울 강남구 대치동 • 취향 동행러</p>
            </div>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Manner Temperature */}
        <div className="mt-4 pt-3.5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-700">매너온도</span>
            <span className="font-bold text-[#6c2cf5]">99.2°C 🔥</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="w-[99%] h-full bg-gradient-to-r from-[#8b5cf6] to-[#6c2cf5] rounded-full" />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">기본 36.5°C에서 62.7°C 올랐어요!</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="text-[18px] font-bold text-[#6c2cf5]">14회</div>
          <div className="text-xs text-gray-500 mt-0.5 font-medium">참여한 동행</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="text-[18px] font-bold text-amber-500">4.9</div>
          <div className="text-xs text-gray-500 mt-0.5 font-medium">동행 평점</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-150 shadow-2xs">
          <div className="text-[18px] font-bold text-rose-500">8개</div>
          <div className="text-xs text-gray-500 mt-0.5 font-medium">받은 후기</div>
        </div>
      </div>

      {/* Upcoming Active Appointment */}
      <div className="bg-white rounded-[22px] p-4 border border-[#e3dbfc] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
            진행 예정 동행 (1건)
          </span>
          <button
            onClick={onOpenDashboard}
            className="text-xs font-bold text-[#6c2cf5] hover:underline flex items-center"
          >
            상세보기 &gt;
          </button>
        </div>
        <h4 className="font-bold text-[15px] text-gray-900 leading-snug">
          {currentAppointment.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {currentAppointment.dateTime} • {currentAppointment.location}
        </p>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-[22px] border border-gray-150 overflow-hidden shadow-xs divide-y divide-gray-100">
        <button className="w-full p-4 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>관심 등록한 동행 이벤트</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50">
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>취향 키워드 및 동행 뱃지</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>동네 인증 및 본인 확인 센터</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};
