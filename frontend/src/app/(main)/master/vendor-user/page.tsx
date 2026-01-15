'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// 1. 인터페이스 정의
interface VendorUser {
  id: string;        
  askUserNum: string; 
  vendorCode: string;
  vendorName: string;
  userId: string;
  userName: string;
  phone: string;
  email: string;
  status: string;    
  createdAt: string;
  blockFlag: string;
}

export default function VendorUserPage() {
  const [vendorUsers, setVendorUsers] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    vendorName: '',
    userId: '',
    userName: '',
    blockFlag: '',
    startDate: '',
    endDate: '',
  });

  // 2. 데이터 호출 함수
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
        
        // 고유 ID 부여 (체크박스 오류 및 렌더링 오류 방지)
        const mappedData = data.map((item: any, index: number) => ({
          ...item,
          id: item.askUserNum || `${item.userId}_${index}`
        }));
        
        setVendorUsers(mappedData);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchVendorUsers();
  }, [fetchVendorUsers]);

  // 3. 컬럼 정의 (useMemo를 사용하여 컬럼 중복 생성 방지)
  const columns = useMemo<ColumnDef<VendorUser>[]>(() => [
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      render: (val) => {
        const status = val as string;
        if (status === 'Y' || status === 'A') return <Badge variant="green">승인</Badge>;
        if (status === 'R') return <Badge variant="red">반려</Badge>;
        return <Badge variant="yellow">대기</Badge>;
      },
    },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', align: 'left' },
    { key: 'userId', header: 'ID', width: 120, align: 'center' },
    { key: 'userName', header: '담당자명', width: 100, align: 'center' },
    { key: 'phone', header: '전화번호', width: 140, align: 'center' },
    { key: 'email', header: '이메일', align: 'left' },
    { key: 'createdAt', header: '등록일자', width: 110, align: 'center' },
    {
      key: 'blockFlag',
      header: '차단',
      width: 80,
      align: 'center',
      render: (val) => (
        <span className={val === 'Y' ? 'text-red-500 font-bold' : 'text-gray-400'}>
          {val === 'Y' ? 'Y' : 'N'}
        </span>
      ),
    },
  ], []);

  const handleReset = () => {
    setSearchParams({
      vendorCode: '', vendorName: '', userId: '', userName: '', blockFlag: '', startDate: '', endDate: ''
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="협력업체 사용자 관리" subtitle="계정 정보를 조회하고 상태를 확인합니다." />

      <SearchPanel 
        onSearch={fetchVendorUsers} 
        onReset={handleReset} 
        loading={loading}
      >
        <Input label="협력사코드" value={searchParams.vendorCode} onChange={(e) => setSearchParams(p => ({ ...p, vendorCode: e.target.value }))} />
        <Input label="담당자ID" value={searchParams.userId} onChange={(e) => setSearchParams(p => ({ ...p, userId: e.target.value }))} />
        <Select 
          label="차단여부" 
          value={searchParams.blockFlag} 
          options={[{value:'', label:'전체'}, {value:'Y', label:'Y'}, {value:'N', label:'N'}]}
          onChange={(e) => setSearchParams(p => ({ ...p, blockFlag: e.target.value }))} 
        />
        <DatePicker label="시작일" value={searchParams.startDate} onChange={(e) => setSearchParams(p => ({ ...p, startDate: e.target.value }))} />
        <DatePicker label="종료일" value={searchParams.endDate} onChange={(e) => setSearchParams(p => ({ ...p, endDate: e.target.value }))} />
      </SearchPanel>

      <Card title="사용자 목록" padding={false}>
        <DataGrid
          columns={columns}
          data={vendorUsers}
          keyField="id" 
          loading={loading}
          /* selectable 속성을 제거하여 체크박스와 일괄 선택 기능을 삭제했습니다. */
          emptyMessage="조회된 데이터가 없습니다."
        />
      </Card>
    </div>
  );
}