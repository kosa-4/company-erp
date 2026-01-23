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
  tel?: string;
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
  rejectReason: string;
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

      if (!response.ok) {
        const errorText = await response.text();
        let message = '협력업체 조회에 실패했습니다.';

        try {
          // JSON 응답인 경우 메시지 추출
          const errorData = JSON.parse(errorText);
          message = errorData.message || message; 
        } catch {
          // JSON이 아닐 시 => 정상적인 응답이 아닐 시
          if (errorText && errorText.length < 100) message = errorText; 
        }  
        throw new Error(message);
      }
      // 2-3. 데이터 파싱
      const data = await response.json();
      // 2-4. 상태 업데이트
      setVendors(data.vendors);
      
    } catch(error: any){
      // 1) 오류 처리
      console.error("데이터 조회 중 오류 발생:", error);
      alert(error.message || "데이터 로드에 실패하였습니다.")
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
  const [originalVendor, setOriginalVendor] = useState<Vendor | null>(null);

  const handleRowClick = async (vendor: Vendor) => {
  // 1. 클릭한 행 데이터(VNCH 데이터가 포함된 목록 데이터)를 즉시 세팅
  // SQL에서 COALESCE로 가져온 '수정 후' 값이 여기에 담겨 있습니다.
  setSelectedVendor(vendor); 
  setOriginalVendor(null); // 초기화
  setAttachedFiles([]);
  latestVendorCodeRef.current = vendor.vendorCode;

  // 2. 상태가 'C'(변경 대기)일 때만 마스터 테이블(VNGL)의 '수정 전' 데이터를 가져옴
  if (vendor.status === 'C') {
    try {
      // 마스터 데이터를 가져오는 전용 경로
      const clickedCode = vendor.vendorCode;
      const response = await fetch(`/api/v1/vendors/${clickedCode}`);
      if (!response.ok) throw new Error('마스터 데이터 조회 실패');
      const result = await response.json();
      
      if (result.success && result.data) {
        // 백엔드에서 온 순수 마스터(VNGL) 데이터만 세팅
        if (latestVendorCodeRef.current !== clickedCode) return;
        setOriginalVendor(result.data); 
      }
    } catch (error) {
      console.error("마스터 데이터 로드 실패:", error);
    }
  }

  // 3. 파일 목록 및 모달 오픈
  fetchVendorFiles(vendor.vendorCode);
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
      width: 50,
      align: 'center',
      render: (value) => getStatusBadge(value as Vendor['status']),
    },
    {
      key: 'vendorCode',
      header: '협력사코드',
      width: 100,
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
      width: 120,
      align: 'left',
    },

    {
      key: 'businessType',
      header: '사업형태',
      width: 100,
      align: 'center',
      render: (value) => {
        // 1. 값이 없는 경우 처리
        if (!value) return '-';
        
        // 2. 문자열로 변환 -> 공백제거 -> 대문자로 통일
        const normalizedValue = String(value).trim().toUpperCase();

        // 3. 비교 로직
        if (normalizedValue === 'CORP') return '법인';
        if (normalizedValue === 'INDIVIDUAL') return '개인';
        
        // 4. 만약 DB에 '법인'이라는 한글 자체가 들어있다면 그대로 출력
        return String(value); 
      },
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
      width: 80,
      align: 'left',
      render: (value) => (
        <span className="truncate block max-w-[200px]" title={String(value)}>
          {String(value)}
        </span>
      ),
    },
    {
      key: 'createdAt', // 서버에서 내려주는 키값이 createdAt 인지 확인하세요
      header: '등록일자',
      width: 100,
      align: 'center',
      render: (value) => (
        // 데이터가 "2026-01-20T15:30:00" 형태라면 앞의 10자리만 추출
        <span className="text-gray-600 text-sm">
          {value ? String(value).substring(0, 10) : '-'}
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
      const response = await fetch("/api/v1/vendors/new", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json(); // { success: true, message: "...", data: "VN..." }

      // 1. 에러 통합 처리
      if (!response.ok || !result.success) {
      // result.errors => valid 메세지
      const errorMsg =
          (result?.data && typeof result.data === 'object' && Object.values(result.data)[0]) ||
          result?.message ||
          '협력업체 등록에 실패했습니다.';
      throw new Error(String(errorMsg));
    }
      
    const vendorCode = result.data; // 컨트롤러가 준 vendorCode가 여기 담김!
    
    // 2. 파일이 존재 시에만 파일 업로드 실행
    if (selectedFiles.length > 0 && vendorCode) {
      try {
          //  1) 회사 코드로 파일 조회
          await uploadFiles(vendorCode);
        } catch (e) {
          // 2) 파일 업로드 실패 시
          console.error("파일 업로드 실패:", e);
          alert('업체는 등록됐지만 파일 업로드에 실패했습니다. 다시 시도해주세요.');
          finalizeRegistration();
          return;
      }
    } // if end

    // 3. 파일 등록까지 성공 시
    alert(result.message || '등록이 완료되었습니다.');
    finalizeRegistration();

    } catch (error: any) {
      alert(error.message || '저장 중 오류가 발생했습니다.');
    }
  };

  const finalizeRegistration = () => {
  setIsCreateModalOpen(false);
  setSelectedFiles([]);
  fetchVendors();
};
// 등록 주소
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

/* 수정 모달용 주소 검색 함수 */
  const handleEditAddressSearch = () => {
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

        // State를 직접 업데이트
        setEditVendorData(prev => {
            if(!prev) return null;
            return {
                ...prev,
                zipCode: data.zonecode,
                address: fullAddress,
                addressDetail: '' // 상세주소 초기화 (사용자 재입력 유도)
            }
        });
        
        // 상세주소 입력창으로 포커스를 주려면 별도 ref가 필요하지만, 
        // 여기서는 데이터 업데이트에 집중합니다.
      }
    }).open();
  };

  /* 승인 */
  const approveVendor = async (targets: Vendor[] = selectedVendors) => {
    if (targets.length === 0) return alert("승인할 업체를 선택해주세요.");

    // 1. 상태 검증: 승인 대상은 무조건 '신규(N)' 또는 '변경(C)'이어야 함
    // 하나라도 승인(A)이나 반려(R)가 섞여 있는지 체크
    const invalidVendor = targets.find(v => v.status === 'A' || v.status === 'R');

    if (invalidVendor) {
      const statusName = invalidVendor?.status === 'A' ? '이미 승인된' : '반려된';
      
      alert(`[${invalidVendor?.vendorName}] 업체는 ${statusName} 상태이므로 승인할 수 없습니다. \n승인 가능한(신규/변경) 업체만 선택해주세요.`);
      return;
    }
    
    // 2. 승인 / 반려 상태가 없을 시
    if (!confirm(`${targets.length}건을 승인하시겠습니까?`)) return;
    
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
        const errorData = await response.json();
        throw new Error(errorData.message || '협력업체 승인에 실패했습니다.');
      } 

      // 2. 승인 성공 알림
      alert('선택한 협력업체가 승인되었습니다.');

      // 3. 성공했을 때만 목록 최신화 및 선택 초기화
      fetchVendors(); // 목록 최신화
      setSelectedVendors([]); // 승인이 끝났으니 체크박스 선택 해제

    } catch(error: any){
      // 3. 오류 처리
      alert(error.message)
      console.error("협력업체 승인 중 오류 발생:", error);
    }; 
  };

  /* 반려 */
  // 1. 반려 사유 입력 모달 상태
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectClick = () => {
    // 1. 선택된 업체가 있는지 확인
    if (selectedVendors.length === 0) {
      return alert("반려할 업체를 선택해주세요.");
    }

    // 2. 상태 검증: 승인(A) 또는 반려(R)인 업체가 포함되어 있는지 확인
    const invalidVendor = selectedVendors.find(v => v.status === 'A' || v.status === 'R');

    if (invalidVendor) {
      const statusName = invalidVendor.status === 'A' ? '이미 승인된' : '이미 반려된';
      alert(
        `[${invalidVendor.vendorName}] 업체는 ${statusName} 상태이므로 반려할 수 없습니다.\n` +
        `반려 가능한(신규/변경) 업체만 선택해주세요.`
      );
      return;
    }

    // 3. 검증 통과 시: 입력 사유 초기화 후 모달 열기
    setRejectReason('');
    setIsRejectModalOpen(true);
  };
  
  /* 반려 확정 실행 함수 */
