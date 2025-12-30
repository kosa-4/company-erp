'use client';

import React, { useState } from 'react';
import { User } from '@/types';

interface HeaderProps {
  user?: User;
}

// 임시 Mock 사용자 데이터
const mockUser: User = {
  id: '1',
  userId: 'admin',
  userName: '홍길동',
  email: 'admin@company.com',
  companyCode: 'COMP001',
  companyName: '(주)테스트회사',
  departmentCode: 'DEPT001',
  departmentName: '구매팀',
  userType: 'BUYER',
  role: 'MANAGER',
};

const Header: React.FC<HeaderProps> = ({ user = mockUser }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);


  return (
    <header 
      className="fixed top-0 right-0 left-[260px] h-16 bg-white border-b border-gray-200 z-30 shadow-sm"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page Title or Breadcrumb area */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Welcome back, {user.userName} !</h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">


          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-medium text-sm">
                  {user.userName.charAt(0)}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-stone-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideIn">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user.userName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                      {user.role === 'ADMIN' ? '관리자' : user.role === 'MANAGER' ? '담당자' : '사용자'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {user.departmentName}
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  <a href="/mypage/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    내 정보 수정
                  </a>
                  <a href="/mypage/notice" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    공지사항
                  </a>
                  <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <a href="/help" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Center
                  </a>
                </div>
                <div className="border-t border-stone-200 py-2">
                  <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(showUserMenu) && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => {
            setShowUserMenu(false);

          }}
        />
      )}
    </header>
  );
};

export default Header;
