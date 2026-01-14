'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  User, 
  Building2, 
  FileText, 
  Package, 
  Home,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

// 협력사 전용 네비게이션 메뉴
const vendorNavigationItems: NavItem[] = [
  {
    name: 'My Page',
    href: '/vendor/mypage',
    icon: User,
    children: [
      { name: '프로필', href: '/vendor/mypage/profile' },
      { name: '공지사항', href: '/vendor/mypage/notice' },
    ],
  },
  {
    name: '기준정보',
    href: '/vendor/master',
    icon: Building2,
    children: [
      { name: '협력업체 변경신청', href: '/vendor/master/info' },
      { name: '담당자관리', href: '/vendor/master/users' },
    ],
  },
  {
    name: '견적관리',
    href: '/vendor/rfq',
    icon: FileText,
    children: [
      { name: '견적현황', href: '/vendor/rfq/submit' },
      { name: '견적결과', href: '/vendor/rfq/result' },
    ],
  },
  {
    name: '발주관리',
    href: '/vendor/order',
    icon: Package,
    children: [
      { name: '발주서 조회', href: '/vendor/order/list' },
    ],
  },
];

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
  const Icon = item.icon;

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
                <Icon className="w-4 h-4" />
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
          <span className={`text-base ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
            <Icon className="w-4 h-4" />
          </span>
          <span className="text-[13px] font-medium">{item.name}</span>
        </Link>
      )}
    </div>
  );
};

const VendorSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

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
      {/* Logo Area - FABRIO */}
      <div className="h-14 flex items-center px-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-gray-900 font-bold text-lg">FABRIO</h1>
        </Link>
      </div>

      {/* Home Link */}
      <div className="px-2 py-3">
        <Link
          href="/vendor"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors
            ${pathname === '/vendor'
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <span className={`text-base ${pathname === '/vendor' ? 'text-gray-700' : 'text-gray-500'}`}>
            <Home className="w-4 h-4" />
          </span>
          <span className="text-[13px] font-medium">홈</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 overflow-y-auto h-[calc(100vh-180px)]">
        <div className="space-y-0.5">
          {vendorNavigationItems.map((item) => (
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
              {user?.userId?.charAt(0)?.toUpperCase() || '협'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.vendorCd || '(주)협력사'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.userId || '담당자'}</p>
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

export default VendorSidebar;
