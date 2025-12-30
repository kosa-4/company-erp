'use client';

import React, { useState } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DatePicker,
  Textarea,
  DataGrid,
  Modal,
  ModalFooter
} from '@/components/ui';
import { ColumnDef } from '@/types';

interface PrItem {
  lineNo: number;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  requestDeliveryDate: string;
  remark: string;
}

const mockItems: PrItem[] = [
  {
    lineNo: 1,
    itemCode: 'ITM-2024-0001',
    itemName: '노트북 (15인치)',
    spec: '15.6" FHD, i7, 16GB, 512GB SSD',
    unit: 'EA',
    quantity: 5,
    unitPrice: 1500000,
    amount: 7500000,
    requestDeliveryDate: '2025-01-15',
    remark: '개발팀용',
  },
  {
    lineNo: 2,
    itemCode: 'ITM-2024-0002',
    itemName: '27인치 모니터',
    spec: '27" QHD, IPS, 75Hz',
    unit: 'EA',
    quantity: 5,
    unitPrice: 350000,
    amount: 1750000,
    requestDeliveryDate: '2025-01-15',
    remark: '',
  },
];

export default function PurchaseRequestPage() {
  const [prItems, setPrItems] = useState<PrItem[]>(mockItems);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    prNo: '자동채번',
    prName: '',
    requester: '홍길동',
    department: '구매팀',
    requestDate: new Date().toISOString().split('T')[0],
    purchaseType: 'GENERAL',
    totalAmount: prItems.reduce((sum, item) => sum + item.amount, 0),
    remark: '',
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const columns: ColumnDef<PrItem>[] = [
    { key: 'lineNo', header: 'No', width: 50, align: 'center' },
    { key: 'itemCode', header: '품목코드', width: 140, align: 'center' },
    { key: 'itemName', header: '품목명', align: 'left' },
    { key: 'spec', header: '규격', width: 200, align: 'left' },
    { key: 'unit', header: '단위', width: 60, align: 'center' },
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
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { 
      key: 'amount', 
      header: '금액', 
      width: 130, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'requestDeliveryDate', header: '희망납기일', width: 110, align: 'center' },
    { key: 'remark', header: '비고', width: 120, align: 'left' },
  ];

  const handleSave = async () => {
    if (!formData.prName.trim()) {
      alert('구매요청명을 입력해주세요.');
      return;
    }
    if (prItems.length === 0) {
      alert('품목을 추가해주세요.');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('저장되었습니다.');
  };

  const handleAddItem = () => {
    setIsItemModalOpen(true);
  };

  const handleRemoveItem = () => {
    // 마지막 아이템 삭제 (실제로는 선택된 아이템 삭제)
    if (prItems.length > 0) {
      setPrItems(prItems.slice(0, -1));
    }
  };

  return (
    <div>
      <PageHeader 
        title="구매요청" 
        subtitle="새로운 구매요청을 등록합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        }
      >
        <div className="flex gap-2">
          <Button variant="secondary">삭제</Button>
          <Button variant="primary" loading={isSaving} onClick={handleSave}>
            저장
          </Button>
        </div>
      </PageHeader>

      {/* 기본 정보 */}
      <Card title="기본 정보" className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="PR번호"
            value={formData.prNo}
            readOnly
          />
          <Input
            label="구매요청명"
            value={formData.prName}
            onChange={(e) => setFormData(prev => ({ ...prev, prName: e.target.value }))}
            placeholder="구매요청명 입력"
            required
          />
          <Input
            label="요청자"
            value={formData.requester}
            readOnly
          />
          <Input
            label="부서"
            value={formData.department}
            readOnly
          />
          <DatePicker
            label="요청날짜"
            value={formData.requestDate}
            disabled
          />
          <Select
            label="구매유형"
            value={formData.purchaseType}
            onChange={(e) => setFormData(prev => ({ ...prev, purchaseType: e.target.value }))}
            required
            options={[
              { value: 'GENERAL', label: '일반' },
              { value: 'CONTRACT', label: '단가계약' },
              { value: 'URGENT', label: '긴급' },
            ]}
          />
          <Input
            label="요청금액"
            value={`₩${formatNumber(formData.totalAmount)}`}
            readOnly
          />
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">첨부파일</label>
            <div className="flex gap-2">
              <input type="file" className="hidden" id="file-upload" />
              <Button 
                variant="secondary" 
                className="h-[42px]"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                파일 선택
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Textarea
            label="비고"
            value={formData.remark}
            onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
            placeholder="비고 입력"
            rows={2}
          />
        </div>
      </Card>

      {/* 품목 정보 */}
      <Card 
        title="품목 정보" 
        actions={
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleRemoveItem}>
              삭제
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddItem}>
              품목추가
            </Button>
          </div>
        }
        padding={false}
      >
        <DataGrid
          columns={columns}
          data={prItems}
          keyField="lineNo"
          emptyMessage="품목을 추가해주세요."
          selectable
        />
        
        {/* 합계 */}
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <div className="text-right">
            <span className="text-gray-500 mr-4">총 요청금액:</span>
            <span className="text-xl font-bold text-blue-600">
              ₩{formatNumber(prItems.reduce((sum, item) => sum + item.amount, 0))}
            </span>
          </div>
        </div>
      </Card>

      {/* 품목 선택 모달 */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="품목 선택"
        size="xl"
        footer={
          <ModalFooter
            onClose={() => setIsItemModalOpen(false)}
            onConfirm={() => {
              // 품목 추가 로직
              const newItem: PrItem = {
                lineNo: prItems.length + 1,
                itemCode: 'ITM-2024-0003',
                itemName: '무선 키보드 마우스 세트',
                spec: '무선 2.4GHz, USB 수신기',
                unit: 'SET',
                quantity: 10,
                unitPrice: 45000,
                amount: 450000,
                requestDeliveryDate: '2025-01-20',
                remark: '',
              };
              setPrItems([...prItems, newItem]);
              setIsItemModalOpen(false);
            }}
            confirmText="추가"
          />
        }
      >
        <div className="space-y-4">
          {/* 검색 영역 */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="품목코드" placeholder="품목코드 입력" />
            <Input label="품목명" placeholder="품목명 입력" />
            <div className="flex items-end">
              <Button variant="primary">검색</Button>
            </div>
          </div>

          {/* 품목 목록 */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 p-3 text-center">
                    <input type="checkbox" />
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">품목코드</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">품목명</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">규격</th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-600">단위</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-600">단가</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t hover:bg-blue-50 cursor-pointer">
                  <td className="p-3 text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 text-sm">ITM-2024-0003</td>
                  <td className="p-3 text-sm">무선 키보드 마우스 세트</td>
                  <td className="p-3 text-sm">무선 2.4GHz, USB 수신기</td>
                  <td className="p-3 text-sm text-center">SET</td>
                  <td className="p-3 text-sm text-right">₩45,000</td>
                </tr>
                <tr className="border-t hover:bg-blue-50 cursor-pointer">
                  <td className="p-3 text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 text-sm">ITM-2024-0004</td>
                  <td className="p-3 text-sm">A4 복사용지</td>
                  <td className="p-3 text-sm">A4, 80g, 500매/박스</td>
                  <td className="p-3 text-sm text-center">BOX</td>
                  <td className="p-3 text-sm text-right">₩25,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}

