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
  ModalFooter,
  Textarea
} from '@/components/ui';
import { ColumnDef, StatusType } from '@/types';
import { formatNumber } from '@/lib/utils';

interface PendingRfq {
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

const mockData: PendingRfq[] = [
  {
    prNo: 'PR-2024-0156',
    prName: '개발팀 노트북 구매',
    status: 'APPROVED',
    purchaseType: '일반',
    requester: '홍길동',
    department: '개발팀',
    requestDate: '2024-12-27',
    itemCode: 'ITM-2024-0001',
    itemName: '노트북 (15인치)',
    quantity: 5,
    unitPrice: 1500000,
    amount: 7500000,
    requestDeliveryDate: '2025-01-15',
    remark: '신규 입사자용',
  },
  {
    prNo: 'PR-2024-0155',
    prName: '사무용품 구매',
    status: 'APPROVED',
    purchaseType: '일반',
    requester: '김철수',
    department: '총무팀',
    requestDate: '2024-12-26',
    itemCode: 'ITM-2024-0004',
    itemName: 'A4 복사용지',
    quantity: 50,
    unitPrice: 25000,
    amount: 1250000,
    requestDeliveryDate: '2025-01-10',
    remark: '',
  },
];

export default function RfqPendingPage() {
  const [data] = useState<PendingRfq[]>(mockData);
  const [selectedRows, setSelectedRows] = useState<PendingRfq[]>([]);
  const [searchParams, setSearchParams] = useState({
    prNo: '',
    prName: '',
    startDate: '',
    endDate: '',
    requester: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);

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
    });
  };



  const getStatusBadge = (status: StatusType) => {
    return <Badge variant="green">승인</Badge>;
  };

  const columns: ColumnDef<PendingRfq>[] = [
    {
      key: 'status',
      header: '상태',
      width: 80,
      align: 'center',
      render: (value) => getStatusBadge(value as StatusType),
    },
    { key: 'prNo', header: 'PR번호', width: 130, align: 'center' },
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

  const handleRfqRequest = () => {
    if (selectedRows.length === 0) {
      alert('견적 요청할 항목을 선택해주세요.');
      return;
    }
    setIsRfqModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="견적대기목록" 
        subtitle="승인된 구매요청에 대한 견적을 요청합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
          ]}
        />
      </SearchPanel>

      <Card 
        title="견적대기 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={handleRfqRequest}>
            견적요청
          </Button>
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
          emptyMessage="견적 대기 중인 항목이 없습니다."
        />
      </Card>

      {/* 견적요청 모달 */}
      <Modal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="견적 요청"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRfqModalOpen(false)}>취소</Button>
            <Button variant="secondary">임시저장</Button>
            <Button variant="primary" onClick={() => {
              alert('협력업체에 전송되었습니다.');
              setIsRfqModalOpen(false);
              setSelectedRows([]);
            }}>협력업체 전송</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="RFQ번호" value="자동채번" readOnly />
            <Input label="견적명" placeholder="견적명 입력" required />
            <Input label="요청부서" value={selectedRows[0]?.department || ''} readOnly />
            <Input label="구매담당자" value="홍길동" readOnly />
            <Select
              label="견적유형"
              required
              options={[
                { value: 'PRIVATE', label: '수의계약' },
                { value: 'COMPETITIVE', label: '지명경쟁' },
              ]}
            />
            <DatePicker label="견적마감일" required />
          </div>

          <Textarea label="비고" placeholder="비고 입력" rows={2} />

          {/* 품목 목록 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-900">품목 목록</h4>
              <Button variant="secondary" size="sm">협력업체 선택</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right font-semibold text-gray-600">수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">예상단가</th>
                    <th className="p-3 text-left font-semibold text-gray-600">협력업체</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRows.map((row) => (
                    <tr key={row.prNo} className="border-t">
                      <td className="p-3">{row.itemCode}</td>
                      <td className="p-3">{row.itemName}</td>
                      <td className="p-3 text-right">{formatNumber(row.quantity)}</td>
                      <td className="p-3 text-right">₩{formatNumber(row.unitPrice)}</td>
                      <td className="p-3">
                        <span className="text-gray-400">선택 필요</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

