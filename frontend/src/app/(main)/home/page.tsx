'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import {
  FileText, Package, Clipboard, Warehouse, Building2, LayoutGrid,
  TrendingUp, TrendingDown, Bell, ChevronRight, Circle, Square, Triangle, Hexagon, Octagon, Pentagon
} from 'lucide-react';
import { mypageApi } from '@/lib/api/mypage';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, DashboardData } from '@/lib/api/dashboard';
import { toast } from 'sonner';
import { noticeApi, NoticeListResponse } from '@/lib/api/notice';

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
          <div className={`flex items-center gap-1 mt-1.5 text-xs ${changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`}>
            {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
            {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
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
  type: 'request' | 'rfq' | 'order' | 'receiving';
  title: string;
  description: string;
  time: string;
}> = ({ type, title, description, time }) => {
  const typeConfig = {
    request: { color: 'bg-gray-400' },
    rfq: { color: 'bg-gray-500' },
    order: { color: 'bg-gray-600' },
    receiving: { color: 'bg-gray-700' },
  };

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
      <div className={`w-1.5 h-1.5 mt-2 rounded-full ${typeConfig[type].color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [notices, setNotices] = useState<NoticeListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, dbData, noticeData] = await Promise.all([
        mypageApi.getInitData(),
        dashboardApi.getBuyerData(),
        noticeApi.getList()
      ]);

      setUserName(userData.userNameKo || '');
      setDashboardData(dbData);
      setNotices(noticeData.slice(0, 3));
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // 구매사 전용 통계 매핑
  const stats = [
    {
      title: '이번 달 구매요청', value: dashboardData?.stats.prCount ?? '0', change: dashboardData?.stats.prChange || '0% 증가', changeType: 'positive' as const,
      icon: <Circle className="w-full h-full" />
    },
    {
      title: '진행중 견적', value: dashboardData?.stats.activeRfqCount ?? '0', change: dashboardData?.stats.rfqChange || '전월대비 0건', changeType: 'neutral' as const,
      icon: <Square className="w-full h-full" />
    },
    {
      title: '발주 완료', value: dashboardData?.stats.poCompletedCount ?? '0', change: dashboardData?.stats.poChange || '목표 대비 100%', changeType: 'positive' as const,
      icon: <Triangle className="w-full h-full" />
    },
    {
      title: '입고 대기', value: dashboardData?.stats.grWaitingCount ?? '0', change: dashboardData?.stats.grChange || '지연 없음', changeType: 'negative' as const,
      icon: <Hexagon className="w-full h-full" />
    },
  ];

  const quickLinks = [
    {
      href: '/purchase/request', title: '구매요청', description: '새 구매요청 등록',
      icon: <FileText className="w-full h-full" />
    },
    {
      href: '/rfq/pending', title: '견적대기', description: '견적 요청 대기목록',
      icon: <Clipboard className="w-full h-full" />, badge: dashboardData?.stats.pendingProcessCount
    },
    // TODO: 발주대기 건수 집계 API 추가 필요 (현재 더미 데이터)
    {
      href: '/order/pending', title: '발주대기', description: '발주 대기목록',
      icon: <Package className="w-full h-full" />, badge: 3
    },
    {
      href: '/inventory/receiving-target', title: '입고대상', description: '입고 처리 대상',
      icon: <Warehouse className="w-full h-full" />
    },
    {
      href: '/master/item', title: '품목관리', description: '품목 현황 조회',
      icon: <LayoutGrid className="w-full h-full" />
    },
    {
      href: '/master/vendor', title: '협력업체', description: '협력업체 관리',
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
              안녕하세요, {userName || '사용자'}님
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              오늘도 효율적인 구매 업무를 시작해보세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{dashboardData?.stats.pendingProcessCount ?? 0}</p>
              <p className="text-xs text-gray-500">처리 대기</p>
            </div>
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{dashboardData?.stats.pendingApprovalCount ?? 0}</p>
              <p className="text-xs text-gray-500">승인 대기</p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <QuickLinkCard key={link.href} {...link} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 최근 활동 */}
        <Card title="최근 활동" className="lg:col-span-2" padding={false}>
          <div className="divide-y divide-gray-50">
            {dashboardData?.activities.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">최근 활동이 없습니다.</div>
            ) : (
              dashboardData?.activities.map((activity, idx) => (
                <ActivityItem
                  key={idx}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  time={activity.regDate?.substring(0, 10) || ''}
                />
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-100">
            <Button variant="ghost" fullWidth size="sm">
              전체 활동 보기
            </Button>
          </div>
        </Card>

        {/* 공지사항 */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">공지사항</h3>
            </div>
            <Link href="/mypage/notice" className="text-xs text-gray-500 hover:text-gray-700">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {notices.map((notice) => (
              <Link
                key={notice.noticeNum}
                href="/mypage/notice"
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500">
                    일반
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{notice.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notice.regDate?.substring(0, 10) || '-'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100">
            <Button variant="ghost" fullWidth size="sm">
              전체 공지 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
