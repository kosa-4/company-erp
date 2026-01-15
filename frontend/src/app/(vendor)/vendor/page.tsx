'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { 
  Package, FileText, Users, Building2, Bell, ChevronRight, 
  Circle, Square, Triangle, Hexagon, Warehouse, LayoutGrid, Clipboard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// 대시보드 통계 카드 (심플 버전)
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}> = ({ title, value, change, changeType = 'neutral', icon }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
          }`}>
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 p-2">
        {icon}
      </div>
    </div>
  </div>
);

// 빠른 링크 카드 (심플 버전)
const QuickLinkCard: React.FC<{
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: number;
}> = ({ href, title, description, icon, badge }) => (
  <Link
    href={href}
    className="relative block bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
  >
    {badge && (
      <span className="absolute top-3 right-3 min-w-[20px] h-5 bg-gray-700 text-white text-xs font-medium rounded-full flex items-center justify-center px-1.5">
        {badge}
      </span>
    )}
    <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 p-2 mb-3">
      {icon}
    </div>
    <h3 className="font-medium text-gray-900 mb-0.5">{title}</h3>
    <p className="text-xs text-gray-500">{description}</p>
  </Link>
);

// 최근 활동 아이템
const ActivityItem: React.FC<{
  type: 'order' | 'rfq' | 'notice';
  title: string;
  time: string;
}> = ({ type, title, time }) => {
  const typeConfig = {
    order: { color: 'bg-blue-500' },
    rfq: { color: 'bg-emerald-500' },
    notice: { color: 'bg-amber-500' },
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${typeConfig[type].color}`} />
        <span className="text-sm text-gray-700">{title}</span>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
};

export default function VendorHomePage() {
  const { user } = useAuth();
  
  const stats = [
    { title: '미확인 발주', value: '3', change: '+2 건', changeType: 'negative' as const, // 미확인은 negative(빨강) 등 주의 필요
      icon: <Package className="w-full h-full" /> },
    { title: '진행중 견적', value: '5', change: '+1 건', changeType: 'neutral' as const,
      icon: <FileText className="w-full h-full" /> },
    { title: '이번 달 낙찰', value: '2', change: '+2 건', changeType: 'positive' as const,
      icon: <Circle className="w-full h-full" /> },
    { title: '납품 예정', value: '1', change: 'D-3', changeType: 'neutral' as const,
      icon: <Warehouse className="w-full h-full" /> },
  ];

  const quickLinks = [
    { 
      href: '/vendor/order/list', 
      title: '발주서 조회', 
      description: '수신된 발주서 확인', 
      icon: <Package className="w-full h-full" />,
      badge: 3
    },
    { 
      href: '/vendor/rfq/submit', 
      title: '견적현황', 
      description: '견적 요청 및 제출', 
      icon: <FileText className="w-full h-full" />,
      badge: 2 
    },
    { 
      href: '/vendor/master/users', 
      title: '담당자관리', 
      description: '소속 담당자 관리', 
      icon: <Users className="w-full h-full" /> 
    },
    { 
      href: '/vendor/master/info', 
      title: '정보변경', 
      description: '업체 정보 변경 신청', 
      icon: <Building2 className="w-full h-full" /> 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simple Welcome Banner */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              안녕하세요, {user?.userName || '홍길동'}님
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              협력사 포털에 오신 것을 환영합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">1</p>
              <p className="text-xs text-gray-500">견적 요청</p>
            </div>
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">3</p>
              <p className="text-xs text-gray-500">발주 대기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Links Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">빠른 메뉴</h2>
          <span className="text-xs text-gray-400">자주 사용하는 메뉴</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <QuickLinkCard key={link.href} {...link} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 최근 알림 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">최근 알림</h3>
            </div>
            <Link href="/vendor/mypage/notice" className="text-xs text-gray-500 hover:text-gray-700">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            <ActivityItem type="order" title="새로운 발주서가 도착했습니다." time="10분 전" />
            <ActivityItem type="rfq" title="견적 요청이 접수되었습니다." time="1시간 전" />
            <ActivityItem type="notice" title="시스템 정기점검 안내" time="3시간 전" />
          </div>
        </div>

        {/* 공지사항 (간략) */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">공지사항</h3>
            <Link href="/vendor/mypage/notice" className="text-xs text-gray-500 hover:text-gray-700">
              더보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { title: '시스템 점검 안내', date: '2024.12.30', type: '공지' },
              { title: '신규 기능 업데이트', date: '2024.12.24', type: '일반' },
            ].map((notice, index) => (
              <Link
                key={index}
                href="/vendor/mypage/notice"
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                   <span className={`px-1.5 py-0.5 text-xs rounded ${
                    notice.type === '공지' ? 'bg-gray-200 text-gray-700' : 
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {notice.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{notice.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notice.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
