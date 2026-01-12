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
  Textarea,
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { purchaseOrderApi } from '@/lib/api/purchaseOrder';
import { PurchaseOrderDTO, PurchaseOrderItemDTO } from '@/types/purchaseOrder';
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

  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPo, setEditingPo] = useState<PurchaseOrderDTO | null>(null);
  const [editForm, setEditForm] = useState({
    poName: '',
    poDate: '',
    remark: '',
    items: [] as Array<{
      itemCode: string;
      itemName: string;
      specification: string;
      unit: string;
      orderQuantity: number;
      unitPrice: number;
      amount: number;
      deliveryDate: string;
      storageLocation: string;
      remark: string;
    }>,
  });

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
      (r) => r.progressStatus === 'CONFIRMED'
    );
    if (approvedItems.length === 0) {
      alert('확정 상태의 항목만 승인할 수 있습니다.');
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
    const rejectItems = selectedRows.filter(
      (r) => r.progressStatus === 'CONFIRMED'
    );
    if (rejectItems.length === 0) {
      alert('확정 상태의 항목만 반려할 수 있습니다.');
      return;
    }
    const reason = prompt('반려사유를 입력해주세요.');
    if (reason) {
      try {
        const uniquePoNos = [...new Set(rejectItems.map((item) => item.poNo))];
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

  // 발주전송
  const handleSend = async () => {
    const approvedItems = selectedRows.filter(
      (r) => r.progressStatus === 'APPROVED'
    );
    if (approvedItems.length === 0) {
      alert('승인 상태의 항목만 발주전송할 수 있습니다.');
      return;
    }
    try {
      const uniquePoNos = [...new Set(approvedItems.map((item) => item.poNo))];
      await Promise.all(uniquePoNos.map((poNo) => purchaseOrderApi.send(poNo)));
      alert(`${uniquePoNos.length}건이 발주전송되었습니다.`);
      setSelectedRows([]);
      await fetchData();
    } catch (error) {
      alert('발주전송 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 수정 모달 열기
  const handleEdit = async () => {
    const savedItems = selectedRows.filter((r) => r.progressStatus === 'SAVED');
    if (savedItems.length === 0) {
      alert('저장 상태의 항목만 수정할 수 있습니다.');
      return;
    }
    if (savedItems.length > 1) {
      const uniquePoNos = [...new Set(savedItems.map((item) => item.poNo))];
      if (uniquePoNos.length > 1) {
        alert('한 번에 하나의 발주만 수정할 수 있습니다.');
        return;
      }
    }

    try {
      const poNo = savedItems[0].poNo;
      const detail = await purchaseOrderApi.getDetail(poNo);
      setEditingPo(detail);
      setEditForm({
        poName: detail.poName || '',
        poDate: detail.poDate || '',
        remark: detail.remark || '',
        items: detail.items?.map((item) => ({
          itemCode: item.itemCode || '',
          itemName: item.itemName || '',
          specification: item.specification || '',
          unit: item.unit || '',
          orderQuantity: item.orderQuantity || 0,
          unitPrice: Number(item.unitPrice) || 0,
          amount: Number(item.amount) || 0,
          deliveryDate: item.deliveryDate || '',
          storageLocation: item.storageLocation || '',
          remark: item.remark || '',
        })) || [],
      });
      setIsEditModalOpen(true);
    } catch (error) {
      alert('발주 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!editingPo || !editingPo.poNo) return;

    if (!editForm.poName.trim()) {
      alert('발주명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const updateData: PurchaseOrderDTO = {
        poNo: editingPo.poNo,
        poName: editForm.poName,
        poDate: editForm.poDate,
        vendorCode: editingPo.vendorCode,
        purchaseType: editingPo.purchaseType,
        remark: editForm.remark,
        items: editForm.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          specification: item.specification,
          unit: item.unit,
          orderQuantity: item.orderQuantity,
          unitPrice: item.unitPrice,
          amount: item.orderQuantity * item.unitPrice,
          deliveryDate: item.deliveryDate,
          storageLocation: item.storageLocation,
          remark: item.remark,
        } as PurchaseOrderItemDTO)),
      };

      await purchaseOrderApi.update(editingPo.poNo, updateData);
      alert('발주가 수정되었습니다.');
      setIsEditModalOpen(false);
      setEditingPo(null);
      setSelectedRows([]);
      await fetchData();
    } catch (error) {
      alert('발주 수정 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
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
            <Button variant="secondary" onClick={handleEdit}>
              수정
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              확정
            </Button>
            <Button variant="success" onClick={handleApprove}>
              승인
            </Button>
            <Button variant="info" onClick={handleSend}>
              발주전송
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

      {/* 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="발주 수정"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>닫기</Button>
            <Button variant="primary" onClick={handleSaveEdit} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </>
        }
      >
        {editingPo && (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <Input label="PO번호" value={editingPo.poNo || ''} readOnly />
              <Input
                label="발주명"
                placeholder="발주명 입력"
                required
                value={editForm.poName}
                onChange={(e) => setEditForm(prev => ({ ...prev, poName: e.target.value }))}
              />
              <Input label="발주담당자" value={editingPo.purchaseManager || ''} readOnly />
              <Input label="협력업체" value={editingPo.vendorName || ''} readOnly />
              <DatePicker
                label="발주일자"
                value={editForm.poDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, poDate: e.target.value }))}
              />
              <Input
                label="발주총금액"
                value={`₩${formatNumber(editForm.items.reduce((sum, item) => sum + (item.orderQuantity * item.unitPrice), 0))}`}
                readOnly
              />
            </div>

            {/* 품목 목록 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">품목 목록</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-600">품목코드</th>
                      <th className="p-3 text-left font-semibold text-gray-600">품목명</th>
                      <th className="p-3 text-right font-semibold text-gray-600">단가</th>
                      <th className="p-3 text-right font-semibold text-gray-600">수량</th>
                      <th className="p-3 text-right font-semibold text-gray-600">금액</th>
                      <th className="p-3 text-center font-semibold text-gray-600">납기일</th>
                      <th className="p-3 text-left font-semibold text-gray-600">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editForm.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.itemCode}</td>
                        <td className="p-3">{item.itemName}</td>
                        <td className="p-3 text-right">₩{formatNumber(item.unitPrice)}</td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={item.orderQuantity}
                            className="w-20 px-2 py-1 border rounded text-right"
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 0;
                              setEditForm(prev => ({
                                ...prev,
                                items: prev.items.map((it, i) =>
                                  i === index
                                    ? { ...it, orderQuantity: newQuantity, amount: newQuantity * it.unitPrice }
                                    : it
                                ),
                              }));
                            }}
                          />
                        </td>
                        <td className="p-3 text-right font-medium">₩{formatNumber(item.orderQuantity * item.unitPrice)}</td>
                        <td className="p-3 text-center">
                          <input
                            type="date"
                            value={item.deliveryDate}
                            className="px-2 py-1 border rounded"
                            onChange={(e) => {
                              setEditForm(prev => ({
                                ...prev,
                                items: prev.items.map((it, i) =>
                                  i === index
                                    ? { ...it, deliveryDate: e.target.value }
                                    : it
                                ),
                              }));
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.remark}
                            placeholder="비고"
                            className="w-24 px-2 py-1 border rounded"
                            onChange={(e) => {
                              setEditForm(prev => ({
                                ...prev,
                                items: prev.items.map((it, i) =>
                                  i === index
                                    ? { ...it, remark: e.target.value }
                                    : it
                                ),
                              }));
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Textarea
              label="비고"
              placeholder="비고 입력"
              rows={2}
              value={editForm.remark}
              onChange={(e) => setEditForm(prev => ({ ...prev, remark: e.target.value }))}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}