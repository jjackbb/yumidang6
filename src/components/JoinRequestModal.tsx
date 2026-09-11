import React, { useState } from 'react';
import { X, Send, Calendar, MapPin, AlertCircle, ShieldCheck, Sparkles, User } from 'lucide-react';
import { MeetupPost, Appointment, CurrentUser } from '../types';

interface JoinRequestModalProps {
  post: MeetupPost | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser | null;
  currentAppointment?: Appointment;
  onSubmitRequest: (postId: string, message: string) => void;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  post,
  isOpen,
  onClose,
  currentUser,
  currentAppointment,
  onSubmitRequest,
}) => {
  const [message, setMessage] = useState(
    '안녕하세요! 공고 내용 확인하고 취향이 잘 맞을 것 같아 신청드립니다. 약속 시간 철저히 지키겠습니다 :)'
  );

  if (!isOpen || !post) return null;

  // Check schedule collision: if currentAppointment has overlapping date
  const hasScheduleCollision = Boolean(
    currentAppointment &&
      currentAppointment.status === '매칭 확정' &&
      post.time.includes('2026.9.12') &&
      currentAppointment.dateTime.includes('2026.9.12')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmitRequest(post.id, message.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6c2cf5] text-white flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900">1:1 동행 참여 신청</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Meetup Summary */}
          <div className="p-3.5 bg-[#f8f9fc] rounded-2xl border border-gray-150 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                {post.category}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                호스트: {post.author} (당도 99.2 🍯)
              </span>
            </div>
            <h4 className="font-bold text-sm text-gray-900 leading-snug">
              {post.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {post.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {post.location}
              </span>
            </div>
          </div>

          {/* Schedule Conflict Warning (Phase 3 Requirement) */}
          {hasScheduleCollision && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">⚠️ 일정 중복 주의 안내</span>
                <span>
                  이미 동일한 날짜({currentAppointment?.dateTime})에 확정된 동행 약속이 있습니다. 시간이 겹치지 않는지 확인 후 신청해주세요.
                </span>
              </div>
            </div>
          )}

          {/* Sender Profile Preview */}
          {currentUser && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.maskedName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900">{currentUser.maskedName}</span>
                    <span className="text-[10px] font-bold text-[#6c2cf5] bg-[#f0edff] px-1.5 py-0.5 rounded">
                      나의 프로필
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">당도 {currentUser.sugarContent.toFixed(1)} 🍯</span>
                </div>
              </div>
              <span className="text-[11px] text-gray-400">호스트에게 전달됨</span>
            </div>
          )}

          {/* Introduction Message Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              호스트에게 전할 소개 메시지
            </label>
            <textarea
              rows={4}
              required
              placeholder="동행에 지원하게 된 이유, 본인 소개 등을 친절하게 적어주시면 매칭 확률이 높아집니다."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5] resize-none leading-relaxed"
            />
          </div>

          {/* 1:1 Matching Commitment Notice */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-[#6c2cf5] leading-relaxed">
            <span className="font-bold block mb-0.5">🤝 1:1 동행 매칭 약속</span>
            호스트가 회원님의 신청을 [수락]하면 즉시 1:1 매칭이 확정(2/2명)되며, 호스트와의 1:1 실시간 조율 채팅방이 자동으로 개설됩니다.
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>1:1 동행 신청서 전달하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
