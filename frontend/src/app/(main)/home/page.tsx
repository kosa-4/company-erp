'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

// 대시보드 통계 카드
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}> = ({ title, value, change, changeType = 'neutral', icon, color, iconBg }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            changeType === 'positive' ? 'text-emerald-600' : 
            changeType === 'negative' ? 'text-red-500' : 'text-stone-500'
          }`}>
            {changeType === 'positive' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {changeType === 'negative' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        {icon}
      </div>
    </div>
    {/* Progress bar */}
    <div className="mt-4">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: '72%' }}></div>
      </div>
    </div>
  </div>
);

// 최근 활동 아이템
const ActivityItem: React.FC<{
  type: 'request' | 'rfq' | 'order' | 'receiving';
  title: string;
  description: string;
  time: string;
}> = ({ type, title, description, time }) => {
  const typeConfig = {
    request: { color: 'bg-blue-50 text-blue-600', icon: '📋' },
    rfq: { color: 'bg-indigo-50 text-indigo-600', icon: '📝' },
    order: { color: 'bg-orange-50 text-orange-600', icon: '📦' },
    receiving: { color: 'bg-emerald-50 text-emerald-600', icon: '🏪' },
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig[type].color}`}>
        <span>{typeConfig[type].icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
};

// 빠른 링크 카드
const QuickLinkCard: React.FC<{
  href: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}> = ({ href, title, description, icon, color }) => (
  <Link
    href={href}
    className="block p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 group"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </Link>
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 환영 섹션 */}
      <div className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 rounded-2xl p-8 text-white shadow-lg shadow-blue-200/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">안녕하세요, 홍길동님! 👋</h1>
            <p className="text-blue-50">오늘도 효율적인 구매 업무를 시작해보세요.</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-blue-50">처리 대기</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-blue-50">승인 대기</p>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="이번 달 구매요청"
          value="156"
          change="12% 증가"
          changeType="positive"
          color="bg-gradient-to-r from-blue-300 to-indigo-300"
          iconBg="bg-blue-50"
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          title="진행중 견적"
          value="23"
          change="전월대비 5건"
          changeType="neutral"
          color="bg-gradient-to-r from-purple-300 to-pink-300"
          iconBg="bg-purple-50"
          icon={<svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          title="발주 완료"
          value="89"
          change="목표 대비 92%"
          changeType="positive"
          color="bg-gradient-to-r from-amber-300 to-orange-300"
          iconBg="bg-amber-50"
          icon={<svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <StatCard
          title="입고 대기"
          value="17"
          change="3건 지연"
          changeType="negative"
          color="bg-gradient-to-r from-emerald-300 to-teal-300"
          iconBg="bg-emerald-50"
          icon={<svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
        />
      </div>

      {/* 빠른 링크 */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickLinkCard
            href="/purchase/request"
            title="구매요청"
            description="새 구매요청 등록"
            icon="🛒"
            color="bg-blue-50"
          />
          <QuickLinkCard
            href="/rfq/pending"
            title="견적대기"
            description="견적 요청 대기목록"
            icon="📝"
            color="bg-indigo-50"
          />
          <QuickLinkCard
            href="/order/pending"
            title="발주대기"
            description="발주 대기목록"
            icon="📦"
            color="bg-orange-50"
          />
          <QuickLinkCard
            href="/inventory/receiving-target"
            title="입고대상"
            description="입고 처리 대상"
            icon="🏪"
            color="bg-emerald-50"
          />
          <QuickLinkCard
            href="/master/item"
            title="품목관리"
            description="품목 현황 조회"
            icon="📋"
            color="bg-stone-100"
          />
          <QuickLinkCard
            href="/master/vendor"
            title="협력업체"
            description="협력업체 관리"
            icon="🏢"
            color="bg-indigo-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 활동 */}
        <Card title="최근 활동" className="lg:col-span-2" padding={false}>
          <div className="divide-y divide-stone-100">
            <ActivityItem
              type="request"
              title="구매요청 PR-2024-0156 등록"
              description="노트북 외 3건 - 김철수"
              time="5분 전"
            />
            <ActivityItem
              type="rfq"
              title="견적서 제출 완료"
              description="(주)테크솔루션 - RFQ-2024-0089"
              time="1시간 전"
            />
            <ActivityItem
              type="order"
              title="발주 승인 완료"
              description="PO-2024-0234 - 총 ₩15,000,000"
              time="2시간 전"
            />
            <ActivityItem
              type="receiving"
              title="입고 처리 완료"
              description="GR-2024-0178 - 모니터 20대"
              time="3시간 전"
            />
            <ActivityItem
              type="request"
              title="구매요청 승인 요청"
              description="사무용품 구매 - 박영희"
              time="4시간 전"
            />
          </div>
          <div className="p-4 border-t border-stone-100">
            <Button variant="ghost" fullWidth>
              전체 활동 보기
            </Button>
          </div>
        </Card>

        {/* 알림 & 공지 */}
        <Card title="공지사항" padding={false}>
          <div className="divide-y divide-gray-100">
            <a href="/mypage/notice" className="block p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">중요</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">연말 결산 관련 구매 마감 안내</p>
                  <p className="text-xs text-gray-500 mt-1">2024.12.27</p>
                </div>
              </div>
            </a>
            <a href="/mypage/notice" className="block p-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">공지</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">시스템 정기점검 안내 (12/30)</p>
                  <p className="text-xs text-gray-500 mt-1">2024.12.26</p>
                </div>
              </div>
            </a>
            <a href="/mypage/notice" className="block p-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">일반</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">신규 협력업체 등록 절차 변경</p>
                  <p className="text-xs text-stone-500 mt-1">2024.12.24</p>
                </div>
              </div>
            </a>
          </div>
          <div className="p-4 border-t border-stone-100">
            <Button variant="ghost" fullWidth>
              전체 공지 보기
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
