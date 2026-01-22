'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, User, LogOut, MessageSquare } from 'lucide-react';
import { User as UserType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { mypageApi } from '@/lib/api/mypage';
import { vendorMypageApi } from '@/lib/api/vendorMypage';

interface HeaderProps {
  user?: UserType;
}

const Header: React.FC<HeaderProps> = ({ user: propUser }) => {
  const { logout, user: authUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 협력사인 경우 vn_user에서 정보 조회, 구매사인 경우 API 호출
        if (authUser?.comType === 'V') {
          const response = await vendorMypageApi.getUserInfo();
          if (response && response.userName) {
            setUserName(response.userName);
            setUserEmail(response.email || '');
            setDepartmentName(''); // 협력사는 부서명 없음
          } else {
            setUserName('');
            setUserEmail('');
            setDepartmentName('');
          }
        } else {
          const myInfo = await mypageApi.getInitData();
          setUserName(myInfo.userNameKo || authUser?.userId || '');
          setUserEmail(myInfo.email || '');
          setDepartmentName(myInfo.departmentName || '');
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        // 실패 시 빈 문자열로 설정
        setUserName('');
        setUserEmail('');
        setDepartmentName('');
      }
    };

    if (authUser) {
      loadUserInfo();
    }
  }, [authUser]);

  // API에서 가져온 userName을 우선 사용 (propUser 무시)
  const mappedRole: 'ADMIN' | 'MANAGER' | 'USER' = 
    authUser?.role === 'ADMIN' ? 'ADMIN' : 
    authUser?.role === 'BUYER' ? 'USER' : 
    'USER';

  const user: UserType = {
    id: authUser?.userId || '',
    userId: authUser?.userId || '',
    userName: userName || authUser?.userId || '', // API에서 가져온 userName 우선 사용
    email: userEmail,
    companyCode: '',
    companyName: '',
    departmentCode: '',
    departmentName: departmentName,
    userType: authUser?.comType === 'B' ? 'BUYER' : 'VENDOR',
    role: mappedRole,
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const notifications = [
    { id: 1, title: '새로운 구매요청이 등록되었습니다.', time: '5분 전', unread: true },
    { id: 2, title: '견적서가 도착했습니다.', time: '30분 전', unread: true },
    { id: 3, title: '발주서 승인이 완료되었습니다.', time: '1시간 전', unread: false },
  ];

  return (
    <header className="fixed top-0 right-0 left-60 h-14 bg-white border-b border-gray-100 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Welcome Message */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-medium text-gray-900">
            Welcome, <span className="font-semibold">{userName || user.userName || user.userId || '사용자'}</span>
          </h2>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            {user.role === 'ADMIN' ? '관리자' : user.role === 'MANAGER' ? '담당자' : '사용자'}
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
                <Link href="/mypage/notice" className="block p-2.5 text-center text-sm text-gray-600 hover:bg-gray-50 border-t border-gray-100">
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
                  {(userName || user.userName || user.userId)?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {userName || user.userName || user.userId || '사용자'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{userName || user.userName || user.userId || '사용자'}</p>
                  <p className="text-sm text-gray-500">{userEmail || user.email || ''}</p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {user.role === 'ADMIN' ? '관리자' : user.role === 'MANAGER' ? '담당자' : '사용자'}
                    </span>
                    {departmentName && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {departmentName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="py-1">
                  {/* Settings, Help & Center 제거됨 */}
                  <Link 
                    href="/mypage/profile" 
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    내 정보 수정
                  </Link>
                  <Link 
                    href="/mypage/notice" 
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

export default Header;
