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
  Badge
} from '@/components/ui';
import { ColumnDef } from '@/types';

interface RfqProgress {
  rfqNo: string;
  rfqName: string;
  rfqType: string;
  buyer: string;
  createdAt: string;
  vendorName: string;
  vendorCode: string;
  status: 'TEMP' | 'SENT' | 'SUBMITTED';
  sentDate: string;
  submittedDate: string;
}

const mockData: RfqProgress[] = [
  {
    rfqNo: 'RFQ-2024-0089',
    rfqName: '개발팀 노트북 견적',
    rfqType: '지명경쟁',
    buyer: '홍길동',
    createdAt: '2024-12-27',
    vendorName: '(주)테크솔루션',
    vendorCode: 'VND-2024-0001',
    status: 'SUBMITTED',
    sentDate: '2024-12-27',
    submittedDate: '2024-12-28',
  },
  {
    rfqNo: 'RFQ-2024-0089',
    rfqName: '개발팀 노트북 견적',
    rfqType: '지명경쟁',
    buyer: '홍길동',
    createdAt: '2024-12-27',
    vendorName: '(주)오피스프로',
    vendorCode: 'VND-2024-0002',
    status: 'SENT',
    sentDate: '2024-12-27',
    submittedDate: '',
  },
  {
    rfqNo: 'RFQ-2024-0088',
    rfqName: '사무용품 견적',
    rfqType: '수의계약',
    buyer: '홍길동',
    createdAt: '2024-12-26',
    vendorName: '(주)오피스프로',
    vendorCode: 'VND-2024-0002',
    status: 'SUBMITTED',
    sentDate: '2024-12-26',
    submittedDate: '2024-12-27',
  },
  {
    rfqNo: 'RFQ-2024-0087',
    rfqName: '테스트 견적',
    rfqType: '수의계약',
    buyer: '홍길동',
    createdAt: '2024-12-25',
    vendorName: '글로벌IT',
    vendorCode: 'VND-2024-0003',
    status: 'TEMP',
    sentDate: '',
    submittedDate: '',
  },
];

export default function RfqProgressPage() {
  const [data] = useState<RfqProgress[]>(mockData);
  const [selectedRows, setSelectedRows] = useState<RfqProgress[]>([]);
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

  const getStatusBadge = (status: RfqProgress['status']) => {
    const config = {
      TEMP: { variant: 'gray' as const, label: '임시저장' },
      SENT: { variant: 'yellow' as const, label: '요청중' },
      SUBMITTED: { variant: 'green' as const, label: '제출완료' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<RfqProgress>[] = [
    {
      key: 'rfqNo',
      header: '견적번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    { key: 'rfqName', header: '견적명', align: 'left' },
    { key: 'rfqType', header: '견적유형', width: 90, align: 'center' },
    { key: 'buyer', header: '구매담당자', width: 100, align: 'center' },
    { key: 'createdAt', header: '등록일', width: 100, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 150, align: 'left' },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as RfqProgress['status']),
    },
    { key: 'sentDate', header: '전송일', width: 100, align: 'center' },
    { key: 'submittedDate', header: '제출일', width: 100, align: 'center' },
  ];

  const handleSend = () => {
    const tempItems = selectedRows.filter(r => r.status === 'TEMP');
    if (tempItems.length === 0) {
      alert('임시저장 상태의 항목만 전송할 수 있습니다.');
      return;
    }
    alert(`${tempItems.length}건이 전송되었습니다.`);
    setSelectedRows([]);
  };

  const handleClose = () => {
    const sendableItems = selectedRows.filter(r => r.status === 'SENT' || r.status === 'SUBMITTED');
    if (sendableItems.length === 0) {
      alert('요청중 또는 제출완료 상태의 항목만 마감할 수 있습니다.');
      return;
    }
    alert(`${sendableItems.length}건이 마감되었습니다.`);
    setSelectedRows([]);
  };

  return (
    <div>
      <PageHeader 
        title="견적진행현황" 
        subtitle="견적 요청 진행 상황을 조회합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
            { value: 'TEMP', label: '임시저장' },
            { value: 'SENT', label: '요청중' },
            { value: 'SUBMITTED', label: '제출완료' },
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
        title="견적진행 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary">수정</Button>
            <Button variant="primary" onClick={handleSend}>전송</Button>
            <Button variant="warning" onClick={handleClose}>마감</Button>
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
          emptyMessage="견적 진행 내역이 없습니다."
        />
      </Card>
    </div>
  );
}

