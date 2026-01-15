'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, User, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VendorUser {
  id: string;
  userId: string;
  userName: string;
  email: string;
  vendorCode: string;
  vendorName: string;
}

interface VendorHeaderProps {
  user?: VendorUser;
}

// 임시 Mock 사용자 데이터
const mockVendorUser: VendorUser = {
  id: '1',
  userId: 'vendor01',
  userName: '홍길동',
  email: 'vendor@partner.com',
  vendorCode: 'VND001',
  vendorName: '(주)협력사',
};

const VendorHeader: React.FC<VendorHeaderProps> = ({ user = mockVendorUser }) => {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const notifications = [
    { id: 1, title: '새로운 발주서가 도착했습니다.', time: '10분 전', unread: true },
    { id: 2, title: '견적 요청이 접수되었습니다.', time: '1시간 전', unread: true },
    { id: 3, title: '시스템 점검 안내', time: '3시간 전', unread: false },
  ];

  return (
    <header className="fixed top-0 right-0 left-60 h-14 bg-white border-b border-gray-100 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Welcome Message */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-medium text-gray-900">
            Welcome, <span className="font-semibold">{user.vendorName}</span>
          </h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            협력사
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">알림</h3>
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">2 new</span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.unread ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notification.unread && (
                          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className={notification.unread ? '' : 'ml-3.5'}>
                          <p className={`text-sm ${notification.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/vendor/mypage/notice" className="block p-2.5 text-center text-sm text-gray-600 hover:bg-gray-50 border-t border-gray-100">
                  전체 알림 보기
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.userName.charAt(0)}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user.userName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      협력사
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {user.vendorName}
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <Link 
                    href="/vendor/mypage/profile" 
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    내 정보 수정
                  </Link>
                  <Link 
                    href="/vendor/mypage/notice" 
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    공지사항
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default VendorHeader;
