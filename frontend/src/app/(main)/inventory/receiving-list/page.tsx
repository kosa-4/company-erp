'use client';

import React, { useState, useEffect } from 'react';
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
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { goodsReceiptApi, GoodsReceiptDTO, GoodsReceiptItemDTO } from '@/lib/api/goodsReceipt';
import { getErrorMessage } from '@/lib/api/error';

interface ReceivingRecord {
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
  const [selectedRows, setSelectedRows] = useState<ReceivingRecord[]>([]);
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

      // GoodsReceiptDTO를 ReceivingRecord 형식으로 변환
      const transformed: ReceivingRecord[] = [];
      result.forEach((gr: GoodsReceiptDTO) => {
        if (gr.items && gr.items.length > 0) {
          gr.items.forEach((item: GoodsReceiptItemDTO) => {
            transformed.push({
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
              grDate: item.grDate || gr.grDate || '',
              storageLocation: item.warehouseCode || '',
              remark: item.remark || gr.remark || '',
            });
          });
        } else {
          transformed.push({
            grNo: gr.grNo || '',
            poNo: gr.poNo || '',
            status: gr.status || '',
            receiver: gr.ctrlUserName || '',
            vendorName: gr.vendorName || '',
            itemCode: '-',
            itemName: '-',
            spec: '-',
            unit: '-',
            unitPrice: 0,
            receivedQuantity: 0,
            receivedAmount: Number(gr.totalAmount) || 0,
            grDate: gr.grDate || '',
            storageLocation: '-',
            remark: gr.remark || '',
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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'yellow' | 'green' | 'red' | 'gray'; label: string }> = {
      'GRP': { variant: 'yellow', label: '부분입고' },
      'GRE': { variant: 'green', label: '입고완료' },
      'GRC': { variant: 'red', label: '입고취소' },
    };
    const { variant, label } = config[status] || { variant: 'gray', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRowClick = async (row: ReceivingRecord) => {
    try {
      const detail = await goodsReceiptApi.getDetail(row.grNo);
      setSelectedGr(detail);
      setIsAdjustMode(false);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('상세 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const columns: ColumnDef<ReceivingRecord>[] = [
    {
      key: 'grNo',
      header: '입고번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: '입고상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(String(value)),
    },
    { key: 'receiver', header: '입고담당자', width: 100, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', width: 140, align: 'left' },
    { key: 'spec', header: '규격', width: 150, align: 'left' },
    { key: 'unit', header: '단위', width: 60, align: 'center' },
    { 
      key: 'receivedQuantity', 
      header: '입고수량', 
      width: 90, 
      align: 'right',
      render: (value) => formatNumber(Number(value)),
    },
    { 
      key: 'receivedAmount', 
      header: '입고금액', 
      width: 120, 
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'grDate', header: '입고일자', width: 100, align: 'center' },
    { key: 'storageLocation', header: '저장위치', width: 100, align: 'left' },
  ];

  // 입고조정 버튼 클릭
  const handleAdjust = async () => {
    if (selectedRows.length === 0) {
      alert('선택한 문서가 없습니다.');
      return;
    }
    
    const row = selectedRows[0];
    if (row.status !== 'GRP') {
      alert('부분입고 상태의 항목만 조정할 수 있습니다.');
      return;
    }

    try {
      const detail = await goodsReceiptApi.getDetail(row.grNo);
      setSelectedGr(detail);
      
      // 첫 번째 품목의 정보로 조정 폼 초기화
      const firstItem = detail.items?.[0];
      if (firstItem) {
        setAdjustItemCode(firstItem.itemCode || '');
        setAdjustQuantity(firstItem.grQuantity || 0);
        setAdjustUnitPrice(Number(firstItem.unitPrice) || 0);
        setAdjustAmount((firstItem.grQuantity || 0) * (Number(firstItem.unitPrice) || 0));
      }
      
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
      });
      alert('수정되었습니다.');
      setIsDetailModalOpen(false);
      setSelectedRows([]);
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
      setSelectedRows([]);
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
        subtitle="입고 처리 내역을 조회합니다."
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
            { value: 'GRC', label: '입고취소' },
          ]}
        />
      </SearchPanel>

      <Card 
        title="입고현황 목록"
        padding={false}
        actions={
          <Button variant="secondary" onClick={handleAdjust}>입고조정</Button>
        }
      >
        <DataGrid
          columns={columns}
          data={data}
          keyField="grNo"
          loading={loading}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={(rows) => setSelectedRows(rows.length > 0 ? [rows[rows.length - 1]] : [])}
          onRowClick={handleRowClick}
          emptyMessage="입고 내역이 없습니다."
        />
      </Card>

      {/* 상세/조정 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={isAdjustMode ? '입고 조정' : '입고 상세'}
        size="lg"
        footer={
          isAdjustMode ? (
            <>
              <Button variant="primary" onClick={handleSaveAdjust} disabled={loading}>
                {loading ? '저장 중...' : '수정'}
              </Button>
              <Button variant="danger" onClick={handleCancelItem} disabled={loading}>취소</Button>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
            </>
          ) : (
            <ModalFooter
              onClose={() => setIsDetailModalOpen(false)}
              cancelText="닫기"
            />
          )
        }
      >
        {selectedGr && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">입고번호: {selectedGr.grNo}</h3>
              {getStatusBadge(selectedGr.status || '')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">입고담당자</label>
                <p className="font-medium">{selectedGr.ctrlUserName || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">입고일자</label>
                <p className="font-medium">{selectedGr.grDate || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">협력업체</label>
                <p className="font-medium">{selectedGr.vendorName || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">PO번호</label>
                <p className="font-medium">{selectedGr.poNo || '-'}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">규격</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">입고수량</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">입고금액</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGr.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-sm">{item.itemCode}</td>
                      <td className="p-3 text-sm">{item.itemDesc}</td>
                      <td className="p-3 text-sm">{item.itemSpec}</td>
                      <td className="p-3 text-sm text-right">
                        {isAdjustMode && item.itemCode === adjustItemCode ? (
                          <input 
                            type="number"
                            value={adjustQuantity}
                            min={0}
                            className="w-20 px-2 py-1 border rounded text-right"
                            onChange={(e) => handleAdjustQuantityChange(parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <>{formatNumber(item.grQuantity || 0)} {item.unitCode}</>
                        )}
                      </td>
                      <td className="p-3 text-sm text-right font-medium">
                        {isAdjustMode && item.itemCode === adjustItemCode 
                          ? `₩${formatNumber(adjustAmount)}`
                          : `₩${formatNumber(Number(item.grAmount) || 0)}`
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedGr.remark && (
              <div>
                <label className="text-sm text-gray-500">비고</label>
                <p className="mt-1 text-gray-700">{selectedGr.remark}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 입고금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(isAdjustMode ? adjustAmount : Number(selectedGr.totalAmount || 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
