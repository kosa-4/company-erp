'use client';

import React, { useState, useRef, useEffect } from 'react';
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
import { ColumnDef } from '@/types';

interface Vendor {
  askNum:string;
  vendorCode: string;
  vendorName: string;
  vendorNameEn?: string;
  status: 'N' | 'C' | 'A' | 'R';
  businessType: 'CORP' | 'INDIVIDUAL';
  businessNo: string;
  ceoName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  phone?: string;
  fax?: string;
  email: string;
  businessCategory?: string;
  industry?: string;
  establishDate?: string;
  useYn: 'Y' | 'N';
  stopReason?: string;
  remark?: string;
  createdAt: string;
  createdBy: string;
}

export default function VendorPage() {

  /* 검색 및 조회 */

  // 1. 상태 변수 정의
  // 1-1. 협력업체 목록 출력용 상태 변수
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [page, setPage] = useState("1");
  const [totalPage, setTotalPage] = useState("");
  const [loading, setLoading] = useState(false);

  // 1-2. 검색 조건 상태 변수
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    vendorName: '',
    useYn: '',
    startDate: '',
    endDate: '',
    businessType: '',
    industry: '',
    page: "1",
  });
  // 1-3. 모달 및 선택된 협력업체 상세 정보 상태 변수
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 2. 협력사 조회
  const fetchVendors = async () => {
    setLoading(true);
    try{
      // 2-1. searchParams에 입력된 page 값이 없을 시 1로 초기화
      const initPageParam = {
        ...searchParams,
        page: searchParams.page || "1",
      };

      // 2-2. API 요청
      const response = await fetch ("/api/v1/vendors?" +
        new URLSearchParams(initPageParam as any) 
      );

      if(!response.ok){
        // 1) 오류 처리
        throw new Error('협력업체 조회에 실패했습니다.');
      }
      // 2-3. 데이터 파싱
      const data = await response.json();
      console.log("조회된 데이터:", data);
      // 2-4. 상태 업데이트
      setVendors(data.vendors);
      
    } catch(error){
      // 1) 오류 처리
      console.error("데이터 조회 중 오류 발생:", error);
      alert("데이터 로드에 실패하였습니다.")
    } finally{
      // 2-5. 검색 로딩 표시
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    }    
  };

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
      industry: '',
      page: "1",
    });
  };

  const handleRowClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDetailModalOpen(true);
  };
  console.log("selectedVendor: ", selectedVendors);
  const getStatusBadge = (status: Vendor['status']) => {
    const config = {
      N: { variant: 'gray' as const, label: '신규' },
      C: { variant: 'yellow' as const, label: '변경' },
      A: { variant: 'green' as const, label: '승인' },
      R: { variant: 'red' as const, label: '반려' },
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
      key: 'industry',
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

  useEffect(() => {
    fetchVendors();
  }, [searchParams]);

  /* 저장 */
  // 1. form input 데이터 가져오기 (input name 작성 필수!)
  const saveForm = useRef<HTMLFormElement>(null);
  
  // 2. 협력사 저장
  const saveVendor = async () => {
    // 2-1. form 태그 null 처리
    if (!saveForm.current) return;

    // 2-2. FormData 저장
    const formData = new FormData(saveForm.current);
    const data = Object.fromEntries(formData.entries());

    try{
      // 2-3. API 요청
      const response = await fetch ("/api/v1/vendors/new",{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(data),
      });

      if(!response.ok){
        throw new Error('협력업체 저장에 실패했습니다.');
      };

      // 2-4. 저장 성공 알림
      alert('저장되었습니다.');
    } catch(error){

      // 2-5. 오류 처리
      console.error("데이터 입력 중 오류 발생:", error);
    };
  };

  
  /* 승인 */
  const approveVendor = async () => {
    try{
      // 1. API 요청
      const response = await fetch(`/api/v1/vendors/approve`, {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(selectedVendors),
      });
      if(!response.ok){
        throw new Error('협력업체 승인에 실패했습니다.');
      } 

      // 2. 승인 성공 알림
      alert('선택한 협력업체가 승인되었습니다.');
    } catch(error){
      // 3. 오류 처리
      console.error("협력업체 승인 중 오류 발생:", error);
    }; 
  };

  /* 반려 */
  const rejectVendor = async () => {
    try{
      // 1. API 요청
      const response = await fetch(`/api/v1/vendors/reject`, {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(selectedVendors),
      });
      if(!response.ok){
        throw new Error('협력업체 반려에 실패했습니다.');
      } 

      // 2. 승인 성공 알림
      alert('선택한 협력업체가 반려되었습니다.');
    } catch(error){
      // 3. 오류 처리
      console.error("협력업체 반려 중 오류 발생:", error);
    }; 
  }

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
          value={searchParams.industry}
          onChange={(e) => setSearchParams(prev => ({ ...prev, industry: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="협력업체 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="success" onClick={approveVendor}>승인</Button>
            <Button variant="danger" onClick={rejectVendor}>반려</Button>
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
          selectedRows={selectedVendors}
          onSelectionChange={(selectedRows) => {
            // 만약 selectedRows가 방금 클릭한 한 개의 객체만 담긴 배열이라면
          const clickedRow = selectedRows[selectedRows.length - 1]; // 가장 최근에 클릭된 행
          if (!clickedRow) {
              // 만약 아무것도 없는 배열이 들어오면 전부 해제된 것이니 초기화
              setSelectedVendors([]);
              return;
          }

          const targetKey = clickedRow.vendorCode; // 비교할 고유 키값

          setSelectedVendors((prev) => {
            // 2. '객체'가 아니라 '고유 키(vendorCode)'로 찾습니다. (이게 핵심!)
            const isExist = prev.some((v) => v.vendorCode === targetKey);

            if (isExist) {
              // 이미 있다면 -> 무조건 제거 (토글 OFF)
              return prev.filter((v) => v.vendorCode !== targetKey);
            } else {
              // 없다면 -> 상태 체크 후 추가 (토글 ON)
              if (clickedRow.status === "A" || !clickedRow.askNum) {
                alert("승인 가능한 상태가 아닙니다.");
                return prev;
              }
              return [...prev, clickedRow];
            }
          });
          }}
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
            {selectedVendor?.status === 'A' && (
              <Button variant="primary">수정</Button>
            )}
            {selectedVendor?.status === 'P' && (
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
              <Input label="업종" value={selectedVendor.industry || ''} />
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
              saveVendor();
              setIsCreateModalOpen(false);
            }}
            confirmText="저장"
          />
        }
      >
        <form ref={saveForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Input name="vendorCode" label="협력사코드" value="자동채번" readOnly />
              <Input name="vendorName" label="협력사명" placeholder="협력사명 입력" required />
              <Input name="vendorEngName" label="협력사명(영문)" placeholder="영문 협력사명 입력" />
              <Select
                name="businessType"
                label="사업형태"
                placeholder="선택"
                required
                options={[
                  { value: 'CORP', label: '법인' },
                  { value: 'INDIVIDUAL', label: '개인' },
                ]}
              />
              <Input name="businessNo" label="사업자등록번호" placeholder="000-00-00000" required />
              <Input name="ceoName" label="대표자명" placeholder="대표자명 입력" required />
              <div className="flex gap-2">
                <Input label="우편번호" placeholder="우편번호" required />
                <div className="flex items-end">
                  <Button variant="secondary" className="h-[42px]">검색</Button>
                </div>
              </div>
              <div className="col-span-2">
                <Input name='address' label="주소" placeholder="주소" required readOnly />
              </div>
              <Input name="addressDetail" label="상세주소" placeholder="상세주소 입력" />
              <Input name="tel" label="전화번호" placeholder="02-0000-0000" />
              <Input name="fax" label="팩스번호" placeholder="02-0000-0000" />
              <Input name="email" label="이메일" type="email" placeholder="email@example.com" required />
              <DatePicker name='foundationAt' label="설립일자" />
              <Input name="businessCategory" label="업태" placeholder="업태 입력" />
              <Input name="industry" label="업종" placeholder="업종 입력" />
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
        </form>
      </Modal>
    </div>
  );
}

