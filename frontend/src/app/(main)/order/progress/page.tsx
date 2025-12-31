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
import { formatNumber } from '@/lib/utils';

interface OrderProgress {
  poNo: string;
  poName: string;
  purchaseType: string;
  buyer: string;
  progressStatus: 'SAVED' | 'CONFIRMED' | 'PENDING' | 'APPROVED' | 'SENT' | 'DELIVERED' | 'CLOSED';
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  amount: number;
  deliveryDate: string;
  paymentTerms: string;
  storageLocation: string;
  remark: string;
}

const mockData: OrderProgress[] = [
  {
    poNo: 'PO-2024-0234',
    poName: '개발팀 모니터 발주',
    purchaseType: '일반',
    buyer: '홍길동',
    progressStatus: 'SENT',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    itemCode: 'ITM-2024-0002',
    itemName: '27인치 모니터',
    spec: '27" QHD, IPS, 75Hz',
    unit: 'EA',
    unitPrice: 340000,
    orderQuantity: 10,
    amount: 3400000,
    deliveryDate: '2025-01-10',
    paymentTerms: '당월말',
    storageLocation: '본사 창고',
    remark: '',
  },
  {
    poNo: 'PO-2024-0233',
    poName: '사무용품 발주',
    purchaseType: '단가계약',
    buyer: '홍길동',
    progressStatus: 'APPROVED',
    vendorCode: 'VND-2024-0002',
    vendorName: '(주)오피스프로',
    itemCode: 'ITM-2024-0004',
    itemName: 'A4 복사용지',
    spec: 'A4, 80g, 500매/박스',
    unit: 'BOX',
    unitPrice: 24000,
    orderQuantity: 50,
    amount: 1200000,
    deliveryDate: '2025-01-08',
    paymentTerms: '익월말',
    storageLocation: '본사 창고',
    remark: '',
  },
  {
    poNo: 'PO-2024-0232',
    poName: '키보드 마우스 발주',
    purchaseType: '일반',
    buyer: '홍길동',
    progressStatus: 'PENDING',
    vendorCode: 'VND-2024-0002',
    vendorName: '(주)오피스프로',
    itemCode: 'ITM-2024-0003',
    itemName: '무선 키보드 마우스 세트',
    spec: '무선 2.4GHz, USB 수신기',
    unit: 'SET',
    unitPrice: 45000,
    orderQuantity: 20,
    amount: 900000,
    deliveryDate: '2025-01-12',
    paymentTerms: '당월말',
    storageLocation: '본사 창고',
    remark: '',
  },
  {
    poNo: 'PO-2024-0231',
    poName: '노트북 발주',
    purchaseType: '일반',
    buyer: '홍길동',
    progressStatus: 'DELIVERED',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    itemCode: 'ITM-2024-0001',
    itemName: '노트북 (15인치)',
    spec: '15.6" FHD, i7, 16GB, 512GB SSD',
    unit: 'EA',
    unitPrice: 1450000,
    orderQuantity: 5,
    amount: 7250000,
    deliveryDate: '2024-12-28',
    paymentTerms: '당월말',
    storageLocation: '본사 창고',
    remark: '',
  },
];

