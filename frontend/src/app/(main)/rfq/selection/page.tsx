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
  Modal
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';

interface RfqSelection {
  rfqNo: string;
  rfqName: string;
  rfqType: string;
  buyer: string;
  createdAt: string;
  itemCode: string;
  itemName: string;
  estimatedAmount: number;
  quotedAmount: number | null;
  vendorName: string;
  vendorCode: string;
  status: 'CLOSED' | 'OPENED' | 'SELECTED';
  sentDate: string;
  submittedDate: string;
}



export default function RfqSelectionPage() {
  const [data] = useState<RfqSelection[]>([]);
  const [selectedRows, setSelectedRows] = useState<RfqSelection[]>([]);
  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    startDate: '',
    endDate: '',
    rfqType: '',
    status: '',
    buyer: '',
  });
  const [loading, setLoading] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      rfqNo: '',
      rfqName: '',
      startDate: '',
      endDate: '',
      rfqType: '',
      status: '',
      buyer: '',
    });
  };



  const getStatusBadge = (status: RfqSelection['status']) => {
    const config = {
      CLOSED: { variant: 'gray' as const, label: '마감' },
      OPENED: { variant: 'blue' as const, label: '개찰' },
      SELECTED: { variant: 'green' as const, label: '선정완료' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<RfqSelection>[] = [
    {
      key: 'rfqNo',
      header: '견적번호',
      width: 110,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    { key: 'rfqName', header: '견적명', width: 200, align: 'left' },
    { key: 'rfqType', header: '견적유형', width: 80, align: 'center' },
    { key: 'buyer', header: '구매담당자', width: 90, align: 'center' },
    { key: 'createdAt', header: '등록일', width: 90, align: 'center' },
    { key: 'itemCode', header: '품목코드', width: 120, align: 'center' },
    { key: 'itemName', header: '품목명', width: 140, align: 'left' },
    { 
      key: 'estimatedAmount', 
      header: '예상금액', 
      width: 110, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { 
      key: 'quotedAmount', 
      header: '견적금액', 
      width: 110, 
      align: 'right',
      render: (value, row) => {
        if (row.status === 'CLOSED') {
          return <span className="text-gray-400">***</span>;
        }
        return value ? `₩${formatNumber(Number(value))}` : '-';
      },
    },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'vendorCode', header: '협력사코드', width: 120, align: 'center' },
    {
      key: 'status',
      header: '상태',
      width: 90,
      align: 'center',
      render: (value) => getStatusBadge(value as RfqSelection['status']),
    },
    { key: 'sentDate', header: '전송일', width: 90, align: 'center' },
    { key: 'submittedDate', header: '제출일', width: 90, align: 'center' },
  ];

  const handleOpen = () => {
    const closedItems = selectedRows.filter(r => r.status === 'CLOSED');
    if (closedItems.length === 0) {
      alert('마감 상태의 항목만 개찰할 수 있습니다.');
      return;
    }
    alert(`${closedItems.length}건이 개찰되었습니다. 견적금액이 공개됩니다.`);
    setSelectedRows([]);
  };

  const handleSelect = () => {
    const openedItems = selectedRows.filter(r => r.status === 'OPENED');
    if (openedItems.length === 0) {
      alert('개찰 상태의 항목만 선정할 수 있습니다.');
      return;
    }
    alert('협력업체가 선정되었습니다.');
    setSelectedRows([]);
  };

  return (
    <div>
      <PageHeader 
        title="협력업체 선정" 
        subtitle="마감된 견적에 대해 협력업체를 선정합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="RFQ번호"
          placeholder="RFQ번호 입력"
          value={searchParams.rfqNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqNo: e.target.value }))}
        />
        <DatePicker
          label="견적일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="견적일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Input
          label="견적명"
          placeholder="견적명 입력"
          value={searchParams.rfqName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqName: e.target.value }))}
        />
        <Select
          label="견적유형"
          value={searchParams.rfqType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqType: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'PRIVATE', label: '수의계약' },
            { value: 'COMPETITIVE', label: '지명경쟁' },
          ]}
        />
        <Select
          label="상태"
          value={searchParams.status}
          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'CLOSED', label: '마감' },
            { value: 'OPENED', label: '개찰' },
            { value: 'SELECTED', label: '선정완료' },
          ]}
        />
        <Input
          label="구매담당자"
          placeholder="담당자명 입력"
          value={searchParams.buyer}
          onChange={(e) => setSearchParams(prev => ({ ...prev, buyer: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="협력업체 선정 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleOpen}>개찰</Button>
            <Button variant="secondary" onClick={() => setIsCompareModalOpen(true)}>견적비교</Button>
            <Button variant="success" onClick={handleSelect}>선정</Button>
          </div>
        }
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="rfqNo"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          emptyMessage="협력업체 선정 대상이 없습니다."
        />
      </Card>

      {/* 견적비교 모달 */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="견적 비교"
        size="xl"
      >
        <div className="space-y-4">
          {/* 헤더 정보 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">RFQ번호:</span>
              <span className="ml-2 font-medium">RFQ-2024-0088</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">견적명:</span>
              <span className="ml-2 font-medium">사무용품 견적</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">총 예상금액:</span>
              <span className="ml-2 font-medium text-blue-600">₩1,250,000</span>
            </div>
          </div>

          {/* 비교 테이블 */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-600">협력사코드</th>
                  <th className="p-3 text-left font-semibold text-gray-600">협력사명</th>
                  <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                  <th className="p-3 text-right font-semibold text-gray-600">단가</th>
                  <th className="p-3 text-right font-semibold text-gray-600">수량</th>
                  <th className="p-3 text-right font-semibold text-gray-600">금액</th>
                  <th className="p-3 text-center font-semibold text-gray-600">납기가능일</th>
                  <th className="p-3 text-center font-semibold text-gray-600">제출일</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-blue-50">
                  <td className="p-3">VND-2024-0002</td>
                  <td className="p-3 font-medium">(주)오피스프로</td>
                  <td className="p-3">A4 복사용지</td>
                  <td className="p-3 text-right">₩24,000</td>
                  <td className="p-3 text-right">50</td>
                  <td className="p-3 text-right font-medium text-blue-600">₩1,200,000</td>
                  <td className="p-3 text-center">2025-01-08</td>
                  <td className="p-3 text-center">2024-12-27</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3">VND-2024-0001</td>
                  <td className="p-3">(주)테크솔루션</td>
                  <td className="p-3">A4 복사용지</td>
                  <td className="p-3 text-right">₩25,500</td>
                  <td className="p-3 text-right">50</td>
                  <td className="p-3 text-right">₩1,275,000</td>
                  <td className="p-3 text-center">2025-01-10</td>
                  <td className="p-3 text-center">2024-12-28</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary">엑셀다운로드</Button>
            <Button variant="secondary" onClick={() => setIsCompareModalOpen(false)}>닫기</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

