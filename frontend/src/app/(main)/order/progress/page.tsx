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
  Modal,
  Textarea,
  ModalFooter // Ensure this is imported if not already, or use Custom Footer
} from '@/components/ui';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import { purchaseOrderApi } from '@/lib/api/purchaseOrder';
import { PurchaseOrderDTO, PurchaseOrderItemDTO } from '@/types/purchaseOrder';
import { getErrorMessage } from '@/lib/api/error';

// PO 그룹 인터페이스
interface PoGroup {
  poNo: string;
  poName: string;
  poDate: string;
  purchaseType: string;
  purchaseTypeDisplay: string;
  buyer: string;
  status: string;
  statusDisplay: string;
  statusBadgeColor: string;
  vendorCode: string;
  vendorName: string;
  itemCount: number;
  totalAmount: number;
  remark: string;
  items: PurchaseOrderItemDTO[];
  receivedQuantity: number;
  checkFlag: string;
}

export default function OrderProgressPage() {
  const [poGroups, setPoGroups] = useState<PoGroup[]>([]);
  const [expandedPos, setExpandedPos] = useState<Set<string>>(new Set());
  const [selectedPoNo, setSelectedPoNo] = useState<string | null>(null);
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

  // 반려 모달 상태
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  // 상태별 배지 색상
  const getStatusBadgeColor = (code: string): string => {
    const colorMap: Record<string, string> = {
      'T': 'bg-gray-100 text-gray-800',
      'D': 'bg-blue-100 text-blue-800',
      'R': 'bg-red-100 text-red-800',
      'A': 'bg-green-100 text-green-800',
      'S': 'bg-blue-100 text-blue-800',
      'C': 'bg-green-100 text-green-800',
      'E': 'bg-gray-100 text-gray-800',
    };
    return colorMap[code] || 'bg-gray-100 text-gray-800';
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

      if (!result || !Array.isArray(result)) {
        setPoGroups([]);
        return;
      }

      // PO별로 그룹화
      const groups: PoGroup[] = result.map((po: PurchaseOrderDTO) => {
        const purchaseTypeDisplay = 
          po.purchaseType === 'G' ? '일반' : 
          po.purchaseType === 'C' ? '단가계약' : 
          po.purchaseType === 'E' ? '긴급' : 
          po.purchaseType || '';

        return {
          poNo: po.poNo || '',
          poName: po.poName || '',
          poDate: po.poDate?.toString() || '',
          purchaseType: po.purchaseType || '',
          purchaseTypeDisplay,
          buyer: po.purchaseManager || '',
          status: po.status || '',
          statusDisplay: statusCodeToDisplay(po.status || ''),
          statusBadgeColor: getStatusBadgeColor(po.status || ''),
          vendorCode: po.vendorCode || '',
          vendorName: po.vendorName || '',
          itemCount: po.items?.length || 0,
          totalAmount: Number(po.totalAmount) || 0,
          remark: po.remark || '',
          items: po.items || [],
          receivedQuantity: Number(po.receivedQuantity) || 0,
          checkFlag: po.checkFlag || 'N',
        };
      });

      setPoGroups(groups);
    } catch (error) {
      toast.error('데이터 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
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

  // PO 행 펼치기/접기
  const toggleExpand = (poNo: string) => {
    const newExpanded = new Set(expandedPos);
    if (newExpanded.has(poNo)) {
      newExpanded.delete(poNo);
    } else {
      newExpanded.add(poNo);
    }
    setExpandedPos(newExpanded);
  };

  // PO 선택
  const handleSelectPo = (poNo: string) => {
    setSelectedPoNo(selectedPoNo === poNo ? null : poNo);
  };

  // 상세 보기
  const handleViewDetail = async (poNo: string) => {
    try {
      const detail = await purchaseOrderApi.getDetail(poNo);
      setSelectedPo(detail);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('상세 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 수정 모달 열기
  const handleEdit = async () => {
    if (!selectedPoNo) {
      toast.warning('선택한 문서가 없습니다.');
      return;
    }
    const selectedGroup = poGroups.find(g => g.poNo === selectedPoNo);
    if (!selectedGroup) return;

    if (selectedGroup.status !== 'T') {
      toast.warning('저장 상태의 항목만 수정할 수 있습니다.');
      return;
    }

    try {
      const detail = await purchaseOrderApi.getDetail(selectedPoNo);
      setEditingPo(detail);
      setEditForm({
        poName: detail.poName || '',
        poDate: detail.poDate?.toString() || '',
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
      toast.error('발주 정보 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!editingPo || !editingPo.poNo) return;

    if (!editForm.poName.trim()) {
      toast.warning('발주명을 입력해주세요.');
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
      toast.success('발주가 수정되었습니다.');
      setIsEditModalOpen(false);
      setEditingPo(null);
      setSelectedPoNo(null);
      await fetchData();
    } catch (error) {
      toast.error('발주 수정 중 오류가 발생했습니다: ' + getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPoNo) {
      alert('선택한 문서가 없습니다.');
      return;
    }
    const selectedGroup = poGroups.find(g => g.poNo === selectedPoNo);
    if (!selectedGroup) return;

    if (selectedGroup.status !== 'T') {
      toast.warning('저장 상태의 항목만 확정할 수 있습니다.');
      return;
    }
    try {
      await purchaseOrderApi.confirm(selectedPoNo);
      toast.success('발주가 확정되었습니다.');
      setSelectedPoNo(null);
      await fetchData();
    } catch (error) {
      toast.error('확정 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleApprove = async () => {
    if (!selectedPoNo) {
      alert('선택한 문서가 없습니다.');
      return;
    }
    const selectedGroup = poGroups.find(g => g.poNo === selectedPoNo);
    if (!selectedGroup) return;

    if (selectedGroup.status !== 'D') {
      toast.warning('확정 상태의 항목만 승인할 수 있습니다.');
      return;
    }
    try {
      await purchaseOrderApi.approve(selectedPoNo);
      toast.success('발주가 승인되었습니다.');
      setSelectedPoNo(null);
      await fetchData();
    } catch (error) {
      toast.error('승인 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleReject = async () => {
    if (!selectedPoNo) {
      alert('선택한 문서가 없습니다.');
      return;
    }
    const selectedGroup = poGroups.find(g => g.poNo === selectedPoNo);
    if (!selectedGroup) return;

    if (selectedGroup.status !== 'D') {
      toast.warning('확정 상태의 항목만 반려할 수 있습니다.');
      return;
    }
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedPoNo) return;
    if (!rejectReason.trim()) {
      toast.warning('반려사유를 입력해주세요.');
      return;
    }

    try {
      await purchaseOrderApi.reject(selectedPoNo, rejectReason);
      toast.success('발주가 반려되었습니다.');
      setIsRejectModalOpen(false);
      setSelectedPoNo(null);
      await fetchData();
    } catch (error) {
      toast.error('반려 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleSend = async () => {
    if (!selectedPoNo) {
      alert('선택한 문서가 없습니다.');
      return;
    }
    const selectedGroup = poGroups.find(g => g.poNo === selectedPoNo);
    if (!selectedGroup) return;

    if (selectedGroup.status === 'S') {
      toast.warning('이미 발주전송된 건입니다');
      return;
    }

    if (selectedGroup.status !== 'A') {
      toast.warning('승인 상태의 항목만 발주전송할 수 있습니다.');
      return;
    }
    try {
      await purchaseOrderApi.send(selectedPoNo);
      toast.success('발주가 전송되었습니다.');
      setSelectedPoNo(null);
      await fetchData();
    } catch (error) {
      toast.error('발주전송 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleClose = async () => {
    if (!selectedPoNo) {
      alert('선택한 문서가 없습니다.');
      return;
    }
    const selectedGroup = poGroups.find(g => g.poNo === selectedPoNo);
    if (!selectedGroup) return;

    if (selectedGroup.status !== 'C') {
      toast.warning('납품완료 상태의 항목만 종결할 수 있습니다.');
      return;
    }
    try {
      await purchaseOrderApi.close(selectedPoNo);
      toast.success('발주가 종결되었습니다.');
      setSelectedPoNo(null);
      await fetchData();
    } catch (error) {
      toast.error('종결 처리 중 오류가 발생했습니다: ' + getErrorMessage(error));
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
            <Button variant="secondary" onClick={handleSend}>
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
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="w-12 px-4 py-3.5 whitespace-nowrap"></th>
                  <th className="w-12 px-4 py-3.5 whitespace-nowrap"></th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">PO번호</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">발주명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">구매유형</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">발주담당자</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">발주일자</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">진행상태</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">입고상태</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-left whitespace-nowrap">협력사명</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-center whitespace-nowrap">품목수</th>
                  <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider text-right whitespace-nowrap">총금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-stone-500">데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : poGroups.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-14 h-14 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-stone-500">발주 내역이 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  poGroups.map((group) => (
                    <React.Fragment key={group.poNo}>
                      {/* PO 메인 행 */}
                      <tr 
                        className={`
                          transition-colors duration-150 cursor-pointer
                          ${selectedPoNo === group.poNo ? 'bg-teal-50' : 'hover:bg-stone-50'}
                        `}
                      >
                        {/* 펼치기 아이콘 */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>
                          <svg 
                            className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${expandedPos.has(group.poNo) ? 'rotate-90' : ''}`}
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
                            checked={selectedPoNo === group.poNo}
                            onChange={() => handleSelectPo(group.poNo)}
                            className="w-4 h-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => handleViewDetail(group.poNo)}>
                          <span className="text-blue-600 font-medium hover:underline">{group.poNo}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-left whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>{group.poName}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>{group.purchaseTypeDisplay}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>{group.buyer}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>{group.poDate}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.statusBadgeColor}`}>
                            {group.statusDisplay}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>
                          {group.status === 'C' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              입고완료
                            </span>
                          ) : group.status === 'S' && group.checkFlag === 'N' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              미확인
                            </span>
                          ) : group.receivedQuantity > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              입고진행중
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              미입고
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-left whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>{group.vendorName}</td>
                        <td className="px-4 py-3.5 text-sm text-center whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {group.itemCount}개
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-right font-medium whitespace-nowrap" onClick={() => toggleExpand(group.poNo)}>
                          ₩{formatNumber(group.totalAmount)}
                        </td>
                      </tr>
                      
                      {/* 펼쳐진 품목 상세 */}
                      {expandedPos.has(group.poNo) && (
                        <tr>
                          <td colSpan={12} className="bg-stone-50/50 px-4 py-3">
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
                                    <th className="px-3 py-2 text-xs font-semibold text-stone-600 text-center">납기일</th>
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
                                      <td className="px-3 py-2 text-xs text-right">{formatNumber(item.orderQuantity)}</td>
                                      <td className="px-3 py-2 text-xs text-right">₩{formatNumber(Number(item.unitPrice))}</td>
                                      <td className="px-3 py-2 text-xs text-right font-medium">₩{formatNumber(Number(item.amount))}</td>
                                      <td className="px-3 py-2 text-xs text-center">{item.deliveryDate?.toString().split('T')[0] || '-'}</td>
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

      {/* 상세 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="발주 상세"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
        }
      >
        {selectedPo && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <h3 className="text-lg font-semibold">{selectedPo.poName}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedPo.status || '')}`}>
                {statusCodeToDisplay(selectedPo.status || '')}
              </span>
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
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목코드</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">품목명</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">수량</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">단가</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-600">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPo.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-sm">{item.itemCode}</td>
                      <td className="p-3 text-sm">{item.itemName}</td>
                      <td className="p-3 text-sm text-right">{formatNumber(item.orderQuantity)}</td>
                      <td className="p-3 text-sm text-right">₩{formatNumber(Number(item.unitPrice))}</td>
                      <td className="p-3 text-sm text-right font-medium">₩{formatNumber(Number(item.amount))}</td>
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
      {/* 반려 사유 입력 모달 */}
       <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="반려 사유 입력"
        size="sm"
        footer={
          <>
             <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>취소</Button>
             <Button variant="danger" onClick={confirmReject}>반려</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            반려 사유를 입력해주세요. 입력된 사유는 협력사에게 전달됩니다.
          </p>
          <Textarea 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="반려 사유를 입력하세요..."
            rows={4}
          />
        </div>
      </Modal>

    </div>
  );
}