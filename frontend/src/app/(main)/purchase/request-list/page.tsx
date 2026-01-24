'use client';

import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ColumnDef, StatusType } from '@/types';
import { formatNumber } from '@/lib/utils';
import { prApi, PrListResponse, PrDtDTO } from '@/lib/api/pr';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Upload, X } from 'lucide-react';
import { FileListItemResponse } from '@/lib/api/notice';

interface PurchaseRequest {
  prNo: string;
  prName: string;
  status: StatusType;
  purchaseType: string;
  requester: string;
  department: string;
  requestDate: string;
  amount: number;
  remark: string;
}

// 백엔드 응답을 프론트엔드 형식으로 변환
const transformPrListResponse = (response: PrListResponse[]): PurchaseRequest[] => {
  // regDate를 KST 기준 YYYY-MM-DD로 변환
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';

    try {
      const d =
        typeof date === 'string'
          ? new Date(date)
          : new Date(date);

      if (Number.isNaN(d.getTime())) return '';

      // 브라우저 로컬 타임존(KST 환경 기준)에서 연-월-일만 추출
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  return response.map((item, index) => {
    console.log(`🔄 [${index}] 변환 전 item:`, {
      prNum: item.prNum,
      prSubject: item.prSubject,
      progressCd: item.progressCd,
      pcType: item.pcType,
      prAmt: item.prAmt,
      requester: item.requester,
      deptName: item.deptName,
    });

    const transformed = {
      prNo: item.prNum || '',
      prName: item.prSubject || '',
      status: mapProgressCdToStatus(item.progressCd),
      purchaseType: item.pcType || '일반',
      requester: item.requester || '',
      department: item.deptName || '',
      requestDate: formatDate(item.regDate),
      amount: Number(item.prAmt) || 0,
      remark: item.rmk || '',
    };

    console.log(`✅ [${index}] 변환 후:`, transformed);
    return transformed;
  });
};

// 진행상태코드를 StatusType으로 변환
const mapProgressCdToStatus = (progressCd: string | null | undefined): StatusType => {
  if (!progressCd) return 'TEMP';

  const statusMap: Record<string, StatusType> = {
    '임시저장': 'TEMP',
    '승인': 'APPROVED',
    '반려': 'REJECTED',
  };
  return statusMap[progressCd] || 'TEMP';
};

export default function PurchaseRequestListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isBuyer = user?.role === 'BUYER' || user?.role === 'ADMIN';

  const [data, setData] = useState<PurchaseRequest[]>([]);
  const [selectedRows, setSelectedRows] = useState<PurchaseRequest[]>([]);
  const [searchParams, setSearchParams] = useState({
    prNo: '',
    prName: '',
    startDate: '',
    endDate: '',
    requester: '',
    department: '',
    purchaseType: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPr, setSelectedPr] = useState<PurchaseRequest | null>(null);
  const [prDetailItems, setPrDetailItems] = useState<PrDtDTO[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    prName: '',
    purchaseType: '',
  });
  const [saving, setSaving] = useState(false);
  const [expandedPrs, setExpandedPrs] = useState<Set<string>>(new Set());
  const [prItemsMap, setPrItemsMap] = useState<Map<string, PrDtDTO[]>>(new Map());
  const [editPrItems, setEditPrItems] = useState<PrDtDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deptNameList, setDeptNameList] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<FileListItemResponse[]>([]);
  const [originalAttachedFiles, setOriginalAttachedFiles] = useState<FileListItemResponse[]>([]);
  const [editUploadedFiles, setEditUploadedFiles] = useState<File[]>([]);
  const [deletedFileNums, setDeletedFileNums] = useState<string[]>([]);
  const [isEditDragging, setIsEditDragging] = useState(false);

  // 목록 조회
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);

      // 프론트엔드 파라미터를 백엔드 파라미터로 매핑
      const params = {
        prNum: searchParams.prNo || undefined,
        prSubject: searchParams.prName || undefined,
        pcType: searchParams.purchaseType || undefined,
        requester: searchParams.requester || undefined,
        deptName: searchParams.department || undefined,
        progressCd: searchParams.status || undefined,
        requestDate: searchParams.startDate || undefined,
        page: currentPage,
        pageSize: pageSize,
      };

      console.log('API 요청 params:', params);
      const response = await prApi.getList(params);
      console.log('백엔드 응답 원본:', response);

      if (!response || !response.items || response.items.length === 0) {
        console.warn('응답 데이터가 비어있습니다.');
        setData([]);
        setTotalCount(0);
        setTotalPages(0);
        return;
      }

      const transformedData = transformPrListResponse(response.items);
      console.log('변환된 데이터:', transformedData);
      setData(transformedData);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('구매요청 목록 조회 실패:', error);
      toast.error('구매요청 목록을 불러오는데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage]);

  // 부서 목록 조회
  useEffect(() => {
    const loadDeptNameList = async () => {
      try {
        const deptNames = await prApi.getDeptNameList();
        setDeptNameList(deptNames);
      } catch (error) {
        console.error('부서 목록 조회 실패:', error);
      }
    };
    loadDeptNameList();
  }, []);

  // 초기 로드 및 페이지/검색조건 변경 시 재조회
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => fetchData();

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReset = () => {
    setSearchParams({
      prNo: '',
      prName: '',
      startDate: '',
      endDate: '',
      requester: '',
      department: '',
      purchaseType: '',
      status: '',
    });
    setCurrentPage(1);
  };

  // 행 클릭 시 품목 목록 펼치기/접기
  const toggleExpand = async (prNo: string) => {
    const newExpanded = new Set(expandedPrs);

    if (newExpanded.has(prNo)) {
      newExpanded.delete(prNo);
    } else {
      // 펼치기 - 품목 목록 조회
      newExpanded.add(prNo);

      // 이미 조회한 품목 목록이 없으면 API 호출
      if (!prItemsMap.has(prNo)) {
        try {
          setLoadingDetail(true);
          const detail = await prApi.getDetail(prNo);
          const detailList = detail.items || [];
          setPrItemsMap(prev => new Map(prev).set(prNo, detailList));
        } catch (error) {
          toast.error('구매요청 품목 정보를 불러오는데 실패했습니다.');
          newExpanded.delete(prNo);
        } finally {
          setLoadingDetail(false);
        }
      }
    }

    setExpandedPrs(newExpanded);
  };

  // PR번호 클릭 시 상세 모달 열기
  const handlePrNoClick = async (row: PurchaseRequest, e: React.MouseEvent) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방지

    setSelectedPr(row);
    setIsDetailModalOpen(true);
    setIsEditing(false);
    setEditFormData({
      prName: row.prName,
      purchaseType: row.purchaseType,
    });

    // PR번호로 상세 정보 조회 (헤더 + DT 항목 목록)
    try {
      setLoadingDetail(true);
      const detail = await prApi.getDetail(row.prNo);
      const detailList = detail.items || [];
      setPrDetailItems(detailList);
      setEditPrItems(detailList.map(item => ({ ...item }))); // 복사본 생성

      // 첨부파일 목록 조회
      try {
        const files = await prApi.getFileList(row.prNo);
        setAttachedFiles(files || []);
        setOriginalAttachedFiles(files || []);
      } catch (fileError) {
        console.error('첨부파일 목록 조회 실패:', fileError);
        setAttachedFiles([]);
        setOriginalAttachedFiles([]);
      }
    } catch (error: any) {
      toast.error('구매요청 상세 정보를 불러오는데 실패했습니다: ' + (error?.message || '알 수 없는 오류'));
      setPrDetailItems([]);
      setEditPrItems([]);
      setAttachedFiles([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 구매유형 영문 값을 한글 값으로 변환
  const convertPurchaseTypeToKorean = (purchaseType: string): string => {
    const typeMap: Record<string, string> = {
      '일반': '일반구매',
      '일반구매': '일반구매',
      '단가계약': '단가계약',
      '긴급': '긴급구매',
      '긴급구매': '긴급구매',
    };
    return typeMap[purchaseType] || purchaseType;
  };

  // 구매유형 한글 값을 영문 값으로 변환 (Select 옵션용)
  const convertPurchaseTypeToEnglish = (purchaseType: string): string => {
    const typeMap: Record<string, string> = {
      '일반구매': '일반',
      '일반': '일반',
      '단가계약': '단가계약',
      '긴급구매': '긴급',
      '긴급': '긴급',
    };
    return typeMap[purchaseType] || purchaseType;
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 파일 검증 함수
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 확장자 검증
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `${file.name}: 허용되지 않는 파일 형식입니다. (PDF, DOC, XLSX, 이미지 파일만 가능)`
      };
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `${file.name}: 파일 크기가 10MB를 초과합니다. (현재: ${formatFileSize(file.size)})`
      };
    }

    return { valid: true };
  };

  // 목록에서 수정 버튼 클릭 핸들러
  const handleEditFromList = async () => {
    if (selectedRows.length === 0) {
      toast.warning('수정할 구매요청을 선택해주세요.');
      return;
    }

    // 여러 개 선택 시 알림 표시
    if (selectedRows.length > 1) {
      toast.warning('수정은 1건만 가능합니다.');
      return;
    }

    // 승인된 항목 필터링
    const editableRows = selectedRows.filter(row => row.status !== 'APPROVED');
    if (editableRows.length === 0) {
      toast.warning('수정 가능한 구매요청이 없습니다. (승인된 항목은 수정할 수 없습니다)');
      return;
    }

    // 첫 번째 선택된 항목의 상세 화면 열기
    const firstRow = editableRows[0];
    setSelectedPr(firstRow);
    setIsDetailModalOpen(true);
    setIsEditing(true);
    setEditFormData({
      prName: firstRow.prName,
      purchaseType: firstRow.purchaseType,

    });

    // 품목 목록 조회
    try {
      setLoadingDetail(true);
      const detail = await prApi.getDetail(firstRow.prNo);
      const detailList = detail.items || [];
      setPrDetailItems(detailList);
      setEditPrItems(detailList.map(item => ({ ...item }))); // 복사본 생성

      // 첨부파일 목록 조회
      try {
        const files = await prApi.getFileList(firstRow.prNo);
        setAttachedFiles(files || []);
        setOriginalAttachedFiles(files || []);
      } catch (fileError) {
        console.error('첨부파일 목록 조회 실패:', fileError);
        setAttachedFiles([]);
        setOriginalAttachedFiles([]);
      }
    } catch (error: any) {
      console.error('구매요청 상세 정보 조회 실패:', error);
      toast.error('구매요청 상세 정보를 불러오는데 실패했습니다: ' + (error?.message || '알 수 없는 오류'));
      setPrDetailItems([]);
      setEditPrItems([]);
      setAttachedFiles([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 상세 모달 내부 수정 버튼 클릭 핸들러
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsDetailModalOpen(false);
    setIsEditing(false);
    setEditUploadedFiles([]);
    setDeletedFileNums([]);
    setPrDetailItems([]);
    setSelectedPr(null);
    setAttachedFiles([]);
    setOriginalAttachedFiles([]);
  };

  // 수정 모드에서 기존 파일 삭제 핸들러
  const handleDeleteExistingFile = (fileNum: string) => {
    setDeletedFileNums(prev => [...prev, fileNum]);
    setAttachedFiles(prev => prev.filter(file => file.fileNum !== fileNum));
  };

  // 수정 모드 파일 선택 핸들러
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(validation.error);
      }
    });

    if (validFiles.length > 0) {
      setEditUploadedFiles(prev => [...prev, ...validFiles]);
    }

    // input 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = '';
  };

  // 수정 모드 파일 제거 핸들러
  const handleEditFileRemove = (index: number) => {
    setEditUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 드래그 앤 드롭 핸들러 (수정 모달)
  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDragging(true);
  };

  const handleEditDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDragging(false);
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles: File[] = [];

      files.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          toast.error(validation.error);
        }
      });

      if (validFiles.length > 0) {
        setEditUploadedFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPr) return;

    if (!editFormData.prName.trim()) {
      toast.warning('구매요청명을 입력해주세요.');
      return;
    }

    // 품목 수량, 단가 검증
    if (editPrItems.length === 0) {
      toast.warning('품목이 없습니다.');
      return;
    }

    const invalidItems = editPrItems.filter(item =>
      !item.prQt || Number(item.prQt) <= 0 || !item.unitPrc || Number(item.unitPrc) <= 0
    );

    if (invalidItems.length > 0) {
      toast.warning('모든 품목의 수량과 단가를 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const pcTypeKorean = convertPurchaseTypeToKorean(editFormData.purchaseType);

      // 품목 데이터 변환
      const prDtList = editPrItems.map(item => ({
        itemCd: item.itemCd,
        prQt: Number(item.prQt),
        unitPrc: Number(item.unitPrc),
      }));

      await prApi.update(selectedPr.prNo, {
        prSubject: editFormData.prName,
        pcType: pcTypeKorean,
        prDtList: prDtList,
      });

      // 2. 삭제된 파일 논리적 삭제 처리
      if (deletedFileNums.length > 0) {
        console.log('삭제할 파일 개수:', deletedFileNums.length);
        for (const fileNum of deletedFileNums) {
          try {
            await prApi.deleteFile(fileNum);
            console.log('파일 삭제 완료:', fileNum);
          } catch (error: any) {
            console.error('파일 삭제 실패:', error);
            toast.error(`파일 삭제에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
          }
        }
      }

      // 3. 새로 추가된 파일 업로드
      if (editUploadedFiles.length > 0) {
        console.log('업로드할 파일 개수:', editUploadedFiles.length);
        for (const file of editUploadedFiles) {
          try {
            await prApi.uploadFile(selectedPr.prNo, file);
            console.log('파일 업로드 완료:', file.name);
          } catch (error: any) {
            console.error('파일 업로드 실패:', error);
            toast.error(`${file.name} 업로드에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
          }
        }
      }

      toast.success('구매요청이 수정되었습니다.');
      setIsEditing(false);
      setIsDetailModalOpen(false);
      setEditUploadedFiles([]);
      setDeletedFileNums([]);
      setIsEditDragging(false);
      setSelectedRows([]); // 체크박스 해제

      // 상세 정보 새로고침
      const detail = await prApi.getDetail(selectedPr.prNo);
      const detailList = detail.items || [];
      setPrDetailItems(detailList);

      // 첨부파일 목록 새로고침
      try {
        const files = await prApi.getFileList(selectedPr.prNo);
        setAttachedFiles(files || []);
        setOriginalAttachedFiles(files || []);
      } catch (fileError) {
        console.error('첨부파일 목록 조회 실패:', fileError);
      }

      await fetchData();

    } catch (error: any) {
      console.error('구매요청 수정 실패:', error);
      toast.error(error?.data?.error || error?.message || '구매요청 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };



  const getStatusBadge = (status: StatusType) => {
    const config = {
      TEMP: { variant: 'gray' as const, label: '임시저장' },
      APPROVED: { variant: 'green' as const, label: '승인' },
      REJECTED: { variant: 'red' as const, label: '반려' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<PurchaseRequest>[] = [
    {
      key: 'status',
      header: '상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as StatusType),
    },
    {
      key: 'prNo',
      header: 'PR번호',
      width: 150,
      align: 'center',
      render: (value, row) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer font-medium"
          onClick={(e) => handlePrNoClick(row as PurchaseRequest, e)}
        >
          {String(value)}
        </span>
      ),
    },
    { key: 'prName', header: '구매요청명', width: 250, align: 'left' },
    { key: 'purchaseType', header: '구매유형', width: 100, align: 'center' },
    { key: 'requester', header: '요청자', width: 100, align: 'center' },
    { key: 'department', header: '부서', width: 120, align: 'center' },
    { key: 'requestDate', header: '요청일', width: 110, align: 'center' },
    {
      key: 'amount',
      header: '금액',
      width: 150,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
  ];

  // 승인 상태인 행은 선택 불가능하도록 필터링
  const isRowSelectable = (row: PurchaseRequest) => {
    return row.status !== 'APPROVED';
  };

  // 선택 변경 핸들러 - 승인 상태인 항목 자동 제거
  const handleSelectionChange = (selected: PurchaseRequest[]) => {
    // 승인 상태인 항목은 자동으로 제거
    const filtered = selected.filter(row => row.status !== 'APPROVED');
    setSelectedRows(filtered);

    // 승인 상태인 항목이 제거되었으면 알림
    if (selected.length !== filtered.length) {
      const removedCount = selected.length - filtered.length;
      toast.info(`${removedCount}건의 승인된 구매요청은 선택할 수 없습니다.`);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      toast.warning('삭제할 항목을 선택해주세요.');
      return;
    }

    // 승인 상태인 항목이 있는지 다시 한번 체크 (안전장치)
    const approvedItems = selectedRows.filter(row => row.status === 'APPROVED');
    if (approvedItems.length > 0) {
      toast.warning('승인된 구매요청은 삭제할 수 없습니다.');
      setSelectedRows(selectedRows.filter(row => row.status !== 'APPROVED'));
      return;
    }

    // 중복 제거 (같은 PR번호)
    const uniquePrNos = [...new Set(selectedRows.map(row => row.prNo))];

    toast(`선택한 ${uniquePrNos.length}건의 구매요청을 삭제하시겠습니까?`, {
      action: {
        label: '삭제',
        onClick: async () => {
          try {
            setLoading(true);
            await Promise.all(uniquePrNos.map(prNo => prApi.delete(prNo)));
            toast.success(`${uniquePrNos.length}건이 삭제되었습니다.`);
            setSelectedRows([]);
            await fetchData();
          } catch (error) {
            console.error('구매요청 삭제 실패:', error);
            toast.error('구매요청 삭제에 실패했습니다.');
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      toast.warning('승인할 항목을 선택해주세요.');
      return;
    }

    // 승인 상태 또는 반려 상태인 항목 필터링 (임시저장 상태만 승인 가능)
    const approvableRows = selectedRows.filter(row => row.status === 'TEMP');
    if (approvableRows.length === 0) {
      toast.warning('승인 가능한 항목이 없습니다.');
      return;
    }

    // 중복 제거
    const prNos = [...new Set(approvableRows.map(row => row.prNo))];

    toast(`${prNos.length}건의 구매요청을 승인하시겠습니까?`, {
      action: {
        label: '승인',
        onClick: async () => {
          try {
            setLoading(true);
            await Promise.all(prNos.map(prNo => prApi.approve(prNo)));
            toast.success(`${prNos.length}건이 승인되었습니다.`);
            setSelectedRows([]);
            await fetchData();
          } catch (error) {
            console.error('구매요청 승인 실패:', error);
            toast.error('구매요청 승인에 실패했습니다.');
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const handleReject = async () => {
    if (selectedRows.length === 0) {
      toast.warning('반려할 항목을 선택해주세요.');
      return;
    }

    // 이미 반려된 문서 확인
    const rejectedRows = selectedRows.filter(row => row.status === 'REJECTED');
    if (rejectedRows.length > 0) {
      // 반려된 문서만 선택된 경우
      if (rejectedRows.length === selectedRows.length) {
        toast.warning('이미 반려된 문서입니다.');
        return;
      }
      // 반려된 문서와 다른 상태의 문서가 함께 선택된 경우
      toast.warning('이미 반려된 문서는 제외됩니다.');
    }

    // 승인 상태인 항목은 반려 불가, 반려된 항목도 제외
    const rejectableRows = selectedRows.filter(row => row.status !== 'APPROVED' && row.status !== 'REJECTED');
    if (rejectableRows.length === 0) {
      toast.warning('반려 가능한 항목이 없습니다.');
      return;
    }

    const prNos = [...new Set(rejectableRows.map(row => row.prNo))];

    toast(`${prNos.length}건의 구매요청을 반려하시겠습니까?`, {
      action: {
        label: '반려',
        onClick: async () => {
          try {
            setLoading(true);
            await Promise.all(prNos.map(prNo => prApi.reject(prNo)));
            toast.success(`${prNos.length}건이 반려되었습니다.`);
            setSelectedRows([]);
            await fetchData();
          } catch (error) {
            console.error('구매요청 반려 실패:', error);
            toast.error('구매요청 반려에 실패했습니다.');
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="구매요청 현황"
        subtitle="구매요청 목록을 조회하고 관리합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PR번호"
          placeholder="PR번호 입력"
          value={searchParams.prNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, prNo: e.target.value }))}
        />
        <Input
          label="구매요청명"
          placeholder="구매요청명 입력"
          value={searchParams.prName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, prName: e.target.value }))}
        />
        <DatePicker
          label="요청일자"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />

        <Select
          label="구매유형"
          value={searchParams.purchaseType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, purchaseType: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: '일반구매', label: '일반' },
            { value: '단가계약', label: '단가계약' },
            { value: '긴급구매', label: '긴급' },
          ]}
        />

        <Input
          label="요청자"
          placeholder="요청자 입력"
          value={searchParams.requester}
          onChange={(e) => setSearchParams(prev => ({ ...prev, requester: e.target.value }))}
        />
        <Select
          label="부서"
          value={searchParams.department}
          onChange={(e) => setSearchParams(prev => ({ ...prev, department: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            ...deptNameList.map(deptName => ({ value: deptName, label: deptName }))
          ]}
        />
        <Select
          label="상태"
          value={searchParams.status}
          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: '임시저장', label: '임시저장' },
            { value: '승인', label: '승인' },
            { value: '반려', label: '반려' },
          ]}
        />
      </SearchPanel>

      <Card
        title="구매요청 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleEditFromList}
              disabled={
                selectedRows.length === 0 ||
                selectedRows.some(row => row.status === 'APPROVED')
              }
            >
              수정
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={
                loading ||
                selectedRows.length === 0 ||
                selectedRows.some(row => row.status === 'APPROVED')
              }
            >
              삭제
            </Button>
            {isBuyer && (
              <>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={
                    selectedRows.length === 0 ||
                    selectedRows.some(row => row.status !== 'TEMP')
                  }
                >
                  승인
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={
                    selectedRows.length === 0 ||
                    selectedRows.some(row => row.status === 'APPROVED')
                  }
                >
                  반려
                </Button>
              </>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            구매요청 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12"></th>
                  <th className="px-4 py-3.5 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === data.filter(row => row.status !== 'APPROVED').length && data.filter(row => row.status !== 'APPROVED').length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(data.filter(row => row.status !== 'APPROVED'));
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5 font-medium text-center w-[100px]">상태</th>
                  <th className="px-4 py-3.5 font-medium text-center w-[150px]">PR번호</th>
                  <th className="px-4 py-3.5 font-medium text-left w-[250px]">구매요청명</th>
                  <th className="px-4 py-3.5 font-medium text-center w-[100px]">구매유형</th>
                  <th className="px-4 py-3.5 font-medium text-center w-[100px]">요청자</th>
                  <th className="px-4 py-3.5 font-medium text-center w-[120px]">부서</th>
                  <th className="px-4 py-3.5 font-medium text-center w-[110px]">요청일</th>
                  <th className="px-4 py-3.5 font-medium text-right w-[150px]">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row) => (
                  <React.Fragment key={row.prNo}>
                    <tr
                      className={`
                          transition-colors duration-150 cursor-pointer
                          ${selectedRows.some(r => r.prNo === row.prNo) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                      onClick={() => toggleExpand(row.prNo)}
                    >
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedPrs.has(row.prNo) ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.some(r => r.prNo === row.prNo)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              if (row.status !== 'APPROVED') {
                                setSelectedRows(prev => [...prev, row]);
                              } else {
                                alert('승인된 구매요청은 선택할 수 없습니다.');
                              }
                            } else {
                              setSelectedRows(prev => prev.filter(r => r.prNo !== row.prNo));
                            }
                          }}
                          disabled={row.status === 'APPROVED'}
                          className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center">{getStatusBadge(row.status)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className="text-blue-600 hover:underline cursor-pointer font-medium"
                          onClick={(e) => handlePrNoClick(row, e)}
                        >
                          {row.prNo}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-left">{row.prName}</td>
                      <td className="px-4 py-3.5 text-center">{row.purchaseType}</td>
                      <td className="px-4 py-3.5 text-center">{row.requester}</td>
                      <td className="px-4 py-3.5 text-center">{row.department}</td>
                      <td className="px-4 py-3.5 text-center">{row.requestDate}</td>
                      <td className="px-4 py-3.5 text-right font-medium">₩{formatNumber(row.amount)}</td>
                    </tr>

                    {/* 펼쳐진 품목 상세 */}
                    {expandedPrs.has(row.prNo) && (
                      <tr>
                        <td colSpan={10} className="bg-gray-50/50 px-4 py-3">
                          <div className="ml-12">
                            {loadingDetail ? (
                              <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                <p className="mt-2 text-sm text-gray-500">품목 정보를 불러오는 중...</p>
                              </div>
                            ) : prItemsMap.has(row.prNo) && prItemsMap.get(row.prNo)!.length > 0 ? (
                              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-center">품목코드</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-left">품목명</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-center">규격</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-center">단위</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">수량</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">단가</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-right">금액</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-center">희망납기일</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-left">비고</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  {prItemsMap.get(row.prNo)!.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-xs text-center">{item.itemCd || '-'}</td>
                                      <td className="px-3 py-2 text-xs text-left">{item.itemDesc || '-'}</td>
                                      <td className="px-3 py-2 text-xs text-center">{item.itemSpec || '-'}</td>
                                      <td className="px-3 py-2 text-xs text-center">{item.unitCd || '-'}</td>
                                      <td className="px-3 py-2 text-xs text-right">{formatNumber(Number(item.prQt) || 0)}</td>
                                      <td className="px-3 py-2 text-xs text-right">₩{formatNumber(Number(item.unitPrc) || 0)}</td>
                                      <td className="px-3 py-2 text-xs text-right font-medium">₩{formatNumber(Number(item.prAmt) || 0)}</td>
                                      <td className="px-3 py-2 text-xs text-center">
                                        {item.delyDate
                                          ? new Date(item.delyDate).toISOString().slice(0, 10)
                                          : '-'}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-left">{item.rmk || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                등록된 품목이 없습니다.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 페이징 */}
      {totalPages > 0 && (
        <div className="flex items-center justify-center mt-4 px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              이전
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              다음
            </Button>
          </div>
          <div className="absolute left-4 text-sm text-gray-600">
            총 {totalCount}건 중 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)}건 표시
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setPrDetailItems([]);
          setSelectedPr(null);
          setIsEditing(false);
          setAttachedFiles([]);
          setOriginalAttachedFiles([]);
          setEditUploadedFiles([]);
          setDeletedFileNums([]);
          setIsEditDragging(false);
        }}
        title="구매요청 상세"
        size="lg"
        footer={
          isEditing ? (
            <ModalFooter
              onClose={handleCancelEdit}
              onConfirm={handleSaveEdit}
              cancelText="취소"
              confirmText="저장"
            />
          ) : (
            <ModalFooter
              onClose={() => {
                setIsDetailModalOpen(false);
                setPrDetailItems([]);
                setSelectedPr(null);
                setIsEditing(false);
                setAttachedFiles([]);
                setOriginalAttachedFiles([]);
                setEditUploadedFiles([]);
                setDeletedFileNums([]);
                setIsEditDragging(false);
              }}
              cancelText="닫기"
            />
          )
        }
      >
        {selectedPr && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">구매요청 상세</h3>
                {getStatusBadge(selectedPr.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">PR번호</label>
                <p className="font-medium">{selectedPr.prNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">구매요청명</label>
                {isEditing ? (
                  <Input
                    value={editFormData.prName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, prName: e.target.value }))}
                    placeholder="구매요청명 입력"
                    required
                  />
                ) : (
                  <p className="font-medium">{selectedPr.prName}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">구매유형</label>
                {isEditing ? (
                  <Select
                    value={convertPurchaseTypeToEnglish(editFormData.purchaseType)}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, purchaseType: e.target.value }))}
                    options={[
                      { value: '일반', label: '일반' },
                      { value: '단가계약', label: '단가계약' },
                      { value: '긴급', label: '긴급' },
                    ]}
                  />
                ) : (
                  <p className="font-medium">{selectedPr.purchaseType}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">요청자</label>
                <p className="font-medium">{selectedPr.requester} / {selectedPr.department}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">요청일</label>
                <p className="font-medium">{selectedPr.requestDate}</p>
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
                    <th className="p-3 text-center text-sm font-semibold text-gray-600">희망납기일</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDetail ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        상세 정보를 불러오는 중...
                      </td>
                    </tr>
                  ) : (isEditing ? editPrItems : prDetailItems).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        품목 정보가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    (isEditing ? editPrItems : prDetailItems).map((item, index) => {
                      const prQt = Number(item.prQt) || 0;
                      const unitPrc = Number(item.unitPrc) || 0;
                      const prAmt = prQt * unitPrc;

                      return (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{item.itemCd || ''}</td>
                          <td className="p-3 text-sm">{item.itemDesc || ''}</td>
                          <td className="p-3 text-sm text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={prQt}
                                onChange={(e) => {
                                  const newQt = Number(e.target.value) || 0;
                                  const newItems = [...editPrItems];
                                  newItems[index] = { ...newItems[index], prQt: newQt };
                                  setEditPrItems(newItems);
                                }}
                                className="w-24 text-right"
                                min="0"
                                step="1"
                              />
                            ) : (
                              formatNumber(prQt)
                            )}
                          </td>
                          <td className="p-3 text-sm text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={unitPrc}
                                onChange={(e) => {
                                  const newUnitPrc = Number(e.target.value) || 0;
                                  const newItems = [...editPrItems];
                                  newItems[index] = { ...newItems[index], unitPrc: newUnitPrc };
                                  setEditPrItems(newItems);
                                }}
                                className="w-32 text-right"
                                min="0"
                                step="1"
                              />
                            ) : (
                              `₩${formatNumber(unitPrc)}`
                            )}
                          </td>
                          <td className="p-3 text-sm text-right font-medium">₩{formatNumber(prAmt)}</td>
                          <td className="p-3 text-sm text-center">
                            {item.delyDate
                              ? (typeof item.delyDate === 'string'
                                ? item.delyDate.split('T')[0]
                                : new Date(item.delyDate).toISOString().split('T')[0])
                              : ''}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 요청금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(
                    isEditing && editPrItems.length > 0
                      ? editPrItems.reduce((sum, item) => {
                        const qt = Number(item.prQt) || 0;
                        const unitPrc = Number(item.unitPrc) || 0;
                        return sum + (qt * unitPrc);
                      }, 0)
                      : prDetailItems.length > 0
                        ? prDetailItems.reduce((sum, item) => sum + (Number(item.prAmt) || 0), 0)
                        : selectedPr.amount
                  )}
                </span>
              </div>
            </div>

            {/* 첨부파일 목록 */}
            {isEditing ? (
              <>
                {/* 기존 첨부파일 목록 */}
                {attachedFiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">기존 첨부파일</label>
                    <div className="space-y-2">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.fileNum}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.originName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => prApi.downloadFile(file.fileNum)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="다운로드"
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingFile(file.fileNum)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="삭제"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 새 첨부파일 추가 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일 추가</label>
                  <input
                    type="file"
                    id="edit-file-upload"
                    className="hidden"
                    multiple
                    onChange={handleEditFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                  />
                  <label
                    htmlFor="edit-file-upload"
                    onDragOver={handleEditDragOver}
                    onDragLeave={handleEditDragLeave}
                    onDrop={handleEditDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors block ${isEditDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-600">클릭하여 파일을 선택하거나 드래그하여 업로드</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLSX, 이미지 파일 (최대 10MB)</p>
                  </label>

                  {/* 선택된 파일 목록 */}
                  {editUploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {editUploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEditFileRemove(index)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              attachedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
                  <div className="space-y-2">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.fileNum}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => prApi.downloadFile(file.fileNum)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.originName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}