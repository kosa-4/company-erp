'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems } from '@/constants/navigation';
import { NavItem } from '@/types';

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
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
              ${isChildActive 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-70 group-hover:opacity-100">{item.icon}</span>
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 text-stone-400 ${shouldExpand ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div
            className={`overflow-hidden transition-all duration-200 ${
              shouldExpand ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-200 space-y-0.5">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200
                    ${pathname === child.href
                      ? 'bg-blue-400 text-white font-medium shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Link
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
            ${isActive
              ? 'bg-blue-400 text-white font-medium shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
          <span className={`text-lg ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
          <span className="font-medium text-sm">{item.name}</span>
        </Link>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const pathname = usePathname();
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

  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-[260px] z-40 bg-gray-50/60 backdrop-blur-sm border-r border-gray-200"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-5 border-b border-stone-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-base tracking-tight">Purchase ERP</h1>
            <p className="text-gray-400 text-xs">구매관리시스템</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-8 py-2 bg-gray-100 border-0 rounded-lg text-sm text-gray-700 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-gray-200 px-1.5 py-0.5 rounded">⌘K</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar h-[calc(100vh-180px)]">
        <div className="space-y-0.5">
          {navigationItems.map((item) => (
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
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-medium text-sm">홍</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">홍길동</p>
            <p className="text-xs text-gray-500 truncate">구매팀</p>
          </div>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