const rejectVendor = async (reason: string, targets: Vendor[] = selectedVendors) => {
  // 1. 사유 입력 여부 최종 체크
  if (!reason.trim()) {
    return alert("반려 사유를 입력해주세요.");
  }
  const updatedTargets = selectedVendors.map(v => ({
    ...v,
    rejectRemark: rejectReason, // 변수에 담긴 텍스트를 그대로 전달
    status: 'R'
  }));

  // 2. 진행 확인
  if (!confirm(`선택한 ${targets.length}건을 정말 반려하시겠습니까?`)) return;

  try {
    // 1. API 요청 (사유와 대상 목록을 같이 전송)
    const response = await fetch(`/api/v1/vendors/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 서버에서 받기 편하도록 사유와 대상을 하나의 객체로 묶음
      body: JSON.stringify(updatedTargets),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '협력업체 반려에 실패했습니다.');
    }

    // 2. 처리 성공 시 알림 및 상태 초기화
    alert('선택한 협력업체가 반려되었습니다.');

    // 3. 후속 작업
    setIsRejectModalOpen(false); // 반려 모달 닫기
    setRejectReason('');        // 입력값 초기화
    setSelectedVendors([]);     // 체크박스 선택 해제
    fetchVendors();            // 목록 최신화

  } catch (error: any) {
    // 4. 오류 처리
    console.error("협력업체 반려 중 오류 발생:", error);
    alert(error.message || '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
  }
};

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
    const response = await fetch(`/api/v1/vendors/files/${vendorCode}`, {
      method: 'POST',
      body: fileFormData,
    });
    
    // if (!res.ok) throw new Error('파일 업로드 실패');
    if (!response.ok) {
        const errorText = await response.text();
        let message = '파일 업로드에 실패했습니다.';

        try {
          // JSON 응답인 경우 메시지 추출
          const errorData = JSON.parse(errorText);
          message = errorData.message || message; 
        } catch {
          // JSON이 아닐 시 => 정상적인 응답이 아닐 시
          if (errorText && errorText.length < 100) message = errorText; 
        }  
        throw new Error(message);
      }
  };

  const [attachedFiles, setAttachedFiles] = useState<AttFile[]>([]);

// 특정 업체의 파일 목록을 가져오는 함수
const fetchVendorFiles = async (vendorCode: string) => {
  try {
    const response = await fetch(`/api/v1/vendors/${vendorCode}/files`);
    if(!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `입력 실패 ${response.status}`)
    }
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
  } catch (error: any) {
    alert(error.message);
    console.error("파일 목록 로드 실패:", error);
  }
};

const handleFileDownload = async (fileNo: string, fileName: string) => {
    try {
      // 백엔드의 다운로드 API 호출
      const response = await fetch(`/api/v1/vendors/files/download/${fileNo}`);
      if (!response.ok) {
        const errorText = await response.text();
        let message = '파일 다운로드에 실패했습니다.';

        try {
          // JSON 응답인 경우 메시지 추출
          const errorData = JSON.parse(errorText);
          message = errorData.message || message; 
        } catch {
          // JSON이 아닐 시 => 정상적인 응답이 아닐 시
          if (errorText && errorText.length < 100) message = errorText; 
        }  
        throw new Error(message);
      }

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
  /* 수정 */
  // 체크 후 수정 버튼 클릭
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editVendorData, setEditVendorData] = useState<Vendor | null>(null);
  // 체크 후 수정 버튼 클릭 함수 업데이트
  const handleEditVendor = async () => {
    // 1. 한 건 선택 여부 체크
    if (selectedVendors.length !== 1) {
      return alert("수정은 한 건만 선택해야 합니다.");
    }

    const vendor = selectedVendors[0];

    // 2. 상태 체크
    if (vendor.status !== 'A' && vendor.status !== 'R') {
      return alert("승인(A) 또는 반려(R) 상태인 업체만 수정할 수 있습니다.");
    }

    // 3. 데이터 세팅
    setSelectedFiles([]); // 새 파일 목록 초기화
    setEditVendorData({ ...vendor }); // 수정 데이터 세팅
    
    // [추가됨] 기존 파일 목록을 서버에서 가져오기
    await fetchVendorFiles(vendor.vendorCode);
    
    // 4. 모달 오픈
    setIsEditModalOpen(true);
  };
  /* 협력사 정보 수정 요청 (변경/재신청) */
  const updateVendor = async () => {
    // 1. 수정 데이터 존재 여부 확인
    if (!editVendorData) return;

    // 2. 필수값 체크 (예: 업체명, 대표자명 등)
    if (!editVendorData.vendorName.trim()) return alert("협력사명은 필수입니다.");
    
    if (!confirm("수정된 내용으로 승인(변경) 요청을 하시겠습니까?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/vendors/update", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editVendorData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || '수정 요청에 실패했습니다.');
      }

      // 3. 파일이 새로 추가된 경우 (수정 시에도 파일 업로드 로직 재사용)
      if (selectedFiles.length > 0) {
        await uploadFiles(editVendorData.vendorCode);
      }

      alert(result.message || '변경 요청이 완료되었습니다.');
      
      // 4. 후속 작업
      setIsEditModalOpen(false); // 수정 모달 닫기
      setSelectedFiles([]);      // 선택 파일 초기화
      setSelectedVendors([]);    // 목록 선택 해제
      fetchVendors();           // 목록 최신화

    } catch (error: any) {
      console.error("수정 중 오류 발생:", error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
            <Button variant="danger" onClick={handleRejectClick}>반려</Button>
            <Button variant="success" onClick={() => approveVendor(selectedVendors)}>승인</Button>
            <Button variant="secondary" onClick={handleEditVendor} disabled={selectedVendors.length !== 1}>
              수정
            </Button>
            {/*<Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>*/}
            {/*  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
            {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />*/}
            {/*  </svg>*/}
            {/*  등록*/}
            {/*</Button>*/}
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
          // 1. 체크박스로 선택된 '모든' 업체들이 여기에 담깁니다 (다중 선택 유지)
          selectedRows={selectedVendors} 
          
              // 체크박스 다중 선택 기능 (그대로 유지)
          onSelectionChange={(selectedRows) => {
            setSelectedVendors(selectedRows);
            // 여기서 상세정보(selectedVendor)를 건드리면 엉뚱한 데이터가 들어가는 원인이 됨! 절대 삭제!
          }}
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedVendor?.status === 'C' ? "정보 변경 대조 확인" : "협력업체 상세 정보"}
        size="xl"
        footer={<Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>}
      >
        {selectedVendor && (
          <div className="space-y-6">
            {/* 1. 헤더 (업체명 + 뱃지) */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">{selectedVendor.vendorName}</h3>
                {getStatusBadge(selectedVendor.status)}
              </div>
              <div className="text-sm text-gray-500">
                신청일: {selectedVendor.createdAt ? selectedVendor.createdAt.substring(0, 10) : '-'}
              </div>
            </div>

            {/* 2. 반려 사유 (반려 상태일 때만 표시) */}
            {selectedVendor.status === 'R' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-red-700">⚠️ 반려 사유 안내</span>
                </div>
                <div className="text-sm text-red-600 bg-white p-3 rounded border border-red-100">
                  {selectedVendor.rejectReason || '입력된 사유가 없습니다.'}
                </div>
              </div>
            )}

            {/* 3. 상세 정보 표시 영역 */}
            {selectedVendor.status === 'C' ? (
              /* ================================================= */
              /* [CASE 1] 변경 대기(C) 상태: 변경 전/후 비교 뷰 */
              /* ================================================= */
              <div className="space-y-4">
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs font-bold text-center">
                  왼쪽(회색)은 기존 정보이며, 오른쪽(파란색)은 변경 요청된 정보입니다.
                </div>
                
                {/* 비교 필드 정의 */}
                {[
                  { label: "협력사명", curr: originalVendor?.vendorName, orig: selectedVendor.vendorName },
                  { label: "협력사명(영문)", curr: originalVendor?.vendorNameEng, orig: selectedVendor.vendorNameEng },
                  { label: "사업형태", curr: originalVendor?.businessType === 'CORP' ? '법인' : '개인', orig: selectedVendor.businessType === 'CORP' ? '법인' : '개인' },
                  { label: "사업자번호", curr: originalVendor?.businessNo, orig: selectedVendor.businessNo },
                  { label: "대표자명", curr: originalVendor?.ceoName, orig: selectedVendor.ceoName },
                  { label: "전화번호", curr: originalVendor?.tel, orig: selectedVendor.tel },
                  { label: "팩스번호", curr: originalVendor?.fax, orig: selectedVendor.fax },
                  { label: "이메일", curr: originalVendor?.email, orig: selectedVendor.email },
                  { label: "설립일자", curr: originalVendor?.foundationDate, orig: selectedVendor.foundationDate },
                  { label: "업종", curr: originalVendor?.industry, orig: selectedVendor.industry },
                ].map((field, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-4 border-b pb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 font-bold">[기존 정보]</span>
                      <Input label={field.label} value={field.orig || '데이터 없음'} readOnly className="bg-gray-100 text-gray-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-blue-500 font-bold">[변경 요청]</span>
                      <Input label={field.label} value={field.curr || '-'} readOnly className="bg-blue-50 border-blue-200 font-bold" />
                    </div>
                  </div>
                ))}

                {/* 주소 대조 */}
                <div className="grid grid-cols-2 gap-4 border-b pb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold">[기존 주소]</span>
                    <Input label="우편번호" value={selectedVendor.zipCode || ''} readOnly className="bg-gray-100 text-gray-500 mb-2" />
                    <Input value={selectedVendor.address || ''} readOnly className="bg-gray-100 text-gray-500 mb-2" />
                    <Input value={selectedVendor.addressDetail || ''} readOnly className="bg-gray-100 text-gray-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-blue-500 font-bold">[변경 주소]</span>
                    <Input label="우편번호" value={originalVendor?.zipCode || ''} readOnly className="bg-blue-50 border-blue-200 font-bold mb-2" />
                    <Input value={originalVendor?.address || ''} readOnly className="bg-blue-50 border-blue-200 font-bold mb-2" />
                    <Input value={originalVendor?.addressDetail || ''} readOnly className="bg-blue-50 border-blue-200 font-bold" />
                  </div>
                </div>
                
                {/* 비고 대조 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-bold">[기존 비고]</span>
                    <Textarea value={selectedVendor.remark || ''} readOnly rows={2} className="bg-gray-100 text-gray-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-blue-500 font-bold">[변경 비고]</span>
                    <Textarea value={originalVendor?.remark || ''} readOnly rows={2} className="bg-blue-50 border-blue-200 font-bold" />
                  </div>
                </div>
              </div>
            ) : (
              /* ================================================= */
              /* [CASE 2] 일반 상태(N, A, R): 전체 정보 상세 보기 */
              /* ================================================= */
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">기본 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="협력사코드" value={selectedVendor.vendorCode} readOnly className="bg-gray-100" />
                    <Input label="협력사명" value={selectedVendor.vendorName} readOnly />
                    <Input label="협력사명(영문)" value={selectedVendor.vendorNameEng || '-'} readOnly />
                    <Input 
                      label="사업형태" 
                      value={selectedVendor.businessType === 'CORP' ? '법인' : selectedVendor.businessType === 'INDIVIDUAL' ? '개인' : '-'} 
                      readOnly 
                    />
                    <Input label="사업자등록번호" value={selectedVendor.businessNo} readOnly />
                    <Input label="대표자명" value={selectedVendor.ceoName} readOnly />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">연락처 및 주소</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="전화번호" value={selectedVendor.tel || '-'} readOnly />
                    <Input label="팩스번호" value={selectedVendor.fax || '-'} readOnly />
                    <Input label="이메일" value={selectedVendor.email} readOnly />
                    
                    <div className="md:col-span-3 grid grid-cols-4 gap-4">
                       <div className="col-span-1">
                          <Input label="우편번호" value={selectedVendor.zipCode || '-'} readOnly />
                       </div>
                       <div className="col-span-3">
                          <Input label="기본주소" value={selectedVendor.address || '-'} readOnly />
                       </div>
                       <div className="col-span-4">
                          <Input label="상세주소" value={selectedVendor.addressDetail || '-'} readOnly />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">기타 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Input label="설립일자" value={selectedVendor.foundationDate || '-'} readOnly />
                     <Input label="업종" value={selectedVendor.industry || '-'} readOnly className="md:col-span-2" />
                     <div className="md:col-span-3">
                        <Textarea label="비고" value={selectedVendor.remark} readOnly rows={3} />
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. 첨부파일 (공통) */}
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                첨부파일
              </label>
              <div className="mt-2">
                {attachedFiles.length > 0 ? (
                  <ul className="space-y-2">
                    {attachedFiles.map((file) => (
                      <li key={file.fileNum} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 font-medium">{file.originName}</span>
                          <span className="text-xs text-gray-400">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleFileDownload(file.fileNum, file.originName)}>
                          다운로드
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-sm text-gray-400 italic p-2">첨부된 파일이 없습니다.</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedFiles([]); }}
        title="협력업체 정보 수정 (변경 신청)"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>취소</Button>
            <Button variant="primary" onClick={updateVendor}>수정 요청</Button>
          </div>
        }
      >
        {editVendorData && (
          <div className="space-y-6">
            {/* 반려 상태 알림 */}
            {editVendorData.status === 'R' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                <strong>🚨 기존 반려 사유:</strong> {editVendorData.rejectReason || '사유 없음'}
              </div>
            )}

            {/* 입력 폼 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                label="협력사코드" 
                value={editVendorData.vendorCode} 
                readOnly 
                className="bg-gray-100" 
              />
              <Input 
                label="협력사명" 
                value={editVendorData.vendorName}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, vendorName: e.target.value}) : null)}
                required 
              />
              <Input 
                label="협력사명(영문)" 
                placeholder="영문 협력사명 입력"
                value={editVendorData.vendorNameEng || ''}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, vendorNameEng: e.target.value}) : null)}
              />
              
              <Select
                label="사업형태"
                value={editVendorData.businessType}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, businessType: e.target.value as 'CORP' | 'INDIVIDUAL'}) : null)}
                required
                options={[
                  { value: 'CORP', label: '법인' },
                  { value: 'INDIVIDUAL', label: '개인' },
                ]}
              />
              <Input 
                label="사업자등록번호" 
                value={editVendorData.businessNo} 
                readOnly 
                className="bg-gray-100" 
              />
              <Input 
                label="대표자명" 
                value={editVendorData.ceoName}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, ceoName: e.target.value}) : null)}
                required
              />

              {/* 주소 필드 */}
              <div className="flex gap-2">
                <Input 
                    label="우편번호" 
                    value={editVendorData.zipCode} 
                    readOnly 
                    required 
                />
                <div className="flex items-end">
                  <Button onClick={handleEditAddressSearch} variant="secondary" className="h-[42px]">검색</Button>
                </div>
              </div>
              <div className="col-span-2">
                <Input 
                    label="주소" 
                    value={editVendorData.address} 
                    readOnly 
                    required 
                />
              </div>
              <Input 
                label="상세주소" 
                value={editVendorData.addressDetail || ''}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, addressDetail: e.target.value}) : null)}
                placeholder="상세주소 입력" 
                className="col-span-3"
              />

              <Input 
                label="전화번호" 
                value={editVendorData.tel || ''}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, tel: e.target.value}) : null)}
                placeholder="02-0000-0000" 
              />
              <Input 
                label="팩스번호" 
                value={editVendorData.fax || ''}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, fax: e.target.value}) : null)}
                placeholder="02-0000-0000" 
              />
              <Input 
                label="이메일" 
                value={editVendorData.email}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, email: e.target.value}) : null)}
                type="email" 
                required 
              />
              
              {/* [수정됨] 설립일자 (날짜 초기화 버그 수정) */}
              <DatePicker 
                label="설립일자" 
                // 값 표시: 시간이 포함되어 있을 수 있으므로 앞 10자리만 자름
                value={(editVendorData.foundationDate || '').substring(0, 10)}
                // 변경 핸들러: 함수형 업데이트 사용
                onChange={(e: any) => {
                    const newVal = (e && e.target) ? e.target.value : e;
                    setEditVendorData(prev => prev ? ({...prev, foundationDate: newVal}) : null);
                }}
              />
              
              <Input 
                label="업종" 
                value={editVendorData.industry || ''}
                onChange={(e) => setEditVendorData(prev => prev ? ({...prev, industry: e.target.value}) : null)}
                placeholder="업종 입력" 
              />
            </div>
            
            {/* 파일 관리 섹션 */}
            <div className="space-y-4 pt-4 border-t">
              
              {/* 1. 기존 업로드된 파일 목록 (보기 및 다운로드) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">기존 첨부파일</label>
                {attachedFiles.length > 0 ? (
                  <ul className="space-y-2">
                    {attachedFiles.map((file) => (
                      <li key={file.fileNum} className="flex items-center justify-between p-2 bg-blue-50/50 rounded-md border border-blue-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600">[기존]</span>
                          <span className="text-sm text-gray-700">{file.originName}</span>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleFileDownload(file.fileNum, file.originName)}>
                          다운로드
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-400 italic">기존에 업로드된 파일이 없습니다.</div>
                )}
              </div>

              {/* 2. 새로운 파일 추가 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">파일 추가 (기존 파일은 유지됩니다)</label>
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
                      multiple 
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {/* 새로 선택된 파일 목록 */}
                  {selectedFiles.length > 0 && (
                    <ul className="bg-gray-50 border rounded-md divide-y divide-gray-200">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-green-600">[신규]</span>
                            <span className="text-sm text-gray-600 truncate max-w-[250px]">{file.name}</span>
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
            </div>

            {/* 비고 (Remark) */}
            <div className="w-full">
                <Textarea 
                  label="수정 사유 / 비고" 
                  value={editVendorData.remark || ''}
                  onChange={(e) => setEditVendorData(prev => prev ? ({...prev, remark: e.target.value}) : null)}
                  rows={3} 
                  placeholder="정보 변경 사유 등을 입력하세요."
                />
            </div>
          </div>
        )}
      </Modal>
      

      {/* 등록 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSelectedFiles([]); }}
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
              <Input name="vendorCode" label="협력사코드" value="-" readOnly disabled/> {/* 백에서 체번하므로 불필요 */}
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
      {/* 반려 사유 입력 모달 */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="협력업체 반려 사유 입력"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>취소</Button>
            <Button variant="danger" onClick={() => rejectVendor(rejectReason)}>반려 확정</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded text-red-700 text-sm">
            선택한 <strong>{selectedVendors.length}건</strong>의 업체를 반려 처리합니다.
          </div>
          <Textarea 
            label="반려 사유 (필수)" 
            placeholder="반려 사유를 입력해주세요." 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
}

