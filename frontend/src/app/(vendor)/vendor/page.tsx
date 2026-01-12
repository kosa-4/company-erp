'use client';

import React from 'react';
import Link from 'next/link';
import { Package, FileText, Users, Building2 } from 'lucide-react';

export default function VendorHomePage() {
  const quickLinks = [
    {
      title: '발주서 조회',
      description: '수신된 발주서를 확인하고 수신확인을 합니다.',
      href: '/vendor/order/list',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '견적현황',
      description: '견적 요청을 확인하고 견적서를 작성합니다.',
      href: '/vendor/rfq/submit',
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: '담당자관리',
      description: '협력사 소속 담당자를 관리합니다.',
      href: '/vendor/master/users',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '협력업체 변경신청',
      description: '협력업체 정보 변경을 신청합니다.',
      href: '/vendor/master/info',
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">협력사 포탈</h1>
        <p className="text-emerald-100 text-lg">
          발주 수신, 견적 제출 등 협력사 업무를 처리할 수 있습니다.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 접근</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200"
            >
              <div className={`w-12 h-12 ${link.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <link.icon className={`w-6 h-6 bg-gradient-to-br ${link.color} bg-clip-text text-emerald-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">미확인 발주</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3건</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-semibold">!</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">진행중 견적</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">5건</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">이번 달 낙찰</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2건</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-semibold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
