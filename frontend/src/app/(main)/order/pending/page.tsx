'use client';

import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  SearchPanel,
  Modal,
  DatePicker,
  Textarea
} from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { purchaseOrderApi, RfqSelectedDTO, RfqSelectedItemDTO } from '@/lib/api/purchaseOrder';
import { PurchaseOrderDTO, PurchaseOrderItemDTO as POItemDTO } from '@/types/purchaseOrder';
import { getErrorMessage } from '@/lib/api/error';

// RFQ 그룹 인터페이스
interface RfqGroup {
  rfqNo: string;
  rfqName: string;
  purchaseType: string;
  purchaseTypeDisplay: string;
  buyer: string;
  rfqDate: string;
  vendorCode: string;
  vendorName: string;
  itemCount: number;
  totalAmount: number;
  items: RfqSelectedItemDTO[];
}

export default function OrderPendingPage() {
  const [rfqGroups, setRfqGroups] = useState<RfqGroup[]>([]);
  const [expandedRfqs, setExpandedRfqs] = useState<Set<string>>(new Set());
  const [selectedRfqNo, setSelectedRfqNo] = useState<string | null>(null);
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
        setRfqGroups([]);
        return;
      }

      // RFQ별로 그룹화
      const groups: RfqGroup[] = result.map((rfq: RfqSelectedDTO) => {
        const purchaseTypeDisplay = 
          rfq.purchaseType === 'G' ? '일반' : 
          rfq.purchaseType === 'C' ? '단가계약' : 
          rfq.purchaseType === 'E' ? '긴급' : 
          rfq.purchaseType || '';

        const totalAmount = rfq.items?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

        return {
          rfqNo: rfq.rfqNo || '',
          rfqName: rfq.rfqName || '',
          purchaseType: rfq.purchaseType || '',
          purchaseTypeDisplay,
          buyer: rfq.ctrlUserName || '',
          rfqDate: rfq.rfqDate || '',
          vendorCode: rfq.vendorCode || '',
          vendorName: rfq.vendorName || '',
          itemCount: rfq.items?.length || 0,
          totalAmount,
          items: rfq.items || [],
        };
      });

      setRfqGroups(groups);
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

  // RFQ 행 펼치기/접기
  const toggleExpand = (rfqNo: string) => {
    const newExpanded = new Set(expandedRfqs);
    if (newExpanded.has(rfqNo)) {
      newExpanded.delete(rfqNo);
    } else {
      newExpanded.add(rfqNo);
    }
    setExpandedRfqs(newExpanded);
  };

  // RFQ 선택
  const handleSelectRfq = (rfqNo: string) => {
    setSelectedRfqNo(selectedRfqNo === rfqNo ? null : rfqNo);
  };

  const handleCreateOrder = () => {
    if (!selectedRfqNo) {
      alert('발주할 견적을 선택해주세요.');
      return;
    }

    const selectedGroup = rfqGroups.find(g => g.rfqNo === selectedRfqNo);
    if (!selectedGroup) return;
    
    // 폼 초기화
    setOrderForm({
      poName: selectedGroup.rfqName || '발주서',
      poDate: new Date().toISOString().split('T')[0],
      remark: '',
      items: selectedGroup.items.map(item => ({
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        unit: item.unit || 'EA',
        orderQuantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        amount: Number(item.amount) || 0,
        deliveryDate: item.deliveryDate || '',
        storageLocation: item.storageLocation || '본사 창고',
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
    
    const selectedGroup = rfqGroups.find(g => g.rfqNo === selectedRfqNo);
    if (!selectedGroup?.vendorCode) {
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
        vendorCode: selectedGroup.vendorCode,
        purchaseType: selectedGroup.purchaseType,
        rfqNo: selectedGroup.rfqNo, // RFQ 번호 추가
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
      setSelectedRfqNo(null);
      const moveToProgress = window.confirm('성공적으로 저장되었습니다. 발주진행현황으로 이동하시겠습니까?');
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
    
    const selectedGroup = rfqGroups.find(g => g.rfqNo === selectedRfqNo);
    if (!selectedGroup?.vendorCode) {
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
        vendorCode: selectedGroup.vendorCode,
        purchaseType: selectedGroup.purchaseType,
        rfqNo: selectedGroup.rfqNo, // RFQ 번호 추가
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
      setSelectedRfqNo(null);
      const moveToProgress = window.confirm('성공적으로 확정되었습니다. 발주진행현황으로 이동하시겠습니까?');
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
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="w-12 px-4 py-3.5 whitespace-nowrap"></th>
                  <th className="w-12 px-4 py-3.5 whitespace-nowrap">
                    {/* 선택 체크박스 헤더 */}
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">RFQ번호</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">견적명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">구매유형</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">담당자</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">견적요청일</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">협력사명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">품목수</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">총금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-stone-500">데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : rfqGroups.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-14 h-14 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-stone-500">발주 대기 항목이 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rfqGroups.map((group) => (
                    <React.Fragment key={group.rfqNo}>
                      {/* RFQ 메인 행 */}
                      <tr 
                        className={`
                          transition-colors duration-150 cursor-pointer
                          ${selectedRfqNo === group.rfqNo ? 'bg-teal-50' : 'hover:bg-stone-50'}
                        `}
                      >
                        {/* 펼치기 아이콘 */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>
                          <svg 
                            className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${expandedRfqs.has(group.rfqNo) ? 'rotate-90' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                        {/* 선택 체크박스 */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRfqNo === group.rfqNo}
                            onChange={() => handleSelectRfq(group.rfqNo)}
                            className="w-4 h-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>
                          <span className="text-blue-600 font-medium">{group.rfqNo}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-left whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>{group.rfqName}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>{group.purchaseTypeDisplay}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>{group.buyer}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>{group.rfqDate}</td>
                        <td className="px-4 py-3.5 text-sm text-left whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>{group.vendorName}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {group.itemCount}개
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-right font-medium whitespace-nowrap" onClick={() => toggleExpand(group.rfqNo)}>
                          ₩{formatNumber(group.totalAmount)}
                        </td>
                      </tr>
                      
                      {/* 펼쳐진 품목 상세 */}
                      {expandedRfqs.has(group.rfqNo) && (
                        <tr>
                          <td colSpan={10} className="bg-stone-50/50 px-4 py-3">
                            <div className="ml-12">
                              <table className="w-full border border-stone-200 rounded-lg overflow-hidden">
                                <thead className="bg-stone-100">
                                  <tr>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-center">품목코드</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-left">품목명</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-center">규격</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-center">단위</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-right">수량</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-right">단가</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-right">금액</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-center">납기희망일</th>
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-left">저장위치</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-100">
                                  {group.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-stone-50">
                                      <td className="px-3 py-2 text-xs text-center">{item.itemCode}</td>
                                      <td className="px-3 py-2 text-xs text-left">{item.itemName}</td>
                                      <td className="px-3 py-2 text-xs text-center">{item.specification || '-'}</td>
                                      <td className="px-3 py-2 text-xs text-center">{item.unit}</td>
                                      <td className="px-3 py-2 text-xs text-right">{formatNumber(Number(item.quantity))}</td>
                                      <td className="px-3 py-2 text-xs text-right">₩{formatNumber(Number(item.unitPrice))}</td>
                                      <td className="px-3 py-2 text-xs text-right font-medium">₩{formatNumber(Number(item.amount))}</td>
                                      <td className="px-3 py-2 text-xs text-center">{item.deliveryDate || '-'}</td>
                                      <td className="px-3 py-2 text-xs text-left">{item.storageLocation || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
              value={rfqGroups.find(g => g.rfqNo === selectedRfqNo)?.vendorName || ''} 
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
                        <span className="font-medium text-gray-900">
                          {formatNumber(item.orderQuantity)}
                        </span>
                        <span className="ml-1 text-xs text-gray-900">{item.unit}</span>
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