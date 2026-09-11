import React, { useState } from 'react';
import { Send, MapPin, Clock, CheckCheck, Info } from 'lucide-react';
import { Appointment } from '../types';

interface ChatViewProps {
  appointment: Appointment;
  onOpenDashboard: () => void;
}

interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  time: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ appointment, onOpenDashboard }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'partner',
      text: '안녕하세요! 이번 토요일 르브런치 식사 동행 매칭되어 반갑습니다 :)',
      time: '어제 오후 5:20',
    },
    {
      id: 'm2',
      sender: 'me',
      text: '안녕하세요 조*미님! 반갑습니다. 저도 그곳 프렌치 토스트 꼭 가보고 싶었어요!',
      time: '어제 오후 5:24',
    },
    {
      id: 'm3',
      sender: 'partner',
      text: '제가 2시 예약 미리 메모해 두었어요. 1시 55분쯤 2층 카운터 앞에서 뵐까요?',
      time: '오전 10:12',
    },
    {
      id: 'm4',
      sender: 'me',
      text: '네 좋습니다! 시간 맞춰 도착하겠습니다.',
      time: '오전 10:15',
    },
  ]);

  const [inputVal, setInputVal] = useState('');

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

    // Auto simulated reply from 조*미
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
                식사 동행
              </span>
            </div>
            <p className="text-xs text-gray-500">응답률 98% • 매너온도 4.9</p>
          </div>
        </div>

        <button
          onClick={onOpenDashboard}
          className="text-xs font-bold text-[#6c2cf5] bg-[#f0edff] hover:bg-[#e4dcfa] px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>약속 정보</span>
        </button>
      </div>

      {/* Appointment mini-summary bar */}
      <div className="bg-white/80 backdrop-blur-xs px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#6c2cf5]" />
          <span className="font-semibold text-gray-800">9.12(토) 14:00</span>
          <span className="text-gray-400">|</span>
          <MapPin className="w-3.5 h-3.5 text-[#6c2cf5]" />
          <span className="truncate max-w-[180px]">대치동 르브런치</span>
        </div>
        <span className="font-bold text-[#6c2cf5]">D-1</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Safety Tip */}
        <div className="bg-white/70 border border-gray-200/80 rounded-2xl p-3 text-center text-xs text-gray-500 space-y-0.5">
          <p className="font-semibold text-gray-700">🔒 안전한 동행을 위한 안심 대화방입니다</p>
          <p>개인 연락처나 계좌번호 공유 대신 유미당 채팅을 이용해주세요.</p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-[18px] text-[13.5px] leading-relaxed shadow-2xs ${
                  isMe
                    ? 'bg-[#6c2cf5] text-white rounded-tr-xs'
                    : 'bg-white text-gray-900 border border-gray-150 rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>
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
    </div>
  );
};
