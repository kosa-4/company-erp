'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Calendar, User, FileText, Upload, Eye } from 'lucide-react';
import { 
  Card, 
  Button, 
  Input, 
  DatePicker,
  Textarea,
  DataGrid,
  SearchPanel,
  Modal,
  ModalFooter
} from '@/components/ui';
import { Notice, ColumnDef } from '@/types';

// Mock 데이터
const mockNotices: Notice[] = [
  {
    noticeNo: 'NOTC-2024-0010',
    title: '연말 결산 관련 구매 마감 안내',
    content: '2024년 연말 결산을 위해 12월 27일까지 모든 구매요청을 완료해 주시기 바랍니다.',
    startDate: '2024-12-20',
    endDate: '2024-12-31',
    createdAt: '2024-12-20',
    createdBy: 'admin',
    createdByName: '관리자',
  },
  {
    noticeNo: 'NOTC-2024-0009',
    title: '시스템 정기점검 안내 (12/30)',
    content: '12월 30일 00:00 ~ 06:00 시스템 정기점검이 예정되어 있습니다.',
    startDate: '2024-12-26',
    endDate: '2024-12-30',
    createdAt: '2024-12-26',
    createdBy: 'admin',
    createdByName: '관리자',
  },
  {
    noticeNo: 'NOTC-2024-0008',
    title: '신규 협력업체 등록 절차 변경',
    content: '2025년 1월 1일부터 협력업체 등록 절차가 변경됩니다. 상세 내용을 확인해 주세요.',
    startDate: '2024-12-24',
    endDate: '2025-01-31',
    createdAt: '2024-12-24',
    createdBy: 'admin',
    createdByName: '관리자',
  },
  {
    noticeNo: 'NOTC-2024-0007',
    title: '구매 시스템 신규 기능 안내',
    content: '견적비교 기능이 추가되었습니다. 자세한 사용법은 매뉴얼을 참고해 주세요.',
    startDate: '2024-12-15',
    endDate: '2024-12-31',
    createdAt: '2024-12-15',
    createdBy: 'admin',
    createdByName: '관리자',
  },
];

export default function NoticePage() {
  const [notices] = useState<Notice[]>(mockNotices);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    title: '',
  });
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      title: '',
    });
  };

  const handleRowClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDetailModalOpen(true);
  };

  const columns: ColumnDef<Notice>[] = [
    {
      key: 'noticeNo',
      header: '공지번호',
      width: 140,
      align: 'center',
    },
    {
      key: 'title',
      header: '공지명',
      align: 'left',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '등록일자',
      width: 120,
      align: 'center',
    },
    {
      key: 'createdByName',
      header: '등록자명',
      width: 100,
      align: 'center',
    },
    {
      key: 'startDate',
      header: '공지 시작일',
      width: 120,
      align: 'center',
    },
    {
      key: 'endDate',
      header: '공지 종료일',
      width: 120,
      align: 'center',
    },
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Page Header - 무채색 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">공지사항</h1>
            <p className="text-sm text-gray-500">시스템 공지사항을 확인할 수 있습니다.</p>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          등록
        </Button>
      </div>

      {/* Search Panel */}
      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <DatePicker
          label="공지기간 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="공지기간 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Input
          label="공지명"
          placeholder="공지명을 입력하세요"
          value={searchParams.title}
          onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
        />
      </SearchPanel>

      {/* Data Grid */}
      <Card 
        title="공지사항 목록"
        padding={false}
      >
        <DataGrid
          columns={columns}
          data={notices}
          keyField="noticeNo"
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="등록된 공지사항이 없습니다."
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="공지사항 상세"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsDetailModalOpen(false)}
            cancelText="닫기"
          />
        }
      >
        {selectedNotice && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedNotice.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedNotice.createdByName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedNotice.createdAt}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <Calendar className="w-4 h-4" />
                공지기간: {selectedNotice.startDate} ~ {selectedNotice.endDate}
              </span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 min-h-[200px]">
              <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{selectedNotice.content}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="공지사항 등록"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsCreateModalOpen(false)}
            onConfirm={() => {
              alert('저장되었습니다.');
              setIsCreateModalOpen(false);
            }}
            confirmText="저장"
          />
        }
      >
        <div className="space-y-5">
          <Input label="공지명" placeholder="공지명을 입력하세요" required />
          
          <div className="grid grid-cols-2 gap-4">
            <DatePicker label="공지 시작일" required />
            <DatePicker label="공지 종료일" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="등록일자" value={new Date().toISOString().split('T')[0]} readOnly />
            <Input label="등록자명" value="홍길동" readOnly />
          </div>

          <Textarea label="공지내용" rows={8} placeholder="공지 내용을 입력하세요" required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm text-gray-600">클릭하여 파일을 선택하거나 드래그하여 업로드</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLSX, 이미지 파일 (최대 10MB)</p>
              </div>
            </div>
        </div>
      </Modal>
    </motion.div>
  );
}
