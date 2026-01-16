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
import { prApi, PrListResponse } from '@/lib/api/pr';

interface PurchaseRequest {
  prNo: string;
  prName: string;
  status: StatusType;
  purchaseType: string;
  requester: string;
  department: string;
  requestDate: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  requestDeliveryDate: string;
  remark: string;
}

// 백엔드 응답을 프론트엔드 형식으로 변환
const transformPrListResponse = (response: PrListResponse[]): PurchaseRequest[] => {
  return response.map(item => {
    // regDate와 delyDate가 Date 객체 또는 문자열일 수 있으므로 처리
    const formatDate = (date: string | Date | undefined): string => {
      if (!date) return '';
      if (typeof date === 'string') {
        // 문자열인 경우 그대로 사용하거나 파싱
        return date.split('T')[0];
      }
      // Date 객체인 경우
      return new Date(date).toISOString().split('T')[0];
    };

    return {
      prNo: item.prNum || '',
      prName: '',
      status: mapProgressCdToStatus(item.progressCd),
      purchaseType: item.pcType || '일반',
      requester: item.requester || '',
      department: item.deptName || '',
      requestDate: formatDate(item.regDate),
      itemCode: item.itemCd || '',
      itemName: item.itemDesc || '',
      quantity: Number(item.prQt) || 0,
      unitPrice: Number(item.unitPrc) || 0,
      amount: Number(item.prAmt) || 0,
      requestDeliveryDate: formatDate(item.delyDate),
      remark: '',
    };
  });
};

// 진행상태코드를 StatusType으로 변환
const mapProgressCdToStatus = (progressCd: string): StatusType => {
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

      const response = await prApi.getList(params);
      const transformedData = transformPrListResponse(response);
      setData(transformedData);
    } catch (error) {
      console.error('구매요청 목록 조회 실패:', error);
      alert('구매요청 목록을 불러오는데 실패했습니다.');
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

  const handleRowClick = (row: PurchaseRequest) => {
    setSelectedPr(row);
    setIsDetailModalOpen(true);
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
      width: 130,
      align: 'center',
      render: (value) => (
          <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    { key: 'purchaseType', header: '구매유형', width: 80, align: 'center' },
    { key: 'requester', header: '요청자', width: 80, align: 'center' },
    { key: 'department', header: '부서', width: 80, align: 'center' },
    { key: 'requestDate', header: '요청일', width: 100, align: 'center' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', align: 'left' },
    {
      key: 'quantity',
      header: '수량',
      width: 80,
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    {
      key: 'unitPrice',
      header: '단가',
      width: 110,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    {
      key: 'amount',
      header: '금액',
      width: 120,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'requestDeliveryDate', header: '희망납기일', width: 100, align: 'center' },
  ];

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedRows.length}건의 구매요청을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      // 선택된 모든 항목 삭제
      await Promise.all(selectedRows.map(row => prApi.delete(row.prNo)));
      alert(`${selectedRows.length}건이 삭제되었습니다.`);
      setSelectedRows([]);
      // 목록 다시 조회
      await fetchData();
    } catch (error) {
      console.error('구매요청 삭제 실패:', error);
      alert('구매요청 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (selectedRows.length === 0) {
      alert('승인할 항목을 선택해주세요.');
      return;
    }
    // TODO: 승인 API 연동 필요
    alert(`${selectedRows.length}건이 승인되었습니다.`);
    setSelectedRows([]);
  };

  const handleReject = () => {
    if (selectedRows.length === 0) {
      alert('반려할 항목을 선택해주세요.');
      return;
    }
    // TODO: 반려 API 연동 필요
    alert(`${selectedRows.length}건이 반려되었습니다.`);
    setSelectedRows([]);
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
                { value: '총무팀', label: '총무팀' },
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
                <Button variant="secondary">수정</Button>
                <Button variant="danger" onClick={handleDelete} disabled={loading}>
                  삭제
                </Button>
                <Button variant="success" onClick={handleApprove}>승인</Button>
                <Button variant="danger" onClick={handleReject}>반려</Button>
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
              onSelectionChange={setSelectedRows}
              onRowClick={handleRowClick}
              emptyMessage="구매요청 내역이 없습니다."
          />
        </Card>

        {/* 상세 모달 */}
        <Modal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            title="구매요청 상세"
            size="lg"
            footer={
              <ModalFooter
                  onClose={() => setIsDetailModalOpen(false)}
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
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="border-t">
                      <td className="p-3 text-sm">{selectedPr.itemCode}</td>
                      <td className="p-3 text-sm">{selectedPr.itemName}</td>
                      <td className="p-3 text-sm text-right">{formatNumber(selectedPr.quantity)}</td>
                      <td className="p-3 text-sm text-right">₩{formatNumber(selectedPr.unitPrice)}</td>
                      <td className="p-3 text-sm text-right font-medium">₩{formatNumber(selectedPr.amount)}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="text-right">
                    <span className="text-gray-500 mr-4">총 요청금액:</span>
                    <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(selectedPr.amount)}
                </span>
                  </div>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
}