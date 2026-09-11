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
  authorId?: string;
  avatar: string;
  time: string;
  location: string;
  publicLocation?: string;
  secretLocation?: string;
  partnerPreferences?: string;
  currentMembers: number;
  maxMembers: number;
  tags: string[];
  status: 'recruiting' | 'closed' | 'expired';
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

export interface CurrentUser {
  id: string;
  isLoggedIn: boolean;
  phone: string;
  realName: string;
  maskedName: string;
  nickname: string;
  gender: 'female' | 'male' | 'undisclosed';
  ageGroup: string;
  neighborhood: string;
  sugarContent: number; // 당도 (기본 50.0)
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  avatar: string;
  bio: string;
  joinedAt: string;
}

export interface JoinRequest {
  id: string;
  postId: string;
  postTitle: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterSugar: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ScheduleProposal {
  id: string;
  newDateTime: string;
  newLocation: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposerName: string;
}


