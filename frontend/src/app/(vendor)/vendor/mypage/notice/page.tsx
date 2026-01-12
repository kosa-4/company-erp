'use client';

import React, { useState } from 'react';
import { Bell, Calendar, ChevronRight, Pin } from 'lucide-react';

// 임시 Mock 데이터
const mockNotices = [
  {
    id: 1,
    title: '2025년 상반기 협력업체 평가 안내',
    content: '2025년 상반기 협력업체 평가가 진행됩니다. 상세 내용을 확인해주세요.',
    date: '2025-01-10',
    isPinned: true,
    isRead: false,
  },
  {
    id: 2,
    title: '시스템 정기 점검 안내 (1/15)',
    content: '1월 15일 오전 2시~6시 시스템 정기 점검이 예정되어 있습니다.',
    date: '2025-01-08',
    isPinned: true,
    isRead: true,
  },
  {
    id: 3,
    title: '견적서 양식 변경 안내',
    content: '2025년부터 견적서 양식이 변경됩니다. 첨부된 양식을 확인해주세요.',
    date: '2025-01-05',
    isPinned: false,
    isRead: true,
  },
  {
    id: 4,
    title: '연말정산 서류 제출 안내',
    content: '2024년 연말정산 관련 서류 제출 기한을 안내드립니다.',
    date: '2024-12-20',
    isPinned: false,
    isRead: true,
  },
];

export default function VendorNoticePage() {
  const [notices] = useState(mockNotices);
  const [selectedNotice, setSelectedNotice] = useState<typeof mockNotices[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
        <p className="text-gray-500 mt-1">중요 공지사항을 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-4 ${
                    selectedNotice?.id === notice.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.isPinned && (
                        <Pin className="w-4 h-4 text-emerald-500" />
                      )}
                      {!notice.isRead && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                      <span className={`font-medium ${notice.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notice.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{notice.date}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notice Detail */}
        <div className="lg:col-span-1">
          {selectedNotice ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                {selectedNotice.isPinned && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    중요
                  </span>
                )}
                <span className="text-sm text-gray-400">{selectedNotice.date}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {selectedNotice.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {selectedNotice.content}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">공지사항을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
