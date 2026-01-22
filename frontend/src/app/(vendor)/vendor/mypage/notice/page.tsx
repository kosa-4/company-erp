'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Calendar,
  X,
  Search,
  FileText,
  Download
} from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  Badge 
} from '@/components/ui';
import { noticeApi, NoticeListResponse, NoticeDetailResponse, FileListItemResponse } from '@/lib/api/notice';
import { Notice } from '@/types';
import { toast } from 'sonner';



export default function VendorNoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    title: '',
  });
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileListItemResponse[]>([]);

  // 공지사항 목록 조회
  const fetchNoticeList = async () => {
    try {
      setLoading(true);
      const response = await noticeApi.getList({
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
        subject: searchParams.title || undefined,
      });
      
      // NoticeListResponse를 Notice 타입으로 변환
      const transformedNotices: Notice[] = response.map((item: NoticeListResponse) => ({
        noticeNo: item.noticeNum,
        title: item.subject,
        content: '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        createdAt: item.regDate || '',
        createdBy: item.regUserId || '',
        createdByName: item.regUserName || '',
      }));
      
      setNotices(transformedNotices);
    } catch (error: any) {
      console.error('공지사항 목록 조회 실패:', error);
      toast.error(error?.data?.error || error?.message || '공지사항 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 목록 로드
  useEffect(() => {
    fetchNoticeList();
  }, []);

  const handleSearch = async () => {
    await fetchNoticeList();
  };

  const handleReset = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      title: '',
    });
  };

  const handleNoticeNoClick = async (notice: Notice, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 방지
    try {
      setIsDetailModalOpen(true);
      // 상세 조회 API 호출
      const detail = await noticeApi.getDetail(notice.noticeNo);
      
      // NoticeDetailResponse를 Notice 타입으로 변환
      const noticeDetail: Notice = {
        noticeNo: detail.noticeNum,
        title: detail.subject,
        content: detail.content,
        startDate: detail.startDate,
        endDate: detail.endDate,
        createdAt: detail.regDate,
        createdBy: detail.regUserId,
        createdByName: detail.regUserName,
        modDate: detail.modDate,
        viewCnt: detail.viewCnt || 0,
      };
      
      setSelectedNotice(noticeDetail);
      // 첨부파일 목록 설정
      setAttachedFiles(detail.files || []);
    } catch (error: any) {
      console.error('공지사항 상세 조회 실패:', error);
      toast.error(error?.data?.error || error?.message || '공지사항 상세를 불러오는데 실패했습니다.');
      setIsDetailModalOpen(false);
      setAttachedFiles([]);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button variant="primary" onClick={handleSearch} disabled={loading} className="px-3">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="secondary" onClick={handleReset} disabled={loading} className="px-3">
                초기화
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
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
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <span 
                        className="font-medium text-blue-600 hover:underline cursor-pointer"
                        onClick={(e) => handleNoticeNoClick(notice, e)}
                      >
                        {notice.noticeNo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">
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
        )}
      </Card>

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                   <Badge variant="gray" className="text-xs font-normal text-gray-500 border-gray-300">
                      {selectedNotice.noticeNo}
                   </Badge>
                   <span className="text-xs text-gray-400">|</span>
                   <span className="text-xs text-gray-500">{selectedNotice.createdByName}</span>
                   <span className="text-xs text-gray-400">|</span>
                   <span className="text-xs text-gray-500">등록일: {selectedNotice.createdAt}</span>
                   {selectedNotice.modDate && (
                     <>
                       <span className="text-xs text-gray-400">|</span>
                       <span className="text-xs text-gray-500">수정일: {selectedNotice.modDate}</span>
                     </>
                   )}
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

              {/* 첨부파일 목록 */}
              {attachedFiles.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
                  <div className="space-y-2">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.fileNum}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => noticeApi.downloadFile(file.fileNum)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.originName}</p>
                            <p className="text-xs text-gray-500">
                              {file.fileSize ? formatFileSize(file.fileSize) : '0 Bytes'}
                            </p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <Button variant="secondary" onClick={() => {
                setIsDetailModalOpen(false);
                setAttachedFiles([]);
              }}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
