export interface EventBannerItem {
  id: string;
  badge: string;
  subBadge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag: string;
  startsOn: string;
  endsOn: string;
  kind: '팝업' | '전시' | '축제' | '공연';
  description: string;
  sourceType: 'sample' | 'collected';
  sourceUrl?: string;
}

export type CompanionType = 'free' | 'pro';

export interface ProDetails {
  hourlyRate: number; // 시간당 비용 (예: 25000)
  specialty: string; // 전문 분야
  curriculum: string[]; // 커리큘럼 / 활동 순서
  included: string[]; // 포함 내역
  excluded: string[]; // 불포함 내역
  portfolioPhotos?: string[];
}

export interface EscrowPayment {
  id: string;
  appointmentId?: string;
  postId: string;
  postTitle: string;
  hostName: string;
  requesterName: string;
  hourlyRate: number;
  totalHours: number;
  totalAmount: number;
  status: 'held' | 'released' | 'refunded'; // held: 에스크로 예치 중, released: 동행완료 후 정산, refunded: 취소/환불
  paidAt: string;
  paymentMethod: 'kakaopay' | 'tosspay' | 'card';
}

export interface Appointment {
  id: string;
  postId?: string;
  scheduledAt?: string;
  endsAt?: string;
  participantIds?: string[];
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
  companionType?: CompanionType;
  proDetails?: ProDetails;
  escrowPayment?: EscrowPayment;
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
    | 'other';
}

export interface MeetupPost {
  id: string;
  startsAt?: string;
  endsAt?: string;
  description?: string;
  eventId?: string;
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
  companionType?: CompanionType;
  proDetails?: ProDetails;
}

export interface PublicUserProfile {
  id: string;
  displayName: string;
  avatar: string;
  bio: string;
  neighborhood: string;
  ageGroup: string;
  hobbies: string[];
  traits: string[];
  sugarContent: number | null;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  isSample: boolean;
  reviews: { id: string; author: string; rating: number; comment: string }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'matching' | 'event' | 'chat';
  action?: 'match_requests';
  roomId?: string;
}

export interface CurrentUser {
  id: string;
  isLoggedIn: boolean;
  email?: string;
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
  referralCode?: string;
  isProHost?: boolean;
  proSpecialty?: string;
}

export interface JoinRequest {
  id: string;
  hostId: string;
  postId: string;
  postTitle: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterSugar: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'matched_with_other';
  createdAt: string;
}

export interface ChatMember { id: string; displayName: string; avatar: string }
export interface ConversationMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  isSample?: boolean;
  proposal?: ScheduleProposal;
}
export interface ChatRoom {
  id: string;
  requestId?: string;
  appointmentId?: string;
  postId: string;
  postTitle: string;
  members: ChatMember[];
  messages: ConversationMessage[];
  draft: string;
}

export interface ScheduleProposal {
  id: string;
  newDateTime: string;
  startsAt?: string;
  endsAt?: string;
  newLocation: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposerName: string;
}

export interface PraiseBadge {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export interface ReviewItem {
  id: string;
  appointmentId: string;
  appointmentTitle: string;
  reviewerName: string;
  reviewerAvatar: string;
  targetName: string;
  rating: number;
  badges: string[];
  comment: string;
  isBlind: boolean; // 상대방 미제출 시 true (점수/내용 잠김)
  settledAt?: string;
  createdAt: string;
}

export interface SugarHistoryItem {
  id: string;
  delta: number;
  reason: string;
  date: string;
}
