'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header 
      className="fixed top-0 right-0 left-[260px] h-16 bg-white border-b border-gray-200 z-30 shadow-sm"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Welcome Message */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, <span className="text-emerald-600">{user.vendorName}</span>
          </h2>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            협력사
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
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
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user.userName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                      협력사
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {user.vendorName}
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  <Link href="/vendor/mypage/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    내 정보 수정
                  </Link>
                  <Link href="/vendor/mypage/notice" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    공지사항
                  </Link>
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
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default VendorHeader;
