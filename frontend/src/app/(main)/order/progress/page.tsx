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
  ModalFooter,
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { purchaseOrderApi } from '@/lib/api/purchaseOrder';
import { PurchaseOrderDTO } from '@/types/purchaseOrder';
import { getErrorMessage } from '@/lib/api/error';

interface OrderProgress {
  poNo: string;
  poName: string;
  purchaseType: string;
  buyer: string;
  progressStatus: 'SAVED' | 'CONFIRMED' | 'REJECTED' | 'PENDING' | 'APPROVED' | 'SENT' | 'DELIVERED' | 'CLOSED';
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  amount: number;
  deliveryDate: string;
  paymentTerms: string;
  storageLocation: string;
  remark: string;
}

export default function OrderProgressPage() {
  const [data, setData] = useState<OrderProgress[]>([]);
  const [selectedRows, setSelectedRows] = useState<OrderProgress[]>([]);
  const [searchParams, setSearchParams] = useState({
    poNo: '',
    poName: '',
    buyer: '',
    vendor: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderDTO | null>(null);

  // 코드 -> 표시명
  const statusCodeToDisplay = (code: string): string => {
    const statusMap: Record<string, string> = {
      'T': '저장',
      'D': '확정',
      'R': '반려',
      'A': '승인',
      'S': '발주전송',
      'C': '납품완료',
      'E': '종결',
    };
    return statusMap[code] || code;
  };

  // PurchaseOrderDTO를 OrderProgress 형식으로 변환
  const transformToOrderProgress = (orders: PurchaseOrderDTO[]): OrderProgress[] => {
    const result: OrderProgress[] = [];
    orders.forEach((order) => {
      // items가 없으면 헤더 정보만 표시 (빈 품목으로)
      if (!order.items || order.items.length === 0) {
        result.push({
          poNo: order.poNo || '',
          poName: order.poName || '',
          purchaseType: order.purchaseType || '',
          buyer: order.purchaseManager || '',
          progressStatus: mapStatusToProgressStatus(order.status || ''),
          vendorCode: order.vendorCode || '',
          vendorName: order.vendorName || '',
          itemCode: '-',
          itemName: '-',
          spec: '-',
          unit: '-',
          unitPrice: 0,
          orderQuantity: 0,
          amount: Number(order.totalAmount || 0),
          deliveryDate: '-',
          paymentTerms: '-',
          storageLocation: '-',
          remark: order.remark || '',
        });
      } else {
        // items가 있으면 각 품목별로 행 생성
        order.items.forEach((item) => {
          result.push({
            poNo: order.poNo || '',
            poName: order.poName || '',
            purchaseType: order.purchaseType || '',
            buyer: order.purchaseManager || '',
            progressStatus: mapStatusToProgressStatus(order.status || ''),
            vendorCode: order.vendorCode || '',
            vendorName: order.vendorName || '',
            itemCode: item.itemCode || '',
            itemName: item.itemName || '',
            spec: item.specification || '',
            unit: item.unit || '',
            unitPrice: Number(item.unitPrice || 0),
            orderQuantity: item.orderQuantity || 0,
            amount: Number(item.amount || 0),
            deliveryDate: item.deliveryDate || '',
            paymentTerms: item.paymentTerms || '',
            storageLocation: item.storageLocation || '',
            remark: item.remark || '',
          });
        });
      }
    });
    return result;
  };

  // 상태 매핑 함수
  const mapStatusToProgressStatus = (status: string): OrderProgress['progressStatus'] => {
    const statusMap: Record<string, OrderProgress['progressStatus']> = {
      'T': 'SAVED',
      'D': 'CONFIRMED',
      'R': 'REJECTED',
      'A': 'APPROVED',
      'S': 'SENT',
      'C': 'DELIVERED',
      'E': 'CLOSED',
    };
    return statusMap[status] || 'SAVED';
  };

  // API로 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await purchaseOrderApi.getList({
        poNo: searchParams.poNo || undefined,
        poName: searchParams.poName || undefined,
        purchaseManager: searchParams.buyer || undefined,
        vendorName: searchParams.vendor || undefined,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
        status: searchParams.status || undefined,
      });

      // 안전한 처리: 배열이 아니거나 null인 경우 빈 배열로 처리
      if (!result) {
        console.warn('API 응답이 null입니다.');
        setData([]);
        return;
      }

      if (!Array.isArray(result)) {
        console.error('API 응답이 배열이 아닙니다:', result);
        setData([]);
        return;
      }

      const transformedData = transformToOrderProgress(result);
      setData(transformedData);
    } catch (error) {
      alert('데이터 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
      console.error(error);
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
      buyer: '',
      vendor: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  };

  const getStatusBadge = (status: OrderProgress['progressStatus']) => {
    const config = {
      SAVED: { variant: 'gray' as const, label: '저장' },
      CONFIRMED: { variant: 'blue' as const, label: '확정' },
      REJECTED: { variant: 'red' as const, label: '반려' },
      PENDING: { variant: 'yellow' as const, label: '승인대기' },
      APPROVED: { variant: 'green' as const, label: '승인' },
      SENT: { variant: 'blue' as const, label: '발주전송' },
      DELIVERED: { variant: 'green' as const, label: '납품완료' },
      CLOSED: { variant: 'gray' as const, label: '종결' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRowClick = async (row: OrderProgress) => {
    try {
      const detail = await purchaseOrderApi.getDetail(row.poNo);
      setSelectedPo(detail);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('상세 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const columns: ColumnDef<OrderProgress>[] = [
    {
      key: 'poNo',
      header: 'PO번호',
      width: 130,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    { key: 'poName', header: '발주명', width: 150, align: 'left' },
    { key: 'purchaseType', header: '구매유형', width: 90, align: 'center' },
    { key: 'buyer', header: '발주담당자', width: 100, align: 'center' },
    {
      key: 'progressStatus',
      header: '진행상태',
      width: 100,
      align: 'center',
      render: (value) => getStatusBadge(value as OrderProgress['progressStatus']),
    },
    { key: 'vendorCode', header: '협력사코드', width: 130, align: 'center' },
    { key: 'vendorName', header: '협력사명', width: 140, align: 'left' },
    { key: 'itemCode', header: '품목코드', width: 130, align: 'center' },
    { key: 'itemName', header: '품목명', width: 150, align: 'left' },
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
    {
      key: 'amount',
      header: '금액',
      width: 120,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'deliveryDate', header: '납기가능일', width: 100, align: 'center' },
    { key: 'paymentTerms', header: '결제조건', width: 80, align: 'center' },
    { key: 'storageLocation', header: '저장위치', width: 100, align: 'left' },
  ];

  const handleApprove = async () => {
    const approvedItems = selectedRows.filter(
      (r) => r.progressStatus === 'CONFIRMED' || r.progressStatus === 'SAVED'
    );
    if (approvedItems.length === 0) {
      alert('확정 또는 저장 상태의 항목만 승인할 수 있습니다.');
      return;
    }

    try {
      const uniquePoNos = [...new Set(approvedItems.map((item) => item.poNo))];
      await Promise.all(uniquePoNos.map((poNo) => purchaseOrderApi.approve(poNo)));
      alert(`${uniquePoNos.length}건이 승인되었습니다.`);
      setSelectedRows([]);
      await fetchData();
    } catch (error) {
      alert('승인 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleReject = async () => {
    const approvedItems = selectedRows.filter(
      (r) => r.progressStatus === 'CONFIRMED' || r.progressStatus === 'SAVED'
    );
    if (approvedItems.length === 0) {
      alert('확정 또는 저장 상태의 항목만 반려할 수 있습니다.');
      return;
    }
    const reason = prompt('반려사유를 입력해주세요.');
    if (reason) {
      try {
        const uniquePoNos = [...new Set(approvedItems.map((item) => item.poNo))];
        await Promise.all(uniquePoNos.map((poNo) => purchaseOrderApi.reject(poNo, reason)));
        alert(`${uniquePoNos.length}건이 반려되었습니다.`);
        setSelectedRows([]);
        await fetchData();
      } catch (error) {
        alert('반려 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
      }
    }
  };

  const handleClose = async () => {
    const deliveredItems = selectedRows.filter((r) => r.progressStatus === 'DELIVERED');
    if (deliveredItems.length === 0) {
      alert('납품완료 상태의 항목만 종결할 수 있습니다.');
      return;
    }
    try {
      const uniquePoNos = [...new Set(deliveredItems.map((item) => item.poNo))];
      await Promise.all(uniquePoNos.map((poNo) => purchaseOrderApi.close(poNo)));
      alert(`${uniquePoNos.length}건이 종결되었습니다.`);
      setSelectedRows([]);
      await fetchData();
    } catch (error) {
      alert('종결 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleConfirm = async () => {
    const savedItems = selectedRows.filter(
      (r) => r.progressStatus === 'SAVED'
    );
    if (savedItems.length === 0) {
      alert('저장 상태의 항목만 확정할 수 있습니다.');
      return;
    }
    try {
      const uniquePoNos = [...new Set(savedItems.map((item) => item.poNo))];
      await Promise.all(
        uniquePoNos.map((poNo) => purchaseOrderApi.confirm(poNo))
      );
      alert(`${uniquePoNos.length}건이 확정되었습니다.`);
      setSelectedRows([]);
      await fetchData();
    } catch (error) {
      alert('확정 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  return (
    <div>
      <PageHeader
        title="발주진행현황"
        subtitle="발주 진행 상황을 조회하고 관리합니다."
        icon={
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PO번호"
          placeholder="PO번호 입력"
          value={searchParams.poNo}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, poNo: e.target.value }))
          }
        />
        <Input
          label="발주명"
          placeholder="발주명 입력"
          value={searchParams.poName}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, poName: e.target.value }))
          }
        />
        <Input
          label="발주담당자"
          placeholder="담당자명 입력"
          value={searchParams.buyer}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, buyer: e.target.value }))
          }
        />
        <Input
          label="협력업체"
          placeholder="협력업체명 입력"
          value={searchParams.vendor}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, vendor: e.target.value }))
          }
        />
        <DatePicker
          label="발주일자 시작"
          value={searchParams.startDate}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, startDate: e.target.value }))
          }
        />
        <DatePicker
          label="발주일자 종료"
          value={searchParams.endDate}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />
        <Select
          label="진행상태"
          value={searchParams.status}
          onChange={(e) =>
            setSearchParams((prev) => ({ ...prev, status: e.target.value }))
          }
          options={[
            { value: '', label: '전체' },
            { value: 'T', label: '저장' },
            { value: 'D', label: '확정' },
            { value: 'R', label: '반려' },
            { value: 'A', label: '승인' },
            { value: 'S', label: '발주전송' },
            { value: 'C', label: '납품완료' },
            { value: 'E', label: '종결' },
          ]}
        />
      </SearchPanel>

      <Card
        title="발주진행 목록"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleConfirm}>
              수정 및 확정
            </Button>
            <Button variant="success" onClick={handleApprove}>
              승인
            </Button>
            <Button variant="danger" onClick={handleReject}>
              반려
            </Button>
            <Button variant="warning" onClick={handleClose}>
              종결
            </Button>
          </div>
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
          onRowClick={handleRowClick}
          emptyMessage="발주 내역이 없습니다."
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="발주 상세"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsDetailModalOpen(false)}
            cancelText="닫기"
          />
        }
      >
        {selectedPo && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">{selectedPo.poName}</h3>
              <Badge 
                variant={
                  selectedPo.status === 'A' ? 'green' : 
                  selectedPo.status === 'R' ? 'red' : 
                  selectedPo.status === 'E' ? 'gray' : 
                  selectedPo.status === 'C' ? 'green' : 
                  'blue'
                }
              >
                {statusCodeToDisplay(selectedPo.status || '')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">PO번호</label>
                <p className="font-medium">{selectedPo.poNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">구매유형</label>
                <p className="font-medium">{selectedPo.purchaseType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">협력업체</label>
                <p className="font-medium">{selectedPo.vendorName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">발주담당자</label>
                <p className="font-medium">{selectedPo.purchaseManager}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">
                      품목코드
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">
                      품목명
                    </th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">
                      수량
                    </th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">
                      단가
                    </th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">
                      금액
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPo.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-sm">{item.itemCode}</td>
                      <td className="p-3 text-sm">{item.itemName}</td>
                      <td className="p-3 text-sm text-right">
                        {formatNumber(item.orderQuantity)}
                      </td>
                      <td className="p-3 text-sm text-right">
                        ₩{formatNumber(Number(item.unitPrice))}
                      </td>
                      <td className="p-3 text-sm text-right font-medium">
                        ₩{formatNumber(Number(item.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-gray-500 mr-4">총 발주금액:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(Number(selectedPo.totalAmount || 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}