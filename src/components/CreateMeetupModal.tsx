import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Lock, Info, Sparkles } from 'lucide-react';
import { MeetupPost, CurrentUser } from '../types';

interface CreateMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMeetup: (newPost: MeetupPost) => void;
  onUpdatePost?: (updatedPost: MeetupPost) => void;
  editPost?: MeetupPost | null;
  currentUser: CurrentUser | null;
}

export const CreateMeetupModal: React.FC<CreateMeetupModalProps> = ({
  isOpen,
  onClose,
  onCreateMeetup,
  onUpdatePost,
  editPost,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('식사');
  const [date, setDate] = useState('2026-09-13');
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('서울 강남구 대치동');
  const [publicLocation, setPublicLocation] = useState('대치역 3번 출구 앞');
  const [secretLocation, setSecretLocation] = useState('르브런치 2층 예약석');
  const [partnerPreferences, setPartnerPreferences] = useState('시간 약속 잘 지키고 편안한 대화 나누실 분 환영해요 :)');
  const [tagInput, setTagInput] = useState('#맛집탐방 #주말브런치');

  const isEditing = Boolean(editPost);

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title);
      setCategory(editPost.category);
      const parts = editPost.time.split(' ');
      if (parts[0]) setDate(parts[0]);
      if (parts[1]) setTime(parts[1]);
      setLocation(editPost.location);
      setPublicLocation(editPost.publicLocation || '');
      setSecretLocation(editPost.secretLocation || '');
      setPartnerPreferences(editPost.partnerPreferences || '');
      setTagInput(editPost.tags.map((t) => `#${t}`).join(' '));
    } else {
      setTitle('');
      setCategory('식사');
      setDate('2026-09-13');
      setTime('18:00');
      setLocation('서울 강남구 대치동');
      setPublicLocation('대치역 3번 출구 앞');
      setSecretLocation('르브런치 2층 예약석');
      setPartnerPreferences('시간 약속 잘 지키고 편안한 대화 나누실 분 환영해요 :)');
      setTagInput('#맛집탐방 #주말브런치');
    }
  }, [editPost, isOpen]);

  if (!isOpen) return null;

  const categories = ['전시', '축제', '식사', '운동', '여행', '클래스', '산책', '스터디', '공연', '쇼핑', '번개'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagInput
      ? tagInput
          .split(' ')
          .map((t) => t.replace('#', '').trim())
          .filter(Boolean)
      : [category, '1대1동행'];

    if (isEditing && editPost && onUpdatePost) {
      const updated: MeetupPost = {
        ...editPost,
        title: title.trim(),
        category,
        time: `${date} ${time}`,
        location,
        publicLocation: publicLocation.trim(),
        secretLocation: secretLocation.trim(),
        partnerPreferences: partnerPreferences.trim(),
        tags: parsedTags,
      };
      onUpdatePost(updated);
    } else {
      const newPost: MeetupPost = {
        id: 'post-' + Date.now(),
        category,
        title: title.trim(),
        author: currentUser ? currentUser.maskedName : '조*미',
        authorId: currentUser ? currentUser.id : 'user-default',
        avatar: currentUser
          ? currentUser.avatar
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        time: `${date} ${time}`,
        location,
        publicLocation: publicLocation.trim(),
        secretLocation: secretLocation.trim(),
        partnerPreferences: partnerPreferences.trim(),
        currentMembers: 1,
        maxMembers: 2, // 1:1 동행 2인 고정
        tags: parsedTags,
        status: 'recruiting',
      };
      onCreateMeetup(newPost);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
          <h3 className="text-[17px] font-bold text-gray-900">
            {isEditing ? '1:1 동행 공고 수정' : '새 1:1 동행 모집하기'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1:1 Matching Fixed Notice */}
          <div className="p-3 bg-[#f5f3ff] rounded-xl border border-[#ded6fb] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#6c2cf5] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                1:1
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  1대1 맞춤 동행 서비스
                </span>
                <span className="text-[11px] text-gray-500">
                  나 + 동행 파트너 1명 (총 2인 정원 고정)
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#6c2cf5] bg-white px-2.5 py-1 rounded-lg border border-[#e5dcfa]">
              2/2명 고정
            </span>
          </div>

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
                      ? 'bg-[#6c2cf5] text-white shadow-xs'
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
              placeholder="예: 주말 삼청동 한옥 카페 디저트 투어 1:1 동행 가실 분!"
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

          {/* Public Location (General Area) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              공개 만남 지역 (누구나 열람 가능)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="지역구 (예: 서울 종로구)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5]"
              />
              <input
                type="text"
                placeholder="공개 랜드마크 (예: 안국역 2번 출구)"
                value={publicLocation}
                onChange={(e) => setPublicLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5]"
              />
            </div>
          </div>

          {/* Secret Location (Masked for privacy) */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#6c2cf5]" />
                <span>확정자 전용 상세 비밀 장소 (안심 보호 🔒)</span>
              </label>
              <span className="text-[10px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded">
                확정 시에만 공개
              </span>
            </div>
            <input
              type="text"
              placeholder="예: 어니언 안국 3번 야외 테이블, 카페 2층 카운터 앞"
              value={secretLocation}
              onChange={(e) => setSecretLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#6c2cf5]"
            />
            <p className="text-[10px] text-gray-500 leading-tight">
              * 스토킹 및 개인정보 보호를 위해, 매칭이 확정된 파트너 1인에게만 이 장소가 공개됩니다.
            </p>
          </div>

          {/* Partner Preferences */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              동행 파트너에게 바라는 점 / 사전 질문
            </label>
            <textarea
              rows={2}
              placeholder="예: 편안한 분위기 좋아하시는 분, 비흡연자 선호합니다."
              value={partnerPreferences}
              onChange={(e) => setPartnerPreferences(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6c2cf5] resize-none"
            />
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
              {isEditing ? '공고 수정 완료' : '1:1 동행 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
