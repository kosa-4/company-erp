'use client';

import React, { useState } from 'react';
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



export default function PurchaseRequestListPage() {
  const [data] = useState<PurchaseRequest[]>([]);
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

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
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
      PENDING: { variant: 'yellow' as const, label: '승인대기' },
      APPROVED: { variant: 'green' as const, label: '승인' },
      REJECTED: { variant: 'red' as const, label: '반려' },
      COMPLETE: { variant: 'blue' as const, label: '완료' },
      CANCELED: { variant: 'gray' as const, label: '취소' },
      IN_PROGRESS: { variant: 'blue' as const, label: '진행중' },
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

  const handleApprove = () => {
    if (selectedRows.length === 0) {
      alert('승인할 항목을 선택해주세요.');
      return;
    }
    alert(`${selectedRows.length}건이 승인되었습니다.`);
    setSelectedRows([]);
  };

  const handleReject = () => {
    if (selectedRows.length === 0) {
      alert('반려할 항목을 선택해주세요.');
      return;
    }
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
            { value: 'TEMP', label: '임시저장' },
            { value: 'PENDING', label: '승인대기' },
            { value: 'APPROVED', label: '승인' },
            { value: 'REJECTED', label: '반려' },
          ]}
        />
      </SearchPanel>

      <Card 
        title="구매요청 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary">수정</Button>
            <Button variant="danger">삭제</Button>
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
              <h3 className="text-lg font-semibold">{selectedPr.prName}</h3>
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

