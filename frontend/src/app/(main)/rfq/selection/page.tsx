'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  SearchPanel,
  Badge,
  Modal
} from '@/components/ui';
import { rfqApi } from '@/lib/api/rfq';
import { toast } from 'sonner';
import { formatNumber, formatDate } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/error';

interface RfqSelectionVendor {
  vendorCd: string;
  vendorNm: string;
  totalAmt: number | string | null;
  vnProgressCd: string;
  vnProgressNm: string;
  sendDate: string;
  submitDate: string;
  selectYn: string;
}

interface RfqSelectionGroup {
  rfqNo: string;
  rfqName: string;
  rfqTypeNm: string;
  ctrlUserNm: string;
  regDate: string;
  progressCd: string;
  progressNm: string;
  vendors: RfqSelectionVendor[];
}

export default function RfqSelectionPage() {
  const [data, setData] = useState<RfqSelectionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedRfqNums, setSelectedRfqNums] = useState<string[]>([]);

  // 선정 대상 협력사 상태 (하나만 선택 가능)
  const [selectedVendor, setSelectedVendor] = useState<{ rfqNo: string; vendorCd: string; vendorNm: string } | null>(null);

  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    startDate: '',
    endDate: '',
    rfqType: '',
    status: '',
    buyer: '',
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectionReason, setSelectionReason] = useState('');

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rfqApi.getSelectionList({
        rfqNum: searchParams.rfqNo,
        rfqSubject: searchParams.rfqName,
        fromDate: searchParams.startDate,
        toDate: searchParams.endDate,
        rfqType: searchParams.rfqType,
        progressCd: searchParams.status,
        ctrlUserNm: searchParams.buyer
      });

      // 데이터 그룹화 (RFQ 번호 기준)
      const grouped = response.reduce((acc, curr) => {
        const existing = acc.find(g => g.rfqNo === curr.rfqNum);
        const vendor: RfqSelectionVendor = {
          vendorCd: curr.vendorCd,
          vendorNm: curr.vendorNm,
          totalAmt: curr.totalAmt || 0,
          vnProgressCd: curr.vnProgressCd,
          vnProgressNm: curr.vnProgressNm,
          sendDate: curr.sendDate?.substring(0, 10) || '-',
          submitDate: curr.submitDate?.substring(0, 10) || '-',
          selectYn: curr.selectYn || 'N',
        };

        if (existing) {
          existing.vendors.push(vendor);
        } else {
          acc.push({
            rfqNo: curr.rfqNum,
            rfqName: curr.rfqSubject,
            rfqTypeNm: curr.rfqTypeNm,
            ctrlUserNm: curr.ctrlUserNm,
            regDate: curr.regDate?.substring(0, 10) || '-',
            progressCd: curr.progressCd,
            progressNm: curr.progressNm,
            vendors: [vendor]
          });
        }
        return acc;
      }, [] as RfqSelectionGroup[]);

      setData(grouped);
      // 검색 시 기존 선택/확장 상태 초기화
      setExpandedRows([]);
      setSelectedRfqNums([]);
      setSelectedVendor(null);
    } catch (error) {
      toast.error('목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleReset = () => {
    setSearchParams({
      rfqNo: '',
      rfqName: '',
      startDate: '',
      endDate: '',
      rfqType: '',
      status: '',
      buyer: '',
    });
  };

  const toggleRow = (rfqNo: string) => {
    setExpandedRows(prev =>
      prev.includes(rfqNo) ? prev.filter(id => id !== rfqNo) : [...prev, rfqNo]
    );
  };

  const handleSelectRfq = (rfqNo: string, checked: boolean) => {
    setSelectedRfqNums(prev =>
      checked ? [...prev, rfqNo] : prev.filter(num => num !== rfqNo)
    );
  };

  const getStatusBadge = (status: string, label: string) => {
    const config: Record<string, { variant: 'gray' | 'yellow' | 'green' | 'blue' | 'red' }> = {
      M: { variant: 'red' },
      G: { variant: 'blue' },
      J: { variant: 'green' },
    };
    const { variant } = config[status] || { variant: 'gray' };
    return <Badge variant={variant as any}>{label}</Badge>;
  };

  const handleOpen = async () => {
    if (selectedRfqNums.length === 0) {
      toast.error('개찰할 항목을 선택해주세요.');
      return;
    }

    const targetItems = data.filter(d => selectedRfqNums.includes(d.rfqNo));
    const invalidItems = targetItems.filter(d => d.progressCd !== 'M');

    if (invalidItems.length > 0) {
      toast.error('마감(M) 상태의 항목만 개찰할 수 있습니다.');
      return;
    }

    if (!confirm(`${selectedRfqNums.length}건을 개찰하시겠습니까? 개찰 후에는 금액이 공개됩니다.`)) return;

    try {
      setLoading(true);
      await Promise.all(selectedRfqNums.map(num => rfqApi.openRfq(num)));
      toast.success('개찰 처리가 완료되었습니다.');
      handleSearch();
      setSelectedRfqNums([]);
    } catch (error) {
      toast.error('개찰 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (!selectedVendor) {
      toast.error('선정할 협력사를 선택해주세요.');
      return;
    }

    const rfq = data.find(d => d.rfqNo === selectedVendor.rfqNo);

    // 이미 선정된 업체가 있는지 확인
    const alreadySelected = rfq?.vendors.some(v => v.selectYn === 'Y');
    if (alreadySelected || rfq?.progressCd === 'J') {
      alert('이미 협력업체가 선정되었습니다.');
      return;
    }

    if (rfq?.progressCd !== 'G') {
      toast.error('개찰(G) 상태인 항목만 선정할 수 있습니다.');
      return;
    }

    setSelectionReason('');
    setIsReasonModalOpen(true);
  };

  const confirmSelection = async () => {
    if (!selectedVendor) return;
    try {
      setLoading(true);
      await rfqApi.selectVendor(selectedVendor.rfqNo, selectedVendor.vendorCd, selectionReason);
      toast.success('협력업체 선정이 완료되었습니다.');
      setIsReasonModalOpen(false);
      handleSearch();
      setSelectedVendor(null);
      setSelectedRfqNums([]);
    } catch (error) {
      toast.error('선정 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="협력업체 선정"
        subtitle="마감된 견적에 대해 협력업체를 선정합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
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
        <DatePicker
          label="견적일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="견적일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Input
          label="견적명"
          placeholder="견적명 입력"
          value={searchParams.rfqName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqName: e.target.value }))}
        />
        <Select
          label="견적유형"
          value={searchParams.rfqType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqType: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'OC', label: '수의계약' },
            { value: 'AC', label: '지명경쟁' },
          ]}
        />
        <Select
          label="상태"
          value={searchParams.status}
          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'M', label: '마감' },
            { value: 'G', label: '개찰' },
            { value: 'J', label: '선정완료' },
          ]}
        />
        <Input
          label="구매담당자"
          placeholder="담당자명 입력"
          value={searchParams.buyer}
          onChange={(e) => setSearchParams(prev => ({ ...prev, buyer: e.target.value }))}
        />
      </SearchPanel>

      <Card
        title="협력업체 선정 목록 (RFQ 단위)"
        padding={false}
        actions={
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleOpen} loading={loading}>개찰</Button>
            <Button variant="secondary" onClick={() => setIsCompareModalOpen(true)}>견적비교</Button>
            <Button variant="success" onClick={handleSelect} loading={loading}>선정</Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="w-12 px-4 py-3.5"><div className="w-4" /></th>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-600 rounded"
                    checked={data.length > 0 && selectedRfqNums.length === data.length}
                    onChange={(e) => setSelectedRfqNums(e.target.checked ? data.map(d => d.rfqNo) : [])}
                  />
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">RFQ번호</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-left">견적명</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">견적유형</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">구매담당자</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">등록일</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">상태</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">참여업체</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
                      <span className="text-stone-500">데이터를 불러오는 중...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-stone-500">조회된 데이터가 없습니다.</td>
                </tr>
              ) : (
                data.map((row) => {
                  const isExpanded = expandedRows.includes(row.rfqNo);
                  const isSelected = selectedRfqNums.includes(row.rfqNo);
                  const totalVendors = row.vendors.length;

                  return (
                    <React.Fragment key={row.rfqNo}>
                      <tr
                        className={`hover:bg-teal-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-teal-50/50' : ''}`}
                        onClick={() => toggleRow(row.rfqNo)}
                      >
                        <td className="px-4 py-3 text-center">
                          <svg
                            className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-teal-600 rounded"
                            checked={isSelected}
                            onChange={(e) => handleSelectRfq(row.rfqNo, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600 text-center">{row.rfqNo}</td>
                        <td className="px-4 py-3 text-sm text-stone-700">{row.rfqName}</td>
                        <td className="px-4 py-3 text-sm text-stone-500 text-center">{row.rfqTypeNm}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-center">{row.ctrlUserNm}</td>
                        <td className="px-4 py-3 text-sm text-stone-500 text-center">{row.regDate}</td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(row.progressCd, row.progressNm)}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-stone-600">
                          {totalVendors}개 업체
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-stone-50/50">
                          <td colSpan={9} className="px-12 py-4">
                            <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-inner">
                              <table className="w-full">
                                <thead className="bg-stone-100/50">
                                  <tr>
                                    <th className="w-12 px-4 py-2"></th>
                                    <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-left w-1/4">협력사명</th>
                                    <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">코드</th>
                                    <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">상태</th>
                                    <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-right">총 견적금액</th>
                                    <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">제출일</th>
                                    <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">선정여부</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                  {row.vendors.map(vendor => {
                                    const isVendorSelected = selectedVendor?.rfqNo === row.rfqNo && selectedVendor?.vendorCd === vendor.vendorCd;
                                    return (
                                      <tr
                                        key={vendor.vendorCd}
                                        className={`hover:bg-stone-50/50 cursor-pointer ${isVendorSelected ? 'bg-teal-50' : ''}`}
                                        onClick={() => setSelectedVendor({ rfqNo: row.rfqNo, vendorCd: vendor.vendorCd, vendorNm: vendor.vendorNm })}
                                      >
                                        <td className="px-4 py-2 text-center">
                                          <input
                                            type="radio"
                                            name={`vendor-${row.rfqNo}`}
                                            className="w-4 h-4 text-teal-600"
                                            checked={isVendorSelected}
                                            onChange={() => setSelectedVendor({ rfqNo: row.rfqNo, vendorCd: vendor.vendorCd, vendorNm: vendor.vendorNm })}
                                            onClick={e => e.stopPropagation()}
                                          />
                                        </td>
                                        <td className="px-4 py-2 text-sm text-stone-700 font-medium">{vendor.vendorNm}</td>
                                        <td className="px-4 py-2 text-sm text-stone-500 text-center">{vendor.vendorCd}</td>
                                        <td className="px-4 py-2 text-center text-xs">
                                          <Badge variant={vendor.vnProgressCd === 'RFQC' ? 'blue' : 'gray'}>
                                            {vendor.vnProgressNm}
                                          </Badge>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-stone-700 text-right font-semibold">
                                          {row.progressCd === 'M' ? (
                                            <span className="text-stone-400 font-bold tracking-widest text-xs">****</span>
                                          ) : (
                                            vendor.totalAmt !== null && vendor.totalAmt !== undefined ? `₩${formatNumber(vendor.totalAmt)}` : '-'
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-stone-600 text-center font-medium">
                                          {vendor.submitDate}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                          {vendor.selectYn === 'Y' ? (
                                            <Badge variant="green">선정됨</Badge>
                                          ) : '-'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {row.vendors.length === 0 && (
                                    <tr>
                                      <td colSpan={7} className="py-4 text-center text-xs text-stone-400">데이터가 없습니다.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 견적비교 모달 (생략 또는 기존 유지) */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="견적 비교"
        size="xl"
      >
        <div className="p-8 text-center text-stone-500">
          견적 비교 기능은 선정 대상 RFQ를 선택 후 상세 비교하는 화면으로 구현 예정입니다.
        </div>
      </Modal>

      {/* 선정 사유 입력 모달 */}
      <Modal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        title="업체 선정 사유 입력"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>선정 대상:</strong> {selectedVendor?.vendorNm} ({selectedVendor?.vendorCd})
            </p>
          </div>
          <Input
            label="선정 사유"
            placeholder="선정 사유를 입력하세요 (예: 최저가 낙찰, 납기 준수 등)"
            value={selectionReason}
            onChange={(e) => setSelectionReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsReasonModalOpen(false)}>취소</Button>
            <Button variant="success" onClick={confirmSelection} disabled={!selectionReason || loading}>
              최종 선정 확정
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
