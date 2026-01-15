'use client';

import React, { useState } from 'react';
import { 
  Megaphone, 
  Calendar,
  X 
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  Badge 
} from '@/components/ui';



export default function VendorNoticePage() {
  const [notices] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    title: '',
  });
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleRowClick = (notice: any) => {
    setSelectedNotice(notice);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">공지사항</h1>
          <p className="text-sm text-gray-500">시스템 공지사항을 확인할 수 있습니다.</p>
        </div>
      </div>

      {/* 검색 패널 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">시작일</label>
            <Input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">종료일</label>
            <Input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">공지명</label>
            <div className="flex gap-2">
              <Input
                placeholder="공지명을 입력하세요"
                value={searchParams.title}
                onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
              />
              <Button variant="primary" onClick={handleSearch} disabled={loading}>
                {loading ? '검색중...' : '검색'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium text-center w-32">공지번호</th>
                <th className="px-6 py-3 font-medium">공지명</th>
                <th className="px-6 py-3 font-medium text-center w-32">등록일자</th>
                <th className="px-6 py-3 font-medium text-center w-24">등록자</th>
                <th className="px-6 py-3 font-medium text-center w-48">게시기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <tr 
                  key={notice.noticeNo} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(notice)}
                >
                  <td className="px-6 py-4 text-center font-medium text-gray-900">{notice.noticeNo}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium hover:text-emerald-600 transition-colors">
                      {notice.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">{notice.createdAt}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{notice.createdByName}</td>
                  <td className="px-6 py-4 text-center text-xs text-gray-500">
                    {notice.startDate} ~ {notice.endDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-300">
                      {selectedNotice.noticeNo}
                   </Badge>
                   <span className="text-xs text-gray-400">|</span>
                   <span className="text-xs text-gray-500">{selectedNotice.createdByName}</span>
                   <span className="text-xs text-gray-400">|</span>
                   <span className="text-xs text-gray-500">{selectedNotice.createdAt}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {selectedNotice.title}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mr-2 -mt-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-800 font-medium">
                  게시 기간 : {selectedNotice.startDate} ~ {selectedNotice.endDate}
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedNotice.content}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
