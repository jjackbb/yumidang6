export interface EventBannerItem {
  id: string;
  badge: string;
  subBadge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag: string;
}

export interface Appointment {
  id: string;
  status: string;
  dDay: string;
  appointmentBadge: string;
  title: string;
  dateTime: string;
  location: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRating: number;
  partnerBio: string;
  menuRecommendation: string;
  addressDetail: string;
  confirmedGuests: number;
  totalGuests: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconBg: string;
  iconColor: string;
  iconType:
    | 'exhibition'
    | 'festival'
    | 'dining'
    | 'sports'
    | 'travel'
    | 'class'
    | 'walk'
    | 'study'
    | 'performance'
    | 'shopping'
    | 'flash'
    | 'all';
}

export interface MeetupPost {
  id: string;
  category: string;
  title: string;
  author: string;
  avatar: string;
  time: string;
  location: string;
  currentMembers: number;
  maxMembers: number;
  tags: string[];
  status: 'recruiting' | 'closed';
  imageUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'matching' | 'event' | 'chat';
}
