import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Phone, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { CurrentUser } from '../types';
import { maskRealName } from '../utils/maskName';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: CurrentUser) => void;
}

type AuthStep = 'terms' | 'phone' | 'profile';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [step, setStep] = useState<AuthStep>('terms');

  // Step 1: Terms
  const [agreedAge, setAgreedAge] = useState(false);
  const [agreedService, setAgreedService] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedSafety, setAgreedSafety] = useState(false);

  const allAgreed = agreedAge && agreedService && agreedPrivacy && agreedSafety;

  const handleToggleAll = () => {
    const next = !allAgreed;
    setAgreedAge(next);
    setAgreedService(next);
    setAgreedPrivacy(next);
    setAgreedSafety(next);
  };

  // Step 2: Phone OTP
  const [phone, setPhone] = useState('010-1234-5678');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const handleSendOtp = () => {
    if (!phone.trim()) return;
    setOtpSent(true);
    setTimerSeconds(90);
    setTimerActive(true);
    setOtpError('');
  };

  const handleVerifyOtp = () => {
    // 6자리 번호 검증 (시뮬레이션: 123456 또는 아무 6자리)
    if (otpCode.trim().length === 6) {
      setTimerActive(false);
      setStep('profile');
    } else {
      setOtpError('인증번호 6자리를 올바르게 입력해주세요. (테스트용: 123456)');
    }
  };

  // Step 3: Real Name & Profile
  const [realName, setRealName] = useState('조유미');
  const [nickname, setNickname] = useState('다정한이웃');
  const [gender, setGender] = useState<'female' | 'male' | 'undisclosed'>('female');
  const [ageGroup, setAgeGroup] = useState('20대');
  const [bio, setBio] = useState('브런치와 주말 문화생활을 좋아하는 동행러입니다.');

  if (!isOpen) return null;

  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realName.trim()) return;

    const masked = maskRealName(realName);
    const newUser: CurrentUser = {
      id: 'user-' + Date.now(),
      isLoggedIn: true,
      phone,
      realName: realName.trim(),
      maskedName: masked,
      nickname: nickname.trim() || masked,
      gender,
      ageGroup,
      neighborhood: '서울 강남구 역삼동',
      sugarContent: 50, // 신규 가입 기본 당도 50 Brix
      isPhoneVerified: true,
      isKycVerified: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: bio.trim(),
      joinedAt: '방금 가입',
    };

    onAuthSuccess(newUser);
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6c2cf5] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900">
              {step === 'terms' && '약관 동의 및 본인 확인'}
              {step === 'phone' && '휴대폰 번호 인증'}
              {step === 'profile' && '안심 실명 프로필 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5">
          <div className={`h-1.5 flex-1 rounded-full ${step === 'terms' ? 'bg-[#6c2cf5]' : 'bg-[#ded6fb]'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === 'phone' ? 'bg-[#6c2cf5]' : step === 'profile' ? 'bg-[#ded6fb]' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === 'profile' ? 'bg-[#6c2cf5]' : 'bg-gray-200'}`} />
        </div>

        {/* Step 1: Terms Agreement */}
        {step === 'terms' && (
          <div className="p-5 space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-[#f0edff] text-[#6c2cf5] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-[17px] font-bold text-gray-900">안전한 1:1 동행을 위해</h4>
              <p className="text-xs text-gray-500 mt-1">
                유미당은 신뢰할 수 있는 이웃 간의 만남을 위해 필수 약관 동의를 진행합니다.
              </p>
            </div>

            {/* Agreement Box */}
            <div className="space-y-3 bg-[#f8f9fc] p-4 rounded-2xl border border-gray-100">
              {/* All Agree */}
              <label className="flex items-center gap-3 pb-3 border-b border-gray-200 cursor-pointer font-bold text-sm text-gray-900">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={handleToggleAll}
                  className="w-5 h-5 accent-[#6c2cf5] rounded cursor-pointer"
                />
                <span>전체 약관에 동의합니다</span>
              </label>

              {/* Items */}
              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreedAge}
                    onChange={(e) => setAgreedAge(e.target.checked)}
                    className="w-4 h-4 accent-[#6c2cf5] rounded cursor-pointer"
                  />
                  <span>[필수] 만 19세 이상 성인 본인 확인</span>
                </div>
                <span className="text-[11px] text-gray-400">보기 &gt;</span>
              </label>

              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreedService}
                    onChange={(e) => setAgreedService(e.target.checked)}
                    className="w-4 h-4 accent-[#6c2cf5] rounded cursor-pointer"
                  />
                  <span>[필수] 유미당 서비스 이용약관 동의</span>
                </div>
                <span className="text-[11px] text-gray-400">보기 &gt;</span>
              </label>

              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreedPrivacy}
                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                    className="w-4 h-4 accent-[#6c2cf5] rounded cursor-pointer"
                  />
                  <span>[필수] 개인정보 수집 및 이용 동의</span>
                </div>
                <span className="text-[11px] text-gray-400">보기 &gt;</span>
              </label>

              <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={agreedSafety}
                    onChange={(e) => setAgreedSafety(e.target.checked)}
                    className="w-4 h-4 accent-[#6c2cf5] rounded cursor-pointer"
                  />
                  <span>[필수] 1:1 동행 안전 수칙 준수 서약</span>
                </div>
                <span className="text-[11px] text-gray-400">보기 &gt;</span>
              </label>
            </div>

            <button
              disabled={!allAgreed}
              onClick={() => setStep('phone')}
              className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-1.5 ${
                allAgreed
                  ? 'bg-[#6c2cf5] text-white shadow-md shadow-purple-500/20 active:scale-98'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>동의하고 다음으로</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Phone OTP */}
        {step === 'phone' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                휴대폰 번호
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6c2cf5]"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3.5 py-2.5 bg-[#f0edff] hover:bg-[#ded6fb] text-[#6c2cf5] font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  {otpSent ? '재발송' : '인증번호 발송'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">
                    인증번호 6자리
                  </label>
                  <span className="text-xs font-semibold text-rose-500">
                    남은 시간 {Math.floor(timerSeconds / 60)}:{('0' + (timerSeconds % 60)).slice(-2)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="인증번호 6자리 입력"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm tracking-widest font-mono focus:outline-none focus:border-[#6c2cf5]"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpCode('123456')}
                    className="absolute right-2.5 top-2 text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] px-2 py-1 rounded-md"
                  >
                    테스트용 입력
                  </button>
                </div>

                {otpError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>
            )}

            {/* Policy Notice Box */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">💡 본인확인 정책 안내</span>
              현재 프로토타입에서는 휴대폰 SMS 인증으로 진행되며, 정식 서비스에서는 보다 완벽한 신원 보증을 위해 <strong>1원 계좌 인증</strong>으로 전환될 예정입니다.
            </div>

            <button
              disabled={!otpSent}
              onClick={handleVerifyOtp}
              className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-1.5 ${
                otpSent
                  ? 'bg-[#6c2cf5] text-white shadow-md shadow-purple-500/20 active:scale-98'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>인증 확인 및 계속하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Real Name & Profile */}
        {step === 'profile' && (
          <form onSubmit={handleCompleteSignUp} className="p-5 space-y-4">
            {/* Real Name Input with Live Masking */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  실명 입력 (필수)
                </label>
                <span className="text-[11px] font-semibold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                  화면 표기: {maskRealName(realName) || '미입력'}
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="실명을 입력해주세요 (예: 조유미)"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6c2cf5]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                * 유미당 안심 실명제에 따라 타인에게는 가운데 글자가 마스킹된 <strong>'{maskRealName(realName) || '조*미'}'</strong> 형태로만 안전하게 공개됩니다.
              </p>
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                서비스 활동 닉네임
              </label>
              <input
                type="text"
                placeholder="예: 다정한이웃"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6c2cf5]"
              />
            </div>

            {/* Gender & Age Group */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  성별
                </label>
                <div className="flex gap-1.5">
                  {(['female', 'male'] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        gender === g
                          ? 'border-[#6c2cf5] bg-[#f0edff] text-[#6c2cf5]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {g === 'female' ? '여성' : '남성'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  연령대
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6c2cf5]"
                >
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="50대 이상">50대 이상</option>
                </select>
              </div>
            </div>

            {/* Initial Sugar Content Notice */}
            <div className="p-3 bg-[#f8f6ff] border border-[#e0d6fa] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🍯</span>
                <div>
                  <span className="font-bold text-gray-900 block">기본 시작 당도</span>
                  <span className="text-[11px] text-gray-500">동행 완료 후 상호 평가로 상승합니다</span>
                </div>
              </div>
              <span className="font-extrabold text-[#6c2cf5] text-sm bg-white px-2.5 py-1 rounded-lg border border-[#ded6fb]">
                50 🍯
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all"
            >
              회원가입 완료 및 서비스 시작
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
