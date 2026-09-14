import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Phone, User, ArrowRight, AlertCircle, Check, Clock, Sparkles } from 'lucide-react';
import { CurrentUser } from '../types';
import { maskRealName } from '../utils/maskName';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: CurrentUser) => void;
}

type AuthMode = 'signup' | 'signin';
type SignUpStep = 'terms' | 'phone' | 'profile';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [step, setStep] = useState<SignUpStep>('terms');

  // Input states
  const [phone, setPhone] = useState('010-1234-5678');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerActive, setTimerActive] = useState(false);

  // Profile states
  const [realName, setRealName] = useState('조유미');
  const [gender, setGender] = useState<'female' | 'male' | 'undisclosed'>('female');
  const [ageGroup, setAgeGroup] = useState('20대');
  const [bio, setBio] = useState('브런치와 주말 문화생활을 좋아하는 동행러입니다.');

  // Terms
  const [agreedAge, setAgreedAge] = useState(false);
  const [agreedService, setAgreedService] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedSafety, setAgreedSafety] = useState(false);

  // Error & Info
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Timer countdown
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

  const allAgreed = agreedAge && agreedService && agreedPrivacy && agreedSafety;

  const handleToggleAll = () => {
    const next = !allAgreed;
    setAgreedAge(next);
    setAgreedService(next);
    setAgreedPrivacy(next);
    setAgreedSafety(next);
  };

  const resetForm = () => {
    setPhone('010-1234-5678');
    setOtpSent(false);
    setOtpCode('');
    setTimerActive(false);
    setTimerSeconds(90);
    setErrorMessage('');
    setInfoMessage('');
    setStep('terms');
  };

  if (!isOpen) return null;

  // 인증번호 발송 시뮬레이션
  const handleSendOtp = () => {
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setErrorMessage('');
    setOtpSent(true);
    setTimerSeconds(90);
    setTimerActive(true);
    setInfoMessage(`'${phone.trim()}'으로 인증번호 6자리가 발송되었습니다. (테스트용: 123456)`);
  };

  // 인증번호 검증 시뮬레이션
  const handleVerifyOtp = (isForSignIn = false) => {
    setErrorMessage('');
    if (otpCode.trim().length !== 6) {
      setErrorMessage('인증번호 6자리를 올바르게 입력해주세요.');
      return;
    }

    // 6자리 입력 시 인증 통과
    setTimerActive(false);

    if (isForSignIn) {
      // 로그인 완료 처리
      const loggedUser: CurrentUser = {
        id: 'user-' + Date.now(),
        isLoggedIn: true,
        phone: phone.trim(),
        realName: '조유미',
        maskedName: '조*미',
        nickname: '조*미',
        gender: 'female',
        ageGroup: '20대',
        neighborhood: '서울 강남구 역삼동',
        sugarContent: 50,
        isPhoneVerified: true,
        isKycVerified: false,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: '브런치와 주말 문화생활을 좋아하는 동행러입니다.',
        joinedAt: '방금 로그인',
      };
      onAuthSuccess(loggedUser);
      onClose();
      resetForm();
    } else {
      // 회원가입: 프로필 등록 단계로 진행
      setStep('profile');
      setInfoMessage('휴대폰 본인확인이 완료되었습니다! 안심 실명 프로필을 등록해주세요.');
    }
  };

  // 회원가입 최종 완료
  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!realName.trim()) {
      setErrorMessage('실명을 입력해주세요.');
      return;
    }

    const masked = maskRealName(realName);
    const newUser: CurrentUser = {
      id: 'user-' + Date.now(),
      isLoggedIn: true,
      phone: phone.trim(),
      realName: realName.trim(),
      maskedName: masked,
      nickname: masked, // 가공된 별명 대신 실명 마스킹 사용
      gender,
      ageGroup,
      neighborhood: '서울 강남구 역삼동',
      sugarContent: 50, // 신규 가입 기본 50 Brix
      isPhoneVerified: true,
      isKycVerified: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: bio.trim(),
      joinedAt: '방금 가입',
    };

    onAuthSuccess(newUser);
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6c2cf5] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900">
              {mode === 'signin'
                ? '휴대폰 번호 로그인'
                : step === 'terms'
                ? '약관 동의 및 본인 확인'
                : step === 'phone'
                ? '휴대폰 번호 본인인증'
                : '안심 실명 프로필 등록'}
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-2 flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setStep('terms');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-all ${
              mode === 'signup'
                ? 'text-[#6c2cf5] border-[#6c2cf5]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            휴대폰 본인인증 가입
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-all ${
              mode === 'signin'
                ? 'text-[#6c2cf5] border-[#6c2cf5]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            기존 번호로 로그인
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mx-5 mt-4 p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 flex items-start gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#6c2cf5]" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ==============================
            MODE 1: SIGN UP (회원가입)
        ============================== */}
        {mode === 'signup' && (
          <div>
            {/* Step Indicator */}
            <div className="px-5 pt-3 pb-2 flex items-center gap-1.5">
              <div className={`h-1.5 flex-1 rounded-full ${step === 'terms' ? 'bg-[#6c2cf5]' : 'bg-[#ded6fb]'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step === 'phone' ? 'bg-[#6c2cf5]' : step === 'profile' ? 'bg-[#ded6fb]' : 'bg-gray-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step === 'profile' ? 'bg-[#6c2cf5]' : 'bg-gray-200'}`} />
            </div>

            {/* STEP 1: 약관 동의 */}
            {step === 'terms' && (
              <div className="p-5 space-y-4">
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6c2cf5] flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-[17px] font-bold text-gray-900">안전한 1:1 동행을 위해</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    유미당은 신뢰할 수 있는 이웃 간의 만남을 위해 필수 약관 동의를 진행합니다.
                  </p>
                </div>

                <div className="space-y-3 bg-[#f8f9fc] p-4 rounded-2xl">
                  <label className="flex items-center gap-3 pb-3 border-b border-gray-200/50 cursor-pointer font-bold text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={allAgreed}
                      onChange={handleToggleAll}
                      className="w-5 h-5 accent-[#6c2cf5] rounded cursor-pointer"
                    />
                    <span>전체 약관에 동의합니다</span>
                  </label>

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

            {/* STEP 2: 휴대폰 번호 본인인증 */}
            {step === 'phone' && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    휴대폰 번호
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                      />
                    </div>
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
                  <div className="space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700">
                        인증번호 6자리
                      </label>
                      <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm tracking-widest font-mono text-center font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                      />
                      <button
                        type="button"
                        onClick={() => setOtpCode('123456')}
                        className="absolute right-2 top-2 px-2 py-1 text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] hover:bg-[#ded6fb] rounded-lg transition-colors"
                      >
                        테스트코드 입력
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={otpCode.trim().length !== 6}
                      onClick={() => handleVerifyOtp(false)}
                      className="w-full mt-2 py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] disabled:bg-purple-300 text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      <span>인증 확인 및 계속하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="p-3.5 bg-purple-50/60 rounded-2xl text-[11px] text-purple-900 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1 text-[#6c2cf5]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>실제 발송 없는 안심 테스트 모드 지원</span>
                  </div>
                  <p className="text-gray-600">
                    휴대폰 번호 입력 후 <strong>[인증번호 발송]</strong>을 누르시면, 우측의 <strong>[테스트코드 입력]</strong> 버튼을 통해 즉시 인증을 통과하실 수 있습니다.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('terms')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    &larr; 약관 동의로 돌아가기
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 실명 마스킹 프로필 등록 */}
            {step === 'profile' && (
              <form onSubmit={handleCompleteSignUp} className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      실명 입력 (필수)
                    </label>
                    <span className="text-[11px] font-semibold text-[#6c2cf5] bg-[#f0edff] px-2 py-0.5 rounded-full">
                      화면 표기: {maskRealName(realName) || '미입력'}
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="실명을 입력해주세요 (예: 조유미)"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                    />
                  </div>
                  <div className="p-3 mt-2 bg-purple-50/70 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#6c2cf5]" />
                      <span>유미당 실명 마스킹 원칙 안내</span>
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      유미당은 가공된 별명이 아닌 <strong>본인확인 실명을 *로 가린 상태('{maskRealName(realName) || '조*미'}')</strong>로 모든 동행 서비스에서 안전하게 활동합니다.
                    </p>
                  </div>
                </div>

                {/* 성별 및 연령대 */}
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
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            gender === g
                              ? 'bg-[#f0edff] text-[#6c2cf5] border border-[#6c2cf5]/30'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                      className="w-full px-3.5 py-2 rounded-xl bg-gray-50 focus:bg-white text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                    >
                      <option value="20대">20대</option>
                      <option value="30대">30대</option>
                      <option value="40대">40대</option>
                      <option value="50대 이상">50대 이상</option>
                    </select>
                  </div>
                </div>

                {/* 당도 안내 */}
                <div className="p-3.5 bg-[#f8f6ff] rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🍯</span>
                    <div>
                      <span className="font-bold text-gray-900 block">기본 시작 당도</span>
                      <span className="text-[11px] text-gray-500">동행 완료 후 상호 평가로 상승합니다</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#6c2cf5] text-sm bg-white px-2.5 py-1 rounded-lg shadow-2xs">
                    50 🍯
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all"
                >
                  회원가입 완료 및 서비스 시작
                </button>
              </form>
            )}
          </div>
        )}

        {/* ==============================
            MODE 2: SIGN IN (로그인)
        ============================== */}
        {mode === 'signin' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                가입된 휴대폰 번호
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                  />
                </div>
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
              <div className="space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">
                    인증번호 6자리
                  </label>
                  <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm tracking-widest font-mono text-center font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpCode('123456')}
                    className="absolute right-2 top-2 px-2 py-1 text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] hover:bg-[#ded6fb] rounded-lg transition-colors"
                  >
                    테스트코드 입력
                  </button>
                </div>

                <button
                  type="button"
                  disabled={otpCode.trim().length !== 6}
                  onClick={() => handleVerifyOtp(true)}
                  className="w-full mt-2 py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] disabled:bg-purple-300 text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>인증 확인 및 로그인</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setStep('terms');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className="text-xs text-gray-500 hover:text-[#6c2cf5] font-medium"
              >
                계정이 없으신가요? <span className="underline font-bold text-[#6c2cf5]">휴대폰 본인인증으로 가입</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
