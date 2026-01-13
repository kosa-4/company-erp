'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DatePicker,
  Textarea,
  DataGrid,
  SearchPanel,
  Modal,
  ModalFooter,
  Badge
} from '@/components/ui';
import { Vendor, ColumnDef } from '@/types';

// Mock 데이터
// const mockVendors: Vendor[] = [
//   {
//     vendorCode: 'VND-2024-0001',
//     vendorName: '(주)테크솔루션',
//     vendorNameEn: 'Tech Solution Co., Ltd.',
//     status: 'APPROVED',
//     businessType: 'CORP',
//     businessNo: '123-45-67890',
//     ceoName: '김대표',
//     zipCode: '06123',
//     address: '서울시 강남구 테헤란로 123',
//     addressDetail: '테크빌딩 5층',
//     phone: '02-1234-5678',
//     fax: '02-1234-5679',
//     email: 'contact@techsolution.co.kr',
//     businessCategory: '도매업',
//     businessItem: '전자제품, 컴퓨터',
//     establishDate: '2010-03-15',
//     useYn: 'Y',
//     createdAt: '2024-01-10',
//     createdBy: 'admin',
//   },
//   {
//     vendorCode: 'VND-2024-0002',
//     vendorName: '(주)오피스프로',
//     vendorNameEn: 'Office Pro Inc.',
//     status: 'APPROVED',
//     businessType: 'CORP',
//     businessNo: '234-56-78901',
//     ceoName: '이사무',
//     zipCode: '04532',
//     address: '서울시 중구 을지로 50',
//     addressDetail: '오피스빌딩 3층',
//     phone: '02-2345-6789',
//     fax: '02-2345-6790',
//     email: 'sales@officepro.kr',
//     businessCategory: '소매업',
//     businessItem: '사무용품, 문구류',
//     establishDate: '2015-07-20',
//     useYn: 'Y',
//     createdAt: '2024-02-05',
//     createdBy: 'admin',
//   },
//   {
//     vendorCode: 'VND-2024-0003',
//     vendorName: '글로벌IT',
//     status: 'PENDING',
//     businessType: 'INDIVIDUAL',
//     businessNo: '345-67-89012',
//     ceoName: '박아이티',
//     zipCode: '13496',
//     address: '경기도 성남시 분당구 판교로 123',
//     phone: '031-3456-7890',
//     email: 'globalit@email.com',
//     businessCategory: '서비스업',
//     businessItem: 'IT 컨설팅',
//     useYn: 'Y',
//     createdAt: '2024-12-20',
//     createdBy: 'vendor_admin',
//   },
// ];

