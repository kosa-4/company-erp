'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Building2, Search, Send, X, CheckCircle2, XCircle, Trophy, Edit } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Card, Button, Badge, Input, SearchPanel, DatePicker, Select } from '@/components/ui';
import { rfqApi } from '@/lib/api/rfq';
import { getErrorMessage } from '@/lib/api/error';
import { useRouter } from 'next/navigation';
import VendorQuoteModal from '@/components/vendor/VendorQuoteModal';

export default function VendorRfqSubmitPage() {
  const router = useRouter();
  const [rfqList, setRfqList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    startDate: '',
    endDate: '',
    submitStatus: '',
  });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedRfqNum, setSelectedRfqNum] = useState<string | null>(null);

  // 체크된 RFQ 번호 목록
  const [selectedRfqs, setSelectedRfqs] = useState<string[]>([]);

  // RFQ 목록 조회
  const fetchRfqList = async () => {
    try {
      setLoading(true);
      setSelectedRfqs([]); // 목록 조회 시 선택 초기화

      const apiStatus = filterStatus === 'DONE' ? 'RFQC' : filterStatus;

      const searchText = searchParams.rfqNo || searchParams.rfqName || undefined;
      const progressCd = searchParams.submitStatus || apiStatus || undefined;

      const data = await rfqApi.getVendorRfqList({
        searchText: searchText,
        progressCd: progressCd,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
      });

      if (filterStatus === 'DONE') {
        setRfqList(data.filter((item: any) => item.progressCd === 'J'));
      } else {
        setRfqList(data);
      }
    } catch (error: any) {
      toast.error('견적 목록 조회에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqList();
  }, [filterStatus]);

  // 검색
  const handleSearch = () => {
    fetchRfqList();
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchParams({
      rfqNo: '',
      rfqName: '',
      startDate: '',
      endDate: '',
      submitStatus: '',
    });
  };

  // 체크박스 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRfqs(rfqList.map(r => r.rfqNum));
    } else {
      setSelectedRfqs([]);
    }
  };

  // 개별 체크박스 선택/해제
  const handleSelectRow = (rfqNum: string, checked: boolean) => {
    if (checked) {
      setSelectedRfqs(prev => [...prev, rfqNum]);
    } else {
      setSelectedRfqs(prev => prev.filter(id => id !== rfqNum));
    }
  };

  // 일괄 접수
  const handleBulkAccept = async () => {
    if (selectedRfqs.length === 0) {
      toast.warning('접수할 견적을 선택해주세요.');
      return;
    }

    // 선택된 항목 중 '요청(RFQS)' 상태인 것만 접수 가능
    const targetRfqs = rfqList.filter(r => selectedRfqs.includes(r.rfqNum));
    const invalidItems = targetRfqs.filter(r => r.vendorProgressCd !== 'RFQS');

    if (invalidItems.length > 0) {
      toast.error('접수 처리는 "요청" 상태인 건만 가능합니다.');
      return;
    }

    if (!confirm(`선택한 ${selectedRfqs.length}건의 견적 요청을 접수하시겠습니까?`)) return;

    try {
      // 병렬 처리
      await Promise.all(selectedRfqs.map(id => rfqApi.acceptRfq(id)));
      toast.success('선택한 견적 요청을 접수했습니다.');
      fetchRfqList();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || '접수에 실패했습니다.');
    }
  };

  // 일괄 포기
  const handleBulkReject = async () => {
    if (selectedRfqs.length === 0) {
      toast.warning('포기할 견적을 선택해주세요.');
      return;
    }

    // 접수(RFQJ) 또는 임시저장(RFQT) 상태인 건만 포기 가능
    const targetRfqs = rfqList.filter(r => selectedRfqs.includes(r.rfqNum));
    const invalidItems = targetRfqs.filter(r => r.vendorProgressCd !== 'RFQJ' && r.vendorProgressCd !== 'RFQT');

    if (invalidItems.length > 0) {
      toast.error('포기 처리는 "접수" 또는 "임시저장" 상태인 건만 가능합니다.');
      return;
    }

    if (!confirm(`선택한 ${selectedRfqs.length}건의 견적을 포기하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      await Promise.all(selectedRfqs.map(id => rfqApi.rejectRfq(id)));
      toast.success('선택한 견적을 포기했습니다.');
      fetchRfqList();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || '포기 처리에 실패했습니다.');
    }
  };

  // 견적 작성 모달 열기
  const handleGoToQuote = (rfqNum: string) => {
    setSelectedRfqNum(rfqNum);
    setIsQuoteModalOpen(true);
  };

  // 견적 모달 닫기
  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedRfqNum(null);
  };

  // 견적 제출 성공 시
  const handleQuoteSuccess = () => {
    fetchRfqList();
  };

  const waitingCount = rfqList.filter(r => r.vendorProgressCd === 'RFQS').length;

  // 상태별 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'RFQS': return 'yellow';
      case 'RFQJ': return 'blue';
      case 'RFQT': return 'gray';
      case 'RFQC': return 'green';
      case 'F': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" richColors />

      {/* Page Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">견적관리</h1>
              <p className="text-sm text-gray-500">견적 요청을 확인하고 견적서를 작성합니다.</p>
            </div>
          </div>

          {waitingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-600 text-sm font-medium">{waitingCount}건 접수대기</span>
            </div>
          )}
        </div>

      </div>

      {/* Search Panel */}
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
          label="제출상태"
          value={searchParams.submitStatus}
          onChange={(e) => setSearchParams(prev => ({ ...prev, submitStatus: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'RFQS', label: '요청' },
            { value: 'RFQJ', label: '접수' },
            { value: 'RFQT', label: '임시저장' },
            { value: 'RFQC', label: '제출완료' },
            { value: 'F', label: '포기' },
          ]}
        />
      </SearchPanel>

      {/* RFQ Table */}
      <Card
        title="견적 목록"
        padding={false}
        className="overflow-hidden"
        actions={
          <div className="flex items-center gap-2">
            {/* 메인 액션 버튼 그룹 */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAccept}
                disabled={selectedRfqs.length === 0}
                className="gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                접수
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                disabled={selectedRfqs.length === 0}
                className="gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                견적포기
              </Button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={rfqList.length > 0 && selectedRfqs.length === rfqList.length}
                  />
                </th>
                <th className="px-6 py-3 font-medium">견적번호</th>
                <th className="px-6 py-3 font-medium">견적명</th>
                <th className="px-6 py-3 font-medium">견적유형</th>
                <th className="px-6 py-3 font-medium">마감일</th>
                <th className="px-6 py-3 font-medium text-center">상태</th>
                <th className="px-6 py-3 font-medium text-center">액션/결과</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : rfqList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-300 mb-2" />
                      <p>조회된 견적 요청이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rfqList.map((rfq) => {
                  // 결과 상태 계산
                  let resultStatus = null;
                  if (rfq.progressCd === 'J') { // RFQHD가 선정 완료 상태일 때
                    if (rfq.selectYn === 'Y') {
                      resultStatus = 'WIN';
                    } else {
                      resultStatus = 'LOSE';
                    }
                  }

                  return (
                    <tr
                      key={rfq.rfqNum}
                      className={`transition-colors ${selectedRfqs.includes(rfq.rfqNum) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSelectRow(rfq.rfqNum, !selectedRfqs.includes(rfq.rfqNum))}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedRfqs.includes(rfq.rfqNum)}
                          onChange={(e) => handleSelectRow(rfq.rfqNum, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{rfq.rfqNum}</td>
                      <td className="px-6 py-4 text-gray-600">{rfq.rfqSubject}</td>
                      <td className="px-6 py-4 text-gray-600">{rfq.rfqTypeName || rfq.rfqType}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{rfq.reqCloseDate ? new Date(rfq.reqCloseDate).toLocaleDateString('ko-KR') : '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getStatusBadgeVariant(rfq.vendorProgressCd)}>
                          {rfq.vendorProgressName}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {(rfq.vendorProgressCd === 'RFQJ' || rfq.vendorProgressCd === 'RFQT') && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleGoToQuote(rfq.rfqNum)}
                              className="h-8 text-xs gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              견적 작성
                            </Button>
                          )}
                          {rfq.vendorProgressCd === 'RFQC' && resultStatus === null && (
                            <span className="text-xs text-gray-400">심사중</span>
                          )}
                          {resultStatus === 'WIN' && (
                            <Badge variant="green" className="h-8 px-3">
                              <Trophy className="w-3.5 h-3.5 mr-1" />
                              낙찰
                            </Badge>
                          )}
                          {resultStatus === 'LOSE' && (
                            <Badge variant="red" className="h-8 px-3">
                              탈락
                            </Badge>
                          )}
                          {rfq.vendorProgressCd === 'F' && (
                            <span className="text-xs text-gray-400">포기함</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 견적 작성 모달 */}
      <VendorQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={handleCloseQuoteModal}
        rfqNum={selectedRfqNum}
        onSuccess={handleQuoteSuccess}
      />
    </div>
  );
}
