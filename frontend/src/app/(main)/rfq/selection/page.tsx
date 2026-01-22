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
  Modal,
} from '@/components/ui';
import { rfqApi } from '@/lib/api/rfq';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import RfqCompareModal from './RfqCompareModal';

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
  selectDate: string;
  progressCd: string;
  progressNm: string;
  vendors: RfqSelectionVendor[];
}

export default function RfqSelectionPage() {
  const [data, setData] = useState<RfqSelectionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const [selectedRfqNo, setSelectedRfqNo] = useState<string | null>(null);

  const [compareRfqNo, setCompareRfqNo] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState<{
    rfqNo: string;
    vendorCd: string;
    vendorNm: string;
  } | null>(null);

  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    startDate: '',
    endDate: '',
    rfqType: '',
    status: '',
    buyer: '',
    regDate: '',
    selectDate: '',
  });

  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectionReason, setSelectionReason] = useState('');

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rfqApi.getSelectionList({
        rfqNum: searchParams.rfqNo,
        rfqSubject: searchParams.rfqName,
        regDate: searchParams.regDate,
        selectDate: searchParams.selectDate,
        rfqType: searchParams.rfqType,
        progressCd: searchParams.status,
        ctrlUserNm: searchParams.buyer,
      });

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
            selectDate: curr.selectDate?.substring(0, 10) || '-',
            progressCd: curr.progressCd,
            progressNm: curr.progressNm,
            vendors: [vendor],
          });
        }

        return acc;
      }, [] as RfqSelectionGroup[]);

      grouped.forEach(g => {
        g.vendors.sort((a, b) => {
          if (a.selectYn === b.selectYn) return 0;
          return a.selectYn === 'Y' ? -1 : 1;
        });
      });

      setData(grouped);

      setExpandedRows(
          grouped
              .filter(g => g.progressCd === 'M' || g.progressCd === 'G')
              .map(g => g.rfqNo)
      );

      setSelectedRfqNo(null);
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
      regDate: '',
      selectDate: '',
    });
  };

  const toggleRow = (rfqNo: string) => {
    setExpandedRows(prev =>
        prev.includes(rfqNo) ? prev.filter(id => id !== rfqNo) : [...prev, rfqNo]
    );
  };

  const handleSelectRfq = (rfqNo: string) => {
    setSelectedRfqNo(rfqNo);
    setSelectedVendor(null);
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

  // 개찰
  const handleOpen = async () => {
    if (!selectedRfqNo) {
      toast.error('개찰할 항목을 선택해주세요.');
      return;
    }

    const target = data.find(d => d.rfqNo === selectedRfqNo);
    if (!target) return;

    if (target.progressCd !== 'M') {
      toast.error('마감(M) 상태의 항목만 개찰할 수 있습니다.');
      return;
    }

    toast('1건을 개찰하시겠습니까? 개찰 후에는 금액이 공개됩니다.', {
      action: {
        label: '개찰',
        onClick: async () => {
          try {
            setLoading(true);
            await rfqApi.openRfq(selectedRfqNo);
            toast.success('개찰 처리가 완료되었습니다.');
            await handleSearch();
            setSelectedRfqNo(null);
            setSelectedVendor(null);
          } catch (error) {
            toast.error('개찰 처리 중 오류가 발생했습니다.');
          } finally {
            setLoading(false);
          }
        },
      },
    });
  };

  // 선정
  const handleSelect = () => {
    if (!selectedVendor) {
      toast.error('선정할 협력사를 선택해주세요.');
      return;
    }

    const rfq = data.find(d => d.rfqNo === selectedVendor.rfqNo);

    const alreadySelected = rfq?.vendors.some(v => v.selectYn === 'Y');
    if (alreadySelected || rfq?.progressCd === 'J') {
      toast.warning('이미 협력업체가 선정되었습니다.');
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
      await rfqApi.selectVendor(
          selectedVendor.rfqNo,
          selectedVendor.vendorCd,
          selectionReason
      );
      toast.success('협력업체 선정이 완료되었습니다.');
      setIsReasonModalOpen(false);
      await handleSearch();
      setSelectedVendor(null);
      setSelectedRfqNo(null);
    } catch (error) {
      toast.error('선정 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 견적비교
  const handleOpenCompare = () => {
    if (!selectedRfqNo) {
      toast.error('견적비교는 문서단위로 1건만 선택해서 진행해주세요.');
      return;
    }

    const rfq = data.find(d => d.rfqNo === selectedRfqNo);
    if (!rfq) return;

    if (rfq.progressCd === 'M') {
      toast.error('개찰(G) 이후에 견적비교가 가능합니다.');
      return;
    }

    setCompareRfqNo(rfq.rfqNo);
    setIsCompareModalOpen(true);
  };

  return (
      <div className="space-y-6">
        <PageHeader
            title="협력업체 선정"
            subtitle="마감된 견적에 대해 협력업체를 선정합니다."
        />

        <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
          <Input
              label="RFQ번호"
              placeholder="RFQ번호 입력"
              value={searchParams.rfqNo}
              onChange={e => setSearchParams(prev => ({ ...prev, rfqNo: e.target.value }))}
          />
          <Input
              label="견적명"
              placeholder="견적명 입력"
              value={searchParams.rfqName}
              onChange={e => setSearchParams(prev => ({ ...prev, rfqName: e.target.value }))}
          />
          <DatePicker
              label="선정일"
              value={searchParams.selectDate}
              onChange={e => setSearchParams(prev => ({ ...prev, selectDate: e.target.value }))}
          />
          <DatePicker
              label="등록일"
              value={searchParams.regDate}
              onChange={e => setSearchParams(prev => ({ ...prev, regDate: e.target.value }))}
          />
          <Select
              label="견적유형"
              value={searchParams.rfqType}
              onChange={e => setSearchParams(prev => ({ ...prev, rfqType: e.target.value }))}
              options={[
                { value: '', label: '전체' },
                { value: 'OC', label: '수의계약' },
                { value: 'AC', label: '지명경쟁' },
              ]}
          />
          <Select
              label="상태"
              value={searchParams.status}
              onChange={e => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
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
              onChange={e => setSearchParams(prev => ({ ...prev, buyer: e.target.value }))}
          />
        </SearchPanel>

        <Card
            title="협력업체 선정 목록 (RFQ 단위)"
            padding={false}
            actions={
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleOpen} loading={loading}>
                  개찰
                </Button>
                <Button variant="secondary" onClick={handleOpenCompare}>
                  견적비교
                </Button>
                <Button variant="success" onClick={handleSelect} loading={loading}>
                  선정
                </Button>
              </div>
            }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="w-12 px-4 py-3.5">
                  <div className="w-4" />
                </th>
                <th className="w-10 px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  선택
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  RFQ번호
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-left">
                  견적명
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  견적유형
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  구매담당자
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  등록일
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  선정일
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  상태
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  참여업체
                </th>
              </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
              {loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
                        <span className="text-stone-500">데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
              ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-stone-500">
                      조회된 데이터가 없습니다.
                    </td>
                  </tr>
              ) : (
                  data.map(row => {
                    const isExpanded = expandedRows.includes(row.rfqNo);
                    const isSelected = selectedRfqNo === row.rfqNo;
                    const totalVendors = row.vendors.length;

                    return (
                        <React.Fragment key={row.rfqNo}>
                          <tr
                              className={`hover:bg-teal-50/30 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-teal-50/50' : ''
                              }`}
                              onClick={() => {
                                handleSelectRfq(row.rfqNo);
                                toggleRow(row.rfqNo);
                              }}
                          >
                            <td className="px-4 py-3 text-center">
                              <svg
                                  className={`w-4 h-4 text-stone-400 transition-transform ${
                                      isExpanded ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                              >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </td>

                            <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                  type="radio"
                                  name="rfq-select"
                                  className="w-4 h-4 text-teal-600"
                                  checked={isSelected}
                                  onChange={() => handleSelectRfq(row.rfqNo)}
                              />
                            </td>

                            <td className="px-4 py-3 text-sm font-medium text-blue-600 text-center">
                              {row.rfqNo}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-700">{row.rfqName}</td>
                            <td className="px-4 py-3 text-sm text-stone-500 text-center">
                              {row.rfqTypeNm}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600 text-center">
                              {row.ctrlUserNm}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-500 text-center">
                              {row.regDate}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-500 text-center">
                              {row.selectDate}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(row.progressCd, row.progressNm)}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-stone-600">
                              {totalVendors}개 업체
                            </td>
                          </tr>

                          {isExpanded && (
                              <tr className="bg-stone-50/50">
                                <td colSpan={10} className="px-12 py-4">
                                  <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-inner">
                                    <table className="w-full">
                                      <thead className="bg-stone-100/50">
                                      <tr>
                                        <th className="w-12 px-4 py-2"></th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">
                                          코드
                                        </th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center w-1/4">
                                          협력사명
                                        </th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">
                                          상태
                                        </th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-right">
                                          총 견적금액
                                        </th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">
                                          제출일
                                        </th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">
                                          선정여부
                                        </th>
                                      </tr>
                                      </thead>

                                      <tbody className="divide-y divide-stone-100">
                                      {row.vendors.map(vendor => {
                                        const isVendorSelected =
                                            selectedVendor?.rfqNo === row.rfqNo &&
                                            selectedVendor?.vendorCd === vendor.vendorCd;

                                        return (
                                            <tr
                                                key={vendor.vendorCd}
                                                className={`hover:bg-stone-50/50 cursor-pointer ${
                                                    isVendorSelected ? 'bg-teal-50' : ''
                                                }`}
                                                onClick={() =>
                                                    setSelectedVendor({
                                                      rfqNo: row.rfqNo,
                                                      vendorCd: vendor.vendorCd,
                                                      vendorNm: vendor.vendorNm,
                                                    })
                                                }
                                            >
                                              <td className="px-4 py-2 text-center">
                                                <input
                                                    type="radio"
                                                    name={`vendor-${row.rfqNo}`}
                                                    className="w-4 h-4 text-teal-600"
                                                    checked={isVendorSelected}
                                                    onChange={() =>
                                                        setSelectedVendor({
                                                          rfqNo: row.rfqNo,
                                                          vendorCd: vendor.vendorCd,
                                                          vendorNm: vendor.vendorNm,
                                                        })
                                                    }
                                                    onClick={e => e.stopPropagation()}
                                                />
                                              </td>

                                              <td className="px-4 py-2 text-sm text-stone-500 text-center">
                                                {vendor.vendorCd}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-stone-500 text-center font-medium">
                                                {vendor.vendorNm}
                                              </td>
                                              <td className="px-4 py-2 text-center text-xs">
                                                <Badge variant={vendor.vnProgressCd === 'RFQC' ? 'blue' : 'gray'}>
                                                  {vendor.vnProgressNm}
                                                </Badge>
                                              </td>
                                              <td className="px-4 py-2 text-sm text-stone-700 text-right font-semibold">
                                                {row.progressCd === 'M' ? (
                                                    <span className="text-stone-400 font-bold tracking-widest text-xs">
                                        ****
                                      </span>
                                                ) : vendor.totalAmt !== null && vendor.totalAmt !== undefined ? (
                                                    `₩${formatNumber(vendor.totalAmt)}`
                                                ) : (
                                                    '-'
                                                )}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-stone-600 text-center font-medium">
                                                {vendor.submitDate}
                                              </td>
                                              <td className="px-4 py-2 text-center">
                                                {vendor.selectYn === 'Y' ? <Badge variant="green">선정됨</Badge> : '-'}
                                              </td>
                                            </tr>
                                        );
                                      })}

                                      {row.vendors.length === 0 && (
                                          <tr>
                                            <td colSpan={7} className="py-4 text-center text-xs text-stone-400">
                                              데이터가 없습니다.
                                            </td>
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


        <RfqCompareModal
            isOpen={isCompareModalOpen}
            rfqNo={compareRfqNo}
            onClose={() => {
              setIsCompareModalOpen(false);
              setCompareRfqNo(null);
            }}
        />

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
                placeholder="선정 사유를 입력하세요"
                value={selectionReason}
                onChange={e => setSelectionReason(e.target.value)}
                required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsReasonModalOpen(false)}>
                취소
              </Button>
              <Button
                  variant="success"
                  onClick={confirmSelection}
                  disabled={!selectionReason || loading}
              >
                최종 선정 확정
              </Button>
            </div>
          </div>
        </Modal>
      </div>
  );
}
