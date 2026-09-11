import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Lock, Sparkles } from 'lucide-react';

interface KycAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAlreadyVerified: boolean;
  onKycSuccess: () => void;
}

export const KycAuthModal: React.FC<KycAuthModalProps> = ({
  isOpen,
  onClose,
  isAlreadyVerified,
  onKycSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleStartKyc = () => {
    setIsProcessing(true);
    // 외부 KYC PG 모듈 연동 시뮬레이션 (1.5초)
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      onKycSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6c2cf5] text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900">선택형 KYC 본인확인 센터</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isAlreadyVerified || isComplete ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-[19px] font-bold text-gray-900">
                KYC 본인확인이 완료되었습니다
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed max-w-[300px] mx-auto">
                프로필에 <strong>[공식 KYC 인증]</strong> 뱃지가 부여되어 상대방에게 최고 수준의 신뢰도를 제공합니다.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0edff] text-[#6c2cf5] text-xs font-bold border border-[#ded6fb]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>공식 인증회원 뱃지 활성화</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-[#6c2cf5] text-white font-bold rounded-xl text-sm transition-colors"
              >
                확인
              </button>
            </div>
          ) : (
            <>
              {/* Introduction */}
              <div className="p-4 bg-[#f8f6ff] rounded-2xl border border-[#ded6fb] space-y-2">
                <div className="flex items-center gap-2 text-[#6c2cf5]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold">1:1 동행 신뢰 보증 뱃지</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  외부 신원확인 기관(NICE/KCB 모바일 신분증)을 통해 신원을 검증받고, 프로필에 신뢰 마크를 달 수 있는 선택형 프리미엄 인증입니다.
                </p>
              </div>

              {/* Policy & Fee Info */}
              <div className="space-y-2.5 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-150">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-800 block">인증 실비 안내</span>
                    <span>외부 모바일 신분증 인증 수수료: <strong>건당 2,500원</strong> (사용자 직접 결제)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                  <Lock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-800 block">개인정보 미보관 원칙</span>
                    <span>유미당은 주민번호나 신분증 원본을 절대 보관하지 않으며, 공인 기관의 검증 완료 여부만 안전하게 수신합니다.</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={isProcessing}
                onClick={handleStartKyc}
                className="w-full py-3.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white font-bold rounded-xl text-[15px] shadow-md shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>외부 신원 확인 연동 중...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>2,500원 결제 및 KYC 인증 시작</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
