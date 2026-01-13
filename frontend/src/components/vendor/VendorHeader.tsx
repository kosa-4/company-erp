'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

  /**
   * 로그아웃 핸들러
   * - 세션 종료 후 랜딩 페이지로 이동
   */
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
    <motion.header 
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 left-[260px] h-16 bg-white/80 backdrop-blur-xl border-b border-stone-100 z-30"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Welcome Message */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Welcome, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{user.vendorName}</span>
            </h2>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            협력사
          </span>
        </motion.div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
                >
                  <div className="p-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-stone-100/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-stone-900">알림</h3>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">2 new</span>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notification, idx) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div className={notification.unread ? '' : 'ml-5'}>
                            <p className={`text-sm ${notification.unread ? 'text-stone-900 font-medium' : 'text-stone-600'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5">{notification.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Link href="/vendor/mypage/notice" className="block p-3 text-center text-sm text-teal-600 font-medium hover:bg-stone-50 border-t border-stone-100">
                    전체 알림 보기
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                <span className="text-white font-semibold text-sm">
                  {user.userName.charAt(0)}
                </span>
              </div>
              <motion.div
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-stone-100">
                    <p className="font-semibold text-stone-900">{user.userName}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{user.email}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        협력사
                      </span>
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full">
                        {user.vendorName}
                      </span>
                    </div>
                  </div>
                  <div className="py-2">
                    {[
                      { href: '/vendor/mypage/profile', icon: User, label: '내 정보 수정' },
                      { href: '/vendor/mypage/notice', icon: MessageSquare, label: '공지사항' },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link 
                          href={item.href} 
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-stone-400" />
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 py-2">
                    <motion.button 
                      onClick={handleLogout}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
    </motion.header>
  );
};

export default VendorHeader;
