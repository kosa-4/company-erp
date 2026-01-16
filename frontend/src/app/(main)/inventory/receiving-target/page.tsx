'use client';

import React, { useState, useEffect } from 'react';
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
import { formatNumber } from '@/lib/utils';
import { goodsReceiptApi, PendingPODTO, GoodsReceiptDTO } from '@/lib/api/goodsReceipt';
import { getErrorMessage } from '@/lib/api/error';

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

interface ReceivingFormItem {
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  receivedQuantity: number;
  receivedAmount: number;
  storageLocation: string;
}

export default function ReceivingTargetPage() {
  const [data, setData] = useState<ReceivingTarget[]>([]);
  const [selectedRows, setSelectedRows] = useState<ReceivingTarget[]>([]);
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
        setData([]);
        return;
      }

      // PO 데이터를 ReceivingTarget 형식으로 변환
      const transformed: ReceivingTarget[] = [];
      result.forEach((po: PendingPODTO) => {
        if (po.items && po.items.length > 0) {
          po.items.forEach((item) => {
            transformed.push({
              poNo: po.poNo || '',
              poName: po.poName || '',
              buyer: po.ctrlUserName || '',
              poDate: po.poDate || '',
              vendorCode: po.vendorCode || '',
              vendorName: po.vendorName || '',
              itemCode: item.itemCode || '',
              itemName: item.itemName || '',
              spec: item.specification || '',
              unit: item.unit || '',
              unitPrice: Number(item.unitPrice) || 0,
              orderQuantity: item.orderQuantity || 0,
              storageLocation: item.storageLocation || '본사 창고',
              amount: Number(item.amount) || 0,
            });
          });
        } else {
          // items가 없으면 헤더 정보만
          transformed.push({
            poNo: po.poNo || '',
            poName: po.poName || '',
            buyer: po.ctrlUserName || '',
            poDate: po.poDate || '',
            vendorCode: po.vendorCode || '',
            vendorName: po.vendorName || '',
            itemCode: '-',
            itemName: '-',
            spec: '-',
            unit: '-',
            unitPrice: 0,
            orderQuantity: 0,
            storageLocation: '-',
            amount: 0,
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
      poNo: '',
      poName: '',
      vendor: '',
      startDate: '',
      endDate: '',
    });
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
    
    // 입고 폼 초기화
    setGrDate(new Date().toISOString().split('T')[0]);
    setRemark('');
    setReceivingItems(selectedRows.map(row => ({
      itemCode: row.itemCode,
      itemName: row.itemName,
      spec: row.spec,
      unit: row.unit,
      unitPrice: row.unitPrice,
      orderQuantity: row.orderQuantity,
      receivedQuantity: row.orderQuantity, // 기본값: 발주수량
      receivedAmount: row.amount,
      storageLocation: row.storageLocation,
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
    if (!selectedRows[0]?.poNo) {
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
      if (item.receivedQuantity > item.orderQuantity) {
        alert(`${i + 1}번째 품목의 입고수량이 발주수량을 초과했습니다.`);
        return;
      }
    }

    try {
      setLoading(true);
      const grData: GoodsReceiptDTO = {
        poNo: selectedRows[0]?.poNo,
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
      setSelectedRows([]);
      
      const moveToList = window.confirm('성공적으로 입고 처리되었습니다.\n\n입고현황으로 이동하시겠습니까?');
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
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          value={item.receivedQuantity}
                          min={0}
                          max={item.orderQuantity}
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
