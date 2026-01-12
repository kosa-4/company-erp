'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, FileText, Users, Building2, ChevronRight, Bell, TrendingUp, ArrowUpRight } from 'lucide-react';

// 애니메이션 variants
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
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function VendorHomePage() {
  const quickLinks = [
    {
      title: '발주서 조회',
      description: '수신된 발주서를 확인하고 수신확인',
      href: '/vendor/order/list',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      badge: 3,
    },
    {
      title: '견적현황',
      description: '견적 요청 확인 및 견적서 작성',
      href: '/vendor/rfq/submit',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
      badge: 2,
    },
    {
      title: '담당자관리',
      description: '협력사 소속 담당자 관리',
      href: '/vendor/master/users',
      icon: Users,
      gradient: 'from-purple-500 to-indigo-500',
      shadowColor: 'shadow-purple-500/20',
    },
    {
      title: '협력업체 변경신청',
      description: '협력업체 정보 변경 신청',
      href: '/vendor/master/info',
      icon: Building2,
      gradient: 'from-orange-500 to-amber-500',
      shadowColor: 'shadow-orange-500/20',
    },
  ];

  const stats = [
    { label: '미확인 발주', value: 3, change: '+2', isUp: true, color: 'text-red-600', bgColor: 'bg-red-50' },
    { label: '진행중 견적', value: 5, change: '+1', isUp: true, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: '이번 달 낙찰', value: 2, change: '+2', isUp: true, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner with Gradient & Glass */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Floating orbs */}
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
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
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                시스템 정상 운영중
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                협력사 포탈
              </h1>
              <p className="text-emerald-100 text-lg max-w-md">
                발주 수신, 견적 제출 등 협력사 업무를 처리할 수 있습니다.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/vendor/order/list"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-2xl font-semibold shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
              >
                발주서 확인하기
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500 font-medium">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-xs text-stone-400">건</span>
                </div>
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                <TrendingUp className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs">
              <span className="text-emerald-500 font-medium">{stat.change}</span>
              <span className="text-stone-400">지난주 대비</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Links Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-stone-900">빠른 접근</h2>
          <span className="text-sm text-stone-400">자주 사용하는 메뉴</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={link.href}
                className={`relative group block bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-xl ${link.shadowColor} transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Badge */}
                {link.badge && (
                  <span className="absolute top-4 right-4 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {link.badge}
                  </span>
                )}
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.gradient} p-3 mb-4 shadow-lg ${link.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <link.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-teal-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-stone-500 mb-3">{link.description}</p>
                
                <div className="flex items-center text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>바로가기</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">최근 알림</h3>
              <p className="text-xs text-stone-500">Today</p>
            </div>
          </div>
          <Link href="/vendor/mypage/notice" className="text-sm text-teal-600 font-medium hover:underline">
            전체보기
          </Link>
        </div>
        <div className="divide-y divide-stone-50">
          {[
            { title: '새로운 발주서가 도착했습니다.', time: '10분 전', type: 'order' },
            { title: '견적 요청이 접수되었습니다.', time: '1시간 전', type: 'rfq' },
            { title: '시스템 정기점검 안내', time: '3시간 전', type: 'notice' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ backgroundColor: "rgba(20, 184, 166, 0.03)" }}
              className="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'order' ? 'bg-blue-500' : 
                  item.type === 'rfq' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <span className="text-stone-700">{item.title}</span>
              </div>
              <span className="text-xs text-stone-400">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
