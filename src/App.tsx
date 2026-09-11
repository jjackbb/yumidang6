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
import { CategoryItem, EventBannerItem, MeetupPost, CurrentUser } from './types';

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

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpenCreateMeetup = () => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateMeetup = (newPost: MeetupPost) => {
    setMeetupPosts((prev) => [newPost, ...prev]);
    // Also add notification
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '새로운 동행이 등록되었습니다',
        description: `[${newPost.category}] "${newPost.title}" 모집이 시작되었습니다.`,
        time: '방금',
        read: false,
        type: 'event',
      },
      ...prev,
    ]);
  };

  const handleJoinMeetup = (post: MeetupPost) => {
    if (!currentUser || !currentUser.isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    alert(`"${post.title}" 동행 참여 신청이 전달되었습니다! 호스트와 채팅방이 열립니다.`);
    setSelectedEvent(null);
    setActiveTab('chat');
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
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Tab 1: Home View */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto">
            {/* 1. 9월 2주차 주목할 이벤트 */}
            <EventBanner
              events={mockEventBanners}
              onSelectEvent={(event) => setSelectedEvent(event)}
              onViewAllEvents={() => setSelectedEvent(mockEventBanners[0])}
            />

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
              onSelectPost={(post) => {
                const foundCat = mockCategories.find((c) => c.name === post.category);
                if (foundCat) setSelectedCategory(foundCat);
              }}
            />
          </div>
        )}

        {/* Tab 3: 채팅 */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            <ChatView
              appointment={appointment}
              onOpenDashboard={() => setIsDashboardOpen(true)}
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
          onJoinMeetup={handleJoinMeetup}
        />

        {/* Modal: 카테고리별 동행 리스트 */}
        <CategoryDetailModal
          category={selectedCategory}
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          posts={activeMeetupPosts}
          onOpenCreate={handleOpenCreateMeetup}
        />

        {/* Modal: 새 동행 모집하기 (FAB + 클릭 시) */}
        <CreateMeetupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateMeetup={handleCreateMeetup}
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
