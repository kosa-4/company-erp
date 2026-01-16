'use client';

import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DataGrid,
  SearchPanel,
  Modal,
  DatePicker,
  Textarea
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { purchaseOrderApi, RfqSelectedDTO, RfqSelectedItemDTO } from '@/lib/api/purchaseOrder';
import { PurchaseOrderDTO, PurchaseOrderItemDTO as POItemDTO } from '@/types/purchaseOrder';
import { getErrorMessage } from '@/lib/api/error';

// 목록 표시용 인터페이스 (RFQ + 품목 정보 통합)
interface PendingOrderRow {
  rfqNo: string;
  rfqName: string;
  purchaseType: string;
  buyer: string;
  rfqDate: string;
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
  storageLocation: string;
}

export default function OrderPendingPage() {
  const [data, setData] = useState<PendingOrderRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<PendingOrderRow[]>([]);
  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    vendorName: '',
    purchaseType: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // 발주 작성 폼 상태
  const [orderForm, setOrderForm] = useState({
    poName: '',
    poDate: new Date().toISOString().split('T')[0],
    remark: '',
    items: [] as Array<{
      itemCode: string;
      itemName: string;
      unit: string;
      orderQuantity: number;
      unitPrice: number;
      amount: number;
      deliveryDate: string;
      storageLocation: string;
    }>,
  });

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await purchaseOrderApi.getRfqSelectedList({
        rfqNo: searchParams.rfqNo || undefined,
        rfqName: searchParams.rfqName || undefined,
        vendorName: searchParams.vendorName || undefined,
        purchaseType: searchParams.purchaseType || undefined,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
      });

      if (!result || !Array.isArray(result)) {
        setData([]);
        return;
      }

      // RFQ 데이터를 표시용 행으로 변환
      const transformed: PendingOrderRow[] = [];
      result.forEach((rfq: RfqSelectedDTO) => {
        if (rfq.items && rfq.items.length > 0) {
          rfq.items.forEach((item: RfqSelectedItemDTO) => {
            transformed.push({
              rfqNo: rfq.rfqNo || '',
              rfqName: rfq.rfqName || '',
              purchaseType: rfq.purchaseType === 'G' ? '일반' : rfq.purchaseType === 'C' ? '단가계약' : rfq.purchaseType === 'E' ? '긴급' : rfq.purchaseType || '',
              buyer: rfq.ctrlUserName || '',
              rfqDate: rfq.rfqDate || '',
              vendorCode: rfq.vendorCode || '',
              vendorName: rfq.vendorName || '',
              itemCode: item.itemCode || '',
              itemName: item.itemName || '',
              quantity: Number(item.quantity) || 0,
              unitPrice: Number(item.unitPrice) || 0,
              totalAmount: Number(item.amount) || 0,
              deliveryDate: item.deliveryDate || '',
              storageLocation: item.storageLocation || '본사 창고',
            });
          });
        } else {
          // 품목이 없으면 헤더 정보만
          transformed.push({
            rfqNo: rfq.rfqNo || '',
            rfqName: rfq.rfqName || '',
            purchaseType: rfq.purchaseType || '',
            buyer: rfq.ctrlUserName || '',
            rfqDate: rfq.rfqDate || '',
            vendorCode: rfq.vendorCode || '',
            vendorName: rfq.vendorName || '',
            itemCode: '-',
            itemName: '-',
            quantity: 0,
            unitPrice: 0,
            totalAmount: Number(rfq.rfqAmount) || 0,
            deliveryDate: '-',
            storageLocation: '-',
          });
        }
      });
      setData(transformed);
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      alert('데이터 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
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
      rfqNo: '',
      rfqName: '',
      vendorName: '',
      purchaseType: '',
      startDate: '',
      endDate: '',
    });
  };

  const columns: ColumnDef<PendingOrderRow>[] = [
    {
      key: 'rfqNo',
      header: 'RFQ번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 font-medium">{String(value)}</span>
      ),
    },
    { key: 'rfqName', header: '견적명', width: 150, align: 'left' },
    { key: 'purchaseType', header: '구매유형', width: 90, align: 'center' },
    { key: 'buyer', header: '담당자', width: 80, align: 'center' },
    { key: 'rfqDate', header: '견적요청일', width: 100, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 120, align: 'center' },
    { key: 'itemName', header: '품목명', width: 150, align: 'left' },
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
      width: 100, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { 
      key: 'totalAmount', 
      header: '금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'deliveryDate', header: '납기희망일', width: 100, align: 'center' },
    { key: 'storageLocation', header: '저장위치', width: 90, align: 'center' },
  ];

  const handleCreateOrder = () => {
    if (selectedRows.length === 0) {
      alert('발주할 항목을 선택해주세요.');
      return;
    }
    
    // 폼 초기화
    setOrderForm({
      poName: selectedRows[0].rfqName || '발주서',
      poDate: new Date().toISOString().split('T')[0],
      remark: '',
      items: selectedRows.map(row => ({
        itemCode: row.itemCode,
        itemName: row.itemName,
        unit: 'EA',
        orderQuantity: row.quantity,
        unitPrice: row.unitPrice,
        amount: row.totalAmount,
        deliveryDate: row.deliveryDate,
        storageLocation: row.storageLocation,
      })),
    });
    
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = async () => {
    // Validation
    if (!orderForm.poName.trim()) {
      alert('발주명을 입력해주세요.');
      return;
    }
    if (!orderForm.poDate) {
      alert('발주일자를 선택해주세요.');
      return;
    }
    if (!selectedRows[0]?.vendorCode) {
      alert('협력업체 정보가 없습니다.');
      return;
    }
    if (orderForm.items.length === 0) {
      alert('발주 품목이 없습니다.');
      return;
    }
    // 품목별 Validation
    for (let i = 0; i < orderForm.items.length; i++) {
      const item = orderForm.items[i];
      if (!item.orderQuantity || item.orderQuantity <= 0) {
        alert(`${i + 1}번째 품목의 발주수량을 확인해주세요.`);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        alert(`${i + 1}번째 품목의 단가를 확인해주세요.`);
        return;
      }
    }

    try {
      setLoading(true);
      const purchaseOrderData: PurchaseOrderDTO = {
        poName: orderForm.poName,
        poDate: orderForm.poDate,
        vendorCode: selectedRows[0]?.vendorCode || '',
        purchaseType: selectedRows[0]?.purchaseType === '일반' ? 'G' : selectedRows[0]?.purchaseType === '단가계약' ? 'C' : 'G',
        remark: orderForm.remark,
        items: orderForm.items.map(item => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          unit: item.unit,
          orderQuantity: item.orderQuantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          deliveryDate: item.deliveryDate,
          storageLocation: item.storageLocation,
        } as POItemDTO)),
      };

      await purchaseOrderApi.create(purchaseOrderData);
      setIsOrderModalOpen(false);
      setSelectedRows([]);
      const moveToProgress = window.confirm('성공적으로 저장되었습니다.\n\n발주진행현황으로 이동하시겠습니까?');
      if (moveToProgress) {
        window.location.href = '/order/progress';
      } else {
        await fetchData();
      }
    } catch (error) {
      alert('발주 저장 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    // Validation (저장과 동일)
    if (!orderForm.poName.trim()) {
      alert('발주명을 입력해주세요.');
      return;
    }
    if (!orderForm.poDate) {
      alert('발주일자를 선택해주세요.');
      return;
    }
    if (!selectedRows[0]?.vendorCode) {
      alert('협력업체 정보가 없습니다.');
      return;
    }
    if (orderForm.items.length === 0) {
      alert('발주 품목이 없습니다.');
      return;
    }
    for (let i = 0; i < orderForm.items.length; i++) {
      const item = orderForm.items[i];
      if (!item.orderQuantity || item.orderQuantity <= 0) {
        alert(`${i + 1}번째 품목의 발주수량을 확인해주세요.`);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        alert(`${i + 1}번째 품목의 단가를 확인해주세요.`);
        return;
      }
    }

    try {
      setLoading(true);
      const purchaseOrderData: PurchaseOrderDTO = {
        poName: orderForm.poName,
        poDate: orderForm.poDate,
        vendorCode: selectedRows[0]?.vendorCode || '',
        purchaseType: selectedRows[0]?.purchaseType === '일반' ? 'G' : selectedRows[0]?.purchaseType === '단가계약' ? 'C' : 'G',
        status: '확정',
        remark: orderForm.remark,
        items: orderForm.items.map(item => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          unit: item.unit,
          orderQuantity: item.orderQuantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          deliveryDate: item.deliveryDate,
          storageLocation: item.storageLocation,
        } as POItemDTO)),
      };

      const created = await purchaseOrderApi.create(purchaseOrderData);
      // 확정 처리
      if (created.poNo) {
        await purchaseOrderApi.confirm(created.poNo);
      }
      setIsOrderModalOpen(false);
      setSelectedRows([]);
      const moveToProgress = window.confirm('성공적으로 확정되었습니다.\n\n발주진행현황으로 이동하시겠습니까?');
      if (moveToProgress) {
        window.location.href = '/order/progress';
      } else {
        await fetchData();
      }
    } catch (error) {
      alert('발주 확정 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 총 발주금액 계산
  const totalOrderAmount = orderForm.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <PageHeader 
        title="발주대기목록" 
        subtitle="선정완료된 견적을 조회하여 발주서를 작성합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="RFQ번호"
          placeholder="RFQ번호 입력"
          value={searchParams.rfqNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqNo: e.target.value }))}
        />
        <Input
          label="견적명"
          placeholder="견적명 입력"
          value={searchParams.rfqName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqName: e.target.value }))}
        />
        <Input
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendorName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendorName: e.target.value }))}
        />
        <Select
          label="구매유형"
          value={searchParams.purchaseType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, purchaseType: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'G', label: '일반' },
            { value: 'C', label: '단가계약' },
            { value: 'E', label: '긴급' },
          ]}
        />
        <DatePicker
          label="견적일 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="견적일 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="발주대기 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={handleCreateOrder}>발주서 작성</Button>
        }
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="rfqNo"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          emptyMessage="발주 대기 항목이 없습니다."
        />
      </Card>

      {/* 발주서 작성 모달 */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="발주서 작성"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={handleSaveOrder} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
            <Button variant="primary" onClick={handleConfirmOrder} disabled={loading}>
              {loading ? '확정 중...' : '확정'}
            </Button>
            <Button variant="secondary" onClick={() => setIsOrderModalOpen(false)}>닫기</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="PO번호" value="" placeholder="저장 시 자동생성" readOnly />
            <Input 
              label="발주명" 
              placeholder="발주명 입력" 
              value={orderForm.poName}
              onChange={(e) => setOrderForm(prev => ({ ...prev, poName: e.target.value }))}
              required
            />
            <DatePicker 
              label="발주일자" 
              value={orderForm.poDate}
              onChange={(e) => setOrderForm(prev => ({ ...prev, poDate: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="협력사" 
              value={selectedRows[0]?.vendorName || ''} 
              readOnly 
            />
            <Input 
              label="총 발주금액" 
              value={`₩${formatNumber(totalOrderAmount)}`} 
              readOnly 
            />
          </div>

          <Textarea 
            label="비고" 
            placeholder="비고 입력" 
            rows={2}
            value={orderForm.remark}
            onChange={(e) => setOrderForm(prev => ({ ...prev, remark: e.target.value }))}
          />

          {/* 발주 품목 목록 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">발주 품목</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right font-semibold text-gray-600">단가</th>
                    <th className="p-3 text-right font-semibold text-gray-600">발주수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">금액</th>
                    <th className="p-3 text-center font-semibold text-gray-600">납기희망일</th>
                    <th className="p-3 text-left font-semibold text-gray-600">저장위치</th>
                  </tr>
                </thead>
                <tbody>
                  {orderForm.items.map((item, index) => (
                    <tr key={item.itemCode} className="border-t">
                      <td className="p-3">{item.itemCode}</td>
                      <td className="p-3">{item.itemName}</td>
                      <td className="p-3 text-right">₩{formatNumber(item.unitPrice)}</td>
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          value={item.orderQuantity}
                          min={1}
                          className="w-20 px-2 py-1 border rounded text-right"
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 0;
                            const newAmount = item.unitPrice * newQuantity;
                            setOrderForm(prev => ({
                              ...prev,
                              items: prev.items.map((it, i) => 
                                i === index 
                                  ? { ...it, orderQuantity: newQuantity, amount: newAmount }
                                  : it
                              ),
                            }));
                          }}
                        />
                      </td>
                      <td className="p-3 text-right font-medium">₩{formatNumber(item.amount)}</td>
                      <td className="p-3 text-center">{item.deliveryDate}</td>
                      <td className="p-3">{item.storageLocation}</td>
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