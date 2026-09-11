import React, { useState } from 'react';
import { Send, MapPin, Clock, CheckCheck, Info, CalendarClock, Check, X, Sparkles } from 'lucide-react';
import { Appointment, ScheduleProposal } from '../types';

interface ChatViewProps {
  appointment: Appointment;
  onOpenDashboard: () => void;
  onUpdateAppointment?: (newSchedule: { dateTime: string; location: string }) => void;
}

interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  time: string;
  proposal?: ScheduleProposal;
}

export const ChatView: React.FC<ChatViewProps> = ({
  appointment,
  onOpenDashboard,
  onUpdateAppointment,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'partner',
      text: '안녕하세요! 이번 토요일 식사 동행 매칭되어 반갑습니다 :)',
      time: '어제 오후 5:20',
    },
    {
      id: 'm2',
      sender: 'me',
      text: `안녕하세요 ${appointment.partnerName}님! 반갑습니다. 식사 약속 기대되네요!`,
      time: '어제 오후 5:24',
    },
    {
      id: 'm3',
      sender: 'partner',
      text: '제가 2시 예약 미리 메모해 두었어요. 혹시 시간이나 장소 편하신 곳 있으시면 언제든 말씀해주세요!',
      time: '오전 10:12',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposedDateTime, setProposedDateTime] = useState('2026.9.12(토) 15:00');
  const [proposedLocation, setProposedLocation] = useState(appointment.location);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: 'm-' + Date.now(),
      sender: 'me',
      text: inputVal.trim(),
      time: '방금',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Auto simulated reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'm-' + (Date.now() + 1),
          sender: 'partner',
          text: '확인했습니다! 내일 맛있는 식사 하면서 즐거운 시간 보내요 😊',
          time: '방금',
        },
      ]);
    }, 1200);
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedDateTime.trim() || !proposedLocation.trim()) return;

    const newProposal: ScheduleProposal = {
      id: 'prop-' + Date.now(),
      newDateTime: proposedDateTime.trim(),
      newLocation: proposedLocation.trim(),
      status: 'pending',
      proposerName: '나',
    };

    const newMsg: Message = {
      id: 'm-prop-' + Date.now(),
      sender: 'me',
      text: `[일정/장소 변경 제안] ${proposedDateTime.trim()} / ${proposedLocation.trim()} (으)로 변경을 제안합니다.`,
      time: '방금',
      proposal: newProposal,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsProposalModalOpen(false);

    // Auto partner acceptance simulation after 2 seconds
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.proposal && msg.proposal.id === newProposal.id) {
            return {
              ...msg,
              proposal: { ...msg.proposal, status: 'accepted' },
            };
          }
          return msg;
        })
      );

      if (onUpdateAppointment) {
        onUpdateAppointment({
          dateTime: proposedDateTime.trim(),
          location: proposedLocation.trim(),
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'm-reply-' + Date.now(),
          sender: 'partner',
          text: `제안해주신 시간(${proposedDateTime.trim()})과 장소 좋습니다! 일정 변경 수락했어요. 그때 뵐게요! 👍`,
          time: '방금',
        },
      ]);
    }, 2000);
  };

  const handleAcceptProposal = (msgId: string, proposal: ScheduleProposal) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.proposal) {
          return {
            ...msg,
            proposal: { ...msg.proposal, status: 'accepted' },
          };
        }
        return msg;
      })
    );

    if (onUpdateAppointment) {
      onUpdateAppointment({
        dateTime: proposal.newDateTime,
        location: proposal.newLocation,
      });
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'm-' + Date.now(),
        sender: 'me',
        text: '제안해주신 일정 변경을 수락했습니다! 약속 정보가 즉시 업데이트되었습니다.',
        time: '방금',
      },
    ]);
  };

  const handleRejectProposal = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.proposal) {
          return {
            ...msg,
            proposal: { ...msg.proposal, status: 'rejected' },
          };
        }
        return msg;
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        id: 'm-' + Date.now(),
        sender: 'me',
        text: '죄송하지만 해당 시간은 어려울 것 같아요. 기존 일정대로 진행하면 좋을 것 같습니다!',
        time: '방금',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] bg-[#f6f7fb] text-left">
      {/* Top Partner Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={appointment.partnerAvatar}
              alt={appointment.partnerName}
              className="w-10 h-10 rounded-full object-cover border border-purple-200"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[15px] text-gray-900">{appointment.partnerName}</h3>
              <span className="text-[11px] font-bold text-[#6c2cf5] bg-[#f0edff] px-1.5 py-0.5 rounded">
                1:1 동행
              </span>
            </div>
            <p className="text-xs text-gray-500">당도 99.2 🍯 • 1:1 안심 조율방</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsProposalModalOpen(true)}
            className="text-xs font-bold text-[#6c2cf5] bg-[#f0edff] hover:bg-[#e4dcfa] px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">일정/장소 제안</span>
            <span className="sm:hidden">제안</span>
          </button>
          <button
            onClick={onOpenDashboard}
            className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>약속 정보</span>
          </button>
        </div>
      </div>

      {/* Appointment mini-summary bar (Dynamic reflection) */}
      <div className="bg-white/90 backdrop-blur-xs px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#6c2cf5]" />
          <span className="font-bold text-gray-900">{appointment.dateTime}</span>
          <span className="text-gray-400">|</span>
          <MapPin className="w-3.5 h-3.5 text-[#6c2cf5]" />
          <span className="truncate max-w-[180px] font-semibold text-gray-800">{appointment.location}</span>
        </div>
        <span className="font-bold text-[#6c2cf5] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
          확정됨 (2/2명)
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Safety Tip */}
        <div className="bg-white/70 border border-gray-200/80 rounded-2xl p-3 text-center text-xs text-gray-500 space-y-0.5">
          <p className="font-semibold text-gray-700">🔒 안전한 1:1 동행을 위한 안심 대화방입니다</p>
          <p>시간이나 장소 조정은 상단의 [일정/장소 제안] 기능을 이용해 상호 동의 하에 안전하게 변경하세요.</p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Proposal Card Rendering */}
              {msg.proposal ? (
                <div
                  className={`w-full max-w-[320px] rounded-2xl p-3.5 border shadow-sm text-xs space-y-2.5 ${
                    isMe
                      ? 'bg-purple-50/90 border-purple-200 text-gray-900'
                      : 'bg-white border-[#6c2cf5]/40 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="font-bold text-[#6c2cf5] flex items-center gap-1 text-[11px]">
                      <CalendarClock className="w-3.5 h-3.5" />
                      1:1 조건 변경 제안
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        msg.proposal.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : msg.proposal.status === 'rejected'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {msg.proposal.status === 'accepted'
                        ? '수락 완료'
                        : msg.proposal.status === 'rejected'
                        ? '제안 거절됨'
                        : '수락 대기중'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500">시간:</span>
                      <span className="font-bold text-gray-900">{msg.proposal.newDateTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500">장소:</span>
                      <span className="font-bold text-gray-900">{msg.proposal.newLocation}</span>
                    </div>
                  </div>

                  {msg.proposal.status === 'pending' && !isMe && (
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => handleRejectProposal(msg.id)}
                        className="flex-1 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-600 font-bold text-center"
                      >
                        거절
                      </button>
                      <button
                        onClick={() => handleAcceptProposal(msg.id, msg.proposal!)}
                        className="flex-1 py-1.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white rounded-lg font-bold text-center flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        수락하기
                      </button>
                    </div>
                  )}

                  {msg.proposal.status === 'pending' && isMe && (
                    <p className="text-[10.5px] text-gray-400 text-center pt-1 border-t border-gray-100">
                      상대방이 수락하면 약속 정보가 즉시 변경됩니다.
                    </p>
                  )}

                  {msg.proposal.status === 'accepted' && (
                    <p className="text-[10.5px] text-emerald-600 font-bold text-center pt-1">
                      ✓ 상호 동의로 일정이 변경되었습니다
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-[18px] text-[13.5px] leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#6c2cf5] text-white rounded-tr-xs'
                      : 'bg-white text-gray-900 border border-gray-150 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="flex items-center gap-1 mt-1 text-[10.5px] text-gray-400 px-1">
                <span>{msg.time}</span>
                {isMe && <CheckCheck className="w-3 h-3 text-[#6c2cf5]" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSend}
        className="bg-white p-3 border-t border-gray-200 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setIsProposalModalOpen(true)}
          title="일정/장소 제안하기"
          className="p-2 text-gray-500 hover:text-[#6c2cf5] hover:bg-purple-50 rounded-full transition-colors"
        >
          <CalendarClock className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#6c2cf5] border border-transparent focus:border-[#6c2cf5]"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-[#6c2cf5] text-white flex items-center justify-center hover:bg-[#5820d8] active:scale-95 transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Schedule Change Proposal Modal */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-[380px] rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#6c2cf5] flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">일정 / 장소 변경 제안</h4>
              </div>
              <button
                onClick={() => setIsProposalModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">새로운 날짜 및 시간</label>
                <input
                  type="text"
                  value={proposedDateTime}
                  onChange={(e) => setProposedDateTime(e.target.value)}
                  placeholder="예: 2026.9.12(토) 15:30"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c2cf5]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">새로운 만남 장소</label>
                <input
                  type="text"
                  value={proposedLocation}
                  onChange={(e) => setProposedLocation(e.target.value)}
                  placeholder="예: 강남역 11번 출구 스타벅스"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6c2cf5]"
                  required
                />
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-relaxed">
                제안 카드가 상대방에게 전송되며, 상대방이 [수락] 버튼을 누르면 약속 카드 정보가 즉시 업데이트됩니다.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#6c2cf5] hover:bg-[#5820d8] text-white rounded-xl font-bold shadow-sm shadow-purple-500/20"
                >
                  제안 전송하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

