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

interface VendorUser {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  vendorCode: string;
  vendorName: string;
  userId: string;
  userName: string;
  phone: string;
  email: string;
  createdAt: string;
  isBlocked: boolean;
}



export default function VendorUserPage() {
  const [vendorUsers] = useState<VendorUser[]>([]);
  const [selectedRows, setSelectedRows] = useState<VendorUser[]>([]);
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    vendorName: '',
    isBlocked: '',
    startDate: '',
    endDate: '',
    businessType: '',
    businessItem: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      vendorCode: '',
      vendorName: '',
      isBlocked: '',
      startDate: '',
      endDate: '',
      businessType: '',
      businessItem: '',
    });
  };

  const getStatusBadge = (status: VendorUser['status']) => {
    const config = {
      PENDING: { variant: 'yellow' as const, label: '승인대기' },
      APPROVED: { variant: 'green' as const, label: '승인' },
      REJECTED: { variant: 'red' as const, label: '반려' },
      BLOCKED: { variant: 'gray' as const, label: 'BLOCK' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<VendorUser>[] = [
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as VendorUser['status']),
    },
    {
      key: 'vendorCode',
      header: '협력사코드',
      width: 140,
      align: 'center',
    },
    {
      key: 'vendorName',
      header: '협력사명',
      align: 'left',
    },
    {
      key: 'userId',
      header: '담당자ID',
      width: 120,
      align: 'center',
    },
    {
      key: 'userName',
      header: '담당자명',
      width: 100,
      align: 'center',
    },
    {
      key: 'phone',
      header: '담당자 전화번호',
      width: 140,
      align: 'center',
    },
    {
      key: 'email',
      header: '담당자 이메일',
      width: 200,
      align: 'left',
    },
    {
      key: 'createdAt',
      header: '등록일자',
      width: 110,
      align: 'center',
    },
    {
      key: 'isBlocked',
      header: 'BLOCK여부',
      width: 100,
      align: 'center',
      render: (value) => (
        <span className={value ? 'text-red-500 font-medium' : 'text-gray-500'}>
          {value ? 'Y' : 'N'}
        </span>
      ),
    },
  ];

  const handleApprove = () => {
    if (selectedRows.length === 0) {
      alert('승인할 항목을 선택해주세요.');
      return;
    }
    const pendingUsers = selectedRows.filter(u => u.status === 'PENDING');
    if (pendingUsers.length === 0) {
      alert('승인대기 상태의 항목만 승인할 수 있습니다.');
      return;
    }
    alert(`${pendingUsers.length}건이 승인되었습니다.`);
    setSelectedRows([]);
  };

  const handleReject = () => {
    if (selectedRows.length === 0) {
      alert('반려할 항목을 선택해주세요.');
      return;
    }
    const pendingUsers = selectedRows.filter(u => u.status === 'PENDING');
    if (pendingUsers.length === 0) {
      alert('승인대기 상태의 항목만 반려할 수 있습니다.');
      return;
    }
    alert(`${pendingUsers.length}건이 반려되었습니다.`);
    setSelectedRows([]);
  };

  return (
    <div>
      <PageHeader 
        title="협력업체 사용자 관리" 
        subtitle="협력업체 담당자 계정을 관리합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="협력사코드"
          placeholder="협력사코드 입력"
          value={searchParams.vendorCode}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendorCode: e.target.value }))}
        />
        <Input
          label="협력사명"
          placeholder="협력사명 입력"
          value={searchParams.vendorName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendorName: e.target.value }))}
        />
        <Select
          label="BLOCK여부"
          value={searchParams.isBlocked}
          onChange={(e) => setSearchParams(prev => ({ ...prev, isBlocked: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'Y', label: 'Y' },
            { value: 'N', label: 'N' },
          ]}
        />
        <DatePicker
          label="등록일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="등록일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Select
          label="사업형태"
          value={searchParams.businessType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, businessType: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'CORP', label: '법인' },
            { value: 'INDIVIDUAL', label: '개인' },
          ]}
        />
        <Input
          label="업종"
          placeholder="업종 입력"
          value={searchParams.businessItem}
          onChange={(e) => setSearchParams(prev => ({ ...prev, businessItem: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="사용자 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="success" onClick={handleApprove}>승인</Button>
            <Button variant="danger" onClick={handleReject}>반려</Button>
          </div>
        }
      >
        <DataGrid
          columns={columns}
          data={vendorUsers}
          keyField="id"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          emptyMessage="등록된 협력업체 사용자가 없습니다."
        />
      </Card>
    </div>
  );
}