export default function OrderProgressPage() {
  const [data] = useState<OrderProgress[]>(mockData);
  const [selectedRows, setSelectedRows] = useState<OrderProgress[]>([]);
  const [searchParams, setSearchParams] = useState({
    poNo: '',
    poName: '',
    buyer: '',
    vendor: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<OrderProgress | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      poNo: '',
      poName: '',
      buyer: '',
      vendor: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  };



  const getStatusBadge = (status: OrderProgress['progressStatus']) => {
    const config = {
      SAVED: { variant: 'gray' as const, label: '저장' },
      CONFIRMED: { variant: 'blue' as const, label: '확정' },
      PENDING: { variant: 'yellow' as const, label: '승인대기' },
      APPROVED: { variant: 'green' as const, label: '승인' },
      SENT: { variant: 'blue' as const, label: '발주전송' },
      DELIVERED: { variant: 'green' as const, label: '납품완료' },
      CLOSED: { variant: 'gray' as const, label: '종결' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRowClick = (row: OrderProgress) => {
    setSelectedPo(row);
    setIsDetailModalOpen(true);
  };

  const columns: ColumnDef<OrderProgress>[] = [
    {
      key: 'poNo',
      header: 'PO번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    { key: 'poName', header: '발주명', width: 150, align: 'left' },
    { key: 'purchaseType', header: '구매유형', width: 90, align: 'center' },
    { key: 'buyer', header: '발주담당자', width: 100, align: 'center' },
    {
      key: 'progressStatus',
      header: '진행상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as OrderProgress['progressStatus']),
    },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', width: 150, align: 'left' },
    { key: 'spec', header: '규격', width: 150, align: 'left' },
    { key: 'unit', header: '단위', width: 60, align: 'center' },
    { 
      key: 'unitPrice', 
      header: '단가', 
      width: 100, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { 
      key: 'orderQuantity', 
      header: '발주수량', 
      width: 90, 
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    { 
      key: 'amount', 
      header: '금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'deliveryDate', header: '납기가능일', width: 100, align: 'center' },
    { key: 'paymentTerms', header: '결제조건', width: 80, align: 'center' },
    { key: 'storageLocation', header: '저장위치', width: 100, align: 'left' },
  ];

  const handleApprove = () => {
    const pendingItems = selectedRows.filter(r => r.progressStatus === 'PENDING');
    if (pendingItems.length === 0) {
      alert('승인대기 상태의 항목만 승인할 수 있습니다.');
      return;
    }
    alert(`${pendingItems.length}건이 승인되었습니다.`);
    setSelectedRows([]);
  };

  const handleReject = () => {
    const pendingItems = selectedRows.filter(r => r.progressStatus === 'PENDING');
    if (pendingItems.length === 0) {
      alert('승인대기 상태의 항목만 반려할 수 있습니다.');
      return;
    }
    const reason = prompt('반려사유를 입력해주세요.');
    if (reason) {
      alert(`${pendingItems.length}건이 반려되었습니다.`);
      setSelectedRows([]);
    }
  };

  const handleClose = () => {
    const deliveredItems = selectedRows.filter(r => r.progressStatus === 'DELIVERED');
    if (deliveredItems.length === 0) {
      alert('납품완료 상태의 항목만 종결할 수 있습니다.');
      return;
    }
    alert(`${deliveredItems.length}건이 종결되었습니다.`);
    setSelectedRows([]);
  };

  return (
    <div>
      <PageHeader 
        title="발주진행현황" 
        subtitle="발주 진행 상황을 조회하고 관리합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PO번호"
          placeholder="PO번호 입력"
          value={searchParams.poNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, poNo: e.target.value }))}
        />
        <Input
          label="발주명"
          placeholder="발주명 입력"
          value={searchParams.poName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, poName: e.target.value }))}
        />
        <Input
          label="발주담당자"
          placeholder="담당자명 입력"
          value={searchParams.buyer}
          onChange={(e) => setSearchParams(prev => ({ ...prev, buyer: e.target.value }))}
        />
        <Input
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendor}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendor: e.target.value }))}
        />
        <DatePicker
          label="발주일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="발주일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Select
          label="진행상태"
          value={searchParams.status}
          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'SAVED', label: '저장' },
            { value: 'CONFIRMED', label: '확정' },
            { value: 'PENDING', label: '승인대기' },
            { value: 'APPROVED', label: '승인' },
            { value: 'SENT', label: '발주전송' },
            { value: 'DELIVERED', label: '납품완료' },
            { value: 'CLOSED', label: '종결' },
          ]}
        />
      </SearchPanel>

      <Card 
        title="발주진행 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary">수정 및 확정</Button>
            <Button variant="success" onClick={handleApprove}>승인</Button>
            <Button variant="danger" onClick={handleReject}>반려</Button>
            <Button variant="warning" onClick={handleClose}>종결</Button>
          </div>
        }
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="poNo"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowClick={handleRowClick}
          emptyMessage="발주 내역이 없습니다."
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="발주 상세"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsDetailModalOpen(false)}
            cancelText="닫기"
          />
        }
      >
        {selectedPo && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">{selectedPo.poName}</h3>
              {getStatusBadge(selectedPo.progressStatus)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">PO번호</label>
                <p className="font-medium">{selectedPo.poNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">구매유형</label>
                <p className="font-medium">{selectedPo.purchaseType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">협력업체</label>
                <p className="font-medium">{selectedPo.vendorName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">발주담당자</label>
                <p className="font-medium">{selectedPo.buyer}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">수량</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">단가</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">금액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 text-sm">{selectedPo.itemCode}</td>
                    <td className="p-3 text-sm">{selectedPo.itemName}</td>
                    <td className="p-3 text-sm text-right">{formatNumber(selectedPo.orderQuantity)}</td>
                    <td className="p-3 text-sm text-right">₩{formatNumber(selectedPo.unitPrice)}</td>
                    <td className="p-3 text-sm text-right font-medium">₩{formatNumber(selectedPo.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 발주금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(selectedPo.amount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

