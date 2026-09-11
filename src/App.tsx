/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { EventBanner } from './components/EventBanner';
import { AppointmentCard } from './components/AppointmentCard';
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
import { MatchRequestsModal } from './components/MatchRequestsModal';
import { ExploreView } from './components/ExploreView';
import { ChatView } from './components/ChatView';
import { MyPageView } from './components/MyPageView';

import {
  mockAppointment,
  mockCategories,
  mockEventBanners,
  mockMeetupPosts,
  mockNotifications,
} from './data/mockData';
import { CategoryItem, EventBannerItem, MeetupPost, CurrentUser, JoinRequest } from './types';

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // User Auth state (Phase 1)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>({
    id: 'user-default',
    isLoggedIn: true,
    phone: '010-9876-5432',
    realName: '조유미',
    maskedName: '조*미',
    nickname: '다정한이웃',
    gender: 'female',
    ageGroup: '20대',
    neighborhood: '서울 강남구 대치동',
    sugarContent: 99.2,
    isPhoneVerified: true,
    isKycVerified: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: '브런치와 주말 문화생활을 좋아하는 동행러입니다.',
    joinedAt: '2026.08',
  });

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
  const [isMatchRequestsOpen, setIsMatchRequestsOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: 'req-init-1',
      postId: 'm4',
      postTitle: '성수동 디저트 오마카세 같이 가실 분',
      requesterId: 'user-req-1',
      requesterName: '김*수',
      requesterAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      requesterSugar: 78.4,
      message: '안녕하세요! 디저트 카페 투어 정말 좋아하는데 혼자 가기 아쉬웠어요. 약속 시간 잘 지키겠습니다 :)',
      status: 'pending',
      createdAt: '10분 전',
    },
    {
      id: 'req-init-2',
      postId: 'm4',
      postTitle: '성수동 디저트 오마카세 같이 가실 분',
      requesterId: 'user-req-2',
      requesterName: '이*은',
      requesterAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      requesterSugar: 85.0,
      message: '성수동 거주 중인 30대입니다. 매너 있게 좋은 대화 나누며 달콤한 시간 보내요!',
      status: 'pending',
      createdAt: '30분 전',
    },
  ]);

  // App data states
  const [appointment, setAppointment] = useState(mockAppointment);
  const [meetupPosts, setMeetupPosts] = useState<MeetupPost[]>(() =>
    mockMeetupPosts.map((p) => ({
      ...p,
      maxMembers: 2,
      currentMembers: p.status === 'closed' ? 2 : 1,
    }))
  );
  const [notifications, setNotifications] = useState(mockNotifications);

  // 1대1 동행 서비스 원칙(최대 2명) 강제 정규화
  const activeMeetupPosts = meetupPosts.map((p) => ({
    ...p,
    maxMembers: 2,
    currentMembers: p.status === 'closed' ? 2 : Math.min(p.currentMembers, 1),
  }));

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const pendingRequestsCount = joinRequests.filter((r) => r.status === 'pending').length;

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

  const handleCreateMeetup = (newPost: MeetupPost) => {
    setMeetupPosts((prev) => [newPost, ...prev]);
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
  };

  const handleUpdatePost = (updatedPost: MeetupPost) => {
    setMeetupPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setSelectedPostForDetail(updatedPost);
    setEditingPost(null);
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '동행 공고가 수정되었습니다',
        description: `"${updatedPost.title}" 내용이 성공적으로 갱신되었습니다.`,
        time: '방금',
        read: false,
        type: 'event',
      },
      ...prev,
    ]);
  };

  const handleClosePost = (postId: string) => {
    setMeetupPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: 'closed', currentMembers: 2 } : p))
    );
    setSelectedPostForDetail((prev) =>
      prev && prev.id === postId ? { ...prev, status: 'closed', currentMembers: 2 } : prev
    );
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '동행 모집이 조기 마감되었습니다',
        description: '공고가 2/2명 마감 상태로 전환되었습니다.',
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);
  };

  const handleDeletePost = (postId: string) => {
    setMeetupPosts((prev) => prev.filter((p) => p.id !== postId));
    setSelectedPostForDetail(null);
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '동행 공고가 삭제되었습니다',
        description: '등록하셨던 공고가 정상적으로 삭제 처리되었습니다.',
        time: '방금',
        read: false,
        type: 'event',
      },
      ...prev,
    ]);
  };

  const handleEditPost = (post: MeetupPost) => {
    setEditingPost(post);
    setSelectedPostForDetail(null);
    setIsCreateModalOpen(true);
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
    if (post.status === 'closed' || post.currentMembers >= 2) {
      alert('이미 1:1 매칭이 마감된(2/2명) 공고입니다.');
      return;
    }

    setSelectedPostForJoin(post);
    setSelectedPostForDetail(null);
    setSelectedEvent(null);
    setSelectedCategory(null);
    setIsJoinRequestModalOpen(true);
  };

  // Phase 3: Submit Join Request
  const handleSendJoinRequest = (postId: string, message: string) => {
    const post = activeMeetupPosts.find((p) => p.id === postId) || selectedPostForJoin;
    if (!post || !currentUser) return;

    const newReq: JoinRequest = {
      id: 'req-' + Date.now(),
      postId: post.id,
      postTitle: post.title,
      requesterId: currentUser.id,
      requesterName: currentUser.maskedName,
      requesterAvatar: currentUser.avatar,
      requesterSugar: currentUser.sugarContent,
      message,
      status: 'pending',
      createdAt: '방금',
    };

    setJoinRequests((prev) => [newReq, ...prev]);

    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '1:1 동행 참여 신청 완료',
        description: `"${post.title}" 공고에 소개 메시지와 함께 신청이 접수되었습니다. 호스트가 수락하면 1:1 채팅방이 열립니다.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);

    alert(`[신청 완료] "${post.title}" 호스트에게 1:1 동행 신청서가 전달되었습니다!`);
  };

  // Phase 3: Accept Join Request (Single Lock Mechanism)
  const handleAcceptRequest = (requestId: string) => {
    const targetReq = joinRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // 1. Single Lock: Set chosen request accepted, others for the same post rejected
    setJoinRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: 'accepted' };
        }
        if (r.postId === targetReq.postId && r.status === 'pending') {
          return { ...r, status: 'rejected' };
        }
        return r;
      })
    );

    // 2. Close post and set members to 2/2
    const targetPost = meetupPosts.find((p) => p.id === targetReq.postId);
    setMeetupPosts((prev) =>
      prev.map((p) =>
        p.id === targetReq.postId ? { ...p, status: 'closed', currentMembers: 2 } : p
      )
    );

    // 3. Update confirmed appointment
    setAppointment({
      id: 'apt-' + Date.now(),
      title: targetReq.postTitle,
      category: targetPost?.category || '디저트',
      dateTime: targetPost?.time || '2026.9.15(화) 15:00',
      location: targetPost?.location || '성수동 디저트 카페',
      currentMembers: 2,
      maxMembers: 2,
      status: '매칭 확정',
      partnerName: targetReq.requesterName,
      partnerAvatar: targetReq.requesterAvatar,
      partnerRole: '참여자',
      dDay: 'D-2',
    });

    // 4. Send system notification
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '🎉 1:1 동행 매칭 확정!',
        description: `${targetReq.requesterName}님과의 1:1 동행이 확정(2/2명)되었습니다. 채팅방에서 세부 일정을 조율해보세요!`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);

    setIsMatchRequestsOpen(false);
    setActiveTab('chat');
  };

  // Phase 3: Reject Join Request
  const handleRejectRequest = (requestId: string) => {
    setJoinRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  // Phase 3: Real-time Schedule update from ChatView proposal
  const handleUpdateAppointment = (newSchedule: { dateTime: string; location: string }) => {
    setAppointment((prev) => ({
      ...prev,
      dateTime: newSchedule.dateTime,
      location: newSchedule.location,
    }));
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '📅 1:1 동행 약속 변경 완료',
        description: `약속이 [${newSchedule.dateTime} / ${newSchedule.location}] (으)로 확정 변경되었습니다.`,
        time: '방금',
        read: false,
        type: 'matching',
      },
      ...prev,
    ]);
  };

  const handleAuthSuccess = (newUser: CurrentUser) => {
    setCurrentUser(newUser);
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

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#f2f4f8] flex justify-center selection:bg-purple-100">
      {/* Mobile container simulating the exact mobile app interface */}
      <main className="w-full max-w-[440px] min-h-screen bg-white shadow-xl relative flex flex-col">
        {/* Top Header */}
        <Header
          unreadCount={unreadNotifCount}
          pendingRequestCount={pendingRequestsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMatchRequests={() => setIsMatchRequestsOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Tab 1: Home View */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto pb-6">
            {/* 1. 9월 2주차 주목할 이벤트 */}
            <EventBanner
              events={mockEventBanners}
              onSelectEvent={(event) => setSelectedEvent(event)}
              onViewAllEvents={() => setSelectedEvent(mockEventBanners[0])}
            />

            {/* Phase 3: Pending Host Requests quick banner if any */}
            {pendingRequestsCount > 0 && (
              <div className="px-5 mb-3">
                <button
                  onClick={() => setIsMatchRequestsOpen(true)}
                  className="w-full p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-between shadow-md shadow-purple-500/20 active:scale-98 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      📬
                    </span>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        도착한 1:1 동행 신청이 <span className="underline">{pendingRequestsCount}건</span> 있습니다!
                      </p>
                      <p className="text-[10.5px] text-purple-100 mt-0.5">
                        신청자의 당도와 메시지를 확인하고 매칭을 확정하세요.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-white text-[#6c2cf5] px-2.5 py-1 rounded-full shrink-0">
                    확인
                  </span>
                </button>
              </div>
            )}

            {/* 2. 매칭 확정 약속 카드 */}
            <AppointmentCard
              appointment={appointment}
              onOpenDashboard={() => setIsDashboardOpen(true)}
            />

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

        {/* Tab 3: 채팅 */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            <ChatView
              appointment={appointment}
              onOpenDashboard={() => setIsDashboardOpen(true)}
              onUpdateAppointment={handleUpdateAppointment}
            />
          </div>
        )}

        {/* Tab 4: Me */}
        {activeTab === 'me' && (
          <div className="flex-1 overflow-y-auto">
            <MyPageView
              currentAppointment={appointment}
              onOpenDashboard={() => setIsDashboardOpen(true)}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenKyc={() => setIsKycModalOpen(true)}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* Bottom Navigation Bar + FAB (+) Button */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          onOpenCreate={handleOpenCreateMeetup}
        />

        {/* Modal: 참여 대시보드 */}
        <DashboardModal
          appointment={appointment}
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          onOpenChat={() => {
            setIsDashboardOpen(false);
            setActiveTab('chat');
          }}
        />

        {/* Modal: 이벤트 상세 & 불꽃축제 동행 모임 */}
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          relatedPosts={activeMeetupPosts.filter((p) => p.category === '축제' || p.category === '공연')}
          onJoinMeetup={handleStartJoinRequest}
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
          onEditPost={handleEditPost}
          onClosePost={handleClosePost}
          onDeletePost={handleDeletePost}
        />

        {/* Phase 3 Modal: 1:1 동행 신청서 모달 (신청자) */}
        <JoinRequestModal
          post={selectedPostForJoin}
          isOpen={isJoinRequestModalOpen}
          onClose={() => {
            setIsJoinRequestModalOpen(false);
            setSelectedPostForJoin(null);
          }}
          currentUser={currentUser}
          currentAppointment={appointment}
          onSubmitRequest={handleSendJoinRequest}
        />

        {/* Phase 3 Modal: 받은 동행 신청 목록 & 1:1 매칭 확정 락 (호스트) */}
        <MatchRequestsModal
          isOpen={isMatchRequestsOpen}
          onClose={() => setIsMatchRequestsOpen(false)}
          requests={joinRequests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />

        {/* Modal: 알림 창 */}
        <NotificationModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        />

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
      </main>
    </div>
  );
}

