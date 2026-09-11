import React from 'react';
import { User, Heart, Calendar, ShieldCheck, ChevronRight, Settings, Star, Award, LogOut, Sparkles } from 'lucide-react';
import { Appointment, CurrentUser } from '../types';

interface MyPageViewProps {
  currentAppointment: Appointment;
  onOpenDashboard: () => void;
  currentUser: CurrentUser | null;
  onOpenAuth: () => void;
  onOpenKyc: () => void;
  onLogout: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({
  currentAppointment,
  onOpenDashboard,
  currentUser,
  onOpenAuth,
  onOpenKyc,
  onLogout,
}) => {
  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <div className="px-5 pt-12 pb-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#f0edff] text-[#6c2cf5] flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">로그인이 필요한 서비스입니다</h3>
        <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
          유미당은 신뢰할 수 있는 1:1 동행을 위해 간단한 휴대폰 본인인증 후 이용하실 수 있습니다.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full max-w-xs mx-auto py-3.5 bg-[#6c2cf5] text-white font-bold rounded-xl text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all"
        >
          휴대폰 본인인증으로 시작하기
        </button>
      </div>
    );
  }

  const diffSugar = Math.round(currentUser.sugarContent - 50);

  return (
    <div className="px-5 pt-3 pb-24 text-left space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-[22px] p-5 border border-gray-150 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt="내 프로필"
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[17px] font-bold text-gray-900">
                  {currentUser.nickname} ({currentUser.maskedName})
                </h3>
                {currentUser.isKycVerified ? (
                  <span className="text-[10px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full border border-[#ded6fb] flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    공식 KYC 인증
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                    인증회원
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentUser.neighborhood} • {currentUser.ageGroup}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="로그아웃"
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Sugar Content (당도) */}
        <div className="mt-4 pt-3.5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-700">당도</span>
            <span className="font-bold text-[#6c2cf5]">{Math.round(currentUser.sugarContent)} 🍯</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6c2cf5] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(currentUser.sugarContent, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {diffSugar >= 0
              ? `기본 당도 50에서 ${diffSugar} 올랐어요!`
              : `기본 당도 50에서 ${Math.abs(diffSugar)} 변동되었어요.`}
          </p>
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
        <button
          onClick={onOpenKyc}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#6c2cf5]" />
            <div>
              <span className="block">선택형 KYC 본인확인 센터</span>
              <span className="text-[11px] text-gray-400 font-normal">
                {currentUser.isKycVerified ? '공식 인증 완료' : 'NICE/KCB 모바일 신분증 인증'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {currentUser.isKycVerified && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                인증됨
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        <button className="w-full p-4 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50 text-left">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>관심 등록한 동행 이벤트</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button className="w-full p-4 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50 text-left">
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>취향 키워드 및 동행 뱃지</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};
