import React, { useState } from 'react';
import { X, MapPin, Clock, Users, Plus, Check } from 'lucide-react';
import { CategoryItem, MeetupPost } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface CategoryDetailModalProps {
  category: CategoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  posts: MeetupPost[];
  onOpenCreate: () => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  isOpen,
  onClose,
  posts,
  onOpenCreate,
}) => {
  const [joinedPosts, setJoinedPosts] = useState<string[]>([]);

  if (!isOpen || !category) return null;

  const filteredPosts =
    category.iconType === 'all'
      ? posts
      : posts.filter((p) => p.category === category.name);

  const handleToggleJoin = (postId: string) => {
    if (joinedPosts.includes(postId)) {
      setJoinedPosts((prev) => prev.filter((id) => id !== postId));
    } else {
      setJoinedPosts((prev) => [...prev, postId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl ${category.iconBg} flex items-center justify-center`}>
              <CategoryIcon type={category.iconType} />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">
                {category.name} 동행 찾기
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              현재 모집 중인 {category.name} 동행 ({filteredPosts.length}건)
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenCreate();
              }}
              className="text-xs font-bold text-[#6c2cf5] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>직접 모집하기</span>
            </button>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-600">
                아직 등록된 {category.name} 동행이 없습니다.
              </p>
              <p className="text-xs text-gray-400">가장 먼저 첫 동행을 모집해보세요!</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreate();
                }}
                className="mt-3 px-4 py-2 bg-[#6c2cf5] text-white rounded-xl text-xs font-bold"
              >
                동행 모집 글 올리기
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isJoined = joinedPosts.includes(post.id);
              return (
                <div
                  key={post.id}
                  className="p-4 rounded-[20px] border border-gray-150 bg-white hover:border-[#cfbffb] transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                        {post.status === 'closed' ? (
                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            마감
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            모집중
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-[15px] text-gray-900 leading-snug">
                        {post.title}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                        {isJoined ? post.currentMembers + 1 : post.currentMembers}/{post.maxMembers}명
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{post.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{post.location}</span>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] text-gray-500 bg-[#f4f5f9] px-2 py-0.5 rounded-md font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        {post.author}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleJoin(post.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isJoined
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : post.status === 'closed'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#6c2cf5] text-white hover:bg-[#5820d8]'
                      }`}
                      disabled={post.status === 'closed' && !isJoined}
                    >
                      {isJoined ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>참여 신청됨</span>
                        </>
                      ) : post.status === 'closed' ? (
                        '모집 마감'
                      ) : (
                        '동행 참여하기'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
