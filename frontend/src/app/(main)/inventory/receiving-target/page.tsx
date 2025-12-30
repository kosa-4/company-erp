'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  DatePicker,
  DataGrid,
  SearchPanel,
  Modal,
  Textarea
} from '@/components/ui';
import { ColumnDef } from '@/types';

interface ReceivingTarget {
  poNo: string;
  poName: string;
  buyer: string;
  poDate: string;
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  storageLocation: string;
  amount: number;
}

const mockData: ReceivingTarget[] = [
  {
    poNo: 'PO-2024-0234',
    poName: '개발팀 모니터 발주',
    buyer: '홍길동',
    poDate: '2024-12-26',
    vendorCode: 'VND-2024-0001',
    vendorName: '(주)테크솔루션',
    itemCode: 'ITM-2024-0002',
    itemName: '27인치 모니터',
    spec: '27" QHD, IPS, 75Hz',
    unit: 'EA',
    unitPrice: 340000,
    orderQuantity: 10,
    storageLocation: '본사 창고',
    amount: 3400000,
  },
  {
    poNo: 'PO-2024-0233',
    poName: '사무용품 발주',
    buyer: '홍길동',
    poDate: '2024-12-25',
    vendorCode: 'VND-2024-0002',
    vendorName: '(주)오피스프로',
    itemCode: 'ITM-2024-0004',
    itemName: 'A4 복사용지',
    spec: 'A4, 80g, 500매/박스',
    unit: 'BOX',
    unitPrice: 24000,
    orderQuantity: 50,
    storageLocation: '본사 창고',
    amount: 1200000,
  },
];

export default function ReceivingTargetPage() {
  const [data] = useState<ReceivingTarget[]>(mockData);
  const [selectedRows, setSelectedRows] = useState<ReceivingTarget[]>([]);
  const [searchParams, setSearchParams] = useState({
    poNo: '',
    poName: '',
    buyer: '',
    vendor: '',
    item: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      poNo: '',
      poName: '',
      buyer: '',
      vendor: '',
      item: '',
      startDate: '',
      endDate: '',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const columns: ColumnDef<ReceivingTarget>[] = [
    {
      key: 'poNo',
      header: 'PO번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 font-medium">{String(value)}</span>
      ),
    },
    { key: 'poName', header: '발주명', width: 150, align: 'left' },
    { key: 'buyer', header: '발주담당자', width: 100, align: 'center' },
    { key: 'poDate', header: '발주일자', width: 100, align: 'center' },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', width: 140, align: 'left' },
    { key: 'spec', header: '규격', width: 150, align: 'left' },
    { key: 'unit', header: '단위', width: 60, align: 'center' },
    { 
      key: 'unitPrice', 
      header: '단가', 
      width: 100, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { 
      key: 'orderQuantity', 
      header: '발주수량', 
      width: 90, 
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    { key: 'storageLocation', header: '저장위치', width: 100, align: 'left' },
    { 
      key: 'amount', 
      header: '금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
  ];

  const handleReceiving = () => {
    if (selectedRows.length === 0) {
      alert('입고 처리할 항목을 선택해주세요.');
      return;
    }
    setIsReceivingModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="입고대상조회" 
        subtitle="입고 처리 대상 발주를 조회합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PO번호"
          placeholder="PO번호 입력"
          value={searchParams.poNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, poNo: e.target.value }))}
        />
        <Input
          label="발주명"
          placeholder="발주명 입력"
          value={searchParams.poName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, poName: e.target.value }))}
        />
        <Input
          label="발주담당자"
          placeholder="담당자명 입력"
          value={searchParams.buyer}
          onChange={(e) => setSearchParams(prev => ({ ...prev, buyer: e.target.value }))}
        />
        <Input
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendor}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendor: e.target.value }))}
        />
        <Input
          label="품목명/품목코드"
          placeholder="품목 검색"
          value={searchParams.item}
          onChange={(e) => setSearchParams(prev => ({ ...prev, item: e.target.value }))}
        />
        <DatePicker
          label="발주일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="발주일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="입고대상 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={handleReceiving}>입고처리</Button>
        }
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="poNo"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          emptyMessage="입고 대상이 없습니다."
        />
      </Card>

      {/* 입고처리 모달 */}
      <Modal
        isOpen={isReceivingModalOpen}
        onClose={() => setIsReceivingModalOpen(false)}
        title="입고 처리"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReceivingModalOpen(false)}>닫기</Button>
            <Button variant="primary" onClick={() => {
              alert('입고가 처리되었습니다.');
              setIsReceivingModalOpen(false);
              setSelectedRows([]);
            }}>저장</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="입고번호" value="자동채번" readOnly />
            <DatePicker label="입고일자 (문서기준)" />
            <DatePicker label="입고일자 (업무기준)" />
            <Input label="입고금액" value={`₩${formatNumber(selectedRows.reduce((sum, r) => sum + r.amount, 0))}`} readOnly />
          </div>

          <Textarea label="비고" placeholder="비고 입력" rows={2} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">첨부파일</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <p className="text-sm text-gray-500">클릭하여 파일을 선택하거나 드래그하여 업로드</p>
            </div>
          </div>

          {/* 입고 품목 목록 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">입고 품목</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right font-semibold text-gray-600">단가</th>
                    <th className="p-3 text-right font-semibold text-gray-600">발주수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">입고수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">입고금액</th>
                    <th className="p-3 text-left font-semibold text-gray-600">저장위치</th>
                    <th className="p-3 text-center font-semibold text-gray-600">입고일시</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRows.map((row) => (
                    <tr key={row.poNo} className="border-t">
                      <td className="p-3">{row.itemCode}</td>
                      <td className="p-3">{row.itemName}</td>
                      <td className="p-3 text-right">₩{formatNumber(row.unitPrice)}</td>
                      <td className="p-3 text-right">{formatNumber(row.orderQuantity)}</td>
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          defaultValue={row.orderQuantity}
                          className="w-20 px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="p-3 text-right font-medium">₩{formatNumber(row.amount)}</td>
                      <td className="p-3">
                        <select className="px-2 py-1 border rounded text-sm">
                          <option value="본사 창고">본사 창고</option>
                          <option value="지사 창고">지사 창고</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="datetime-local" 
                          className="px-2 py-1 border rounded text-sm"
                        />
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

