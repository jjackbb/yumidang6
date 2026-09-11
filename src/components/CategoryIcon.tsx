import React from 'react';
import { CategoryItem } from '../types';

interface Props {
  type: CategoryItem['iconType'];
}

export const CategoryIcon: React.FC<Props> = ({ type }) => {
  switch (type) {
    case 'exhibition':
      // Palette
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#7c3aed] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <circle cx="13.5" cy="6.5" r=".5" fill="#7c3aed" />
          <circle cx="17.5" cy="10.5" r=".5" fill="#7c3aed" />
          <circle cx="8.5" cy="7.5" r=".5" fill="#7c3aed" />
          <circle cx="6.5" cy="12.5" r=".5" fill="#7c3aed" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.992 6.35 17.52 2 12 2z" />
        </svg>
      );

    case 'festival':
      // Party popper / horn bursting confetti
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#ff385c] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="M5.8 11.3 2 22l10.7-3.79" />
          <path d="M4 3h.01" />
          <path d="M22 8h.01" />
          <path d="M15 2h.01" />
          <path d="M22 20h.01" />
          <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
          <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.66-.75 1.12-1.41.96l-.8-.2" />
          <path d="m11 13 1.9 1.9a6.7 6.7 0 0 0 4.7 2 6.7 6.7 0 0 0 4.7-2l.7-.7" />
          <path d="M11 13 8.3 15.7a3 3 0 0 0 0 4.2l.1.1a3 3 0 0 0 4.2 0L15.3 17.3" />
        </svg>
      );

    case 'dining':
      // Utensils - fork and knife
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#e68a00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="M18 2v20" />
          <path d="M21 2c0 4-3 6-3 6" />
          <path d="M6 2v7a3 3 0 0 0 6 0V2" />
          <path d="M9 12v10" />
        </svg>
      );

    case 'sports':
      // Runner / sports motion
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#0284c7] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <circle cx="15" cy="4" r="2" fill="#0284c7" />
          <path d="m9 20 3-6 4 1 2 5" />
          <path d="m6 16 3-3 2.5 1.5 2-4.5-3-2-4 1" />
          <path d="m15 9 3 2.5" />
        </svg>
      );

    case 'travel':
      // Wheeled suitcase
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#059669] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M9 10v6" />
          <path d="M15 10v6" />
          <circle cx="8" cy="21.5" r="1.5" fill="#059669" />
          <circle cx="16" cy="21.5" r="1.5" fill="#059669" />
        </svg>
      );

    case 'class':
      // Pen / Stylus / Nib
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#6c2cf5] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="m12 19 7-7 3 3-7 7-3-3z" />
          <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18" />
          <path d="m2 2 7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      );

    case 'walk':
      // Cute Paw Print
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ea580c] stroke-none">
          <ellipse cx="6.5" cy="8.5" rx="2" ry="2.5" />
          <ellipse cx="11" cy="6" rx="2" ry="2.5" />
          <ellipse cx="15.5" cy="6" rx="2" ry="2.5" />
          <ellipse cx="20" cy="8.5" rx="2" ry="2.5" />
          <path d="M7 14.5c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4c0 3-2 5.5-5.5 5.5S7 17.5 7 14.5z" />
        </svg>
      );

    case 'study':
      // Book open
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#0284c7] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );

    case 'performance':
      // Ticket / Stage
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#db2777] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <rect width="20" height="15" x="2" y="5" rx="3" />
          <path d="M2 10a2.5 2.5 0 0 1 0 5" />
          <path d="M22 10a2.5 2.5 0 0 0 0 5" />
          <path d="M9 5v2" />
          <path d="M15 5v2" />
          <path d="M8 12h.01" />
          <path d="M12 12h.01" />
          <path d="M16 12h.01" />
        </svg>
      );

    case 'shopping':
      // Shopping Bag
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-[#6c2cf5] stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );

    case 'flash':
      // Lightning bolt
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#d97706] stroke-[#d97706] stroke-linecap-round stroke-linejoin-round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );

    case 'all':
      // 3x3 dots grid
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#4b5563] stroke-none">
          <circle cx="5" cy="5" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
        </svg>
      );

    default:
      return null;
  }
};
