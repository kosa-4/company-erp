'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Package, LogOut } from 'lucide-react';
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
    <div className="mb-1">
      {hasChildren ? (
        <>
          <motion.button
            onClick={onToggle}
            whileHover={{ x: 4 }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isChildActive 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100' 
                : 'text-stone-600 hover:bg-stone-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isChildActive 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30' 
                  : 'bg-stone-100 group-hover:bg-stone-200'
              }`}>
                <span className={`text-sm ${isChildActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-700'}`}>
                  {item.icon}
                </span>
              </div>
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            <motion.div
              animate={{ rotate: shouldExpand ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 ml-4 pl-4 border-l-2 border-stone-100 space-y-1">
                  {item.children?.map((child, idx) => (
                    <motion.div
                      key={child.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200
                          ${pathname === child.href
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-md shadow-blue-500/25'
                            : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                          }`}
                      >
                        {child.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div whileHover={{ x: 4 }}>
          <Link
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-stone-600 hover:bg-stone-50'
              }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isActive ? 'bg-white/20' : 'bg-stone-100 group-hover:bg-stone-200'
            }`}>
              <span className={`text-sm ${isActive ? 'text-white' : 'text-stone-500'}`}>{item.icon}</span>
            </div>
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        </motion.div>
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
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen w-[260px] z-40 bg-white/80 backdrop-blur-xl border-r border-stone-200/50"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-5 border-b border-stone-100">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <Package className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-stone-900 font-bold text-base tracking-tight group-hover:text-blue-600 transition-colors">Purchase ERP</h1>
            <p className="text-stone-400 text-xs">구매관리시스템</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border-0 rounded-xl text-sm text-stone-700 placeholder-stone-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium bg-stone-100 px-1.5 py-0.5 rounded">⌘K</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
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
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100 bg-gradient-to-t from-white to-transparent">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">홍</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900 truncate">홍길동</p>
            <p className="text-xs text-stone-500 truncate">구매팀</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
