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
import { ColumnDef, StatusType } from '@/types';
import { formatNumber } from '@/lib/utils';
import { prApi, PrListResponse, PrDtDTO } from '@/lib/api/pr';

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
  // regDate가 Date 객체 또는 문자열일 수 있으므로 처리
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return new Date(date).toISOString().split('T')[0];
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
  const [data, setData] = useState<PurchaseRequest[]>([]);
  const [selectedRows, setSelectedRows] = useState<PurchaseRequest[]>([]);
  const [searchParams, setSearchParams] = useState({
    prNo: '',
    prName: '',
    startDate: '',
    endDate: '',
    requester: '',
    department: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPr, setSelectedPr] = useState<PurchaseRequest | null>(null);
  const [prDetailItems, setPrDetailItems] = useState<PrDtDTO[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 목록 조회
  const fetchData = async () => {
    try {
      setLoading(true);

      // 프론트엔드 파라미터를 백엔드 파라미터로 매핑
      const params = {
        prNum: searchParams.prNo || undefined,
        prSubject: searchParams.prName || undefined,
        requester: searchParams.requester || undefined,
        deptName: searchParams.department || undefined,
        progressCd: searchParams.status || undefined,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
      };

      console.log('API 요청 params:', params);
      const response = await prApi.getList(params);
      console.log('백엔드 응답 원본:', response);
      console.log('응답 데이터 개수:', response?.length || 0);
      
      if (!response || response.length === 0) {
        console.warn('응답 데이터가 비어있습니다.');
        setData([]);
        return;
      }
      
      const transformedData = transformPrListResponse(response);
      console.log('변환된 데이터:', transformedData);
      setData(transformedData);
    } catch (error) {
      console.error('구매요청 목록 조회 실패:', error);
      alert('구매요청 목록을 불러오는데 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async () => {
    await fetchData();
  };

  const handleReset = () => {
    setSearchParams({
      prNo: '',
      prName: '',
      startDate: '',
      endDate: '',
      requester: '',
      department: '',
      status: '',
    });
  };

  const handleRowClick = async (row: PurchaseRequest) => {
    console.log('🔍 구매요청 상세 조회 시작 - PR번호:', row.prNo);
    setSelectedPr(row);
    setIsDetailModalOpen(true);

    // PR번호로 상세 정보 조회 (DT 항목 목록)
    try {
      setLoadingDetail(true);
      console.log('📡 API 호출 - getDetail:', row.prNo);
      const detailList = await prApi.getDetail(row.prNo);
      console.log('✅ API 응답 성공 - 품목 개수:', detailList?.length || 0);
      console.log('📦 상세 데이터:', detailList);
      setPrDetailItems(detailList);
    } catch (error) {
      console.error('❌ 구매요청 상세 조회 실패:', error);
      alert('구매요청 상세 정보를 불러오는데 실패했습니다.');
      setPrDetailItems([]);
    } finally {
      setLoadingDetail(false);
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
      render: (value) => (
          <span className="text-blue-600 hover:underline cursor-pointer font-medium">
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
      alert(`${removedCount}건의 승인된 구매요청은 선택할 수 없습니다.`);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    // 승인 상태인 항목이 있는지 다시 한번 체크 (안전장치)
    const approvedItems = selectedRows.filter(row => row.status === 'APPROVED');
    if (approvedItems.length > 0) {
      alert('승인된 구매요청은 삭제할 수 없습니다.');
      setSelectedRows(selectedRows.filter(row => row.status !== 'APPROVED'));
      return;
    }

    // 중복 제거 (같은 PR번호)
    const uniquePrNos = [...new Set(selectedRows.map(row => row.prNo))];

    if (!confirm(`선택한 ${uniquePrNos.length}건의 구매요청을 삭제하시겠습니까?\n(논리적 삭제: 복구 가능)`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('삭제 요청 PR번호:', uniquePrNos);
      
      // 각 PR번호에 대해 삭제 API 호출
      const results = await Promise.allSettled(
        uniquePrNos.map(async (prNo) => {
          console.log(`삭제 시도: ${prNo}`);
          try {
            const result = await prApi.delete(prNo);
            console.log(`삭제 성공: ${prNo}`, result);
            return result;
          } catch (err) {
            console.error(`삭제 실패: ${prNo}`, err);
            throw err;
          }
        })
      );

      // 성공/실패 카운트
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      // 실패한 항목 상세 로그
      const failedResults = results.filter(r => r.status === 'rejected');
      if (failedResults.length > 0) {
        console.error('❌ 삭제 실패 상세:', failedResults.map((r: any) => ({
          reason: r.reason,
          message: r.reason?.message,
          status: r.reason?.status,
        })));
      }

      if (failCount > 0) {
        const errorMsg = failedResults[0] && 'reason' in failedResults[0] 
          ? (failedResults[0].reason as any)?.message || '알 수 없는 오류'
          : '알 수 없는 오류';
        alert(`${successCount}건 삭제 완료, ${failCount}건 실패\n오류: ${errorMsg}`);
      } else {
        alert(`${successCount}건이 삭제되었습니다.`);
      }

      setSelectedRows([]);
      // 목록 다시 조회
      await fetchData();
    } catch (error) {
      console.error('❌ 구매요청 삭제 실패:', error);
      alert('구매요청 삭제에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      alert('승인할 항목을 선택해주세요.');
      return;
    }

    // 승인 상태인 항목 필터링
    const approvableRows = selectedRows.filter(row => row.status !== 'APPROVED');
    if (approvableRows.length === 0) {
      alert('승인 가능한 항목이 없습니다. (이미 승인된 항목은 제외됩니다)');
      return;
    }
    
    if (approvableRows.length !== selectedRows.length) {
      const alreadyApprovedCount = selectedRows.length - approvableRows.length;
      if (!confirm(`승인 가능한 항목 ${approvableRows.length}건을 승인하시겠습니까?\n(이미 승인된 항목 ${alreadyApprovedCount}건은 제외됩니다)`)) {
        return;
      }
    } else {
      if (!confirm(`선택한 ${approvableRows.length}건의 구매요청을 승인하시겠습니까?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      // 승인 가능한 행들에서 prNo를 추출하고 중복 제거
      const prNos = approvableRows.map(row => row.prNo);
      const uniquePrNos = [...new Set(prNos)];
      console.log('✅ 승인 요청 PR번호:', uniquePrNos);

      // 각 prNo에 대해 승인 API 호출
      const results = await Promise.allSettled(
        uniquePrNos.map(async (prNo) => {
          console.log(`✅ 승인 시도: ${prNo}`);
          try {
            const result = await prApi.approve(prNo);
            console.log(`✅ 승인 성공: ${prNo}`, result);
            return result;
          } catch (err) {
            console.error(`❌ 승인 실패: ${prNo}`, err);
            throw err;
          }
        })
      );

      // 성공/실패 카운트
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      if (failCount > 0) {
        alert(`${successCount}건 승인 완료, ${failCount}건 실패`);
      } else {
        alert(`${successCount}건이 승인되었습니다.`);
      }

      setSelectedRows([]);
      // 목록 다시 조회하여 변경된 상태값 반영 (승인 상태로 변경된 항목은 체크박스가 비활성화됨)
      await fetchData();
    } catch (error) {
      console.error('❌ 구매요청 승인 실패:', error);
      alert('구매요청 승인에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (selectedRows.length === 0) {
      alert('반려할 항목을 선택해주세요.');
      return;
    }

    // 승인 상태인 항목은 반려 불가
    const rejectableRows = selectedRows.filter(row => row.status !== 'APPROVED');
    if (rejectableRows.length === 0) {
      alert('반려 가능한 항목이 없습니다. (승인된 항목은 반려할 수 없습니다)');
      return;
    }
    
    if (rejectableRows.length !== selectedRows.length) {
      const approvedCount = selectedRows.length - rejectableRows.length;
      if (!confirm(`반려 가능한 항목 ${rejectableRows.length}건을 반려하시겠습니까?\n(승인된 항목 ${approvedCount}건은 제외됩니다)`)) {
        return;
      }
    } else {
      if (!confirm(`선택한 ${rejectableRows.length}건의 구매요청을 반려하시겠습니까?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      // 반려 가능한 행들에서 prNo를 추출하고 중복 제거
      const prNos = rejectableRows.map(row => row.prNo);
      const uniquePrNos = [...new Set(prNos)];
      console.log('❌ 반려 요청 PR번호:', uniquePrNos);

      // 각 prNo에 대해 반려 API 호출
      const results = await Promise.allSettled(
        uniquePrNos.map(async (prNo) => {
          console.log(`❌ 반려 시도: ${prNo}`);
          try {
            const result = await prApi.reject(prNo);
            console.log(`✅ 반려 성공: ${prNo}`, result);
            return result;
          } catch (err) {
            console.error(`❌ 반려 실패: ${prNo}`, err);
            throw err;
          }
        })
      );

      // 성공/실패 카운트
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      if (failCount > 0) {
        alert(`${successCount}건 반려 완료, ${failCount}건 실패`);
      } else {
        alert(`${successCount}건이 반려되었습니다.`);
      }

      setSelectedRows([]);
      // 목록 다시 조회하여 변경된 상태값 반영
      await fetchData();
    } catch (error) {
      console.error('❌ 구매요청 반려 실패:', error);
      alert('구매요청 반려에 실패했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
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
              label="요청일자 시작"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <DatePicker
              label="요청일자 종료"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
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
                { value: '개발팀', label: '개발팀' },
                { value: '구매팀', label: '구매팀' },
                { value: '영업팀', label: '영업팀' },
                { value: '기획팀', label: '기획팀' },
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
                <Button 
                  variant="success" 
                  onClick={handleApprove}
                  disabled={
                    selectedRows.length === 0 || 
                    selectedRows.some(row => row.status === 'APPROVED')
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
              </div>
            }
        >
          <DataGrid
              columns={columns}
              data={data}
              keyField="prNo"
              loading={loading}
              selectable
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              isRowSelectable={isRowSelectable}
              onRowClick={handleRowClick}
              emptyMessage="구매요청 내역이 없습니다."
          />
        </Card>

        {/* 상세 모달 */}
        <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setPrDetailItems([]);
              setSelectedPr(null);
            }}
            title="구매요청 상세"
            size="lg"
            footer={
              <ModalFooter
                  onClose={() => {
                    setIsDetailModalOpen(false);
                    setPrDetailItems([]);
                    setSelectedPr(null);
                  }}
                  cancelText="닫기"
              />
            }
        >
          {selectedPr && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <h3 className="text-lg font-semibold">구매요청 상세</h3>
                  {getStatusBadge(selectedPr.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">PR번호</label>
                    <p className="font-medium">{selectedPr.prNo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">구매유형</label>
                    <p className="font-medium">{selectedPr.purchaseType}</p>
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
                    ) : prDetailItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            품목 정보가 없습니다.
                          </td>
                        </tr>
                    ) : (
                        prDetailItems.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-3 text-sm">{item.itemCd || ''}</td>
                              <td className="p-3 text-sm">{item.itemDesc || ''}</td>
                              <td className="p-3 text-sm text-right">{formatNumber(Number(item.prQt) || 0)}</td>
                              <td className="p-3 text-sm text-right">₩{formatNumber(Number(item.unitPrc) || 0)}</td>
                              <td className="p-3 text-sm text-right font-medium">₩{formatNumber(Number(item.prAmt) || 0)}</td>
                              <td className="p-3 text-sm text-center">
                                {item.delyDate
                                    ? (typeof item.delyDate === 'string'
                                        ? item.delyDate.split('T')[0]
                                        : new Date(item.delyDate).toISOString().split('T')[0])
                                    : ''}
                              </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="text-right">
                    <span className="text-gray-500 mr-4">총 요청금액:</span>
                    <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(
                        prDetailItems.length > 0
                            ? prDetailItems.reduce((sum, item) => sum + (Number(item.prAmt) || 0), 0)
                            : selectedPr.amount
                    )}
                </span>
                  </div>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
}