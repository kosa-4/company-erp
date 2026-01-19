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
  vendorNameEng?: string;
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
  foundationDate?: string;
  useYn: 'Y' | 'N';
  stopReason?: string;
  remark?: string;
  createdAt: string;
  createdBy: string;
}

interface AttFile {
  fileNum: string;
  originName: string;
  fileSize: number;
  filePath: string;
}

interface Window {
  daum: {
    Postcode: new (options: {
      oncomplete: (data: {
        zonecode: string;
        roadAddress: string;
        jibunAddress: string;
        buildingName: string;
      }) => void;
    }) => { open: () => void };
  };
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
  const fetchVendors = async (params = searchParams) => {
  setLoading(true);
  try {
    const initPageParam = {
      ...params,
      page: params.page || "1",
    };

    const response = await fetch("/api/v1/vendors?" + 
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

  const handleSearch = async (e?: React.FormEvent) => {
    // 만약 Form 이벤트가 들어온다면 새로고침 방지
    if (e && e.preventDefault) e.preventDefault();
    
    setLoading(true);
    await fetchVendors(); // 실제 데이터 조회 함수 호출
    setLoading(false);
  };

  const handleReset = () => {
    const resetParams = ({
      vendorCode: '',
      vendorName: '',
      useYn: '',
      startDate: '',
      endDate: '',
      businessType: '',
      industry: '',
      page: "1",
    });
    setSearchParams(resetParams);
    fetchVendors(resetParams);
  };

  const latestVendorCodeRef = useRef<string | null>(null);

  const handleRowClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    latestVendorCodeRef.current = vendor.vendorCode;
    setAttachedFiles([]); // 이전 데이터 초기화
    fetchVendorFiles(vendor.vendorCode); // 파일 목록 조회 호출
    setIsDetailModalOpen(true);
  };
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
  }, []);

  /* 저장 */
  // 1. form input 데이터 가져오기 (input name 작성 필수!)
  const saveForm = useRef<HTMLFormElement>(null);
  
