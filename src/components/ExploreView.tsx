import React, { useState } from 'react';
import { MapPin, Navigation, Search, Filter, Users, Calendar } from 'lucide-react';
import { MeetupPost } from '../types';

interface ExploreViewProps {
  posts: MeetupPost[];
  onSelectPost: (post: MeetupPost) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ posts, onSelectPost }) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const neighborhoods = ['전체', '강남구 대치동', '종로구 삼청동', '영등포구 여의도동', '성동구 성수동'];

  const filteredPosts = posts.filter((p) => {
    const matchesNeighborhood =
      selectedNeighborhood === '전체' || p.location.includes(selectedNeighborhood.split(' ')[1] || '');
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNeighborhood && matchesSearch;
  });

  return (
    <div className="px-5 pt-3 pb-24 text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
            내 주변 동행 둘러보기
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            현재 위치: 서울 강남구 대치2동 기준
          </p>
        </div>
        <div className="p-2 rounded-full bg-[#f0edff] text-[#6c2cf5]">
          <Navigation className="w-5 h-5" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="동네 이름, 관심사(브런치, 전시, 산책 등) 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-[14px] text-xs focus:outline-none focus:border-[#6c2cf5]"
        />
      </div>

      {/* Neighborhood Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-3">
        {neighborhoods.map((n) => (
          <button
            key={n}
            onClick={() => setSelectedNeighborhood(n)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedNeighborhood === n
                ? 'bg-[#6c2cf5] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Map Illustration / Visual */}
      <div className="relative h-32 rounded-[20px] overflow-hidden mb-4 border border-gray-200 bg-[#e9eef6] flex items-center justify-center">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="relative text-center z-10">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#6c2cf5] text-white flex items-center justify-center shadow-lg animate-bounce">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[12px] font-bold text-gray-800 mt-1 inline-block bg-white/90 px-3 py-1 rounded-full shadow-xs">
            대치동 반경 3km 내 8개의 동행 모임
          </span>
        </div>
      </div>

      {/* Meetups list */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="p-4 bg-white border border-gray-150 rounded-[20px] hover:border-[#6c2cf5] transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                {post.category}
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  post.status === 'closed' || post.currentMembers >= 2
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-purple-50 text-[#6c2cf5]'
                }`}
              >
                {post.status === 'closed' || post.currentMembers >= 2
                  ? '2/2명 (마감)'
                  : '1/2명 (모집중)'}
              </span>
            </div>

            <h4 className="font-bold text-[15px] text-gray-900 leading-snug mb-2">
              {post.title}
            </h4>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{post.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{post.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium text-gray-700">{post.author}</span>
              </div>
              <span className="font-bold text-[#6c2cf5]">상세보기 &gt;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
