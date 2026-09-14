/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { maskRealName } from './utils/maskName';
import { trackBackEvent } from './utils/trackBackEvent';
import { trackFunnelEvent } from './utils/trackFunnelEvent';
import { Header } from './components/Header';
import { EventBanner } from './components/EventBanner';
import { AppointmentReminders } from './components/AppointmentReminders';
import { EventsView } from './components/EventsView';
import { RequestTab } from './components/CompanionRequests';
import { sampleEventsForMonth } from './data/events';
import { DEMO_USER_ID } from './data/demoIdentity';
import { appointmentStart, koreaDateParts } from './utils/calendar';
import { completionAvailability, formatMeetupRange, isValidMeetupRange } from './utils/meetupLifecycle';
import { CategoryGrid } from './components/CategoryGrid';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardModal } from './components/DashboardModal';
import { EventDetailModal } from './components/EventDetailModal';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { CreateMeetupModal } from './components/CreateMeetupModal';

import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { KycAuthModal } from './components/KycAuthModal';
import { PostDetailModal } from './components/PostDetailModal';
import { JoinRequestModal } from './components/JoinRequestModal';
import { SafetyRulesModal } from './components/SafetyRulesModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { ReportModal } from './components/ReportModal';
import { ReviewModal } from './components/ReviewModal';
import { EscrowPaymentModal } from './components/EscrowPaymentModal';
import { ExploreView } from './components/ExploreView';
import { ChatView } from './components/ChatView';
import { ChatListView } from './components/ChatListView';
import { UserProfileModal } from './components/UserProfileModal';
import { publicProfileForMember } from './data/publicProfiles';
import { CancellationDialog, LifecycleConfirmDialog, ScheduleConflictDialog } from './components/LifecycleDialogs';
import { cancelAppointment as cancelConfirmedAppointment, closePost, conditionsOf, confirmChangedConditions, expirePosts, isConfirmedAppointment, isOpenRequest, isRecruiting, overlappingAppointments, recruitmentDeadline, updateRecruitingPost, type LifecycleState } from './utils/postLifecycle';
import { acceptRequest, createRequestRoom, requestRoomId, roomAccess } from './utils/conversations';
import { MyPageView } from './components/MyPageView';

import {
  mockAppointments,
  mockCategories,
  mockMeetupPosts,
  mockNotifications,
} from './data/mockData';
import { Appointment, CategoryItem, EventBannerItem, MeetupPost, CurrentUser, JoinRequest, ReviewItem, EscrowPayment, NotificationItem, ChatRoom, PublicUserProfile, ScheduleProposal } from './types';

