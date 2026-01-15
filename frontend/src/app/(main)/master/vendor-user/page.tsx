'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// 1. 백엔드 DTO(VendorUserListDto)와 변수명 일치화
interface VendorUser {
  vendorCode: string;
  vendorName: string;
  userId: string;
  userName: string;
  phone: string;
  email: string;
  status: string;    // 'Y' 또는 'N' (또는 PROGRESS_CD 값)
  createdAt: string;
  blockFlag: string; // 'Y' 또는 'N'
}

export default function VendorUserPage() {
  const [vendorUsers, setVendorUsers] = useState<VendorUser[]>([]);
  const [selectedRows, setSelectedRows] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 검색 파라미터 (백엔드 VendorUserSearchDto와 매칭)
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    vendorName: '',
    userId: '',
    userName: '',
    blockFlag: '',
    startDate: '',
    endDate: '',
  });

  // 2. 데이터 호출 함수 (실제 API 연동)
  const fetchVendorUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/v1/vendor-user?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVendorUsers(data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 페이지 진입 시 즉시 실행
  useEffect(() => {
    fetchVendorUsers();
  }, []);

  const handleSearch = () => fetchVendorUsers();

  const handleReset = () => {
    setSearchParams({
      vendorCode: '',
      vendorName: '',
      userId: '',
      userName: '',
      blockFlag: '',
      startDate: '',
      endDate: '',
    });
  };

  // 3. 상태 배지 렌더링 (백엔드 status 값 기준)
  const getStatusBadge = (status: string) => {
    // 'Y'는 승인(Green), 그 외(N 등)는 대기(Yellow)로 표시
    if (status === 'Y') return <Badge variant="green">승인</Badge>;
    return <Badge variant="yellow">승인대기</Badge>;
  };

  const columns: ColumnDef<VendorUser>[] = [
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as string),
    },
    { key: 'vendorCode', header: '협력사코드', width: 140, align: 'center' },
    { key: 'vendorName', header: '협력사명', align: 'left' },
    { key: 'userId', header: '담당자ID', width: 120, align: 'center' },
    { key: 'userName', header: '담당자명', width: 100, align: 'center' },
    { key: 'phone', header: '담당자 전화번호', width: 140, align: 'center' },
    { key: 'email', header: '담당자 이메일', width: 200, align: 'left' },
    { key: 'createdAt', header: '등록일자', width: 110, align: 'center' },
    {
      key: 'blockFlag',
      header: 'BLOCK여부',
      width: 100,
      align: 'center',
      render: (value) => (
        <span className={value === 'Y' ? 'text-red-500 font-medium' : 'text-gray-500'}>
          {value === 'Y' ? 'Y' : 'N'}
        </span>
      ),
    },
  ];

  // 승인/반려 핸들러 (API 호출 구조로 변경)
  const handleUpdateStatus = async (isApprove: boolean) => {
    if (selectedRows.length === 0) {
      alert('항목을 선택해주세요.');
      return;
    }
    // 선택된 데이터 처리 로직...
    alert(`${selectedRows.length}건을 ${isApprove ? '승인' : '반려'} 처리합니다.`);
  };

  return (
    <div className="space-y-6">
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
          value={searchParams.vendorCode}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendorCode: e.target.value }))}
        />
        <Input
          label="협력사명"
          value={searchParams.vendorName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendorName: e.target.value }))}
        />
        <Input
          label="담당자ID"
          value={searchParams.userId}
          onChange={(e) => setSearchParams(prev => ({ ...prev, userId: e.target.value }))}
        />
        <Select
          label="BLOCK여부"
          value={searchParams.blockFlag}
          onChange={(e) => setSearchParams(prev => ({ ...prev, blockFlag: e.target.value }))}
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
      </SearchPanel>

      <Card 
        title="사용자 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="success" onClick={() => handleUpdateStatus(true)}>승인</Button>
            <Button variant="danger" onClick={() => handleUpdateStatus(false)}>반려</Button>
          </div>
        }
      >
        <DataGrid
          columns={columns}
          data={vendorUsers}
          keyField="userId" // 백엔드에서 유니크한 키인 userId 사용
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