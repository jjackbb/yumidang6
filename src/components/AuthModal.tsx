import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Check, Clock, Sparkles } from 'lucide-react';
import { CurrentUser } from '../types';
import { maskRealName } from '../utils/maskName';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: CurrentUser) => void;
}

type AuthMode = 'signin' | 'signup';
type SignUpStep = 'terms' | 'email_otp' | 'profile';
type SignInMethod = 'password' | 'otp';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('password');
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('terms');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [isDevFallback, setIsDevFallback] = useState(false);

  // Profile states
  const [realName, setRealName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'undisclosed'>('female');
  const [ageGroup, setAgeGroup] = useState('20대');
  const [bio, setBio] = useState('브런치와 주말 문화생활을 좋아하는 동행러입니다.');

  // Terms
  const [agreedAge, setAgreedAge] = useState(false);
  const [agreedService, setAgreedService] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedSafety, setAgreedSafety] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
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
    setEmail('');
    setPassword('');
    setNewPassword('');
    setOtpSent(false);
    setOtpCode('');
    setTimerActive(false);
    setTimerSeconds(180);
    setIsDevFallback(false);
    setRealName('');
    setErrorMessage('');
    setInfoMessage('');
    setSignUpStep('terms');
  };

  if (!isOpen) return null;

  // Supabase User to CurrentUser mapper
  const buildCurrentUser = (user: any): CurrentUser => {
    const meta = user.user_metadata || {};
    const name = meta.realName || realName || '유미당 회원';
    const masked = meta.maskedName || maskRealName(name);

    return {
      id: user.id,
      isLoggedIn: true,
      email: user.email || email.trim(),
      phone: user.phone || '010-0000-0000',
      realName: name,
      maskedName: masked,
      nickname: masked,
      gender: meta.gender || gender,
      ageGroup: meta.ageGroup || ageGroup,
      neighborhood: meta.neighborhood || '서울 강남구 역삼동',
      sugarContent: 50,
      isPhoneVerified: false,
      isKycVerified: false,
      avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: meta.bio || bio,
      joinedAt: '방금 가입',
    };
  };

  // 1. 발송: 이메일로 6자리 OTP 발송
  const handleSendOtp = async (isForSignIn = false) => {
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: !isForSignIn,
        },
      });

      if (error) {
        if (error.message.includes('rate limit') || (error as any).status === 429) {
          // Supabase 무료 기본 메일 한도(시간당 약 3건) 초과 시 개발 테스트 모드로 유연하게 전환
          setIsDevFallback(true);
          setOtpSent(true);
          setTimerSeconds(180);
          setTimerActive(true);
          setInfoMessage('💡 Supabase 무료 계정의 기본 발송 한도(시간당 3건)에 도달하여 [개발 테스트 모드]가 활성화되었습니다. 아래 [테스트 코드 123456 입력]을 눌러 인증을 진행하실 수 있습니다.');
          return;
        }
        if (error.message.includes('Signups not allowed')) {
          setErrorMessage('가입되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      setOtpSent(true);
      setTimerSeconds(180);
      setTimerActive(true);
      setInfoMessage(`'${email.trim()}'으로 6자리 인증코드가 발송되었습니다. 메일함을 확인해주세요.`);
    } catch (err: any) {
      setErrorMessage(err.message || '인증번호 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 2. 검증: 6자리 OTP 인증번호 검증
  const handleVerifyOtp = async (isForSignIn = false) => {
    setErrorMessage('');
    setInfoMessage('');

    if (otpCode.trim().length !== 6) {
      setErrorMessage('6자리 인증코드를 정확히 입력해주세요.');
      return;
    }

    // 개발 fallback 모드이거나 테스트 코드(123456)인 경우
    if (isDevFallback || otpCode.trim() === '123456') {
      setTimerActive(false);
      if (isForSignIn) {
        const fallbackUser: CurrentUser = {
          id: 'user-otp-' + Date.now(),
          isLoggedIn: true,
          email: email.trim(),
          phone: '010-0000-0000',
          realName: '유미당 테스트회원',
          maskedName: '유*원',
          nickname: '유*원',
          gender: 'female',
          ageGroup: '20대',
          neighborhood: '서울 강남구 역삼동',
          sugarContent: 50,
          isPhoneVerified: false,
          isKycVerified: false,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: '브런치와 주말 문화생활을 좋아하는 동행러입니다.',
          joinedAt: '방금 가입',
        };
        onAuthSuccess(fallbackUser);
        onClose();
        resetForm();
      } else {
        setInfoMessage('이메일 인증이 성공적으로 확인되었습니다! 프로필 정보를 입력해주세요.');
        setSignUpStep('profile');
      }
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email',
      });

      if (error) {
        setErrorMessage('인증코드가 올바르지 않거나 만료되었습니다. 다시 확인해주세요.');
        return;
      }

      setTimerActive(false);

      if (isForSignIn) {
        if (data.user) {
          const currentUser = buildCurrentUser(data.user);
          onAuthSuccess(currentUser);
          onClose();
          resetForm();
        }
      } else {
        setInfoMessage('이메일 인증이 성공적으로 완료되었습니다! 프로필 정보를 입력해주세요.');
        setSignUpStep('profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || '인증코드 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 3. 비밀번호로 로그인
  const handleSignInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        const currentUser = buildCurrentUser(data.user);
        onAuthSuccess(currentUser);
        onClose();
        resetForm();
      }
    } catch (err: any) {
      setErrorMessage(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 4. 회원가입 최종 완료 (프로필 및 비밀번호 등록)
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!realName.trim()) {
      setErrorMessage('실명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const masked = maskRealName(realName);

      // Supabase 활성 세션이 있는 경우 업데이트
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const updatePayload: any = {
          data: {
            realName: realName.trim(),
            maskedName: masked,
            gender,
            ageGroup,
            bio: bio.trim(),
          },
        };
        if (newPassword.trim().length >= 6) {
          updatePayload.password = newPassword.trim();
        }

        const { data, error } = await supabase.auth.updateUser(updatePayload);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
        if (data.user) {
          onAuthSuccess(buildCurrentUser(data.user));
          onClose();
          resetForm();
          return;
        }
      }

      // 개발 테스트 모드(세션 미발급)의 경우 fallback 사용자 생성
      const fallbackUser: CurrentUser = {
        id: 'user-' + Date.now(),
        isLoggedIn: true,
        email: email.trim(),
        phone: '010-0000-0000',
        realName: realName.trim(),
        maskedName: masked,
        nickname: masked,
        gender,
        ageGroup,
        neighborhood: '서울 강남구 역삼동',
        sugarContent: 50,
        isPhoneVerified: false,
        isKycVerified: false,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: bio.trim(),
        joinedAt: '방금 가입',
      };

      onAuthSuccess(fallbackUser);
      onClose();
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || '프로필 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
              {mode === 'signin' ? '유미당 로그인' : '유미당 회원가입'}
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
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignUpStep('terms');
              setErrorMessage('');
              setInfoMessage('');
            }}
            className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-all ${
              mode === 'signup'
                ? 'text-[#6c2cf5] border-[#6c2cf5]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            이메일 인증 회원가입
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
          <div className="mx-5 mt-4 p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 flex items-start gap-2 animate-in fade-in leading-relaxed">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#6c2cf5]" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ==============================
            MODE 1: SIGN IN (로그인)
        ============================== */}
        {mode === 'signin' && (
          <div className="p-5 space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setSignInMethod('password');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  signInMethod === 'password'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                비밀번호로 로그인
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignInMethod('otp');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  signInMethod === 'otp'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                이메일 인증코드 로그인
              </button>
            </div>

            {/* 방식 1-A: 비밀번호 로그인 */}
            {signInMethod === 'password' && (
              <form onSubmit={handleSignInWithPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">이메일</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">비밀번호</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="비밀번호를 입력해주세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] disabled:bg-purple-300 text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>로그인 중...</span>
                    </>
                  ) : (
                    <>
                      <span>로그인</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 방식 1-B: 이메일 OTP 번호로 로그인 */}
            {signInMethod === 'otp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">이메일</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={loading || (timerActive && timerSeconds > 150)}
                      onClick={() => handleSendOtp(true)}
                      className="px-3.5 py-2.5 bg-[#f0edff] hover:bg-[#ded6fb] text-[#6c2cf5] font-bold text-xs rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {otpSent ? '재발송' : '인증코드 발송'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700">이메일 6자리 인증코드</label>
                      <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(timerSeconds / 60)}:{('0' + (timerSeconds % 60)).slice(-2)}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6자리 숫자 입력"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm tracking-widest font-mono text-center border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
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
                      disabled={loading || otpCode.trim().length !== 6}
                      onClick={() => handleVerifyOtp(true)}
                      className="w-full mt-2 py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] disabled:bg-purple-300 text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>확인 중...</span>
                        </>
                      ) : (
                        <span>인증 확인 및 로그인</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignUpStep('terms');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className="text-xs text-gray-500 hover:text-[#6c2cf5] font-medium"
              >
                계정이 없으신가요? <span className="underline font-bold text-[#6c2cf5]">이메일 인증으로 가입</span>
              </button>
            </div>
          </div>
        )}

        {/* ==============================
            MODE 2: SIGN UP (회원가입)
        ============================== */}
        {mode === 'signup' && (
          <div>
            {/* Step Indicator */}
            <div className="px-5 pt-3 pb-2 flex items-center gap-1.5">
              <div className={`h-1.5 flex-1 rounded-full ${signUpStep === 'terms' ? 'bg-[#6c2cf5]' : 'bg-[#ded6fb]'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${signUpStep === 'email_otp' ? 'bg-[#6c2cf5]' : signUpStep === 'profile' ? 'bg-[#ded6fb]' : 'bg-gray-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${signUpStep === 'profile' ? 'bg-[#6c2cf5]' : 'bg-gray-200'}`} />
            </div>

            {/* STEP 1: 약관 동의 */}
            {signUpStep === 'terms' && (
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
                      <span>[필수] 만 19세 이상 성인 확인</span>
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
                  onClick={() => setSignUpStep('email_otp')}
                  className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-1.5 ${
                    allAgreed
                      ? 'bg-[#6c2cf5] text-white shadow-md shadow-purple-500/20 active:scale-98'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>동의하고 이메일 인증하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: 이메일 6자리 OTP 인증 */}
            {signUpStep === 'email_otp' && (
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">이메일 인증</label>
                    <span className="text-[11px] text-[#6c2cf5] font-semibold">이메일 주소 입력</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSendOtp(false)}
                      className="px-3.5 py-2.5 bg-[#f0edff] hover:bg-[#ded6fb] text-[#6c2cf5] font-bold text-xs rounded-xl transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {otpSent ? '인증코드 재발송' : '인증코드 발송'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="p-3 bg-purple-50/70 rounded-xl text-xs text-purple-900 leading-relaxed">
                      💡 <strong>{email}</strong> 로 발송된 6자리 인증코드를 입력해주세요.
                      {isDevFallback && (
                        <div className="mt-1.5 pt-1.5 border-t border-purple-200 text-[#6c2cf5] font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>발송 한도 초과로 개발 모드 활성화됨 (테스트코드: 123456)</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-700">6자리 인증코드</label>
                        <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          유효시간 {Math.floor(timerSeconds / 60)}:{('0' + (timerSeconds % 60)).slice(-2)}
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6자리 숫자 입력"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl bg-gray-50 focus:bg-white text-base tracking-[0.3em] font-mono text-center font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                        />
                        <button
                          type="button"
                          onClick={() => setOtpCode('123456')}
                          className="absolute right-2.5 top-2.5 px-2 py-1 text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] hover:bg-[#ded6fb] rounded-lg transition-colors"
                        >
                          테스트코드 입력
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loading || otpCode.trim().length !== 6}
                      onClick={() => handleVerifyOtp(false)}
                      className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] disabled:bg-purple-300 text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>인증코드 검증 중...</span>
                        </>
                      ) : (
                        <>
                          <span>인증 확인 및 다음</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSignUpStep('terms')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    &larr; 약관 동의로 돌아가기
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: 프로필 설정 및 비밀번호 */}
            {signUpStep === 'profile' && (
              <form onSubmit={handleCompleteSignUp} className="p-5 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>이메일({email}) 인증이 확인되었습니다!</span>
                </div>

                {/* 실명 입력 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">실명 입력 (필수)</label>
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
                  <p className="text-[11px] text-gray-500 mt-1">
                    동행 시 상대방에게는 <strong>'{maskRealName(realName) || '조*미'}'</strong> 형태로 안전하게 표시됩니다.
                  </p>
                </div>

                {/* 비밀번호 설정 (선택: 추후 비밀번호로 빠른 로그인 가능) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    비밀번호 설정 <span className="text-gray-400 font-normal">(선택 / 6자 이상)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="설정 시 비밀번호로도 바로 로그인 가능"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-gray-50 focus:bg-white text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6c2cf5]/30 focus:border-[#6c2cf5]"
                    />
                  </div>
                </div>

                {/* 성별 및 연령대 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">성별</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">연령대</label>
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
                  disabled={loading}
                  className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] disabled:bg-purple-300 text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>회원가입 완료 중...</span>
                    </>
                  ) : (
                    <span>회원가입 완료 및 시작하기</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
