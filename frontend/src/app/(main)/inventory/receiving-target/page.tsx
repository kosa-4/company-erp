'use client';

import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  DatePicker,
  SearchPanel,
  Modal,
  Textarea
} from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { goodsReceiptApi, PendingPODTO, GoodsReceiptDTO } from '@/lib/api/goodsReceipt';
import { getErrorMessage } from '@/lib/api/error';

// 평탄화된 입고 대상 아이템 인터페이스
interface ReceivingTargetItem {
  id: string; // 고유 ID (poNo + itemCode)
  rfqNo: string;
  poNo: string;
  poName: string;
  buyer: string;
  poDate: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  remainingQuantity: number; // 잔여수량
  amount: number;
  storageLocation: string;
}

interface ReceivingFormItem {
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  remainingQuantity: number;
  receivedQuantity: number;
  receivedAmount: number;
  storageLocation: string;
}

export default function ReceivingTargetPage() {
  const [targetItems, setTargetItems] = useState<ReceivingTargetItem[]>([]);
  // 선택된 아이템 ID 집합
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  
  const [searchParams, setSearchParams] = useState({
    poNo: '',
    poName: '',
    vendor: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);
  
  // 입고 폼 상태
  const [grDate, setGrDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [receivingItems, setReceivingItems] = useState<ReceivingFormItem[]>([]);
  // 현재 작업 중인 PO 번호 (입고 처리는 한 번에 하나의 PO만 가능)
  const [currentPoNo, setCurrentPoNo] = useState<string | null>(null);

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await goodsReceiptApi.getPendingPOList({
        poNo: searchParams.poNo || undefined,
        poName: searchParams.poName || undefined,
        vendorName: searchParams.vendor || undefined,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
      });

      if (!result || !Array.isArray(result)) {
        setTargetItems([]);
        return;
      }

      // PO 데이터를 품목 단위로 평탄화 (Flatten)
      const flatItems: ReceivingTargetItem[] = [];
      
      result.forEach((po: PendingPODTO) => {
        if (!po.items || po.items.length === 0) return;
        
        po.items.forEach((item) => {
          // 잔여 수량이 0 이하면 목록에 표시하지 않음 (이미 완료된 경우)
          const remainingQty = item.remainingQuantity !== undefined ? item.remainingQuantity : (item.orderQuantity || 0);
          if (remainingQty <= 0) return;

          flatItems.push({
            id: `${po.poNo}_${item.itemCode}`,
            rfqNo: po.rfqNo || '',
            poNo: po.poNo || '',
            poName: po.poName || '',
            poDate: po.poDate || '',
            buyer: po.ctrlUserName || '',
            vendorName: po.vendorName || '',
            itemCode: item.itemCode || '',
            itemName: item.itemName || '',
            spec: item.specification || '',
            unit: item.unit || '',
            unitPrice: Number(item.unitPrice) || 0,
            orderQuantity: item.orderQuantity || 0,
            remainingQuantity: remainingQty,
            amount: Number(item.amount) || 0,
            storageLocation: item.storageLocation || '본사 창고',
          });
        });
      });

      setTargetItems(flatItems);
      setSelectedItemIds(new Set()); // 조회 시 선택 초기화
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
      poNo: '',
      poName: '',
      vendor: '',
      startDate: '',
      endDate: '',
    });
  };

  // 아이템 선택/해제
  const toggleSelectItem = (id: string, poNo: string) => {
    const newSelected = new Set(selectedItemIds);
    
    // 이미 선택된 아이템이 있고, 다른 PO의 아이템을 선택하려는 경우 경고
    if (newSelected.size > 0 && !newSelected.has(id)) {
      const firstSelectedId = Array.from(newSelected)[0];
      const firstSelectedItem = targetItems.find(item => item.id === firstSelectedId);
      
      if (firstSelectedItem && firstSelectedItem.poNo !== poNo) {
        alert('동일한 발주번호의 품목만 함께 선택할 수 있습니다.');
        return;
      }
    }

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItemIds(newSelected);
  };

  const handleReceiving = () => {
    if (selectedItemIds.size === 0) {
      alert('입고 처리할 품목을 선택해주세요.');
      return;
    }

    const selectedItemsList = targetItems.filter(item => selectedItemIds.has(item.id));
    if (selectedItemsList.length === 0) return;

    // PO 번호 검증 (모두 같아야 함)
    const firstPoNo = selectedItemsList[0].poNo;
    const isAllSamePo = selectedItemsList.every(item => item.poNo === firstPoNo);

    if (!isAllSamePo) {
      alert('동일한 발주번호의 품목만 함께 입고 처리할 수 있습니다.');
      return;
    }

    setCurrentPoNo(firstPoNo);
    
    // 입고 폼 초기화
    setGrDate(new Date().toISOString().split('T')[0]);
    setRemark('');
    setReceivingItems(selectedItemsList.map(item => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      spec: item.spec,
      unit: item.unit,
      unitPrice: item.unitPrice,
      orderQuantity: item.orderQuantity,
      remainingQuantity: item.remainingQuantity,
      receivedQuantity: item.remainingQuantity, // 기본값: 잔여수량
      receivedAmount: item.unitPrice * item.remainingQuantity,
      storageLocation: item.storageLocation,
    })));
    
    setIsReceivingModalOpen(true);
  };

  // 수량 변경 시 금액 업데이트
  const handleQuantityChange = (index: number, newQuantity: number) => {
    setReceivingItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, receivedQuantity: newQuantity, receivedAmount: item.unitPrice * newQuantity }
        : item
    ));
  };

  // 저장위치 변경
  const handleStorageChange = (index: number, newStorage: string) => {
    setReceivingItems(prev => prev.map((item, i) => 
      i === index ? { ...item, storageLocation: newStorage } : item
    ));
  };

  // 입고 저장
  const handleSaveReceiving = async () => {
    // Validation
    if (!grDate) {
      alert('입고일자를 선택해주세요.');
      return;
    }
    if (!currentPoNo) {
      alert('발주 정보가 없습니다.');
      return;
    }
    if (receivingItems.length === 0) {
      alert('입고 품목이 없습니다.');
      return;
    }
    // 품목별 Validation
    for (let i = 0; i < receivingItems.length; i++) {
      const item = receivingItems[i];
      if (item.receivedQuantity <= 0) {
        alert(`${i + 1}번째 품목의 입고수량을 확인해주세요.`);
        return;
      }
      if (item.receivedQuantity > item.remainingQuantity) {
        alert(`${i + 1}번째 품목의 입고수량이 잔여수량(${item.remainingQuantity})을 초과했습니다.`);
        return;
      }
    }

    try {
      setLoading(true);
      const grData: GoodsReceiptDTO = {
        poNo: currentPoNo,
        grDate: grDate,
        totalAmount: receivingItems.reduce((sum, item) => sum + item.receivedAmount, 0),
        status: 'GRP', // 입고처리 상태
        remark: remark,
        items: receivingItems.map(item => ({
          itemCode: item.itemCode,
          itemDesc: item.itemName,
          itemSpec: item.spec,
          unitCode: item.unit,
          grQuantity: item.receivedQuantity,
          grAmount: item.receivedAmount,
          warehouseCode: item.storageLocation,
          grDate: `${grDate}T00:00:00`,
          statusCode: 'N',
        })),
      };

      await goodsReceiptApi.create(grData);
      setIsReceivingModalOpen(false);
      setSelectedItemIds(new Set());
      setCurrentPoNo(null);
      
      const moveToList = window.confirm('성공적으로 입고 처리되었습니다. 입고현황으로 이동하시겠습니까?');
      if (moveToList) {
        window.location.href = '/inventory/receiving-list';
      } else {
        await fetchData();
      }
    } catch (error) {
      alert('입고 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 총 입고금액 계산
  const totalReceivingAmount = receivingItems.reduce((sum, item) => sum + item.receivedAmount, 0);

  return (
    <div>
      <PageHeader 
        title="입고대상조회" 
        subtitle="입고 처리 대상 품목을 조회합니다."
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
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendor}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendor: e.target.value }))}
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
        title="입고대상 품목 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={handleReceiving}>입고처리</Button>
        }
      >
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="w-12 px-4 py-3.5 text-center whitespace-nowrap">
                    <span className="sr-only">선택</span>
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">RFQ번호</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">PO번호</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">품목코드</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">발주명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">품목명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">규격</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">단위</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">잔여수량</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">단가</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">금액</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">저장위치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-16 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-stone-500">데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : targetItems.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-16 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-14 h-14 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-stone-500">입고 대상이 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  targetItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`
                        transition-colors duration-150 hover:bg-stone-50 cursor-pointer
                        ${selectedItemIds.has(item.id) ? 'bg-teal-50/70' : ''}
                      `}
                      onClick={() => toggleSelectItem(item.id, item.poNo)}
                    >
                      <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => toggleSelectItem(item.id, item.poNo)}
                          className="w-4 h-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center font-medium text-blue-600 whitespace-nowrap">{item.rfqNo}</td>
                      <td className="px-4 py-3.5 text-sm text-center font-medium text-blue-600 whitespace-nowrap">{item.poNo}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-blue-600 whitespace-nowrap">{item.itemCode}</td>
                      <td className="px-4 py-3.5 text-sm text-left text-stone-600 truncate max-w-[200px] whitespace-nowrap" title={item.poName}>{item.poName}</td>
                      <td className="px-4 py-3.5 text-sm text-left font-medium text-gray-900 whitespace-nowrap">{item.itemName}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-stone-500 whitespace-nowrap">{item.spec || '-'}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-stone-500 whitespace-nowrap">{item.unit}</td>
                      <td className="px-4 py-3.5 text-sm text-right font-semibold text-blue-600 whitespace-nowrap">{formatNumber(item.remainingQuantity)}</td>
                      <td className="px-4 py-3.5 text-sm text-right text-stone-600 whitespace-nowrap">₩{formatNumber(item.unitPrice)}</td>
                      <td className="px-4 py-3.5 text-sm text-right font-medium text-stone-900 whitespace-nowrap">₩{formatNumber(item.amount)}</td>
                      <td className="px-4 py-3.5 text-sm text-left text-stone-500 whitespace-nowrap">{item.storageLocation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 입고처리 모달 */}
      <Modal
        isOpen={isReceivingModalOpen}
        onClose={() => setIsReceivingModalOpen(false)}
        title="입고 처리"
        size="xl"
        footer={
          <>
            <Button variant="primary" onClick={handleSaveReceiving} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
            <Button variant="secondary" onClick={() => setIsReceivingModalOpen(false)}>닫기</Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="입고번호" value="" placeholder="저장 시 자동생성" readOnly />
            <DatePicker 
              label="입고일자" 
              value={grDate}
              onChange={(e) => setGrDate(e.target.value)}
            />
            <Input 
              label="입고금액" 
              value={`₩${formatNumber(totalReceivingAmount)}`} 
              readOnly 
            />
          </div>

          <Textarea 
            label="비고" 
            placeholder="비고 입력" 
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />

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
                    <th className="p-3 text-right font-semibold text-gray-600">잔여수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">입고수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">입고금액</th>
                    <th className="p-3 text-left font-semibold text-gray-600">저장위치</th>
                  </tr>
                </thead>
                <tbody>
                  {receivingItems.map((item, index) => (
                    <tr key={item.itemCode} className="border-t">
                      <td className="p-3">{item.itemCode}</td>
                      <td className="p-3">{item.itemName}</td>
                      <td className="p-3 text-right">₩{formatNumber(item.unitPrice)}</td>
                      <td className="p-3 text-right">{formatNumber(item.orderQuantity)}</td>
                      <td className="p-3 text-right">{formatNumber(item.remainingQuantity)}</td>
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          value={item.receivedQuantity}
                          min={0}
                          max={item.remainingQuantity}
                          className="w-20 px-2 py-1 border rounded text-right"
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-3 text-right font-medium">₩{formatNumber(item.receivedAmount)}</td>
                      <td className="p-3">
                        <select 
                          className="px-2 py-1 border rounded text-sm"
                          value={item.storageLocation}
                          onChange={(e) => handleStorageChange(index, e.target.value)}
                        >
                          <option value="본사 창고">본사 창고</option>
                          <option value="지사 창고">지사 창고</option>
                        </select>
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
