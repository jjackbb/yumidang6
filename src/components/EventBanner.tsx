import React, { useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { EventBannerItem } from '../types';

interface EventBannerProps {
  events: EventBannerItem[];
  onSelectEvent: (event: EventBannerItem) => void;
  onViewAllEvents: () => void;
}

export const EventBanner: React.FC<EventBannerProps> = ({
  events,
  onSelectEvent,
  onViewAllEvents,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentEvent = events[currentIndex] || events[0];

  return (
    <section className="px-5 pt-3 pb-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-[#8b5cf6] fill-[#8b5cf6]/20" />
          <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">
            9월 2주차 주목할 이벤트
          </h2>
        </div>
        <button
          id="btn-view-all-events"
          onClick={onViewAllEvents}
          className="text-[13.5px] text-gray-500 hover:text-gray-900 font-medium flex items-center transition-colors"
        >
          전체보기
          <ChevronRight className="w-4 h-4 ml-0.5 text-gray-400" />
        </button>
      </div>

      {/* Carousel Container with Peek Effect */}
      <div className="relative overflow-hidden">
        <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory py-0.5">
          {events.map((event, idx) => {
            const isMain = idx === currentIndex;
            return (
              <div
                key={event.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  onSelectEvent(event);
                }}
                className={`snap-start relative flex-shrink-0 cursor-pointer rounded-[20px] overflow-hidden shadow-sm transition-all duration-300 ${
                  isMain ? 'w-[calc(100%-24px)]' : 'w-[75%]'
                }`}
                style={{ minHeight: '235px' }}
              >
                {/* Background Image */}
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                {/* Top Badge: "시즌 이벤트" */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-block bg-[#ff5d2b] text-white text-[12px] font-bold px-2.5 py-1 rounded-[8px] shadow-sm">
                    {event.badge}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4.5 z-10 flex flex-col gap-1.5 text-left">
                  {/* Highlight Recommendation */}
                  <div className="flex items-center gap-1 text-[#fde047] text-[12px] font-semibold tracking-tight">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                    <span>{event.subBadge}</span>
                  </div>

                  {/* Main Headline */}
                  <h3 className="text-white text-[18px] font-bold leading-snug drop-shadow-sm">
                    {event.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-white/85 text-[13px] font-normal leading-relaxed">
                    {event.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicator Bars (Identical to screenshot) */}
        <div className="flex items-center justify-center gap-1.5 mt-3.5">
          {events.map((_, idx) => (
            <button
              key={idx}
              id={`carousel-dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`h-[4px] rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-9 bg-[#6c2cf5]'
                  : 'w-12 bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`이벤트 슬라이드 ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
