'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DatePicker,
  DataGrid,
  SearchPanel,
  Badge,
  Modal,
  ModalFooter
} from '@/components/ui';
import { ColumnDef } from '@/types';

interface ReceivingRecord {
  grNo: string;
  status: 'PARTIAL' | 'COMPLETE' | 'CANCELED';
  receiver: string;
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  receivedQuantity: number;
  receivedAmount: number;
  receivedDateTime: string;
  storageLocation: string;
  remark: string;
}

const mockData: ReceivingRecord[] = [
  {
    grNo: 'GR-2024-0178',
    status: 'COMPLETE',
    receiver: '김입고',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    itemCode: 'ITM-2024-0001',
    itemName: '노트북 (15인치)',
    spec: '15.6" FHD, i7, 16GB, 512GB SSD',
    unit: 'EA',
    receivedQuantity: 5,
    receivedAmount: 7250000,
    receivedDateTime: '2024-12-28 14:30',
    storageLocation: '본사 창고',
    remark: '',
  },
  {
    grNo: 'GR-2024-0177',
    status: 'PARTIAL',
    receiver: '홍길동',
    vendorCode: 'VND-2024-0002',
    vendorName: '(주)오피스프로',
    itemCode: 'ITM-2024-0004',
    itemName: 'A4 복사용지',
    spec: 'A4, 80g, 500매/박스',
    unit: 'BOX',
    receivedQuantity: 30,
    receivedAmount: 720000,
    receivedDateTime: '2024-12-27 10:15',
    storageLocation: '본사 창고',
    remark: '나머지 20박스 1/5 입고 예정',
  },
  {
    grNo: 'GR-2024-0176',
    status: 'CANCELED',
    receiver: '홍길동',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    itemCode: 'ITM-2024-0002',
    itemName: '27인치 모니터',
    spec: '27" QHD, IPS, 75Hz',
    unit: 'EA',
    receivedQuantity: 3,
    receivedAmount: 1020000,
    receivedDateTime: '2024-12-26 16:45',
    storageLocation: '본사 창고',
    remark: '품질 불량으로 취소',
  },
];

export default function ReceivingListPage() {
  const [data] = useState<ReceivingRecord[]>(mockData);
  const [selectedRows, setSelectedRows] = useState<ReceivingRecord[]>([]);
  const [searchParams, setSearchParams] = useState({
    grNo: '',
    receiver: '',
    vendor: '',
    item: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGr, setSelectedGr] = useState<ReceivingRecord | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      grNo: '',
      receiver: '',
      vendor: '',
      item: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getStatusBadge = (status: ReceivingRecord['status']) => {
    const config = {
      PARTIAL: { variant: 'yellow' as const, label: '부분입고' },
      COMPLETE: { variant: 'green' as const, label: '입고완료' },
      CANCELED: { variant: 'red' as const, label: '입고취소' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRowClick = (row: ReceivingRecord) => {
    setSelectedGr(row);
    setIsDetailModalOpen(true);
  };

  const columns: ColumnDef<ReceivingRecord>[] = [
    {
      key: 'grNo',
      header: '입고번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: '입고상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as ReceivingRecord['status']),
    },
    { key: 'receiver', header: '입고담당자', width: 100, align: 'center' },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', width: 140, align: 'left' },
    { key: 'spec', header: '규격', width: 150, align: 'left' },
    { key: 'unit', header: '단위', width: 60, align: 'center' },
    { 
      key: 'receivedQuantity', 
      header: '입고수량', 
      width: 90, 
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    { 
      key: 'receivedAmount', 
      header: '입고금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'receivedDateTime', header: '입고일시', width: 140, align: 'center' },
    { key: 'storageLocation', header: '저장위치', width: 100, align: 'left' },
    { 
      key: 'remark', 
      header: '비고', 
      width: 150, 
      align: 'left',
      render: (value) => (
        <span className="truncate block max-w-[150px]" title={String(value)}>
          {String(value) || '-'}
        </span>
      ),
    },
  ];

  const handleAdjust = () => {
    const partialItems = selectedRows.filter(r => r.status === 'PARTIAL');
    if (partialItems.length === 0) {
      alert('부분입고 상태의 항목만 조정할 수 있습니다.');
      return;
    }
    if (partialItems.length > 1) {
      alert('한 건씩만 조정할 수 있습니다.');
      return;
    }
    // 입고조정 모달 열기 (상세 모달과 동일한 구조 사용)
    setSelectedGr(partialItems[0]);
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="입고현황" 
        subtitle="입고 처리 내역을 조회합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="입고번호"
          placeholder="입고번호 입력"
          value={searchParams.grNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, grNo: e.target.value }))}
        />
        <Input
          label="입고담당자"
          placeholder="담당자명 입력"
          value={searchParams.receiver}
          onChange={(e) => setSearchParams(prev => ({ ...prev, receiver: e.target.value }))}
        />
        <Input
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendor}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendor: e.target.value }))}
        />
        <Input
          label="품목명/품목코드"
          placeholder="품목 검색"
          value={searchParams.item}
          onChange={(e) => setSearchParams(prev => ({ ...prev, item: e.target.value }))}
        />
        <DatePicker
          label="입고일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="입고일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Select
          label="입고상태"
          value={searchParams.status}
          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'PARTIAL', label: '부분입고' },
            { value: 'COMPLETE', label: '입고완료' },
            { value: 'CANCELED', label: '입고취소' },
          ]}
        />
      </SearchPanel>

      <Card 
        title="입고현황 목록"
        padding={false}
        actions={
          <Button variant="secondary" onClick={handleAdjust}>입고조정</Button>
        }
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="grNo"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowClick={handleRowClick}
          emptyMessage="입고 내역이 없습니다."
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedGr?.status === 'PARTIAL' ? '입고 조정' : '입고 상세'}
        size="lg"
        footer={
          selectedGr?.status === 'PARTIAL' ? (
            <>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
              <Button variant="danger" onClick={() => {
                const reason = prompt('취소 사유를 입력해주세요.');
                if (reason) {
                  alert('입고가 취소되었습니다.');
                  setIsDetailModalOpen(false);
                }
              }}>취소</Button>
              <Button variant="primary" onClick={() => {
                alert('수정되었습니다.');
                setIsDetailModalOpen(false);
              }}>수정</Button>
            </>
          ) : (
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              cancelText="닫기"
            />
          )
        }
      >
        {selectedGr && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">입고번호: {selectedGr.grNo}</h3>
              {getStatusBadge(selectedGr.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">입고담당자</label>
                <p className="font-medium">{selectedGr.receiver}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">입고일시</label>
                <p className="font-medium">{selectedGr.receivedDateTime}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">협력업체</label>
                <p className="font-medium">{selectedGr.vendorName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">저장위치</label>
                <p className="font-medium">{selectedGr.storageLocation}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">규격</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">입고수량</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">입고금액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 text-sm">{selectedGr.itemCode}</td>
                    <td className="p-3 text-sm">{selectedGr.itemName}</td>
                    <td className="p-3 text-sm">{selectedGr.spec}</td>
                    <td className="p-3 text-sm text-right">{formatNumber(selectedGr.receivedQuantity)} {selectedGr.unit}</td>
                    <td className="p-3 text-sm text-right font-medium">₩{formatNumber(selectedGr.receivedAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {selectedGr.remark && (
              <div>
                <label className="text-sm text-gray-500">비고</label>
                <p className="mt-1 text-gray-700">{selectedGr.remark}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 입고금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(selectedGr.receivedAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

