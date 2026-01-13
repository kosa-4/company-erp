'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { 
  FileText, Package, Clipboard, Bell, 
  TrendingUp, ChevronRight, Building2, User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

// 대시보드 통계 카드
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
  delay?: number;
}> = ({ title, value, change, changeType = 'neutral', icon, gradient, shadowColor, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
    className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <p className="text-3xl font-bold text-stone-900 mt-2">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            changeType === 'positive' ? 'text-emerald-600' : 
            changeType === 'negative' ? 'text-red-500' : 'text-stone-500'
          }`}>
            {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-3 shadow-lg ${shadowColor}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// 빠른 링크 카드
const QuickLinkCard: React.FC<{
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
  badge?: number;
  delay?: number;
}> = ({ href, title, description, icon, gradient, shadowColor, badge, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -6, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      href={href}
      className={`relative group block bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-xl ${shadowColor} transition-all duration-300 overflow-hidden`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Badge */}
      {badge && (
        <span className="absolute top-4 right-4 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {badge}
        </span>
      )}
      
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-3 mb-4 shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      
      <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-stone-500 mb-3">{description}</p>
      
      <div className="flex items-center text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span>바로가기</span>
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  </motion.div>
);

/**
 * 협력사(Vendor) 홈 페이지
 * - comType이 'V'인 사용자만 접근 가능
 * - 협력사 전용 대시보드 및 빠른 링크 제공
 */
export default function VendorHomePage() {
  const { user } = useAuth();

  const stats = [
    { 
      title: '수신 발주', value: '12', change: '3건 신규', changeType: 'positive' as const,
      icon: <Package className="w-full h-full text-white" />,
      gradient: 'from-indigo-500 to-purple-500', shadowColor: 'shadow-indigo-500/20'
    },
    { 
      title: '견적 요청', value: '8', change: '2건 긴급', changeType: 'negative' as const,
      icon: <Clipboard className="w-full h-full text-white" />,
      gradient: 'from-orange-500 to-amber-500', shadowColor: 'shadow-orange-500/20'
    },
    { 
      title: '납품 예정', value: '5', change: '금주 마감', changeType: 'neutral' as const,
      icon: <FileText className="w-full h-full text-white" />,
      gradient: 'from-emerald-500 to-teal-500', shadowColor: 'shadow-emerald-500/20'
    },
    { 
      title: '완료 건수', value: '156', change: '이번 달', changeType: 'positive' as const,
      icon: <TrendingUp className="w-full h-full text-white" />,
      gradient: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/20'
    },
  ];

  const quickLinks = [
    { href: '/vendor/rfq/submit', title: '견적 제출', description: '견적 요청 확인 및 제출', 
      icon: <Clipboard className="w-full h-full text-white" />, gradient: 'from-orange-500 to-amber-500', shadowColor: 'shadow-orange-500/20', badge: 3 },
    { href: '/vendor/order', title: '발주 현황', description: '발주 수신 및 처리', 
      icon: <Package className="w-full h-full text-white" />, gradient: 'from-indigo-500 to-purple-500', shadowColor: 'shadow-indigo-500/20', badge: 2 },
    { href: '/vendor/rfq/result', title: '견적 결과', description: '견적 결과 확인', 
      icon: <FileText className="w-full h-full text-white" />, gradient: 'from-emerald-500 to-teal-500', shadowColor: 'shadow-emerald-500/20' },
    { href: '/vendor/master/info', title: '업체 정보', description: '업체 정보 관리', 
      icon: <Building2 className="w-full h-full text-white" />, gradient: 'from-stone-500 to-stone-600', shadowColor: 'shadow-stone-500/20' },
    { href: '/vendor/master/users', title: '담당자 관리', description: '담당자 정보 관리', 
      icon: <User className="w-full h-full text-white" />, gradient: 'from-blue-500 to-indigo-500', shadowColor: 'shadow-blue-500/20' },
    { href: '/vendor/mypage/notice', title: '공지사항', description: '공지사항 확인', 
      icon: <Bell className="w-full h-full text-white" />, gradient: 'from-amber-500 to-orange-500', shadowColor: 'shadow-amber-500/20' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Floating orbs */}
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm mb-4"
              >
                <Building2 className="w-4 h-4" />
                협력사 포털
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                환영합니다, {user?.userId || '협력사'}님! 🤝
              </h1>
              <p className="text-purple-100 text-lg max-w-md">
                구매사와의 원활한 협업을 위한 포털입니다.
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20"
              >
                <p className="text-4xl font-bold text-white">5</p>
                <p className="text-sm text-purple-100">견적 마감 임박</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20"
              >
                <p className="text-4xl font-bold text-white">3</p>
                <p className="text-sm text-purple-100">신규 발주</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={0.2 + index * 0.1}
          />
        ))}
      </motion.div>

      {/* Quick Links Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-stone-900">빠른 메뉴</h2>
          <span className="text-sm text-stone-400">자주 사용하는 메뉴</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link, index) => (
            <QuickLinkCard
              key={link.href}
              {...link}
              delay={0.3 + index * 0.1}
            />
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 견적 요청 */}
        <Card title="최근 견적 요청" padding={false}>
          <div className="divide-y divide-stone-50">
            {[
              { rfqNo: 'RFQ-2024-0156', title: '노트북 외 3건', deadline: '2024.12.30', status: '긴급', statusColor: 'bg-red-50 text-red-600' },
              { rfqNo: 'RFQ-2024-0155', title: '모니터 20대', deadline: '2024.12.31', status: '일반', statusColor: 'bg-blue-50 text-blue-600' },
              { rfqNo: 'RFQ-2024-0154', title: '사무용품', deadline: '2025.01.02', status: '일반', statusColor: 'bg-blue-50 text-blue-600' },
            ].map((item, index) => (
              <motion.div
                key={item.rfqNo}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.03)" }}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 ${item.statusColor} text-xs font-medium rounded-full`}>
                      {item.status}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{item.title}</p>
                      <p className="text-xs text-stone-500">{item.rfqNo}</p>
                    </div>
                  </div>
                  <span className="text-xs text-stone-400">마감 {item.deadline}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-stone-100">
            <Link href="/vendor/rfq/submit">
              <Button variant="ghost" fullWidth>
                전체 견적 요청 보기
              </Button>
            </Link>
          </div>
        </Card>

        {/* 공지사항 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-stone-900">공지사항</h3>
            </div>
            <Link href="/vendor/mypage/notice" className="text-sm text-indigo-600 font-medium hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {[
              { title: '연말 결산 관련 납품 마감 안내', date: '2024.12.27', type: '중요', typeColor: 'bg-red-50 text-red-600' },
              { title: '시스템 정기점검 안내 (12/30)', date: '2024.12.26', type: '공지', typeColor: 'bg-blue-50 text-blue-600' },
              { title: '견적 제출 절차 변경 안내', date: '2024.12.24', type: '일반', typeColor: 'bg-stone-100 text-stone-600' },
            ].map((notice, index) => (
              <motion.a
                key={index}
                href="/vendor/mypage/notice"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.03)" }}
                className="block p-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 ${notice.typeColor} text-xs font-medium rounded-full`}>
                    {notice.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{notice.title}</p>
                    <p className="text-xs text-stone-500 mt-1">{notice.date}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
          <div className="p-4 border-t border-stone-100">
            <Button variant="ghost" fullWidth>
              전체 공지 보기
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