type ConflictAction =
  | { kind: 'join'; postId: string; message: string }
  | { kind: 'accept'; requestId: string; simulateHost: boolean }
  | { kind: 'proposal'; roomId: string; messageId: string; accepted: boolean; sample: boolean }
  | { kind: 'create'; post: MeetupPost };

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // User Auth state (Supabase Auth 연동)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // 1. 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const name = meta.realName || '유미당 회원';
        const masked = meta.maskedName || maskRealName(name);
        setCurrentUser({
          id: session.user.id,
          isLoggedIn: true,
          email: session.user.email,
          phone: session.user.phone || '010-0000-0000',
          realName: name,
          maskedName: masked,
          nickname: masked,
          gender: meta.gender || 'female',
          ageGroup: meta.ageGroup || '20대',
          neighborhood: meta.neighborhood || '서울 강남구 역삼동',
          sugarContent: 50,
          isPhoneVerified: false,
          isKycVerified: false,
          avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: meta.bio || '유미당과 함께하는 따뜻한 동행입니다.',
          joinedAt: '2026.09',
        });
      }
    });

    // 2. Auth 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const name = meta.realName || '유미당 회원';
        const masked = meta.maskedName || maskRealName(name);
        setCurrentUser({
          id: session.user.id,
          isLoggedIn: true,
          email: session.user.email,
          phone: session.user.phone || '010-0000-0000',
          realName: name,
          maskedName: masked,
          nickname: masked,
          gender: meta.gender || 'female',
          ageGroup: meta.ageGroup || '20대',
          neighborhood: meta.neighborhood || '서울 강남구 역삼동',
          sugarContent: 50,
          isPhoneVerified: false,
          isKycVerified: false,
          avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: meta.bio || '유미당과 함께하는 따뜻한 동행입니다.',
          joinedAt: '2026.09',
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Modal states
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventBannerItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Phase 2: Post Detail & Editing states
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<MeetupPost | null>(null);
  const [editingPost, setEditingPost] = useState<MeetupPost | null>(null);

  // Phase 3: 1:1 Matching Requests & Modals
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [selectedPostForJoin, setSelectedPostForJoin] = useState<MeetupPost | null>(null);
  const [requestTab, setRequestTab] = useState<RequestTab>('sent');
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const today = koreaDateParts(now);
  const eventBanners = sampleEventsForMonth(today.year, today.month);

  // Phase 4: Safety, Voice Call & Emergency Report states
  const [isSafetyRulesOpen, setIsSafetyRulesOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Phase 5: Mutual Blind Review & Sugar Settling states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, { rating: number; badges: string[]; comment: string }>>({});
  const submissionLocks = useRef(new Set<string>());
  const settlementLocks = useRef(new Set<string>());

  // UI 뒤로가기/닫기 이벤트 및 체류시간 실시간 추적 (Supabase 정규화 테이블 ui_back_events)
  const modalOpenTimes = useRef<Record<string, number>>({});

  useEffect(() => {
    if (selectedPostForDetail) {
      modalOpenTimes.current['POST_DETAIL'] = Date.now();
      trackFunnelEvent({
        step: 'POST_DETAIL_VIEW',
        targetPostId: selectedPostForDetail.id,
        pageKey: 'POST_DETAIL',
      });
    } else if (modalOpenTimes.current['POST_DETAIL']) {
      const durationMs = Date.now() - modalOpenTimes.current['POST_DETAIL'];
      delete modalOpenTimes.current['POST_DETAIL'];
      trackBackEvent({ pageKey: 'POST_DETAIL', actionType: 'close', durationMs });
    }
  }, [selectedPostForDetail]);

  useEffect(() => {
    if (selectedCategory) {
      modalOpenTimes.current['CATEGORY_DETAIL'] = Date.now();
    } else if (modalOpenTimes.current['CATEGORY_DETAIL']) {
      const durationMs = Date.now() - modalOpenTimes.current['CATEGORY_DETAIL'];
      delete modalOpenTimes.current['CATEGORY_DETAIL'];
      trackBackEvent({ pageKey: 'CATEGORY_DETAIL', actionType: 'close', durationMs });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedEvent) {
      modalOpenTimes.current['EVENT_DETAIL'] = Date.now();
    } else if (modalOpenTimes.current['EVENT_DETAIL']) {
      const durationMs = Date.now() - modalOpenTimes.current['EVENT_DETAIL'];
      delete modalOpenTimes.current['EVENT_DETAIL'];
      trackBackEvent({ pageKey: 'EVENT_DETAIL', actionType: 'close', durationMs });
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (isCreateModalOpen) {
      modalOpenTimes.current['CREATE_MEETUP'] = Date.now();
    } else if (modalOpenTimes.current['CREATE_MEETUP']) {
      const durationMs = Date.now() - modalOpenTimes.current['CREATE_MEETUP'];
      delete modalOpenTimes.current['CREATE_MEETUP'];
      trackBackEvent({ pageKey: 'CREATE_MEETUP', actionType: 'close', durationMs });
    }
  }, [isCreateModalOpen]);

  useEffect(() => {
    if (isAuthModalOpen) {
      modalOpenTimes.current['AUTH'] = Date.now();
    } else if (modalOpenTimes.current['AUTH']) {
      const durationMs = Date.now() - modalOpenTimes.current['AUTH'];
      delete modalOpenTimes.current['AUTH'];
      trackBackEvent({ pageKey: 'AUTH', actionType: 'close', durationMs });
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (isDashboardOpen) {
      modalOpenTimes.current['DASHBOARD'] = Date.now();
    } else if (modalOpenTimes.current['DASHBOARD']) {
      const durationMs = Date.now() - modalOpenTimes.current['DASHBOARD'];
      delete modalOpenTimes.current['DASHBOARD'];
      trackBackEvent({ pageKey: 'DASHBOARD', actionType: 'close', durationMs });
    }
  }, [isDashboardOpen]);

  useEffect(() => {
    if (isJoinRequestModalOpen) {
      modalOpenTimes.current['JOIN_REQUEST'] = Date.now();
    } else if (modalOpenTimes.current['JOIN_REQUEST']) {
      const durationMs = Date.now() - modalOpenTimes.current['JOIN_REQUEST'];
      delete modalOpenTimes.current['JOIN_REQUEST'];
      trackBackEvent({ pageKey: 'JOIN_REQUEST', actionType: 'close', durationMs });
    }
  }, [isJoinRequestModalOpen]);

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-sample-1',
      appointmentId: 'apt-sample-1',
      appointmentTitle: '삼청동 한옥 카페 디저트 투어 1:1 동행',
      reviewerName: '이*진',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
      targetName: '나',
      rating: 5,
      badges: ['시간 약속을 칼같이 지켜요', '대화가 편안하고 즐거워요'],
      comment: '처음 해보는 1:1 디저트 투어였는데 너무 친절하게 대해주셔서 어색함 전혀 없이 즐겁게 다녀왔습니다!',
      isBlind: false,
      createdAt: '3일 전',
    },
    {
      id: 'rev-sample-2',
      appointmentId: 'apt-sample-2',
      appointmentTitle: '주말 성수동 서울숲 산책 1:1 동행',
      reviewerName: '박*민',
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      targetName: '나',
      rating: 5,
      badges: ['친절하고 배려심이 넘쳐요', '시간 약속을 칼같이 지켜요'],
      comment: '매너가 정말 좋으세요. 시간 약속도 칼같이 지켜주셔서 덕분에 기분 좋은 하루였습니다.',
      isBlind: false,
      createdAt: '1주일 전',
    },
  ]);

  // Phase 6: Pro Paid Companion & Escrow States
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [selectedProPostForEscrow, setSelectedProPostForEscrow] = useState<MeetupPost | null>(null);
  const [escrowPayments] = useState<EscrowPayment[]>([
    {
      id: 'escrow-init-1',
      postId: 'post-6',
      postTitle: '[PRO] 성수동 감성 골목 인생샷 스냅 촬영 1:1 동행 📸',
      hostName: '박*준 (포토그래퍼)',
      requesterName: '조*미',
      hourlyRate: 30000,
      totalHours: 2,
      totalAmount: 60000,
      status: 'held',
      paidAt: '어제',
      paymentMethod: 'kakaopay',
    },
  ]);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: 'req-init-1',
      postId: 'post-demo-host',
      hostId: DEMO_USER_ID,
      postTitle: '성수동 디저트 오마카세 같이 가실 분',
      requesterId: 'user-req-1',
      requesterName: '김*수',
      requesterAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      requesterSugar: 78,
      message: '안녕하세요! 디저트 카페 투어 정말 좋아하는데 혼자 가기 아쉬웠어요. 약속 시간 잘 지키겠습니다 :)',
      status: 'pending',
      createdAt: '10분 전',
    },
    {
      id: 'req-init-2',
      postId: 'post-demo-host',
      hostId: DEMO_USER_ID,
      postTitle: '성수동 디저트 오마카세 같이 가실 분',
      requesterId: 'user-req-2',
      requesterName: '이*은',
      requesterAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      requesterSugar: 85,
      message: '성수동 거주 중인 30대입니다. 매너 있게 좋은 대화 나누며 달콤한 시간 보내요!',
      status: 'pending',
      createdAt: '30분 전',
    },
    {
      id: 'req-sent-demo', postId: 'post-exhibition-open', hostId: 'user-seojin', postTitle: '주말 사진전 함께 보고 감상 나눠요',
      requesterId: DEMO_USER_ID, requesterName: '조*미', requesterAvatar: mockAppointments[0].partnerAvatar,
      requesterSugar: 50, message: '사진전을 천천히 보고 감상을 나누고 싶어요!', status: 'pending', createdAt: '1시간 전',
    },
  ]);

  // App data states
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [activeAppointmentId, setActiveAppointmentId] = useState(mockAppointments[0].id);
  const appointment = appointments.find(item => item.id === activeAppointmentId) || appointments[0];
  const reviewAppointment = appointments.find(item => item.id === reviewAppointmentId) || appointment;
  const reviewKey = (id: string) => `${currentUser?.id}:${id}`;
  useEffect(() => {
    const delay = Math.min(...appointments.map(item => Date.parse(item.endsAt || '') - Date.now()).filter(value => value > 0));
    if (!Number.isFinite(delay)) return;
    const timer = setTimeout(() => setNow(new Date()), Math.min(delay, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [appointments, now]);
  const setAppointment = (next: Appointment | ((previous: Appointment) => Appointment)) => {
    if (typeof next === 'function') {
      setAppointments(previous => previous.map(item => item.id === activeAppointmentId ? next(item) : item));
    } else {
      setAppointments(previous => [next, ...previous.filter(item => item.id !== next.id)]);
      setActiveAppointmentId(next.id);
    }
  };
  const openAppointment = (item: Appointment) => {
    setActiveAppointmentId(item.id);
    setIsDashboardOpen(true);
  };
  const [meetupPosts, setMeetupPosts] = useState<MeetupPost[]>(() =>
    mockMeetupPosts.map((p) => ({
      ...p,
      maxMembers: 2, recruitmentEndsAt: p.recruitmentEndsAt || p.startsAt,
      closedReason: mockAppointments.some(item => item.postId === p.id) ? 'matched' : p.closedReason,
      status: mockAppointments.some(item => item.postId === p.id) ? 'closed' : p.status,
      currentMembers: p.status === 'closed' || mockAppointments.some(item => item.postId === p.id) ? 2 : 1,
    }))
  );
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => [
    ...joinRequests.flatMap(request => { const post = meetupPosts.find(item => item.id === request.postId); return post ? [createRequestRoom(request, post)] : []; }),
    ...mockAppointments.map(item => {
      const post = meetupPosts.find(post => post.id === item.postId);
      const partnerId = item.participantIds?.find(id => id !== DEMO_USER_ID) || `partner-${item.id}`;
      return { id: `room-${item.id}`, appointmentId: item.id, postId: item.postId || '', postTitle: post?.title || item.title, draft: '',
        members: [{ id: DEMO_USER_ID, displayName: '조*미', avatar: mockAppointments[0].partnerAvatar }, { id: partnerId, displayName: post?.author || item.partnerName, avatar: post?.avatar || item.partnerAvatar }],
        messages: [{ id: `system-${item.id}`, senderId: 'system', text: `확정된 동행입니다. ${post?.title || item.title}의 일정과 장소를 여기서 확인해요.`, createdAt: new Date().toISOString(), isSample: true }],
      };
    }),
  ]);
  const [postAction, setPostAction] = useState<{ id: string; mode: 'closed' | 'deleted' } | null>(null);
  const [cancellationTarget, setCancellationTarget] = useState<{ id: string; kind: 'request' | 'appointment'; title: string } | null>(null);
  const [conflictPrompt, setConflictPrompt] = useState<{ conflicts: Appointment[]; action: ConflictAction } | null>(null);
  const [lifecycleNotice, setLifecycleNotice] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [selectedChatProfile, setSelectedChatProfile] = useState<PublicUserProfile | null>(null);
  const matchingLocks = useRef(new Set<string>());
  const proposalLocks = useRef(new Set<string>());
  const activeRoom = chatRooms.find(room => room.id === activeRoomId && room.members.some(member => member.id === currentUser?.id));
  const activeRoomRequest = joinRequests.find(request => request.id === activeRoom?.requestId);
  const activeRoomPost = meetupPosts.find(post => post.id === activeRoom?.postId);
  const activeRoomAppointment = appointments.find(item => item.id === activeRoom?.appointmentId);
  const activePartner = activeRoom?.members.find(member => member.id !== currentUser?.id);
  const myAppointments = appointments.filter(item => currentUser && item.participantIds?.includes(currentUser.id));
  const openRoom = (room: ChatRoom) => {
    if (!roomAccess(room, currentUser?.id, joinRequests, appointments, meetupPosts).canView) return;
    setActiveRoomId(room.id);
    if (room.appointmentId) setActiveAppointmentId(room.appointmentId);
    setActiveTab('chat');
    setNotifications(prev => prev.map(item => item.roomId === room.id ? { ...item, read: true } : item));
  };
  const openRequestRoom = (id: string) => {
    const room = chatRooms.find(room => room.requestId === id);
    if (room) openRoom(room);
  };
  const openRequestProfile = (id: string) => {
    const room = chatRooms.find(room => room.requestId === id);
    if (!room || !roomAccess(room, currentUser?.id, joinRequests, appointments, meetupPosts).canView) return;
    const member = room.members.find(member => member.id !== currentUser?.id);
    if (member) setSelectedChatProfile(publicProfileForMember(member, currentUser));
  };
  const updateRoomDraft = (id: string, draft: string) => setChatRooms(prev => prev.map(room => room.id === id && room.members.some(member => member.id === currentUser?.id) ? { ...room, draft } : room));
  const sendRoomMessage = (id: string, text: string, sample = false) => {
    const room = chatRooms.find(room => room.id === id);
    if (!room || !text.trim() || !roomAccess(room, currentUser?.id, joinRequests, appointments, meetupPosts).canSend || (sample && currentUser?.id !== DEMO_USER_ID)) return;
    const senderId = sample ? room.members.find(member => member.id !== currentUser!.id)!.id : currentUser!.id;
    const message = { id: crypto.randomUUID(), senderId, text: text.trim(), createdAt: new Date().toISOString(), isSample: sample };
    setChatRooms(prev => prev.map(item => item.id === id ? { ...item, draft: sample ? item.draft : '', messages: [...item.messages, message] } : item));
    if (sample) setNotifications(prev => [{ id: `notif-${message.id}`, title: '새 동행 메시지 · 시연', description: text, roomId: id, type: 'chat', time: '방금', read: false }, ...prev]);
  };
  const proposeRoomSchedule = (id: string, proposal: ScheduleProposal) => {
    const room = chatRooms.find(room => room.id === id);
    const target = appointments.find(item => item.id === room?.appointmentId);
    if (!room || !target || target.status === '동행 완료' || !roomAccess(room, currentUser?.id, joinRequests, appointments, meetupPosts).canSend || !isValidMeetupRange(proposal.startsAt, proposal.endsAt)) return;
    if (room.messages.some(item => item.proposal?.status === 'pending')) { alert('먼저 보낸 일정 변경 제안의 응답을 기다려 주세요.'); return; }
    setChatRooms(prev => prev.map(item => item.id === id ? { ...item, messages: [...item.messages, { id: crypto.randomUUID(), senderId: currentUser!.id, text: '일정·장소 변경을 제안했어요.', createdAt: new Date().toISOString(), proposal }] } : item));
  };
  const resolveRoomProposal = (roomId: string, messageId: string, accepted: boolean, sample = false, ignoreConflict = false) => {
    const room = chatRooms.find(item => item.id === roomId);
    const message = room?.messages.find(item => item.id === messageId);
    const proposal = message?.proposal;
    const target = appointments.find(item => item.id === room?.appointmentId);
    if (!room || !target || target.status === '동행 완료' || !proposal || proposal.status !== 'pending' || proposalLocks.current.has(messageId) || !roomAccess(room, currentUser?.id, joinRequests, appointments, meetupPosts).canSend) return;
    if (sample ? currentUser?.id !== DEMO_USER_ID : message.senderId === currentUser?.id) return;
    if (accepted && !isValidMeetupRange(proposal.startsAt, proposal.endsAt)) return;
    if (accepted && !ignoreConflict && warnConflict({ kind: 'proposal', roomId, messageId, accepted, sample }, target.participantIds || [], proposal.startsAt, proposal.endsAt, target.id)) return;
    proposalLocks.current.add(messageId);
    if (accepted) {
      setAppointments(prev => prev.map(item => item.id === target.id ? { ...item, scheduledAt: proposal.startsAt, endsAt: proposal.endsAt, dateTime: proposal.newDateTime, location: proposal.newLocation, addressDetail: proposal.newLocation } : item));
      setMeetupPosts(prev => prev.map(item => item.id === target.postId ? { ...item, startsAt: proposal.startsAt, endsAt: proposal.endsAt, time: proposal.newDateTime, secretLocation: proposal.newLocation } : item));
    }
    setChatRooms(prev => prev.map(item => item.id === roomId ? { ...item, messages: [...item.messages.map(value => value.id === messageId ? { ...value, proposal: { ...proposal, status: accepted ? 'accepted' as const : 'rejected' as const } } : value), { id: crypto.randomUUID(), senderId: 'system', text: accepted ? '일정 변경이 수락됐어요. 새 약속을 확인해 주세요.' : '일정 변경이 거절됐어요. 기존 약속을 유지합니다.', createdAt: new Date().toISOString(), isSample: sample }] } : item));
    setNotifications(prev => [{ id: `notif-${crypto.randomUUID()}`, title: accepted ? '약속 변경 완료' : '약속 변경 거절', description: accepted ? proposal.newDateTime : '기존 일정이 유지됩니다.', type: 'matching', roomId, time: '방금', read: false }, ...prev]);
  };
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [
    ...joinRequests.filter(request => request.hostId === DEMO_USER_ID).map((request): NotificationItem => ({
      id: `notif-${request.id}`,
      title: `${request.requesterName}님이 동행을 신청했어요`,
      description: `"${request.postTitle}" 공고의 신청 내용을 확인해 보세요.`,
      time: request.createdAt,
      read: false,
      type: 'matching',
      action: 'match_requests', roomId: requestRoomId(request.id),
    })),
    ...mockNotifications,
  ]);

  const lifecycleState = (): LifecycleState => ({ posts: meetupPosts, requests: joinRequests, rooms: chatRooms, appointments, notifications });
  const applyLifecycle = (next: LifecycleState | null) => {
    if (!next) { setLifecycleNotice('현재 상태에서 처리할 수 없어요. 최신 공고와 신청 상태를 확인해 주세요.'); return false; }
    setMeetupPosts(next.posts); setJoinRequests(next.requests); setChatRooms(next.rooms); setAppointments(next.appointments); setNotifications(next.notifications);
    return true;
  };
  useEffect(() => {
    const next = expirePosts(lifecycleState(), now);
    if (next) applyLifecycle(next);
    const delay = Math.min(...meetupPosts.filter(post => post.status === 'recruiting').map(post => Date.parse(recruitmentDeadline(post) || '') - Date.now()).filter(ms => ms > 0));
    if (!Number.isFinite(delay)) return;
    const timer = setTimeout(() => setNow(new Date()), Math.min(delay, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [meetupPosts, now]);
  useEffect(() => {
    setSelectedPostForDetail(previous => previous ? meetupPosts.find(post => post.id === previous.id) || null : null);
  }, [meetupPosts]);
  const activeMeetupPosts = meetupPosts.filter(post => post.status !== 'deleted');
  const warnConflict = (action: ConflictAction, participants: string[], startsAt?: string, endsAt?: string, excludeId?: string) => {
    const conflicts = overlappingAppointments(appointments, participants, startsAt, endsAt, excludeId);
    if (!conflicts.length) return false;
    setConflictPrompt({ conflicts, action }); return true;
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpenCreateMeetup = () => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingPost(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateMeetup = (newPost: MeetupPost, ignoreConflict = false) => {
    if (!currentUser || newPost.authorId !== currentUser.id || !isRecruiting(newPost)) return false;
    if (!ignoreConflict && warnConflict({ kind: 'create', post: newPost }, [currentUser.id], newPost.startsAt, newPost.endsAt)) return false;
    setMeetupPosts((prev) => [newPost, ...prev]);
    trackFunnelEvent({
      step: 'CREATE_MEETUP_SUBMIT',
      targetPostId: newPost.id,
      pageKey: 'CREATE_MEETUP',
      metadata: { category: newPost.category, title: newPost.title },
    });
    // Also add notification
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '새로운 1:1 동행이 등록되었습니다',
        description: `[${newPost.category}] "${newPost.title}" 모집이 시작되었습니다.`,
        time: '방금',
        read: false,
        type: 'event',
      },
      ...prev,
    ]);
    setIsCreateModalOpen(false);
    return true;
  };

  const handleUpdatePost = (updatedPost: MeetupPost) => {
    if (!applyLifecycle(updateRecruitingPost(lifecycleState(), updatedPost, currentUser?.id))) return false;
    setSelectedPostForDetail(updatedPost); setEditingPost(null);
    return true;
  };
  const handleClosePost = (postId: string) => setPostAction({ id: postId, mode: 'closed' });
  const handleDeletePost = (postId: string) => setPostAction({ id: postId, mode: 'deleted' });
  const confirmPostAction = () => {
    if (!postAction) return;
    const succeeded = applyLifecycle(closePost(lifecycleState(), postAction.id, postAction.mode, currentUser?.id));
    if (succeeded) setLifecycleNotice(postAction.mode === 'deleted' ? '공고를 삭제했어요. 이전 신청과 대화 기록은 남아 있어요.' : '모집을 마감했어요. 미확정 신청도 함께 종료됐어요.');
    setPostAction(null);
  };
  const handleEditPost = (post: MeetupPost) => {
    if (post.authorId !== currentUser?.id || !isRecruiting(post)) { setLifecycleNotice('모집 중인 본인 공고만 수정할 수 있어요. 확정 약속은 대화방에서 변경을 제안해 주세요.'); return; }
    setEditingPost(post); setSelectedPostForDetail(null); setIsCreateModalOpen(true);
  };
  const handleReconfirm = (requestId: string, revision: number, agree: boolean, simulate = false) => {
    const request = joinRequests.find(item => item.id === requestId);
    if (!request || !currentUser || (simulate && (currentUser.id !== DEMO_USER_ID || request.hostId !== currentUser.id))) return;
    applyLifecycle(confirmChangedConditions(lifecycleState(), requestId, revision, agree, simulate ? request.requesterId : currentUser.id));
  };
  const simulatePostChange = (requestId: string) => {
    const request = joinRequests.find(item => item.id === requestId);
    const post = meetupPosts.find(item => item.id === request?.postId);
    if (currentUser?.id !== DEMO_USER_ID || request?.requesterId !== currentUser.id || !request || !isOpenRequest(request) || !post || !isRecruiting(post)) return;
    const startsAt = new Date(Date.parse(post.startsAt!) + 3600000).toISOString();
    const endsAt = new Date(Date.parse(post.endsAt!) + 3600000).toISOString();
    applyLifecycle(updateRecruitingPost(lifecycleState(), { ...post, startsAt, endsAt, time: formatMeetupRange(startsAt, endsAt), publicLocation: '변경된 공개 만남 장소 · 시연' }, post.authorId));
  };

  // Phase 3: Initiate 1:1 Join Request Modal
  const handleStartJoinRequest = (post: MeetupPost) => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.id === post.authorId) {
      alert('본인이 작성한 동행 공고에는 참여 신청할 수 없습니다.');
      return;
    }
    if (!isRecruiting(post) || post.currentMembers >= 2) {
      alert('이미 1:1 매칭이 마감된(2/2명) 공고입니다.');
      return;
    }

    trackFunnelEvent({
      step: 'JOIN_REQUEST_OPEN',
      targetPostId: post.id,
      pageKey: 'JOIN_REQUEST',
    });

    setSelectedPostForJoin(post);
    setSelectedPostForDetail(null);
    setSelectedEvent(null);
    setSelectedCategory(null);
    setIsJoinRequestModalOpen(true);
  };

  // Phase 3: Submit Join Request
  const handleSendJoinRequest = (postId: string, message: string, ignoreConflict = false) => {
    const post = activeMeetupPosts.find((p) => p.id === postId);
    if (!post || !post.authorId || !currentUser || post.authorId === currentUser.id || !isRecruiting(post) || !message.trim()) return false;
    if (joinRequests.some(request => request.postId === post.id && request.requesterId === currentUser.id && ['pending', 'reconfirming', 'accepted'].includes(request.status))) {
      alert('이미 신청한 동행이에요. Me에서 신청 상태를 확인해 주세요.');
      return false;
    }

    if (!ignoreConflict && warnConflict({ kind: 'join', postId, message }, [currentUser.id], post.startsAt, post.endsAt)) return false;

    trackFunnelEvent({
      step: 'JOIN_REQUEST_SUBMIT',
      targetPostId: post.id,
      pageKey: 'JOIN_REQUEST',
      metadata: { messageLength: message.length },
    });

    const newReq: JoinRequest = {
      id: `req-${crypto.randomUUID()}`,
      hostId: post.authorId || '',
      postId: post.id,
      postTitle: post.title,
      requesterId: currentUser.id,
      requesterName: currentUser.maskedName,
      requesterAvatar: currentUser.avatar,
      requesterSugar: currentUser.sugarContent,
      message,
      status: 'pending', conditionSnapshot: conditionsOf(post),
      createdAt: '방금',
    };

    const room = createRequestRoom(newReq, post);
    setJoinRequests((prev) => [newReq, ...prev]);
    setChatRooms(prev => [room, ...prev]);
    setActiveRoomId(room.id);
    setActiveTab('chat');

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '1:1 동행 참여 신청 완료', roomId: room.id,
        description: `"${post.title}" 공고에 신청했어요. 지금부터 대화할 수 있고, 작성자가 수락하면 확정됩니다.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);

    setIsJoinRequestModalOpen(false); setSelectedPostForJoin(null);
    return true;
  };

  // A request enables conversation; only the host's final acceptance confirms a match.
  const handleAcceptRequest = (requestId: string, simulateHost = false, ignoreConflict = false) => {
    const targetReq = joinRequests.find(item => item.id === requestId);
    if (!targetReq || !currentUser) return;
    if (simulateHost && (currentUser.id !== DEMO_USER_ID || targetReq.requesterId !== currentUser.id)) return;
    const targetPost = meetupPosts.find(item => item.id === targetReq.postId);
    const nextRequests = acceptRequest(joinRequests, targetPost, requestId, simulateHost ? targetReq.hostId : currentUser.id);
    if (!nextRequests || !targetPost || matchingLocks.current.has(targetReq.postId)) return;
    if (!ignoreConflict && warnConflict({ kind: 'accept', requestId, simulateHost }, [targetReq.hostId, targetReq.requesterId], targetPost.startsAt, targetPost.endsAt)) return;
    matchingLocks.current.add(targetReq.postId);
    const roomId = requestRoomId(requestId), appointmentId = `apt-${requestId}`;
    const partner = currentUser.id === targetReq.hostId
      ? { name: targetReq.requesterName, avatar: targetReq.requesterAvatar, bio: targetReq.message }
      : { name: targetPost.author, avatar: targetPost.avatar, bio: '' };
    setJoinRequests(nextRequests);
    setMeetupPosts(prev => prev.map(item => item.id === targetReq.postId ? { ...item, status: 'closed', closedReason: 'matched', currentMembers: 2 } : item));
    setAppointment({ id: appointmentId, postId: targetPost.id, scheduledAt: targetPost.startsAt, endsAt: targetPost.endsAt,
      participantIds: [targetReq.hostId, targetReq.requesterId], title: targetPost.title, dateTime: targetPost.time, location: targetPost.location,
      status: '매칭 확정', partnerName: partner.name, partnerAvatar: partner.avatar, partnerRating: 0, partnerBio: partner.bio,
      menuRecommendation: targetPost.category, addressDetail: targetPost.secretLocation || targetPost.location,
      confirmedGuests: 2, totalGuests: 2, dDay: '', appointmentBadge: '1:1 매칭 확정' });
    setChatRooms(prev => prev.map(room => {
      const request = nextRequests.find(item => item.id === room.requestId);
      if (!request || request.postId !== targetReq.postId || !joinRequests.some(item => item.id === request.id && isOpenRequest(item))) return room;
      return { ...room, appointmentId: request.id === requestId ? appointmentId : room.appointmentId,
        messages: [...room.messages, { id: crypto.randomUUID(), senderId: 'system', createdAt: new Date().toISOString(), text: request.id === requestId ? '작성자가 수락해 동행이 확정됐어요. 같은 방에서 약속을 조율하세요.' : '작성자가 다른 동행자와 확정해 이 신청이 종료됐어요.' }] };
    }));
    setNotifications(prev => [{ id: `notif-${crypto.randomUUID()}`, title: '동행 매칭 확정', description: targetPost.title, roomId, type: 'matching', time: '방금', read: false }, ...prev]);
    trackFunnelEvent({ step: 'MATCH_ACCEPT', targetPostId: targetPost.id, pageKey: 'MATCH_REQUESTS', metadata: { requesterId: targetReq.requesterId, simulated: simulateHost } });
    setActiveRoomId(roomId); setActiveTab('chat');
  };
  const endRequest = (requestId: string, status: 'rejected' | 'cancelled', reason = '') => {
    const request = joinRequests.find(item => item.id === requestId);
    if (!request || !isOpenRequest(request) || (status === 'rejected' ? request.hostId : request.requesterId) !== currentUser?.id) return false;
    const text = status === 'rejected' ? '작성자가 신청을 거절했어요.' : `신청자가 동행 신청을 취소했어요. 사유: ${reason}`;
    setJoinRequests(prev => prev.map(item => item.id === requestId && isOpenRequest(item) ? { ...item, status, cancellationReason: reason } : item));
    setChatRooms(prev => prev.map(room => room.requestId === requestId ? { ...room, messages: [...room.messages, { id: crypto.randomUUID(), senderId: 'system', text, createdAt: new Date().toISOString() }] } : room));
    setNotifications(prev => [{ id: crypto.randomUUID(), title: status === 'rejected' ? '신청 거절' : '신청 취소', description: text, roomId: requestRoomId(requestId), type: 'matching', time: '방금', read: false }, ...prev]);
    return true;
  };
  const handleRejectRequest = (id: string) => endRequest(id, 'rejected');
  const openRequestCancellation = (id: string) => {
    const request = joinRequests.find(item => item.id === id);
    if (request && isOpenRequest(request) && request.requesterId === currentUser?.id) setCancellationTarget({ id, kind: 'request', title: request.postTitle });
  };
  const openAppointmentCancellation = (target: Appointment) => {
    if (currentUser && target.participantIds?.includes(currentUser.id) && isConfirmedAppointment(target)) setCancellationTarget({ id: target.id, kind: 'appointment', title: target.title });
  };
  const confirmCancellation = (reason: string) => {
    if (!cancellationTarget) return false;
    const success = cancellationTarget.kind === 'request' ? endRequest(cancellationTarget.id, 'cancelled', reason) : applyLifecycle(cancelConfirmedAppointment(lifecycleState(), cancellationTarget.id, reason, currentUser?.id));
    if (success) setCancellationTarget(null);
    return success;
  };

  // Phase 4: Handle Emergency / No-Show Report Submit
  const handleReportSubmit = (reasonType: string, details: string) => {
    const reasonMap: Record<string, string> = {
      noshow: '20분 이상 미출현 (노쇼 발생)',
      harassment: '불쾌한 언행 / 비매너 / 성희롱',
      commercial: '금전 요구 / 상업적 영업 / 종교 포교',
      danger: '위급 상황 / 신변 위협 (긴급 SOS)',
    };
    const reasonLabel = reasonMap[reasonType] || reasonType;

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: `🚨 [신고 접수] ${reasonLabel}`,
        description: `${appointment.partnerName} 회원에 대한 신고가 안전센터에 접수되었습니다. 상대방의 당도 패널티(-20 Brix) 검토 및 운영진 조사가 즉시 시작됩니다.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);
  };

  // Phase 4: Send 10-minute Arrival Notice
  const handleSendArrivalNotice = () => {
    if (!isConfirmedAppointment(appointment)) return;
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '🔔 도착 예정 안심 알림 발송',
        description: `${appointment.partnerName}님에게 '약속 장소에 10분 내 도착 예정입니다!' 메시지를 전달했습니다.`,
        time: '방금',
        read: false,
        type: 'chat',
      },
      ...prev,
    ]);
    alert(`${appointment.partnerName}님에게 '약속 장소에 10분 내 도착 예정입니다!' 안심 알림을 전송했습니다.`);
  };

  // Phase 5: Mutual Blind Review Submit & Sugar Settling
  const handleOpenReview = (target: Appointment) => {
    if (!completionAvailability(target, currentUser?.id).canReview) return;
    setReviewAppointmentId(target.id);
    setIsReviewModalOpen(true);
  };

  const handleCompleteAppointment = (target: Appointment) => {
    if (!completionAvailability(target, currentUser?.id).canComplete) return;
    setAppointments(prev => prev.map(item => item.id === target.id ? { ...item, status: '동행 완료', dDay: '완료됨' } : item));
  };

  const handleSubmitReview = (reviewPayload: { rating: number; badges: string[]; comment: string }) => {
    const key = reviewKey(reviewAppointment.id);
    if (!completionAvailability(reviewAppointment, currentUser?.id).canReview || submissionLocks.current.has(key)) return false;
    submissionLocks.current.add(key);
    setSubmittedReviews(prev => ({ ...prev, [key]: reviewPayload }));
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '🔒 블라인드 평가 제출 완료',
        description: `${reviewAppointment.partnerName}님과의 동행 평가를 제출했습니다.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);
    return true;
  };

  const handleSettleSugar = (delta: number, partnerReview: ReviewItem) => {
    const key = reviewKey(partnerReview.appointmentId);
    const target = appointments.find(item => item.id === partnerReview.appointmentId);
    if (!target || !completionAvailability(target, currentUser?.id).canReview || !submissionLocks.current.has(key) || settlementLocks.current.has(key)) return false;
    settlementLocks.current.add(key);
    // 1. 당도 정수형 가산
    setCurrentUser((prev) => {
      if (!prev) return null;
      const nextSugar = Math.min(100, Math.round(prev.sugarContent + delta));
      return {
        ...prev,
        sugarContent: nextSugar,
      };
    });

    // 3. 후기 리스트에 추가
    setReviews((prev) => [partnerReview, ...prev]);

    // 4. 시스템 알림 발송
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: `🍯 당도 정산 완료 (+${delta} 🍯 상승!)`,
        description: `양측 블라인드 평가가 동시 해제되었습니다! ${target.partnerName}님이 칭찬 뱃지를 선물했습니다.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);
    return true;
  };

  const handleAuthSuccess = (newUser: CurrentUser) => {
    setCurrentUser(newUser);
    if (pendingRoomId && chatRooms.some(room => room.id === pendingRoomId && room.members.some(member => member.id === newUser.id))) {
      setActiveRoomId(pendingRoomId); setActiveTab('chat');
      const room = chatRooms.find(room => room.id === pendingRoomId)!;
      if (room.appointmentId) setActiveAppointmentId(room.appointmentId);
      setNotifications(prev => prev.map(item => item.roomId === room.id ? { ...item, read: true } : item));
      setPendingRoomId(null);
    }
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '휴대폰 본인인증 완료',
        description: `${newUser.maskedName}님, 환영합니다! 신뢰할 수 있는 1:1 동행을 시작하세요.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);
  };

  const handleKycSuccess = () => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, isKycVerified: true } : null));
      setNotifications((prev) => [
        {
          id: 'notif-' + Date.now(),
          title: '공식 KYC 본인확인 완료',
          description: '프로필에 공식 인증 마크가 부여되었습니다.',
          time: '방금',
          read: false,
          type: 'matching',
        },
        ...prev,
      ]);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setActiveRoomId(null); setIsDashboardOpen(false); setIsReviewModalOpen(false); setSelectedChatProfile(null);
  };

  const handleUpdateAvatar = (newAvatar: string) => {
    setCurrentUser((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
  };

  // Phase 6: Pro Escrow Payment Handlers
  const handleOpenEscrow = (post: MeetupPost) => {
    setSelectedPostForDetail(null);
    setSelectedProPostForEscrow(post);
    setIsEscrowModalOpen(true);
  };

  const dashboardPartner = chatRooms.find(room => room.appointmentId === appointment.id)?.members.find(member => member.id !== currentUser?.id);
  const dashboardProfile = dashboardPartner ? publicProfileForMember(dashboardPartner, currentUser) : undefined;
  const completionActionsFor = (target: Appointment) => ({
    availability: completionAvailability(target, currentUser?.id, now),
    isCompleted: target.status === '동행 완료',
    hasSubmittedReview: Boolean(submittedReviews[reviewKey(target.id)]),
    onComplete: () => handleCompleteAppointment(target),
    onOpenReview: () => handleOpenReview(target),
  });
  const existingPostRoom = selectedPostForDetail && chatRooms.find(room =>
    room.postId === selectedPostForDetail.id &&
    room.members.some(member => member.id === currentUser?.id) &&
    (room.appointmentId || joinRequests.some(request => request.id === room.requestId && isOpenRequest(request)))
  );

  const continueConflict = () => {
    const action = conflictPrompt?.action; setConflictPrompt(null);
    if (!action) return;
    if (action.kind === 'join') handleSendJoinRequest(action.postId, action.message, true);
    if (action.kind === 'accept') handleAcceptRequest(action.requestId, action.simulateHost, true);
    if (action.kind === 'proposal') resolveRoomProposal(action.roomId, action.messageId, action.accepted, action.sample, true);
    if (action.kind === 'create') handleCreateMeetup(action.post, true);
  };

  return (
    <div className="min-h-screen bg-[#f2f4f8] flex justify-center selection:bg-purple-100">
      {/* Mobile container simulating the exact mobile app interface */}
      <main className="w-full max-w-[440px] min-h-screen bg-white shadow-xl relative flex flex-col">
        {/* Top Header */}
        <Header
          unreadCount={unreadNotifCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Tab 1: Home View */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto pb-24">
            {/* 1. 9월 2주차 주목할 이벤트 */}
            <EventBanner
              events={eventBanners}
              now={now}
              onSelectEvent={(event) => setSelectedEvent(event)}
              onViewAllEvents={() => setIsEventsOpen(true)}
            />

            {/* 2. 매칭 확정 약속 카드 */}
            <AppointmentReminders appointments={myAppointments} now={now} onOpenDashboard={openAppointment} />

            {/* 3. 어떤 동행을 찾고 계신가요? 12가지 카테고리 그리드 */}
            <CategoryGrid
              categories={mockCategories}
              selectedCategory={selectedCategory?.name || null}
              onSelectCategory={(category) => setSelectedCategory(category)}
            />
          </div>
        )}

        {/* Tab 2: U (주변/둘러보기) */}
        {activeTab === 'explore' && (
          <div className="flex-1 overflow-y-auto">
            <ExploreView
              posts={activeMeetupPosts}
              onSelectPost={(post) => setSelectedPostForDetail(post)}
            />
          </div>
        )}

        {/* Request and appointment conversations share the same rooms. */}
        {activeTab === 'chat' && <div className="flex-1 flex flex-col">
          {activeRoom && currentUser && activePartner ? <ChatView key={activeRoom.id}
            room={activeRoom} user={currentUser} partner={publicProfileForMember(activePartner, currentUser)} post={activeRoomPost} request={activeRoomRequest} appointment={activeRoomAppointment}
            status={roomAccess(activeRoom, currentUser.id, joinRequests, appointments, meetupPosts)}
            completionActions={activeRoomAppointment ? completionActionsFor(activeRoomAppointment) : undefined}
            onBack={() => setActiveRoomId(null)} onOpenProfile={() => setSelectedChatProfile(publicProfileForMember(activePartner, currentUser))}
            onOpenPost={() => activeRoomPost && setSelectedPostForDetail(activeRoomPost)}
            onOpenDashboard={() => activeRoomAppointment && openAppointment(activeRoomAppointment)}
            onOpenVoiceCall={() => { if(activeRoomAppointment) { setActiveAppointmentId(activeRoomAppointment.id); setIsVoiceCallOpen(true); } }}
            onAccept={() => activeRoomRequest && handleAcceptRequest(activeRoomRequest.id)} onReject={() => activeRoomRequest && handleRejectRequest(activeRoomRequest.id)}
            onCancel={() => activeRoomRequest && openRequestCancellation(activeRoomRequest.id)}
            onCancelAppointment={() => activeRoomAppointment && openAppointmentCancellation(activeRoomAppointment)}
            onReconfirm={(revision, agree, simulate) => activeRoomRequest && handleReconfirm(activeRoomRequest.id, revision, agree, simulate)}
            onSimulatePostChange={() => activeRoomRequest && simulatePostChange(activeRoomRequest.id)}
            onSimulateAccept={() => activeRoomRequest && handleAcceptRequest(activeRoomRequest.id, true)}
            onSend={(text, sample) => sendRoomMessage(activeRoom.id, text, sample)} onDraft={text => updateRoomDraft(activeRoom.id, text)}
            onPropose={proposal => proposeRoomSchedule(activeRoom.id, proposal)} onResolveProposal={(id, accepted, sample) => resolveRoomProposal(activeRoom.id, id, accepted, sample)}
          /> : <ChatListView rooms={chatRooms} user={currentUser} requests={joinRequests} appointments={appointments} posts={meetupPosts} onOpenRoom={id => { const room = chatRooms.find(item => item.id === id); if(room) openRoom(room); }} onOpenAuth={() => setIsAuthModalOpen(true)} />}
        </div>}

        {/* Tab 4: Me */}
        {activeTab === 'me' && (
          <div className="flex-1 overflow-y-auto">
            <MyPageView
              appointments={myAppointments}
              onOpenDashboard={openAppointment}
              requests={joinRequests}
              requestTab={requestTab}
              onChangeRequestTab={setRequestTab}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onOpenRequestChat={openRequestRoom}
              onOpenRequestProfile={openRequestProfile}
              onCancelRequest={openRequestCancellation}
              onReconfirmRequest={handleReconfirm}
              posts={meetupPosts}
              onOpenOwnPost={id => setSelectedPostForDetail(meetupPosts.find(post => post.id === id) || null)}
              onOpenRequestPost={(postId) => setSelectedPostForDetail(meetupPosts.find(post => post.id === postId) || null)}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenKyc={() => setIsKycModalOpen(true)}
              onLogout={handleLogout}
              onUpdateAvatar={handleUpdateAvatar}
              reviews={reviews}
              escrowPayments={escrowPayments}
            />
          </div>
        )}

        {/* Bottom Navigation Bar + FAB (+) Button */}
        <BottomNav
          activeTab={activeTab}
          unreadChatCount={notifications.filter(item => !item.read && item.type === 'chat' && chatRooms.some(room => room.id === item.roomId && room.members.some(member => member.id === currentUser?.id))).length}
          onChangeTab={(tab) => setActiveTab(tab)}
          onOpenCreate={handleOpenCreateMeetup}
        />

        {/* Modal: 참여 대시보드 */}
        <DashboardModal
          appointment={appointment}
          isOpen={isDashboardOpen && Boolean(currentUser && appointment.participantIds?.includes(currentUser.id))}
          onClose={() => setIsDashboardOpen(false)}
          onOpenChat={() => {
            setIsDashboardOpen(false);
            const room = chatRooms.find(item => item.appointmentId === appointment.id);
            if (room) openRoom(room);
            else { setActiveRoomId(null); setActiveTab('chat'); }
          }}
          onOpenSafetyRules={() => setIsSafetyRulesOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onSendArrivalNotice={handleSendArrivalNotice}
          onCancelAppointment={() => openAppointmentCancellation(appointment)}
          partnerProfile={dashboardProfile}
          onOpenPartnerProfile={() => dashboardProfile && setSelectedChatProfile(dashboardProfile)}
          completionActions={completionActionsFor(appointment)}
        />

        {/* Modal: 이벤트 상세 & 불꽃축제 동행 모임 */}
        {isEventsOpen && <EventsView now={now} onClose={() => setIsEventsOpen(false)} onSelectEvent={setSelectedEvent} />}
        <EventDetailModal
          now={now}
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          relatedPosts={activeMeetupPosts.filter((p) => p.eventId && p.eventId === selectedEvent?.id)}
          onSelectPost={setSelectedPostForDetail}
        />

        {/* Modal: 카테고리별 동행 리스트 */}
        <CategoryDetailModal
          category={selectedCategory}
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          posts={activeMeetupPosts}
          onOpenCreate={handleOpenCreateMeetup}
          onSelectPost={(post) => setSelectedPostForDetail(post)}
        />

        {/* Modal: 새 동행 모집하기 / 공고 수정하기 (FAB + 클릭 또는 공고 수정 시) */}
        <CreateMeetupModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingPost(null);
          }}
          onCreateMeetup={handleCreateMeetup}
          onUpdatePost={handleUpdatePost}
          editPost={editingPost}
          currentUser={currentUser}
        />

        {/* Modal: 공고 상세 및 비밀장소 마스킹 보호 (Phase 2) */}
        <PostDetailModal
          post={selectedPostForDetail}
          isOpen={Boolean(selectedPostForDetail)}
          onClose={() => setSelectedPostForDetail(null)}
          currentUser={currentUser}
          onJoinMeetup={handleStartJoinRequest}
          onOpenEscrow={handleOpenEscrow}
          onEditPost={handleEditPost}
          onClosePost={handleClosePost}
          onDeletePost={handleDeletePost}
          hasLinkedAppointment={appointments.some(item => item.postId === selectedPostForDetail?.id && (isConfirmedAppointment(item) || item.status === '동행 완료'))}
          onOpenExistingChat={existingPostRoom ? () => {
            setSelectedPostForDetail(null); setSelectedCategory(null); setSelectedEvent(null); openRoom(existingPostRoom);
          } : undefined}
          canViewPrivateLocation={Boolean(currentUser && appointments.some(item => item.postId === selectedPostForDetail?.id && item.participantIds?.includes(currentUser.id) && ['매칭 확정', '매칭완료', '동행 완료'].includes(item.status)))}
        />

        {/* Phase 3 Modal: 1:1 동행 신청서 모달 (신청자) */}
        <JoinRequestModal
          post={meetupPosts.find(post => post.id === selectedPostForJoin?.id) || null}
          isOpen={isJoinRequestModalOpen}
          onClose={() => {
            setIsJoinRequestModalOpen(false);
            setSelectedPostForJoin(null);
          }}
          currentUser={currentUser}
          appointments={myAppointments}
          onSubmitRequest={handleSendJoinRequest}
        />

        {/* Phase 4 Modal: 안심 안전 5대 수칙 모달 */}
        <SafetyRulesModal
          isOpen={isSafetyRulesOpen}
          onClose={() => setIsSafetyRulesOpen(false)}
        />

        {/* Phase 4 Modal: 1:1 가상 안심 음성 통화 모달 */}
        <VoiceCallModal
          isOpen={isVoiceCallOpen}
          onClose={() => setIsVoiceCallOpen(false)}
          appointment={appointment}
        />

        {/* Phase 4 Modal: 긴급 신고 및 노쇼(No-Show) 센터 모달 */}
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          appointment={appointment}
          onSubmitReport={handleReportSubmit}
        />

        {/* Modal: 알림 창 */}
        <NotificationModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onOpenRoom={(roomId) => {
            setIsNotificationsOpen(false);
            if (!currentUser) { setPendingRoomId(roomId); setIsAuthModalOpen(true); return; }
            const room = chatRooms.find(item => item.id === roomId); if (room) openRoom(room);
          }}
          onOpenMatchRequests={(notificationId) => {
            setNotifications((prev) =>
              prev.map((item) => item.id === notificationId ? { ...item, read: true } : item)
            );
            setIsNotificationsOpen(false);
            setRequestTab('received');
            setActiveTab('me');
            if (!currentUser) setIsAuthModalOpen(true);
          }}
        />

        {selectedChatProfile && <UserProfileModal profile={selectedChatProfile} onClose={() => setSelectedChatProfile(null)} backLabel="이전 화면으로 돌아가기" />}
        {postAction && <LifecycleConfirmDialog title={postAction.mode === 'deleted' ? '공고 삭제' : '모집 마감'} description={postAction.mode === 'deleted' ? '공고를 목록에서 지우고 남아 있는 신청을 종료합니다. 기존 신청·대화 기록은 보존돼요.' : '새 신청을 받지 않고 미확정 신청을 함께 종료합니다. 동행이 확정되는 것은 아니에요.'} actionLabel={postAction.mode === 'deleted' ? '공고 삭제하기' : '모집 마감하기'} onClose={() => setPostAction(null)} onConfirm={confirmPostAction} />}
        {cancellationTarget && <CancellationDialog key={cancellationTarget.id} kind={cancellationTarget.kind} title={cancellationTarget.title} onClose={() => setCancellationTarget(null)} onConfirm={confirmCancellation} />}
        {conflictPrompt && <ScheduleConflictDialog conflicts={conflictPrompt.conflicts} onClose={() => setConflictPrompt(null)} onContinue={continueConflict} />}
        {lifecycleNotice && <div role="alert" className="fixed bottom-24 left-5 right-5 mx-auto max-w-sm bg-gray-900 text-white p-4 rounded-2xl z-[95] text-xs leading-relaxed shadow-lg">{lifecycleNotice}<button onClick={() => setLifecycleNotice(null)} className="block ml-auto mt-2 font-bold underline">안내 닫기</button></div>}
        {/* Modal: 회원가입 / 휴대폰 본인확인 (Phase 1) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Modal: 선택형 KYC 본인확인 (Phase 1) */}
        <KycAuthModal
          isOpen={isKycModalOpen}
          onClose={() => setIsKycModalOpen(false)}
          isAlreadyVerified={currentUser?.isKycVerified || false}
          onKycSuccess={handleKycSuccess}
        />

        {/* Phase 5 Modal: 상호 블라인드 평가 및 실시간 당도 정산 모달 */}
        {isReviewModalOpen && <ReviewModal
          key={reviewAppointment.id}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          appointment={reviewAppointment}
          existingSubmission={submittedReviews[reviewKey(reviewAppointment.id)]}
          hasSettled={settlementLocks.current.has(reviewKey(reviewAppointment.id))}
          onSubmitReview={handleSubmitReview}
          onSettleSugar={handleSettleSugar}
        />}

        {/* Phase 6 Modal: PRO 1:1 안심 에스크로 결제 모달 */}
        <EscrowPaymentModal
          isOpen={isEscrowModalOpen}
          onClose={() => {
            setIsEscrowModalOpen(false);
            setSelectedProPostForEscrow(null);
          }}
          post={selectedProPostForEscrow}
        />
      </main>
    </div>
  );
}
