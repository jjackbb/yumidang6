/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Clock, CheckCircle2, Sparkles, CreditCard, Lock } from 'lucide-react';
import { MeetupPost, CurrentUser, EscrowPayment } from '../types';

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: MeetupPost | null;
  currentUser: CurrentUser | null;
  onPaymentSuccess: (payment: EscrowPayment, post: MeetupPost) => void;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  onPaymentSuccess,
}) => {
  const [selectedHours, setSelectedHours] = useState<number>(2);
  const [selectedMethod, setSelectedMethod] = useState<'kakaopay' | 'tosspay' | 'card'>('kakaopay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  if (!isOpen || !post || !post.proDetails) return null;

  const hourlyRate = post.proDetails.hourlyRate;
  const totalAmount = hourlyRate * selectedHours;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      const payment: EscrowPayment = {
        id: 'escrow-' + Date.now(),
        postId: post.id,
        postTitle: post.title,
        hostName: post.author,
        requesterName: currentUser?.maskedName || '나',
        hourlyRate,
        totalHours: selectedHours,
        totalAmount,
        status: 'held',
        paidAt: '방금 전',
        paymentMethod: selectedMethod,
      };

      setTimeout(() => {
        onPaymentSuccess(payment, post);
        setIsComplete(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              💎
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-400 text-yellow-950 rounded-full">
                  PRO
                </span>
                <h3 className="text-sm font-bold">1:1 안심 에스크로 결제</h3>
              </div>
              <p className="text-[11px] text-purple-100">동행 완료 시까지 대금이 안전하게 보호됩니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {isComplete ? (
            <div className="py-8 text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-base font-bold text-gray-900">에스크로 안전 예치 완료!</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                결제하신 <span className="font-bold text-purple-600">{totalAmount.toLocaleString()}원</span>이<br />
                유미당 에스크로에 안전하게 보관되었습니다.<br />
                <strong>1:1 매칭 확정 (2/2명)</strong> 및 약속방이 개설됩니다!
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                <Sparkles size={12} />
                <span>호스트 [{post.author}] 님에게 알림 전송 완료</span>
              </div>
            </div>
          ) : (
            <>
              {/* Post & Pro info preview */}
              <div className="p-3.5 bg-purple-50/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                  <span className="truncate max-w-[200px]">{post.title}</span>
                  <span className="shrink-0 text-purple-700">{post.author}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span>전문 분야</span>
                  <span className="font-semibold text-gray-800">{post.proDetails.specialty}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span>시간당 기본 요금</span>
                  <span className="font-bold text-gray-900">{hourlyRate.toLocaleString()}원 / 시간</span>
                </div>
              </div>

              {/* Select Hours */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Clock size={13} className="text-[#6c2cf5]" />
                  <span>동행 시간 선택 (1:1 맞춤 진행)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setSelectedHours(hr)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                        selectedHours === hr
                          ? 'bg-[#6c2cf5] text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                      }`}
                    >
                      {hr}시간
                      <span className="block text-[10px] font-normal opacity-90 mt-0.5">
                        {(hourlyRate * hr).toLocaleString()}원
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="p-3 bg-amber-50/80 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 leading-relaxed">
                  <strong className="font-bold block mb-0.5 text-amber-950">유미당 안심 에스크로 100% 보증</strong>
                  결제 대금은 만남이 완료되고 상호 만족 평가가 등록되기 전까지 유미당에 안전하게 예치됩니다. 노쇼나 취소 발생 시 전액 환불됩니다.
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <CreditCard size={13} className="text-purple-600" />
                  <span>간편 결제 수단</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('kakaopay')}
                    className={`py-2 px-2 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedMethod === 'kakaopay'
                        ? 'bg-[#fee500] text-[#3c1e1e] ring-2 ring-yellow-400 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    <span>🟡 카카오페이</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('tosspay')}
                    className={`py-2 px-2 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedMethod === 'tosspay'
                        ? 'bg-[#0064ff] text-white ring-2 ring-blue-400 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    <span>🔵 토스페이</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`py-2 px-2 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                      selectedMethod === 'card'
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    <span>💳 안심카드</span>
                  </button>
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-3.5 bg-gray-50 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>동행 시간</span>
                  <span>{selectedHours}시간</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>에스크로 안심 수수료</span>
                  <span className="text-emerald-600 font-medium">0원 (런칭 기념 무료)</span>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-gray-200/60">
                  <span className="text-xs font-bold text-gray-800">최종 예치 결제 금액</span>
                  <span className="text-base font-extrabold text-[#6c2cf5]">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>안심 에스크로 결제 처리 중...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>{totalAmount.toLocaleString()}원 안전 예치 결제하기</span>
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
