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
import { CategoryItem, EventBannerItem, MeetupPost } from './types';

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Modal states
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventBannerItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // App data states
  const [appointment, setAppointment] = useState(mockAppointment);
  const [meetupPosts, setMeetupPosts] = useState<MeetupPost[]>(mockMeetupPosts);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
    alert(`"${post.title}" 동행 참여 신청이 전달되었습니다! 호스트와 채팅방이 열립니다.`);
    setSelectedEvent(null);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#f2f4f8] flex justify-center selection:bg-purple-100">
      {/* Mobile container simulating the exact mobile app interface */}
      <main className="w-full max-w-[440px] min-h-screen bg-white shadow-xl relative flex flex-col">
        {/* Top Header */}
        <Header
          unreadCount={unreadNotifCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Tab 1: Home View (Exact reproduction of screenshot) */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto">
            {/* 1. 9월 2주차 주목할 이벤트 (서울세계불꽃축제 배너) */}
            <EventBanner
              events={mockEventBanners}
              onSelectEvent={(event) => setSelectedEvent(event)}
              onViewAllEvents={() => setSelectedEvent(mockEventBanners[0])}
            />

            {/* 2. 매칭 확정 약속 카드 (조*미 님과의 강남맛집 식사 동행) */}
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
              posts={meetupPosts}
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
            />
          </div>
        )}

        {/* Bottom Navigation Bar + FAB (+) Button */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          onOpenCreate={() => setIsCreateModalOpen(true)}
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
          relatedPosts={meetupPosts.filter((p) => p.category === '축제' || p.category === '공연')}
          onJoinMeetup={handleJoinMeetup}
        />

        {/* Modal: 카테고리별 동행 리스트 */}
        <CategoryDetailModal
          category={selectedCategory}
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          posts={meetupPosts}
          onOpenCreate={() => setIsCreateModalOpen(true)}
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
      </main>
    </div>
  );
}