export default function VendorPage() {
  const [vendors] = useState<Vendor[]>([]);
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    vendorName: '',
    useYn: '',
    startDate: '',
    endDate: '',
    businessType: '',
    businessItem: '',
  });
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
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
      vendorCode: '',
      vendorName: '',
      useYn: '',
      startDate: '',
      endDate: '',
      businessType: '',
      businessItem: '',
    });
  };

  const handleRowClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: Vendor['status']) => {
    const config = {
      NEW: { variant: 'gray' as const, label: '신규' },
      PENDING: { variant: 'yellow' as const, label: '승인대기' },
      APPROVED: { variant: 'green' as const, label: '승인' },
      REJECTED: { variant: 'red' as const, label: '반려' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<Vendor>[] = [
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as Vendor['status']),
    },
    {
      key: 'vendorCode',
      header: '협력사코드',
      width: 140,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'vendorName',
      header: '협력사명',
      align: 'left',
    },
    {
      key: 'createdAt',
      header: '등록일자',
      width: 110,
      align: 'center',
    },
    {
      key: 'useYn',
      header: '사용여부',
      width: 80,
      align: 'center',
      render: (value) => (
        <span className={value === 'Y' ? 'text-emerald-600' : 'text-red-500'}>
          {value === 'Y' ? '사용' : '미사용'}
        </span>
      ),
    },
    {
      key: 'businessType',
      header: '사업형태',
      width: 80,
      align: 'center',
      render: (value) => value === 'CORP' ? '법인' : '개인',
    },
    {
      key: 'businessItem',
      header: '업종',
      width: 150,
      align: 'left',
    },
    {
      key: 'ceoName',
      header: '대표자명',
      width: 100,
      align: 'center',
    },
    {
      key: 'address',
      header: '주소',
      align: 'left',
      render: (value) => (
        <span className="truncate block max-w-[200px]" title={String(value)}>
          {String(value)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="협력업체 현황" 
        subtitle="협력업체 정보를 조회하고 관리합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
          label="사용여부"
          value={searchParams.useYn}
          onChange={(e) => setSearchParams(prev => ({ ...prev, useYn: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'Y', label: '사용' },
            { value: 'N', label: '미사용' },
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
        title="협력업체 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="success">승인</Button>
            <Button variant="danger">반려</Button>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              등록
            </Button>
          </div>
        }
      >
        <DataGrid
          columns={columns}
          data={vendors}
          keyField="vendorCode"
          onRowClick={handleRowClick}
          loading={loading}
          selectable
          emptyMessage="등록된 협력업체가 없습니다."
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="협력업체 상세"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
            {selectedVendor?.status === 'APPROVED' && (
              <Button variant="primary">수정</Button>
            )}
            {selectedVendor?.status === 'PENDING' && (
              <>
                <Button variant="danger">반려</Button>
                <Button variant="success">승인</Button>
              </>
            )}
          </>
        }
      >
        {selectedVendor && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">{selectedVendor.vendorName}</h3>
              {getStatusBadge(selectedVendor.status)}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="협력사코드" value={selectedVendor.vendorCode} readOnly />
              <Input label="협력사명" value={selectedVendor.vendorName} />
              <Input label="협력사명(영문)" value={selectedVendor.vendorNameEn || ''} />
              <Select
                label="사업형태"
                value={selectedVendor.businessType}
                options={[
                  { value: 'CORP', label: '법인' },
                  { value: 'INDIVIDUAL', label: '개인' },
                ]}
              />
              <Input label="사업자등록번호" value={selectedVendor.businessNo} />
              <Input label="대표자명" value={selectedVendor.ceoName} />
              <Input label="우편번호" value={selectedVendor.zipCode} />
              <div className="col-span-2">
                <Input label="주소" value={selectedVendor.address} />
              </div>
              <Input label="상세주소" value={selectedVendor.addressDetail || ''} />
              <Input label="전화번호" value={selectedVendor.phone || ''} />
              <Input label="팩스번호" value={selectedVendor.fax || ''} />
              <Input label="이메일" value={selectedVendor.email} />
              <Input label="설립일자" value={selectedVendor.establishDate || ''} />
              <Input label="업태" value={selectedVendor.businessCategory || ''} />
              <Input label="업종" value={selectedVendor.businessItem || ''} />
            </div>

            <Textarea label="비고" value={selectedVendor.remark || ''} rows={3} />
          </div>
        )}
      </Modal>

      {/* 등록 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="협력업체 등록"
        size="xl"
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
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Input label="협력사코드" value="자동채번" readOnly />
            <Input label="협력사명" placeholder="협력사명 입력" required />
            <Input label="협력사명(영문)" placeholder="영문 협력사명 입력" />
            <Select
              label="사업형태"
              placeholder="선택"
              required
              options={[
                { value: 'CORP', label: '법인' },
                { value: 'INDIVIDUAL', label: '개인' },
              ]}
            />
            <Input label="사업자등록번호" placeholder="000-00-00000" required />
            <Input label="대표자명" placeholder="대표자명 입력" required />
            <div className="flex gap-2">
              <Input label="우편번호" placeholder="우편번호" required />
              <div className="flex items-end">
                <Button variant="secondary" className="h-[42px]">검색</Button>
              </div>
            </div>
            <div className="col-span-2">
              <Input label="주소" placeholder="주소" required readOnly />
            </div>
            <Input label="상세주소" placeholder="상세주소 입력" />
            <Input label="전화번호" placeholder="02-0000-0000" />
            <Input label="팩스번호" placeholder="02-0000-0000" />
            <Input label="이메일" type="email" placeholder="email@example.com" required />
            <DatePicker label="설립일자" />
            <Input label="업태" placeholder="업태 입력" />
            <Input label="업종" placeholder="업종 입력" />
          </div>
          
          <div className="flex gap-6">
            <label className="text-sm font-medium text-gray-700">사용여부</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="useYn" value="Y" defaultChecked className="text-blue-600" />
                <span className="text-sm">사용</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="useYn" value="N" className="text-blue-600" />
                <span className="text-sm">미사용</span>
              </label>
            </div>
          </div>

          <Textarea label="비고" placeholder="비고 입력" rows={3} />
        </div>
      </Modal>
    </div>
  );
}

