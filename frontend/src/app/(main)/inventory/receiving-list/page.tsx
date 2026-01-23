'use client';

import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DatePicker,
  SearchPanel,
  Badge,
  Modal,
  ModalFooter,
  Textarea
} from '@/components/ui';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import { purchaseOrderApi } from '@/lib/api/purchaseOrder';
import { goodsReceiptApi, GoodsReceiptDTO, GoodsReceiptItemDTO } from '@/lib/api/goodsReceipt';
import { getErrorMessage } from '@/lib/api/error';
import { PurchaseOrderDTO, PurchaseOrderItemDTO } from '@/types/purchaseOrder';

interface ReceivingRecord {
  id: string; // 고유 ID (grNo + itemCode)
  grNo: string;
  poNo: string;
  status: string;
  receiver: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  receivedQuantity: number;
  receivedAmount: number;
  grDate: string;
  storageLocation: string;
  remark: string;
}

export default function ReceivingListPage() {
  const [data, setData] = useState<ReceivingRecord[]>([]);
  // 선택된 아이템 ID 집합
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  
  const [searchParams, setSearchParams] = useState({
    grNo: '',
    vendor: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGr, setSelectedGr] = useState<GoodsReceiptDTO | null>(null);
  
  // 입고조정용 상태
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustUnitPrice, setAdjustUnitPrice] = useState(0);
  const [adjustItemCode, setAdjustItemCode] = useState('');
  const [targetItem, setTargetItem] = useState<ReceivingRecord | null>(null);
  const [poItemData, setPoItemData] = useState<{ orderQuantity: number; totalReceived: number; currentMyQuantity: number } | null>(null);
  
  // 상세 팝업용 상태
  const [isGrDetailModalOpen, setIsGrDetailModalOpen] = useState(false);
  const [isPoDetailModalOpen, setIsPoDetailModalOpen] = useState(false);
  const [selectedGrDetail, setSelectedGrDetail] = useState<GoodsReceiptDTO | null>(null);
  const [selectedPoDetail, setSelectedPoDetail] = useState<PurchaseOrderDTO | null>(null);

  // 취소 모달 상태
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // 데이터 조회
  const fetchData = async (params = searchParams) => {
    setLoading(true);
    try {
      const result = await goodsReceiptApi.getList({
        grNo: params.grNo || undefined,
        vendorName: params.vendor || undefined,
        status: params.status || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
      });

      if (!result || !Array.isArray(result)) {
        setData([]);
        return;
      }

      // GoodsReceiptDTO를 ReceivingRecord 형식으로 변환 (Flat List)
      const transformed: ReceivingRecord[] = [];
      result.forEach((gr: GoodsReceiptDTO) => {
        if (gr.items && gr.items.length > 0) {
          gr.items.forEach((item: GoodsReceiptItemDTO) => {
            transformed.push({
              id: `${gr.grNo}_${item.itemCode}`,
              grNo: gr.grNo || '',
              poNo: gr.poNo || '',
              status: gr.status || '',
              receiver: gr.ctrlUserName || '',
              vendorName: gr.vendorName || '',
              itemCode: item.itemCode || '',
              itemName: item.itemDesc || '',
              spec: item.itemSpec || '',
              unit: item.unitCode || '',
              unitPrice: Number(item.unitPrice) || 0,
              receivedQuantity: item.grQuantity || 0,
              receivedAmount: Number(item.grAmount) || 0,
              grDate: (item.grDate || gr.grDate || '').split('T')[0],
              storageLocation: item.warehouseCode || '',
              remark: item.remark || gr.remark || '',
            });
          });
        }
      });
      setData(transformed);
      setSelectedItemIds(new Set()); // 조회 시 선택 초기화
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      toast.error('데이터 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async () => {
    await fetchData();
  };

  const handleReset = async () => {
    const emptyParams = {
      grNo: '',
      vendor: '',
      startDate: '',
      endDate: '',
      status: '',
    };
    setSearchParams(emptyParams);
    await fetchData(emptyParams);
  };

  // 아이템 선택/해제 (라디오 버튼 방식 - 단일 선택)
  const toggleSelectItem = (id: string, grNo: string) => {
    // 단일 선택: 무조건 새로 선택한 것으로 교체
    // 만약 이미 선택된 것을 다시 클릭했다면 해제할 것인가?
    // 보통 라디오 버튼은 해제가 안 되지만, 여기서는 토글이 편할 수 있음.
    // 하지만 "Radio form" 요청이므로 단일 선택 강제를 따르되, 같은거 클릭시 유지는 radio standard.
    // 사용자가 체크박스 동작(토글)을 원하면 click logic에서 처리.
    // 여기서는 "checkbox 동작과 모양을 전부 radio 형태로" 라고 했으므로
    // 동작도 radio(하나만 선택)로 변경.
    
    // 이미 선택된 것이면 동작 없음 (Radio standard) 혹은 토글?
    // "Radio form" usually implies selecting one.
    // Let's implement strict single selection.
    setSelectedItemIds(new Set([id]));
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'yellow' | 'green' | 'red' | 'gray'; label: string }> = {
      'GRP': { variant: 'yellow', label: '부분입고' },
      'GRE': { variant: 'green', label: '입고완료' },
      'GRX': { variant: 'red', label: '입고취소' },
    };
    const { variant, label } = config[status] || { variant: 'gray', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // 입고 상세 조회
  const handleViewGrDetail = async (grNo: string) => {
    try {
      const detail = await goodsReceiptApi.getDetail(grNo);
      setSelectedGrDetail(detail);
      setIsGrDetailModalOpen(true);
    } catch (error) {
      toast.error('입고 상세 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 발주 상세 조회
  const handleViewPoDetail = async (poNo: string) => {
    try {
      const response = await fetch(`/api/v1/purchase-orders/${poNo}`);
      if (!response.ok) throw new Error('발주 상세 조회 실패');
      const detail = await response.json();
      setSelectedPoDetail(detail);
      setIsPoDetailModalOpen(true);
    } catch (error) {
      toast.error('발주 상세 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 입고조정 버튼 클릭
  const handleAdjust = async () => {
    if (selectedItemIds.size === 0) {
      toast.warning('조정할 품목을 선택해주세요.');
      return;
    }

    const selectedId = Array.from(selectedItemIds)[0];
    const row = data.find(item => item.id === selectedId);

    if (!row) return;
    
    if (row.status === 'GRX') {
      toast.warning('취소된 입고 건은 조정할 수 없습니다.');
      return;
    }

    try {
      // 상세 정보 조회 (Header 정보 필요)
      const detail = await goodsReceiptApi.getDetail(row.grNo);
      const targetItemDetail = detail.items?.find((i) => i.itemCode === row.itemCode);
      
      const orderQty = targetItemDetail?.orderQty || 0;
      // accumulatedQty: 현재까지의 총 누적 입고량 (현재 건 포함)
      const totalRecv = targetItemDetail?.accumulatedQty || 0;
      const currentMyQty = targetItemDetail?.grQuantity || 0;
      
      // 잔여 수량 (발주 수량 - 총 누적 입고량)
      // 이미 총 누적량에 현재 건이 포함되어 있다고 가정하면, 순수 잔여량은 orderQty - totalRecv
      const remaining = Math.max(0, orderQty - totalRecv);

      setSelectedGr(detail);
      setTargetItem(row);
      setPoItemData({ 
        orderQuantity: orderQty, 
        totalReceived: totalRecv, 
        currentMyQuantity: currentMyQty 
      });
      
      setAdjustItemCode(row.itemCode);
      
      // 요청 사항: "입고 조정 모달에서 표시되는 입고수량은 남은 입고수량이어야 함"
      setAdjustQuantity(remaining);
      setAdjustUnitPrice(row.unitPrice);
      setAdjustAmount(remaining * row.unitPrice); // 금액도 잔량 기준으로 다시 계산 표시
      
      setIsAdjustMode(true);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('상세 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 수량 변경 시 금액 업데이트
  const handleAdjustQuantityChange = (newQuantity: number) => {
    setAdjustQuantity(newQuantity);
    setAdjustAmount(newQuantity * adjustUnitPrice);
  };

  // 조정 저장
  const handleSaveAdjust = async () => {
    if (!selectedGr || !selectedGr.grNo || !adjustItemCode) return;

    if (adjustQuantity <= 0) {
      toast.warning('입고수량을 확인해주세요.');
      return;
    }

    // 발주 수량 초과 검증
    if (poItemData) {
      // 나를 제외한 다른 입고량 합계
      const otherReceived = poItemData.totalReceived - poItemData.currentMyQuantity;
      // 새로운 총 입고 예상량 = 다른 입고량 + 이번 조정 수량
      if (otherReceived + adjustQuantity > poItemData.orderQuantity) {
        toast.warning(`총 입고수량이 발주수량(${formatNumber(poItemData.orderQuantity)})을 초과할 수 없습니다.`);
        return;
      }
    }

    try {
      setLoading(true);
      await goodsReceiptApi.updateItem(selectedGr.grNo, adjustItemCode, {
        grQuantity: adjustQuantity,
        grAmount: adjustAmount,
        warehouseCode: targetItem?.storageLocation, // 저장위치 유지
      });
      toast.success('수정되었습니다.');
      setIsDetailModalOpen(false);
      setSelectedItemIds(new Set());
      await fetchData();
    } catch (error) {
      toast.error('수정 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 입고 취소
  const handleCancelItem = async () => {
    if (!selectedGr || !selectedGr.grNo || !adjustItemCode) return;
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedGr || !selectedGr.grNo || !adjustItemCode) return;
    if (!cancelReason.trim()) {
      toast.warning('취소 사유를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await goodsReceiptApi.cancelItem(selectedGr.grNo, adjustItemCode, cancelReason);
      toast.success('입고가 취소되었습니다.');
      setIsCancelModalOpen(false);
      setIsDetailModalOpen(false); // 상세 모달도 함께 닫기
      setSelectedItemIds(new Set());
      await fetchData();
    } catch (error) {
      toast.error('취소 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="입고현황" 
        subtitle="입고 처리된 품목 내역을 조회합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="입고번호"
          placeholder="입고번호 입력"
          value={searchParams.grNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, grNo: e.target.value }))}
        />
        <Input
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendor}
          onChange={(e) => setSearchParams(prev => ({ ...prev, vendor: e.target.value }))}
        />
        <DatePicker
          label="입고일자"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <Select
          label="입고상태"
          value={searchParams.status}
          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'GRP', label: '부분입고' },
            { value: 'GRE', label: '입고완료' },
            { value: 'GRX', label: '입고취소' },
          ]}
        />
      </SearchPanel>

      <Card 
        title="입고 품목 목록"
        padding={false}
        actions={
          <Button variant="secondary" onClick={handleAdjust}>입고조정/취소</Button>
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
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">입고번호</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">발주번호</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">품목코드</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">입고상태</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">품목명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">담당자</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">협력사명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">규격</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">단위</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">입고수량</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">입고금액</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">입고일자</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">저장위치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-16 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-stone-500">데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-16 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-14 h-14 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-stone-500">입고 내역이 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`
                        transition-colors duration-150 hover:bg-stone-50 cursor-pointer
                        ${selectedItemIds.has(item.id) ? 'bg-teal-50/70' : ''}
                      `}
                      onClick={() => toggleSelectItem(item.id, item.grNo)}
                    >
                      <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => toggleSelectItem(item.id, item.grNo)}
                          className="w-4 h-4 text-teal-600 border-stone-300 rounded-full focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap">
                        <span 
                          className="font-medium text-blue-600 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewGrDetail(item.grNo);
                          }}
                        >
                          {item.grNo}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap">
                        <span 
                          className="font-medium text-blue-600 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPoDetail(item.poNo);
                          }}
                        >
                          {item.poNo}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center text-gray-900 whitespace-nowrap">{item.itemCode}</td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3.5 text-sm text-left font-medium text-gray-900 whitespace-nowrap">{item.itemName}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-stone-600 whitespace-nowrap">{item.receiver}</td>
                      <td className="px-4 py-3.5 text-sm text-left text-stone-600 whitespace-nowrap">{item.vendorName}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-stone-500 whitespace-nowrap">{item.spec || '-'}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-stone-500 whitespace-nowrap">{item.unit}</td>
                      <td className="px-4 py-3.5 text-sm text-right font-medium whitespace-nowrap">{formatNumber(item.receivedQuantity)}</td>
                      <td className="px-4 py-3.5 text-sm text-right text-stone-600 whitespace-nowrap">₩{formatNumber(item.receivedAmount)}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-stone-500 whitespace-nowrap">{item.grDate}</td>
                      <td className="px-4 py-3.5 text-sm text-left text-stone-500 whitespace-nowrap">{item.storageLocation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 입고 조정/취소 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="입고 조정 / 취소"
        size="lg"
        footer={
          <>
            <Button variant="primary" onClick={handleSaveAdjust} disabled={loading}>
              {loading ? '저장 중...' : '수정'}
            </Button>
            <Button variant="danger" onClick={handleCancelItem} disabled={loading}>입고 취소</Button>
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
          </>
        }
      >
        {targetItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">{targetItem.itemName} ({targetItem.itemCode})</h3>
              {getStatusBadge(targetItem.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">입고번호</label>
                <p className="font-medium">{targetItem.grNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">발주번호</label>
                <p className="font-medium">{targetItem.poNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">입고일자</label>
                <p className="font-medium">{targetItem.grDate}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">저장위치</label>
                <p className="font-medium">{targetItem.storageLocation}</p>
              </div>
            </div>

            <div className="border rounded-lg bg-gray-50 p-4 space-y-4">
              <h4 className="font-medium text-gray-900">입고 수량 조정</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">입고수량</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={adjustQuantity}
                      min={0}
                      className="w-full px-3 py-2 border rounded-md text-right"
                      onChange={(e) => handleAdjustQuantityChange(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-gray-500">{targetItem.unit}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">입고금액</label>
                  <div className="w-full px-3 py-2 border rounded-md bg-white text-right font-medium">
                    ₩{formatNumber(adjustAmount)}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              * 조정 시 입고 금액은 (조정 수량 × 단가)로 자동 계산됩니다.<br/>
              * '입고 취소' 버튼을 누르면 해당 품목의 입고 내역이 취소됩니다.
            </div>
          </div>
        )}
      </Modal>

      {/* 입고 상세 모달 */}
      <Modal
        isOpen={isGrDetailModalOpen}
        onClose={() => setIsGrDetailModalOpen(false)}
        title="입고 상세"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsGrDetailModalOpen(false)}>닫기</Button>
        }
      >
        {selectedGrDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">입고번호</label>
                <p className="font-medium">{selectedGrDetail.grNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">발주번호</label>
                <p className="font-medium">{selectedGrDetail.poNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">입고일자</label>
                <p className="font-medium">{selectedGrDetail.grDate?.split('T')[0]}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">협력업체</label>
                <p className="font-medium">{selectedGrDetail.vendorName}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right font-semibold text-gray-600">수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">금액</th>
                    <th className="p-3 text-left font-semibold text-gray-600">저장위치</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGrDetail.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.itemCode}</td>
                      <td className="p-3">{item.itemDesc}</td>
                      <td className="p-3 text-right">{formatNumber(item.grQuantity)}</td>
                      <td className="p-3 text-right font-medium">₩{formatNumber(Number(item.grAmount))}</td>
                      <td className="p-3">{item.warehouseCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 입고금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(Number(selectedGrDetail.totalAmount || 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 발주 상세 모달 */}
      <Modal
        isOpen={isPoDetailModalOpen}
        onClose={() => setIsPoDetailModalOpen(false)}
        title="발주 상세"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsPoDetailModalOpen(false)}>닫기</Button>
        }
      >
        {selectedPoDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">발주번호</label>
                <p className="font-medium">{selectedPoDetail.poNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">발주명</label>
                <p className="font-medium">{selectedPoDetail.poName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">발주일자</label>
                <p className="font-medium">{selectedPoDetail.poDate?.split('T')[0]}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">협력업체</label>
                <p className="font-medium">{selectedPoDetail.vendorName}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right font-semibold text-gray-600">수량</th>
                    <th className="p-3 text-right font-semibold text-gray-600">단가</th>
                    <th className="p-3 text-right font-semibold text-gray-600">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPoDetail.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.itemCode}</td>
                      <td className="p-3">{item.itemName}</td>
                      <td className="p-3 text-right">{formatNumber(item.orderQuantity)}</td>
                      <td className="p-3 text-right">₩{formatNumber(Number(item.unitPrice))}</td>
                      <td className="p-3 text-right font-medium">₩{formatNumber(Number(item.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 발주금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(Number(selectedPoDetail.totalAmount || 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 취소 사유 입력 모달 */}
        <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="입고 취소 사유 입력"
        size="sm"
        footer={
          <>
              <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>취소</Button>
              <Button variant="danger" onClick={confirmCancel}>입고 취소</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            취소 사유를 입력해주세요.
          </p>
          <Textarea 
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="취소 사유를 입력하세요..."
            rows={4}
          />
        </div>
      </Modal>

    </div>
  );
}
