import React, { useState } from 'react';
import { X, Plus, Calendar, MapPin, Users, Tag } from 'lucide-react';
import { MeetupPost } from '../types';

interface CreateMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMeetup: (newPost: MeetupPost) => void;
}

export const CreateMeetupModal: React.FC<CreateMeetupModalProps> = ({
  isOpen,
  onClose,
  onCreateMeetup,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('식사');
  const [date, setDate] = useState('2026-09-13');
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('강남역 인근');
  const [maxMembers, setMaxMembers] = useState(2);
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const categories = ['전시', '축제', '식사', '운동', '여행', '클래스', '산책', '스터디', '공연', '쇼핑', '번개'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPost: MeetupPost = {
      id: 'post-' + Date.now(),
      category,
      title: title.trim(),
      author: '나 (신규)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      time: `${date} ${time}`,
      location,
      currentMembers: 1,
      maxMembers,
      tags: tagInput ? tagInput.split(' ').map((t) => t.replace('#', '')) : [category, '동행모집'],
      status: 'recruiting',
    };

    onCreateMeetup(newPost);
    onClose();
    setTitle('');
    setTagInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
          <h3 className="text-[17px] font-bold text-gray-900">새 동행 모집하기</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              카테고리 선택
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-[#6c2cf5] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              모집 제목
            </label>
            <input
              type="text"
              required
              placeholder="예: 주말 삼청동 한옥 카페 디저트 투어 가실 분!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6c2cf5] focus:ring-1 focus:ring-[#6c2cf5]"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                약속 날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                약속 시간
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              만날 장소 / 지역
            </label>
            <input
              type="text"
              placeholder="예: 서울 종로구 안국역 2번 출구"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6c2cf5]"
            />
          </div>

          {/* Member count */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              모집 인원 (본인 포함)
            </label>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setMaxMembers(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    maxMembers === num
                      ? 'border-[#6c2cf5] bg-[#f0edff] text-[#6c2cf5]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {num}명
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              태그 (공백으로 구분)
            </label>
            <input
              type="text"
              placeholder="#주말 #맛집탐방 #동네친구"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all"
            >
              동행 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
