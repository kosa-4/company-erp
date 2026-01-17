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
  ModalFooter
} from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { goodsReceiptApi, GoodsReceiptDTO, GoodsReceiptItemDTO } from '@/lib/api/goodsReceipt';
import { getErrorMessage } from '@/lib/api/error';

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

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await goodsReceiptApi.getList({
        grNo: searchParams.grNo || undefined,
        vendorName: searchParams.vendor || undefined,
        status: searchParams.status || undefined,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
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
      alert('데이터 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
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

  const handleReset = () => {
    setSearchParams({
      grNo: '',
      vendor: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  };

  // 아이템 선택/해제
  const toggleSelectItem = (id: string, grNo: string) => {
    // 단일 선택만 허용 (조정을 위해)
    // 물론 다중 선택 취소 등을 구현할 수도 있지만, 조정은 개별 품목 단위가 안전함
    const newSelected = new Set<string>();
    if (selectedItemIds.has(id)) {
      // 해제
    } else {
      newSelected.add(id);
    }
    setSelectedItemIds(newSelected);
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

  // 입고조정 버튼 클릭
  const handleAdjust = async () => {
    if (selectedItemIds.size === 0) {
      alert('조정할 품목을 선택해주세요.');
      return;
    }

    const selectedId = Array.from(selectedItemIds)[0];
    const row = data.find(item => item.id === selectedId);

    if (!row) return;
    
    // 입고완료 상태에서도 조정 가능하도록 할지? 일반적으로는 가능하지만 취소는 안됨
    // 여기서는 부분입고 상태일 때만 가능하다는 기존 로직을 따르거나, 
    // 혹은 모든 상태에서 가능하게 할 수 있음. 일단 기존 로직 유지
    if (row.status === 'GRX') {
      alert('취소된 입고 건은 조정할 수 없습니다.');
      return;
    }

    try {
      // 상세 정보 조회 (Header 정보 필요)
      const detail = await goodsReceiptApi.getDetail(row.grNo);
      setSelectedGr(detail);
      setTargetItem(row);
      
      setAdjustItemCode(row.itemCode);
      setAdjustQuantity(row.receivedQuantity);
      setAdjustUnitPrice(row.unitPrice);
      setAdjustAmount(row.receivedAmount);
      
      setIsAdjustMode(true);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('상세 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
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
      alert('입고수량을 확인해주세요.');
      return;
    }

    try {
      setLoading(true);
      await goodsReceiptApi.updateItem(selectedGr.grNo, adjustItemCode, {
        grQuantity: adjustQuantity,
        grAmount: adjustAmount,
        warehouseCode: targetItem?.storageLocation, // 저장위치 유지
      });
      alert('수정되었습니다.');
      setIsDetailModalOpen(false);
      setSelectedItemIds(new Set());
      await fetchData();
    } catch (error) {
      alert('수정 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 입고 취소
  const handleCancelItem = async () => {
    if (!selectedGr || !selectedGr.grNo || !adjustItemCode) return;

    const reason = prompt('취소 사유를 입력해주세요.');
    if (!reason) return;

    try {
      setLoading(true);
      await goodsReceiptApi.cancelItem(selectedGr.grNo, adjustItemCode, reason);
      alert('입고가 취소되었습니다.');
      setIsDetailModalOpen(false);
      setSelectedItemIds(new Set());
      await fetchData();
    } catch (error) {
      alert('취소 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
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
          label="입고일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="입고일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
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
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">PO번호</th>
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
                          type="checkbox"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => toggleSelectItem(item.id, item.grNo)}
                          className="w-4 h-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-center font-medium text-blue-600 whitespace-nowrap">{item.grNo}</td>
                      <td className="px-4 py-3.5 text-sm text-center font-medium text-blue-600 whitespace-nowrap">{item.poNo}</td>
                      <td className="px-4 py-3.5 text-sm text-center text-blue-600 whitespace-nowrap">{item.itemCode}</td>
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
                <label className="text-sm text-gray-500">PO번호</label>
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
                      className="w-full px-3 py-2 border rounded-md"
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
    </div>
  );
}
