import React from 'react';
import { X, Sparkles, MapPin, Calendar, Users, Heart, Share2 } from 'lucide-react';
import { EventBannerItem, MeetupPost } from '../types';

interface EventDetailModalProps {
  event: EventBannerItem | null;
  isOpen: boolean;
  onClose: () => void;
  relatedPosts: MeetupPost[];
  onJoinMeetup: (post: MeetupPost) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  relatedPosts,
  onJoinMeetup,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Image Header */}
        <div className="relative h-60 w-full overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#ff5d2b] text-white text-xs font-bold px-2.5 py-1 rounded-[8px]">
              {event.badge}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-1 text-[#fde047] text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{event.subBadge}</span>
            </div>
            <h3 className="text-[20px] font-bold leading-tight drop-shadow-sm">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Event Body Info */}
        <div className="p-5 space-y-4">
          <div className="bg-[#f8f9fc] p-3.5 rounded-[16px] border border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#6c2cf5]" />
              <span className="font-semibold text-gray-800">2026.9.12(토) 19:20 시작</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#6c2cf5]" />
              <span className="font-semibold text-gray-800">{event.tag}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[16px] text-gray-900 mb-1.5">이벤트 소개</h4>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              화려한 불꽃과 함께하는 서울의 대표 가을 축제! 혼자 보기 아쉬운 밤하늘을 좋은 이웃과 함께 나누세요. 돗자리 명당 잡기, 사진 찍어주기, 간식 쉐어 등 취향에 맞는 다양한 동행이 모이고 있습니다.
            </p>
          </div>

          {/* Current Meetups For This Event */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[16px] text-gray-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#6c2cf5]" />
                <span>모집 중인 동행 모임</span>
              </h4>
              <span className="text-xs text-[#6c2cf5] font-semibold">{relatedPosts.length}개 진행 중</span>
            </div>

            <div className="space-y-2.5">
              {relatedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-[18px] border border-gray-100 bg-white hover:border-[#cfbffb] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#ff5d2b] bg-[#ffebee] px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <h5 className="font-bold text-[14px] text-gray-900 mt-1 leading-snug">
                        {post.title}
                      </h5>
                    </div>
                    <span className="text-xs font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-1 rounded-lg flex-shrink-0">
                      {post.currentMembers}/{post.maxMembers}명
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.time.split(' ')[0]}</span>
                    </div>

                    <button
                      onClick={() => onJoinMeetup(post)}
                      className="px-3 py-1 bg-[#6c2cf5] text-white rounded-lg font-semibold hover:bg-[#5820d8] text-xs transition-colors"
                    >
                      참여 신청
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