  // 2. 협력사 저장
  const saveVendor = async () => {
    if (!saveForm.current) return;
    const formData = new FormData(saveForm.current);
    const data = Object.fromEntries(formData.entries());

      try {
      const res = await fetch("/api/v1/vendors/new", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('협력업체 저장에 실패했습니다.');
      const result = await res.json(); // { success: true, message: "...", data: "VN..." }

      if (!result.success) {
        alert(result.message || '저장에 실패했습니다.');
        return;
      }

      if (result.success) {
        const vendorCode = result.data; // 컨트롤러가 준 vendorCode가 여기 담김!
        // console.log("생성된 업체 코드:", vendorCode);

        // 파일이 있을 때만 파일 업로드 실행
        if (selectedFiles.length > 0 && vendorCode) {
          try {
         await uploadFiles(vendorCode);
          } catch (e) {
            console.error("파일 업로드 실패:", e);
            alert('업체는 등록됐지만 파일 업로드에 실패했습니다. 다시 시도해주세요.');
            setIsCreateModalOpen(false);
            
            fetchVendors();
            return;
          }
        }

        alert(result.message || '등록이 완료되었습니다.');
        setIsCreateModalOpen(false);
        setSelectedFiles([]); // 파일 목록 초기화
        fetchVendors();
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleAddressSearch = () => {
  if (!window.daum?.Postcode) {
    alert('우편번호 서비스를 불러오는 중입니다.');
    return;
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddress = data.roadAddress;
      if (data.buildingName) {
        fullAddress += ` (${data.buildingName})`;
      }

      // useRef(saveForm)를 통해 각 input 엘리먼트에 직접 접근
      if (saveForm.current) {
        // name 속성을 기준으로 input을 찾아 값을 채움
        const zipInput = saveForm.current.elements.namedItem('zipCode') as HTMLInputElement;
        const addrInput = saveForm.current.elements.namedItem('address') as HTMLInputElement;
        const detailInput = saveForm.current.elements.namedItem('addressDetail') as HTMLInputElement;

        if (zipInput) zipInput.value = data.zonecode;
        if (addrInput) addrInput.value = fullAddress;
        if (detailInput) detailInput.focus(); // 상세주소로 포커스 이동
      }
    }
  }).open();
};

  
  /* 승인 */
  const approveVendor = async (targets: Vendor[] = selectedVendors) => {
    try{
      // 1. API 요청
      const response = await fetch(`/api/v1/vendors/approve`, {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(targets),
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
  const rejectVendor = async (targets: Vendor[] = selectedVendors) => {
    try{
      // 1. API 요청
      const response = await fetch(`/api/v1/vendors/reject`, {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(targets),
      });
      if(!response.ok){
        throw new Error('협력업체 반려에 실패했습니다.');
      } 

      // 2. 승인 성공 알림
      alert('선택한 협력업체가 반려되었습니다.');
    } catch(error){
      // 3. 오류 처리
      console.error("협력업체 반려 중 오류 발생:", error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }; 
  }

  /* 파일 첨부 */
 
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // 단일 파일에서 배열로 변경
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 시 호출 (누적 방식)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]); // 기존 파일에 추가
    }
  };

  // 특정 파일 제거 기능
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 파일 업로드 함수
  const uploadFiles = async (vendorCode: string) => {
    console.log("uploadFiles 실행 시작");
    
    const fileFormData = new FormData();
    selectedFiles.forEach(file => {
      fileFormData.append('file', file);
      fileFormData.append('vendorCode', vendorCode); // 중복으로 예상 -> 추후 확인 후 수정
    });

    // 백엔드 주소로 전송 (vendorCode를 경로에 넣지 않음)
    const res = await fetch(`/api/v1/vendors/files/${vendorCode}`, {
      method: 'POST',
      body: fileFormData,
    });
    
    if (!res.ok) throw new Error('파일 업로드 실패');
  };

  const [attachedFiles, setAttachedFiles] = useState<AttFile[]>([]);

// 특정 업체의 파일 목록을 가져오는 함수
const fetchVendorFiles = async (vendorCode: string) => {
  try {
    const response = await fetch(`/api/v1/vendors/${vendorCode}/files`);
    if (response.ok) {
      const result = await response.json(); // ApiResponse 객체
      // console.log("백엔드 파일 응답:", result); // 여기서 구조를 꼭 확인해보세요!
      if (latestVendorCodeRef.current !== vendorCode) return; // 최신 조회한 업체 코드와 다르면 무시
      // result가 아니라 result.data(실제 리스트)를 세팅해야 함
      if (result.success && result.data) {
        setAttachedFiles(result.data); 
      } else if (Array.isArray(result)) {
        // 만약 ApiResponse로 안 감싸고 바로 List를 던진다면
        setAttachedFiles(result);
      }
    }
  } catch (error) {
    console.error("파일 목록 로드 실패:", error);
  }
};

const handleFileDownload = async (fileNo: string, fileName: string) => {
    try {
      // 백엔드의 다운로드 API 호출
      const response = await fetch(`/api/v1/vendors/files/download/${fileNo}`);
      if (!response.ok) throw new Error('다운로드 실패');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // 원본 파일명 설정
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert("파일 다운로드 중 오류가 발생했습니다.");
    }
  };

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

      <SearchPanel 
        onSearch={handleSearch} 
        onReset={handleReset} 
        loading={loading}
      >
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
            <Button variant="danger" onClick={() => selectedVendor && rejectVendor([selectedVendor])}>반려</Button>
            <Button variant="success" onClick={() => selectedVendor && approveVendor([selectedVendor])}>승인</Button>
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
        title="협력업체 상세 정보"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
            {selectedVendor?.status === 'A' && (
              <Button variant="primary">수정</Button>
            )}
            {/* {(selectedVendor?.status === 'N' || selectedVendor?.status === 'C') && (
              <>
                <Button variant="danger" onClick={rejectVendor}>반려</Button>
                <Button variant="success" onClick={approveVendor}>승인</Button>
              </>
            )} */}
          </>
        }
      >
        {selectedVendor && (
          <div className="space-y-6">
            {/* 상단 헤더: 업체명 및 상태 */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">{selectedVendor.vendorName}</h3>
                {getStatusBadge(selectedVendor.status)}
              </div>
              <div className="text-sm text-gray-500">
                등록일: {selectedVendor.createdAt} | 등록자: {selectedVendor.createdBy}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {/* 기본 정보 */}
              <Input label="협력사코드" value={selectedVendor.vendorCode} readOnly className="bg-gray-50" />
              <Input label="협력사명(국문)" value={selectedVendor.vendorName} readOnly />
              <Input label="협력사명(영문)" value={selectedVendor.vendorNameEng || '-'} readOnly />
              
              <Select
                disabled
                label="사업형태"
                value={selectedVendor.businessType}
                options={[
                  { value: 'CORP', label: '법인' },
                  { value: 'INDIVIDUAL', label: '개인' },
                ]}
              />
              <Input label="사업자등록번호" value={selectedVendor.businessNo} readOnly />
              <Input label="대표자명" value={selectedVendor.ceoName} readOnly />

              {/* 연락처 정보 */}
              <Input label="전화번호" value={selectedVendor.phone || '-'} readOnly />
              <Input label="팩스번호" value={selectedVendor.fax || '-'} readOnly />
              <Input label="이메일" value={selectedVendor.email} readOnly />

              {/* 주소 정보 (전체 너비 사용) */}
              <div className="col-span-1">
                <Input label="우편번호" value={selectedVendor.zipCode} readOnly />
              </div>
              <div className="col-span-2">
                <Input label="주소" value={selectedVendor.address} readOnly />
              </div>
              <div className="col-span-3">
                <Input label="상세주소" value={selectedVendor.addressDetail || '-'} readOnly />
              </div>

              {/* 기타 정보 */}
              <Input label="설립일자" value={selectedVendor.foundationDate || '-'} readOnly />
              <Input label="업종" value={selectedVendor.industry || '-'} readOnly />
              <div className="col-span-1">
                <Input label="사용여부" value={selectedVendor.useYn === 'Y' ? '사용' : '미사용'} readOnly 
                        className={selectedVendor.useYn === 'Y' ? 'text-emerald-600' : 'text-red-500'} />
              </div>
              {selectedVendor.status === 'R' && (
                <div className="col-span-2">
                  <Input label="반려사유" value={selectedVendor.stopReason || '-'} readOnly className="text-red-600" />
                </div>
              )}
            </div>
            {/* 상세 모달 내 파일 섹션 수정 */}
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-700">첨부파일</label>
              <div className="mt-2">
                {attachedFiles.length > 0 ? (
                  <ul className="space-y-2">
                    {attachedFiles.map((file) => (
                      // fileNo -> fileNum 으로 변경
                      <li key={file.fileNum} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200 group">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {/* orgName -> originName 으로 변경 */}
                          <span className="text-sm text-gray-700">{file.originName}</span>
                          <span className="text-xs text-gray-400">
                            ({(file.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          // 인자 값도 변경된 필드명으로 전달
                          onClick={() => handleFileDownload(file.fileNum, file.originName)}
                        >
                          다운로드
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-400 italic">첨부된 파일이 없습니다.</div>
                )}
</div>
            </div>

            {/* 비고란 (하단 배치) */}
            <div className="pt-4 border-t">
              <Textarea label="비고" value={selectedVendor.remark || '등록된 비고가 없습니다.'} rows={3} readOnly />
            </div>
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
            }}
            confirmText="저장"
          />
        }
      >
        <form ref={saveForm} onSubmit={(e) => e.preventDefault()}>
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
                <Input name='zipCode' label="우편번호" placeholder="우편번호" required />
                <div className="flex items-end">
                  <Button onClick={handleAddressSearch} variant="secondary" className="h-[42px]">검색</Button>
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
              <Input name="industry" label="업종" placeholder="업종 입력" />
            </div>
            
            {/* 파일 첨부 UI 부분 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">첨부파일 (다중 선택 가능)</label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일 추가
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    multiple // 다중 선택 가능하도록 속성 추가
                    onChange={handleFileChange}
                  />
                </div>
                
                {/* 선택된 파일 목록 */}
                {selectedFiles.length > 0 && (
                  <ul className="bg-gray-50 border rounded-md divide-y divide-gray-200">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 px-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm text-gray-600 truncate max-w-[300px]">{file.name}</span>
                          <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Textarea name='remark' label="비고" placeholder="비고 입력" rows={3} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

