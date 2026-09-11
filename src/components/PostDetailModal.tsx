import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Lock,
  CheckCircle2,
  Users,
  Sparkles,
  Edit3,
  Check,
  Trash2,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { MeetupPost, CurrentUser } from '../types';

interface PostDetailModalProps {
  post: MeetupPost | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser | null;
  onJoinMeetup: (post: MeetupPost) => void;
  onOpenEscrow?: (post: MeetupPost) => void;
  onEditPost: (post: MeetupPost) => void;
  onClosePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  currentUser,
  onJoinMeetup,
  onOpenEscrow,
  onEditPost,
  onClosePost,
  onDeletePost,
}) => {
  if (!isOpen || !post) return null;

  const isHost = Boolean(
    currentUser && (currentUser.id === post.authorId || currentUser.maskedName === post.author)
  );

  const isClosed = post.status === 'closed' || post.currentMembers >= 2;
  const isExpired = post.status === 'expired';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            {post.companionType === 'pro' && (
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span>💎 PRO</span>
                {post.proDetails && <span>{post.proDetails.hourlyRate.toLocaleString()}원/h</span>}
              </span>
            )}
            {isExpired ? (
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                기간 만료
              </span>
            ) : isClosed ? (
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                2/2명 (마감)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                1/2명 (모집중)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Title & Host Profile */}
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 leading-snug">
              {post.title}
            </h3>

            <div className="flex items-center justify-between mt-3 pt-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{post.author}</span>
                    <span className="text-[10px] font-bold text-[#6c2cf5] bg-[#f0edff] px-1.5 py-0.5 rounded">
                      호스트
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">당도 99 🍯 • 인증회원</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-xl">
                  1:1 동행
                </span>
              </div>
            </div>
          </div>

          {/* Phase 6: PRO Specialized Offer Card */}
          {post.companionType === 'pro' && post.proDetails && (
            <div className="p-4 bg-purple-50/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-purple-950">💎 PRO 전문 오퍼 커리큘럼</span>
                </div>
                <span className="text-xs font-extrabold text-[#6c2cf5]">
                  {post.proDetails.hourlyRate.toLocaleString()}원 <span className="text-[10px] font-normal text-gray-500">/ 1시간</span>
                </span>
              </div>

              <div className="text-xs text-purple-900">
                <span className="font-semibold text-gray-500 block text-[11px] mb-0.5">전문 분야</span>
                <p className="font-bold text-gray-800">{post.proDetails.specialty}</p>
              </div>

              {post.proDetails.curriculum && post.proDetails.curriculum.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-gray-500 block text-[11px]">활동 순서 (1:1 맞춤 진행)</span>
                  <div className="space-y-1 bg-white p-2.5 rounded-xl">
                    {post.proDetails.curriculum.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-700">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-[#6c2cf5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-xl">
                  <span className="font-bold text-emerald-600 block mb-0.5">포함 내역</span>
                  <span className="text-gray-600">{post.proDetails.included.join(', ')}</span>
                </div>
                <div className="bg-white p-2 rounded-xl">
                  <span className="font-bold text-gray-500 block mb-0.5">불포함 내역</span>
                  <span className="text-gray-600">{post.proDetails.excluded.join(', ')}</span>
                </div>
              </div>

              <div className="text-[10.5px] text-purple-700 flex items-center gap-1 font-medium pt-0.5">
                <Sparkles size={12} />
                <span>유미당 안심 에스크로 100% 결제 보호 적용</span>
              </div>
            </div>
          )}

          {/* Date & Location */}
          <div className="p-3.5 bg-[#f8f9fc] rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-[#6c2cf5] flex-shrink-0" />
              <span className="font-semibold">{post.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-[#6c2cf5] flex-shrink-0" />
              <span>
                {post.publicLocation ? `${post.location} (${post.publicLocation})` : post.location}
              </span>
            </div>
          </div>

          {/* Secret Location Masking (PRD 2.2 Security Requirement) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              상세 만남 장소
            </label>

            {isHost || isClosed ? (
              <div className="p-3.5 bg-[#f5f3ff] rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6c2cf5]">
                  <CheckCircle2 className="w-4 h-4 text-[#6c2cf5]" />
                  <span>{isHost ? '작성자 전용 비밀 장소 확인' : '매칭 확정자 전용 상세 장소'}</span>
                </div>
                <p className="text-xs text-gray-800 font-medium">
                  {post.secretLocation || '상세 장소: 호스트와 1:1 채팅방에서 최종 조율됩니다.'}
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-[#f8f9fc] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">
                    상세 만남 장소는 1:1 매칭 확정 후 공개됩니다
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                  비공개 🔒
                </span>
              </div>
            )}
          </div>

          {/* Partner Preferences */}
          {post.partnerPreferences && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                동행 파트너에게 바라는 점 / 사전 안내
              </label>
              <div className="p-3.5 bg-gray-50 rounded-2xl text-xs text-gray-700 leading-relaxed">
                {post.partnerPreferences}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {isHost ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#f0edff] rounded-xl text-[11px] text-[#6c2cf5] font-semibold text-center">
                  💡 내가 등록한 1:1 동행 공고입니다.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onEditPost(post)}
                    className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>공고 수정</span>
                  </button>

                  {!isClosed ? (
                    <button
                      onClick={() => onClosePost(post.id)}
                      className="py-3 bg-amber-100/70 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>모집 조기 마감</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="py-3 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold text-center"
                    >
                      마감 완료됨
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onDeletePost(post.id)}
                  className="w-full py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>공고 삭제하기</span>
                </button>
              </div>
            ) : post.companionType === 'pro' ? (
              <button
                disabled={isClosed || isExpired}
                onClick={() => (onOpenEscrow ? onOpenEscrow(post) : onJoinMeetup(post))}
                className={`w-full py-3.5 rounded-xl font-bold text-[15px] shadow-md transition-all flex items-center justify-center gap-2 ${
                  isClosed || isExpired
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-purple-500/25 active:scale-98'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>
                  {isExpired
                    ? '모집 기간이 만료되었습니다'
                    : isClosed
                    ? '1:1 매칭이 마감되었습니다'
                    : `1:1 안심 에스크로 신청 (${post.proDetails?.hourlyRate.toLocaleString()}원/시간)`}
                </span>
              </button>
            ) : (
              <button
                disabled={isClosed || isExpired}
                onClick={() => onJoinMeetup(post)}
                className={`w-full py-3.5 rounded-xl font-bold text-[15px] shadow-md transition-all flex items-center justify-center gap-2 ${
                  isClosed || isExpired
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[#6c2cf5] hover:bg-[#5820d8] text-white shadow-purple-500/25 active:scale-98'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {isExpired
                    ? '모집 기간이 만료되었습니다'
                    : isClosed
                    ? '1:1 매칭이 마감되었습니다'
                    : '1:1 동행 참여 신청하기'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
