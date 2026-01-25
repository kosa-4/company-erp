'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Package, LogOut } from 'lucide-react';
import { navigationItems } from '@/constants/navigation';
import { NavItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { mypageApi } from '@/lib/api/mypage';
import { vendorMypageApi } from '@/lib/api/vendorMypage';

// 일반 사용자(USER)에게 허용된 메뉴 경로
const USER_ALLOWED_PATHS = [
  '/mypage',
  '/mypage/profile',
  '/mypage/notice',
  '/master',
  '/master/item', // 기준정보 -> 품목현황
  '/purchase',
  '/purchase/request', // 구매관리 -> 구매요청
  '/purchase/request-list' // 구매요청 현황
];

// 메뉴 필터링 함수
const getFilteredItems = (items: NavItem[], role?: string): NavItem[] => {
  // ADMIN이나 BUYER는 모든 메뉴 접근 가능
  if (role === 'ADMIN' || role === 'BUYER') {
    return items;
  }

  // 그 외(USER 등)는 허용된 메뉴만 노출
  return items.reduce<NavItem[]>((acc, item) => {
    // 1. 하위 메뉴가 있다면 그것부터 필터링
    let filteredChildren = item.children;
    if (item.children) {
      filteredChildren = item.children.filter(child =>
        USER_ALLOWED_PATHS.includes(child.href)
      );
    }

    // 2. 현재 메뉴가 허용 목록에 있거나, 하위 메뉴 중 살아남은 게 있으면 노출
    const isSelfAllowed = USER_ALLOWED_PATHS.includes(item.href);
    const hasVisibleChildren = filteredChildren && filteredChildren.length > 0;

    if (isSelfAllowed || hasVisibleChildren) {
      // 하위 메뉴가 필터링된 새 객체 생성 (원본 보존)
      acc.push({
        ...item,
        children: filteredChildren
      });
    }
    return acc;
  }, []);
};

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const NavItemComponent: React.FC<NavItemProps> = ({ item, isActive, isOpen, onToggle }) => {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = item.children?.some(child => pathname === child.href) ?? false;
  const shouldExpand = isOpen || isChildActive;

  return (
    <div className="mb-0.5">
      {hasChildren ? (
        <>
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors
              ${isChildActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-base ${isChildActive ? 'text-gray-700' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <span className="text-[13px] font-medium">{item.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${shouldExpand ? 'rotate-180' : ''}`} />
          </button>

          {shouldExpand && (
            <div className="mt-0.5 ml-4 pl-3 border-l border-gray-100 space-y-0.5">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-3 py-2 rounded-md text-[13px] transition-colors
                    ${pathname === child.href
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.href}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors
            ${isActive
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <span className={`text-base ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>{item.icon}</span>
          <span className="text-[13px] font-medium">{item.name}</span>
        </Link>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 협력사인 경우 vn_user에서 정보 조회, 구매사인 경우 API 호출
        if (user?.comType === 'V') {
          const response = await vendorMypageApi.getUserInfo();
          if (response && response.userName) {
            setUserName(response.userName);
            setVendorName(response.vendorName || '');
          } else {
            console.warn('협력사 사용자 정보를 가져올 수 없습니다.');
            setUserName('');
            setVendorName('');
          }
        } else {
          const myInfo = await mypageApi.getInitData();
          setUserName(myInfo.userNameKo || '');
          setVendorName('');
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        // 실패 시 빈 문자열로 설정
        setUserName('');
        setVendorName('');
      }
    };

    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const toggleItem = (href: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 z-40 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          {/* 협력사 스타일 심볼 + 구매사 스타일 폰트 */}
          <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center shadow-sm transform -rotate-3">
            <span className="text-white font-black text-lg italic">F</span>
          </div>
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            FABRIO
          </span>
        </Link>
      </div>

      {/* Home Link - 협력사 사이드바와 동일하게 추가 */}
      <div className="px-2 py-3">
        <Link
          href="/home"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors
            ${pathname === '/home'
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <span className={`text-base ${pathname === '/home' ? 'text-gray-700' : 'text-gray-500'}`}>
            🏠
          </span>
          <span className="text-[13px] font-medium">홈</span>
        </Link>
      </div>

      {/* Navigation - 검색바 제거됨 */}
      <nav className="flex-1 px-2 overflow-y-auto h-[calc(100vh-180px)]">
        <div className="space-y-0.5">
          {getFilteredItems(navigationItems, user?.role).map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isOpen={openItems.has(item.href)}
              onToggle={() => toggleItem(item.href)}
            />
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs">
              {(userName || user?.userId)?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName || user?.userId || '사용자'}</p>
            <p className="text-xs text-gray-500 truncate">담당자</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
