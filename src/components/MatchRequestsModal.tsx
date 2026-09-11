import React from 'react';
import { X, CheckCircle, XCircle, UserCheck, MessageSquare, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { JoinRequest } from '../types';

interface MatchRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: JoinRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const MatchRequestsModal: React.FC<MatchRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onAccept,
  onReject,
}) => {
  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const pastRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[480px] rounded-t-[28px] sm:rounded-[28px] max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6c2cf5] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">받은 1:1 동행 신청</h3>
              <p className="text-[11px] text-gray-500">
                수락 즉시 1:1 매칭이 확정(2/2명)되며 채팅방이 열립니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Pending Requests Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                대기 중인 신청
                <span className="bg-[#6c2cf5] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingRequests.length}
                </span>
              </span>
              <span className="text-[11px] text-amber-600 font-medium">
                * 1건 수락 시 다른 신청은 자동 정중 마감
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500 font-medium">새로운 동행 신청이 없습니다.</p>
                <p className="text-[11px] text-gray-400 mt-1">공고를 공유하거나 조금만 기다려주세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-purple-150 bg-white shadow-xs hover:border-[#6c2cf5] transition-all space-y-3"
                  >
                    {/* Post Title Badge */}
                    <div className="text-[11px] font-semibold text-gray-500 truncate">
                      공고: <span className="text-gray-900 font-bold">{req.postTitle}</span>
                    </div>

                    {/* Requester Profile */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.requesterAvatar}
                          alt={req.requesterName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">{req.requesterName}</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              본인인증
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="text-[#6c2cf5] font-bold">
                              당도 {Math.round(req.requesterSugar)} 🍯
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400">{req.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intro Message */}
                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed border border-gray-100">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mb-1">
                        <MessageSquare className="w-3 h-3" />
                        신청 메시지
                      </div>
                      "{req.message}"
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onReject(req.id)}
                        className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        정중히 거절
                      </button>
                      <button
                        onClick={() => onAccept(req.id)}
                        className="flex-1 py-2.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white font-bold text-xs rounded-xl shadow-sm shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        1:1 동행 수락하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past/Processed Requests */}
          {pastRequests.length > 0 && (
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-2.5">
                처리 완료된 내역 ({pastRequests.length})
              </span>
              <div className="space-y-2">
                {pastRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs opacity-75"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={req.requesterAvatar}
                        alt={req.requesterName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-gray-800">{req.requesterName}</span>
                        <span className="text-[11px] text-gray-400 block truncate max-w-[200px]">
                          {req.postTitle}
                        </span>
                      </div>
                    </div>
                    <div>
                      {req.status === 'accepted' ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          매칭 확정
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                          거절됨
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
