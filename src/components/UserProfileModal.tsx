import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ShieldCheck, Star } from 'lucide-react';
import type { PublicUserProfile } from '../types';

export function UserProfileModal({ profile, onClose }: { profile: PublicUserProfile; onClose: () => void }) {
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    backRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  return <div role="dialog" aria-modal="true" aria-label={`${profile.displayName}님의 상세 프로필`}
    className="fixed inset-0 z-[60] flex justify-center bg-black/60 sm:p-4 sm:items-center"
    onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      // This read-only view has one control; keep keyboard focus in the dialog.
      if (event.key === 'Tab') { event.preventDefault(); backRef.current?.focus(); }
    }}>
    <div className="w-full max-w-[440px] bg-[#f8f9fc] h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto sm:rounded-[28px] text-left shadow-2xl">
      <header className="sticky top-0 bg-white/95 backdrop-blur-md p-4 border-b border-gray-100 z-10">
        <button ref={backRef} onClick={onClose} className="flex items-center gap-2 text-sm font-bold text-gray-800 rounded-lg focus-visible:outline-2 focus-visible:outline-purple-500">
          <ArrowLeft size={19} /> 공고로 돌아가기
        </button>
      </header>
      <div className="p-5 space-y-4">
        {profile.isSample && <p className="text-[11px] text-amber-800 bg-amber-50 rounded-xl px-3 py-2">프로토타입 예시 프로필 · 인증과 후기는 시연용입니다.</p>}
        <section className="bg-white rounded-3xl p-5">
          <div className="flex items-center gap-4">
            <img src={profile.avatar} alt="" className="w-20 h-20 object-cover rounded-full bg-purple-50" />
            <div><h2 className="font-bold text-xl">{profile.displayName}</h2><p className="text-xs text-gray-500 mt-1">{[profile.ageGroup, profile.neighborhood].filter(Boolean).join(' · ') || '등록된 기본 정보가 없어요.'}</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <span className="rounded-full bg-[#f0edff] text-[#6c2cf5] font-bold px-3 py-1.5">🍯 {profile.sugarContent === null ? '당도 정보 없음' : `당도 ${profile.sugarContent}`}</span>
            {(profile.isPhoneVerified || profile.isKycVerified) ? <span className="flex items-center gap-1 text-emerald-700"><ShieldCheck size={14} />{profile.isKycVerified ? '본인확인 완료' : '휴대폰 인증 완료'}</span> : <span className="text-gray-400">인증 정보 없음</span>}
          </div>
        </section>
        <section className="bg-white rounded-3xl p-5"><h3 className="text-sm font-bold mb-2">자기소개</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio || '아직 자기소개를 작성하지 않았어요.'}</p></section>
        <section className="bg-white rounded-3xl p-5 space-y-4">
          {[{ title: '관심사와 취미', values: profile.hobbies }, { title: '나의 성향', values: profile.traits }].map(group => <div key={group.title}>
            <h3 className="text-sm font-bold mb-2">{group.title}</h3><div className="flex flex-wrap gap-2">{group.values.length ? group.values.map(value => <span key={value} className="bg-[#f0edff] text-[#6c2cf5] text-xs rounded-full px-3 py-1.5">{value}</span>) : <p className="text-xs text-gray-400">아직 등록된 정보가 없어요.</p>}</div>
          </div>)}
        </section>
        <section className="bg-white rounded-3xl p-5"><h3 className="text-sm font-bold mb-3">받은 동행 후기 <span className="text-[#6c2cf5]">{profile.reviews.length}</span></h3>
          {profile.reviews.length ? profile.reviews.map(review => <article key={review.id} className="py-3 border-t border-gray-100">
            <div className="flex justify-between text-xs"><span className="font-bold">{review.author}</span><span className="flex items-center gap-1 text-amber-600"><Star size={13} fill="currentColor" />{review.rating.toFixed(1)}</span></div>
            <p className="text-xs text-gray-600 leading-relaxed mt-2">{review.comment}</p>
          </article>) : <p className="text-xs text-gray-400">아직 공개된 동행 후기가 없어요.</p>}
        </section>
      </div>
    </div>
  </div>;
}
