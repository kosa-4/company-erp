'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DataGrid,
  SearchPanel,
  Modal,
  ModalFooter,
  DatePicker,
  Textarea
} from '@/components/ui';
import { ColumnDef } from '@/types';

interface PendingOrder {
  rfqNo: string;
  rfqName: string;
  purchaseType: string;
  buyer: string;
  rfqDate: string;
  selectedDate: string;
  vendorCode: string;
  vendorName: string;
  quantity: number;
  totalAmount: number;
  deliveryDate: string;
  storageLocation: string;
}

const mockData: PendingOrder[] = [
  {
    rfqNo: 'RFQ-2024-0085',
    rfqName: '모니터 구매 견적',
    purchaseType: '일반',
    buyer: '홍길동',
    rfqDate: '2024-12-24',
    selectedDate: '2024-12-26',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    quantity: 10,
    totalAmount: 3400000,
    deliveryDate: '2025-01-10',
    storageLocation: '본사 창고',
  },
  {
    rfqNo: 'RFQ-2024-0083',
    rfqName: '키보드 마우스 세트',
    purchaseType: '단가계약',
    buyer: '홍길동',
    rfqDate: '2024-12-22',
    selectedDate: '2024-12-24',
    vendorCode: 'VND-2024-0002',
    vendorName: '(주)오피스프로',
    quantity: 20,
    totalAmount: 900000,
    deliveryDate: '2025-01-08',
    storageLocation: '본사 창고',
  },
];

export default function OrderPendingPage() {
  const [data] = useState<PendingOrder[]>(mockData);
  const [selectedRows, setSelectedRows] = useState<PendingOrder[]>([]);
  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    purchaseType: '',
    rfqName: '',
    department: '',
    buyer: '',
  });
  const [loading, setLoading] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      rfqNo: '',
      purchaseType: '',
      rfqName: '',
      department: '',
      buyer: '',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const columns: ColumnDef<PendingOrder>[] = [
    {
      key: 'rfqNo',
      header: 'RFQ번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 font-medium">{String(value)}</span>
      ),
    },
    { key: 'rfqName', header: '견적명', align: 'left' },
    { key: 'purchaseType', header: '구매유형', width: 90, align: 'center' },
    { key: 'buyer', header: '구매담당자', width: 100, align: 'center' },
    { key: 'rfqDate', header: '견적요청일', width: 100, align: 'center' },
    { key: 'selectedDate', header: '선정완료일', width: 100, align: 'center' },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { 
      key: 'quantity', 
      header: '수량', 
      width: 80, 
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    { 
      key: 'totalAmount', 
      header: '총금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'deliveryDate', header: '납기희망일', width: 100, align: 'center' },
    { key: 'storageLocation', header: '저장위치', width: 100, align: 'left' },
  ];

  const handleCreateOrder = () => {
    if (selectedRows.length === 0) {
      alert('발주할 항목을 선택해주세요.');
      return;
    }
    setIsOrderModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="발주대기목록" 
        subtitle="발주 대기 중인 견적을 조회합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
        <Select
          label="구매유형"
          value={searchParams.purchaseType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, purchaseType: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'GENERAL', label: '일반' },
            { value: 'CONTRACT', label: '단가계약' },
            { value: 'URGENT', label: '긴급' },
          ]}
        />
        <Input
          label="견적명"
          placeholder="견적명 입력"
          value={searchParams.rfqName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqName: e.target.value }))}
        />
        <Select
          label="요청부서"
          value={searchParams.department}
          onChange={(e) => setSearchParams(prev => ({ ...prev, department: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: '개발팀', label: '개발팀' },
            { value: '총무팀', label: '총무팀' },
            { value: '영업팀', label: '영업팀' },
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
        title="발주대기 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={handleCreateOrder}>발주</Button>
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
          emptyMessage="발주 대기 중인 항목이 없습니다."
        />
      </Card>

      {/* 발주 작성 모달 */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="발주서 작성"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOrderModalOpen(false)}>닫기</Button>
            <Button variant="secondary">저장</Button>
            <Button variant="primary" onClick={() => {
              alert('발주가 확정되었습니다.');
              setIsOrderModalOpen(false);
              setSelectedRows([]);
            }}>확정</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="PO번호" value="자동채번" readOnly />
            <Input label="발주명" placeholder="발주명 입력" required />
            <Input label="발주담당자" value="홍길동" readOnly />
            <Input label="협력업체" value={selectedRows[0]?.vendorName || ''} readOnly />
            <DatePicker label="발주일자" />
            <Input label="발주총금액" value={`₩${formatNumber(selectedRows.reduce((sum, r) => sum + r.totalAmount, 0))}`} readOnly />
          </div>

          {/* 품목 목록 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">품목 목록</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">협력사</th>
                    <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right font-semibold text-gray-600">단가</th>
                    <th className="p-3 text-right font-semibold text-gray-600">발주수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">금액</th>
                    <th className="p-3 text-center font-semibold text-gray-600">납기가능일</th>
                    <th className="p-3 text-left font-semibold text-gray-600">저장위치</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRows.map((row) => (
                    <tr key={row.rfqNo} className="border-t">
                      <td className="p-3">{row.vendorName}</td>
                      <td className="p-3">{row.rfqName}</td>
                      <td className="p-3 text-right">₩{formatNumber(row.totalAmount / row.quantity)}</td>
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          defaultValue={row.quantity}
                          className="w-20 px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="p-3 text-right font-medium">₩{formatNumber(row.totalAmount)}</td>
                      <td className="p-3 text-center">{row.deliveryDate}</td>
                      <td className="p-3">{row.storageLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Textarea label="비고" placeholder="비고 입력" rows={2} />
        </div>
      </Modal>
    </div>
  );
}

