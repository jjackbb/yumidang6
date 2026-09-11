import React from 'react';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onOpenDashboard: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onOpenDashboard,
}) => {
  return (
    <section className="px-5 py-2">
      <div
        id="card-current-appointment"
        className="bg-white border border-[#e3dbfc] rounded-[22px] p-5 shadow-[0_2px_12px_rgba(108,44,245,0.04)] transition-all hover:border-[#cfbffb]"
      >
        {/* Top Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Matching status pill */}
            <div className="flex items-center gap-1.5 bg-[#f0edff] px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-[12px] font-bold text-[#6c2cf5]">
                {appointment.status}
              </span>
            </div>

            {/* D-Day & Time */}
            <span className="font-bold text-[15px] text-gray-900 tracking-tight">
              {appointment.dDay}
            </span>
          </div>

          {/* D-Day badge on right */}
          <div className="border border-[#c6b6f9] bg-white text-[#6c2cf5] text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
            {appointment.appointmentBadge}
          </div>
        </div>

        {/* Appointment Title */}
        <h3 className="font-bold text-[17px] text-gray-900 mt-3.5 mb-2.5 leading-snug">
          {appointment.title}
        </h3>

        {/* Details: Date & Location */}
        <div className="space-y-1.5 text-[13.5px] text-gray-600 font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8b5cf6] flex-shrink-0" />
            <span>{appointment.dateTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8b5cf6] flex-shrink-0" />
            <span>{appointment.location}</span>
          </div>
        </div>

        {/* Subtle Lavender Divider */}
        <div className="border-t border-[#f0ebff] my-3.5" />

        {/* Bottom CTA to Dashboard */}
        <div className="flex justify-end">
          <button
            id="btn-open-dashboard"
            onClick={() => onOpenDashboard(appointment)}
            className="flex items-center text-[#6c2cf5] hover:text-[#561fe0] text-[14px] font-semibold group cursor-pointer transition-colors"
          >
            <span>참여 대시보드 바로가기</span>
            <ChevronRight className="w-4 h-4 ml-0.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
