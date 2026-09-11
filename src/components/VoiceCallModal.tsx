import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import { Appointment } from '../types';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Call connection simulation
  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
      setDuration(0);
      setIsMuted(false);
      setIsSpeaker(false);
      return;
    }

    // Connect after 2.5 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, [isOpen]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, callStatus]);

  if (!isOpen || !appointment) return null;

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className="bg-gradient-to-b from-gray-900 to-[#1e1338] text-white w-full max-w-[360px] rounded-[36px] p-6 shadow-2xl flex flex-col items-center justify-between min-h-[500px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 rounded-full text-[11px] font-bold text-purple-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>안심 번호 보호 1:1 음성 통화</span>
        </div>

        {/* Partner Profile & Status */}
        <div className="flex flex-col items-center text-center space-y-3 my-auto">
          <div className="relative">
            {/* Animated Ring when Calling */}
            {callStatus === 'calling' && (
              <div className="absolute -inset-3 rounded-full bg-[#6c2cf5]/30 animate-ping opacity-75" />
            )}
            <img
              src={appointment.partnerAvatar}
              alt={appointment.partnerName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/30 shadow-2xl relative z-10"
            />
          </div>

          <div>
            <h3 className="text-xl font-extrabold tracking-tight">{appointment.partnerName}</h3>
            <p className="text-xs text-purple-300/80 mt-0.5">당도 99 🍯 • 1:1 동행 파트너</p>
          </div>

          <div className="pt-2">
            {callStatus === 'calling' && (
              <div className="text-sm font-semibold text-purple-200 animate-pulse flex items-center gap-1.5 justify-center">
                <span>안심 회선 연결 중...</span>
              </div>
            )}
            {callStatus === 'connected' && (
              <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{formatDuration(duration)}</span>
              </div>
            )}
            {callStatus === 'ended' && (
              <div className="text-sm font-semibold text-gray-400">통화가 종료되었습니다</div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full space-y-6">
          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Mute Toggle */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`p-3.5 rounded-full transition-all ${
                isMuted
                  ? 'bg-red-500/40 text-red-300'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="음소거"
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => setIsSpeaker((prev) => !prev)}
              className={`p-3.5 rounded-full transition-all ${
                isSpeaker
                  ? 'bg-purple-500/40 text-purple-200'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="스피커폰"
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* End Call Button */}
          <div className="flex justify-center">
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all"
              title="통화 종료"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>

          <p className="text-[10.5px] text-gray-400 text-center">
            개인 휴대전화 번호는 상대방에게 전혀 노출되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
