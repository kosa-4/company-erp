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
  SearchPanel
} from '@/components/ui';
import { ColumnDef } from '@/types';

interface RfqResult {
  rfqNo: string;
  rfqName: string;
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  deliveryDate: string;
  paymentTerms: string;
  submittedDate: string;
  selectedDate: string;
  buyer: string;
  poCreated: boolean;
}

const mockData: RfqResult[] = [
  {
    rfqNo: 'RFQ-2024-0088',
    rfqName: '사무용품 견적',
    vendorCode: 'VND-2024-0002',
    vendorName: '(주)오피스프로',
    itemCode: 'ITM-2024-0004',
    itemName: 'A4 복사용지',
    spec: 'A4, 80g, 500매/박스',
    unit: 'BOX',
    unitPrice: 24000,
    quantity: 50,
    totalAmount: 1200000,
    deliveryDate: '2025-01-08',
    paymentTerms: '익월말',
    submittedDate: '2024-12-27',
    selectedDate: '2024-12-28',
    buyer: '홍길동',
    poCreated: true,
  },
  {
    rfqNo: 'RFQ-2024-0085',
    rfqName: '모니터 구매 견적',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    itemCode: 'ITM-2024-0002',
    itemName: '27인치 모니터',
    spec: '27" QHD, IPS, 75Hz',
    unit: 'EA',
    unitPrice: 340000,
    quantity: 10,
    totalAmount: 3400000,
    deliveryDate: '2025-01-10',
    paymentTerms: '당월말',
    submittedDate: '2024-12-25',
    selectedDate: '2024-12-26',
    buyer: '홍길동',
    poCreated: false,
  },
];

export default function RfqResultPage() {
  const [data] = useState<RfqResult[]>(mockData);
  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    startDate: '',
    endDate: '',
    rfqType: '',
    poCreated: '',
    vendorName: '',
    buyer: '',
  });
  const [loading, setLoading] = useState(false);

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
      poCreated: '',
      vendorName: '',
      buyer: '',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const columns: ColumnDef<RfqResult>[] = [
    {
      key: 'rfqNo',
      header: 'RFQ번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    { key: 'rfqName', header: '견적명', width: 150, align: 'left' },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', width: 140, align: 'left' },
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
      key: 'quantity', 
      header: '수량', 
      width: 70, 
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    { 
      key: 'totalAmount', 
      header: '총 견적금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'deliveryDate', header: '납기가능일', width: 100, align: 'center' },
    { key: 'paymentTerms', header: '결제조건', width: 80, align: 'center' },
    { key: 'submittedDate', header: '제출일', width: 100, align: 'center' },
    { key: 'selectedDate', header: '선정일', width: 100, align: 'center' },
    { key: 'buyer', header: '구매담당자', width: 100, align: 'center' },
    { 
      key: 'poCreated', 
      header: 'PO생성여부', 
      width: 100, 
      align: 'center',
      render: (value) => (
        <span className={value ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
          {value ? 'Y' : 'N'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="협력업체 선정결과" 
        subtitle="선정완료된 견적 결과를 조회합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
          label="PO생성여부"
          value={searchParams.poCreated}
          onChange={(e) => setSearchParams(prev => ({ ...prev, poCreated: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'Y', label: 'Y' },
            { value: 'N', label: 'N' },
          ]}
        />
        <Input
          label="협력사명"
          placeholder="협력사명 입력"
          value={searchParams.vendorName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendorName: e.target.value }))}
        />
        <Input
          label="구매담당자"
          placeholder="담당자명 입력"
          value={searchParams.buyer}
          onChange={(e) => setSearchParams(prev => ({ ...prev, buyer: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="선정결과 목록"
        padding={false}
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="rfqNo"
          loading={loading}
          emptyMessage="선정결과 내역이 없습니다."
        />
      </Card>
    </div>
  );
}

