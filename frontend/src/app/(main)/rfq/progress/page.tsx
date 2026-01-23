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
import { rfqApi, RfqProgressGroup, RfqProgressSearchRequest } from '@/lib/api/rfq';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error';
import RfqRequestModal from '../pending/RfqRequestModal';
import { formatDate, formatNumber } from '@/lib/utils';

export default function RfqProgressPage() {
  const [data, setData] = useState<RfqProgressGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedRfqNums, setSelectedRfqNums] = useState<string[]>([]);

  // 작성/수정 모달 상태 (기존 유지)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRfqNum, setTargetRfqNum] = useState<string | null>(null);

  // ✅ RFQ 상세 모달 상태 (입고 화면 방식 그대로)
  const [isRfqDetailOpen, setIsRfqDetailOpen] = useState(false);
  const [selectedRfqDetail, setSelectedRfqDetail] = useState<any>(null);

  const [searchParams, setSearchParams] = useState<RfqProgressSearchRequest>({
    rfqNum: '',
    rfqSubject: '',
    regDate: '',
    rfqType: '',
    progressCd: '',
    ctrlUserNm: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await rfqApi.getProgressList(searchParams);
      setData(result || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => fetchData();

  const handleReset = () => {
    setSearchParams({
      rfqNum: '',
      rfqSubject: '',
      regDate: '',
      rfqType: '',
      progressCd: '',
      ctrlUserNm: '',
    });
  };

  const toggleRow = (rfqNum: string) => {
    setExpandedRows(prev =>
        prev.includes(rfqNum) ? prev.filter(id => id !== rfqNum) : [...prev, rfqNum]
    );
  };

  const handleSelectRfq = (rfqNum: string, checked: boolean) => {
    setSelectedRfqNums(prev =>
        checked ? [...prev, rfqNum] : prev.filter(num => num !== rfqNum)
    );
  };

  const getStatusBadge = (status: string, label: string) => {
    const config: Record<string, { variant: 'gray' | 'yellow' | 'green' | 'blue' | 'red' }> = {
      T: { variant: 'gray' },
      RFQS: { variant: 'yellow' },
      RFQC: { variant: 'blue' },
      M: { variant: 'red' },
      G: { variant: 'green' },
      J: { variant: 'green' },
    };
    const { variant } = config[status] || { variant: 'gray' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // ✅ RFQ 상세 조회 (입고 화면 방식 그대로: ApiResponse.data)
  const handleViewRfqDetail = async (rfqNum: string, e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ row 토글 방지
    if (!rfqNum) return;

    try {
      const response = await fetch(`/api/v1/buyer/rfqs/${rfqNum}`);
      if (!response.ok) throw new Error('RFQ 상세 조회 실패');

      const apiResponse = await response.json();
      const detail = apiResponse?.data; // ✅ ApiResponse에서 data 추출

      setSelectedRfqDetail(detail);
      setIsRfqDetailOpen(true);
    } catch (error) {
      toast.error('RFQ 상세 조회 중 오류가 발생했습니다: ' + getErrorMessage(error));
    }
  };

  const handleSend = async () => {
    if (selectedRfqNums.length === 0) return toast.warning('전송할 문서를 선택해주세요.');

    const targetItems = data.filter(d => selectedRfqNums.includes(d.rfqNum));
    const invalidItems = targetItems.filter(d => d.progressCd !== 'T');

    if (invalidItems.length > 0) {
      return toast.warning('임시저장(T) 상태인 건만 전송이 가능합니다.');
    }

    toast(`${selectedRfqNums.length}건을 협력사에 전송하시겠습니까?`, {
      action: {
        label: '전송',
        onClick: async () => {
          try {
            setLoading(true);
            for (const rfqNum of selectedRfqNums) {
              const item = targetItems.find(i => i.rfqNum === rfqNum);
              const vendorCodes = item?.vendors.map(v => v.vendorCd) || [];
              await rfqApi.sendRfq(rfqNum, vendorCodes);
            }
            toast.success('전송되었습니다.');
            setSelectedRfqNums([]);
            await fetchData();
          } catch (error) {
            toast.error(getErrorMessage(error));
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  const handleClose = async () => {
    if (selectedRfqNums.length === 0) {
      return toast.warning('마감할 견적을 선택해주세요.');
    }

    const targetItems = data.filter(d => selectedRfqNums.includes(d.rfqNum));
    const invalidItems = targetItems.filter(d => !['RFQS', 'RFQC'].includes(d.progressCd));

    if (invalidItems.length > 0) {
      const invalidStatus = invalidItems.map(i => `${i.rfqNum}(${i.progressNm})`).join(', ');
      return toast.warning(
          `다음 견적은 마감할 수 없습니다: ${invalidStatus}\n요청중(RFQS) 또는 제출완료(RFQC) 상태만 마감 가능합니다.`
      );
    }

    toast(`${selectedRfqNums.length}건을 마감하시겠습니까?`, {
      action: {
        label: '마감',
        onClick: async () => {
          try {
            setLoading(true);
            for (const rfqNum of selectedRfqNums) {
              await rfqApi.closeRfq(rfqNum);
            }
            toast.success('마감 처리되었습니다.');
            setSelectedRfqNums([]);
            await fetchData();
          } catch (error) {
            toast.error(getErrorMessage(error));
          } finally {
            setLoading(false);
          }
        }
      }
    });
  };

  // 기존 수정 기능 유지 (임시저장만 수정 가능)
  const handleEdit = () => {
    if (selectedRfqNums.length === 0) {
      return toast.warning('수정할 문서를 선택해주세요.');
    }
    if (selectedRfqNums.length !== 1) return toast.warning('수정할 문서를 하나만 선택해주세요.');
    const item = data.find(d => d.rfqNum === selectedRfqNums[0]);
    if (item?.progressCd !== 'T') return toast.warning('임시저장 상태에서만 수정이 가능합니다.');

    setTargetRfqNum(item.rfqNum);
    setIsModalOpen(true);
  };

  return (
      <div className="space-y-6">
        <PageHeader
            title="견적진행현황"
            subtitle="견적 요청 진행 상황을 조회하고 전송/마감 처리합니다."
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
        />

        <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
          <Input
              label="RFQ번호"
              placeholder="RFQ번호 입력"
              value={searchParams.rfqNum}
              onChange={(e) => setSearchParams(prev => ({ ...prev, rfqNum: e.target.value }))}
          />
          <DatePicker
              label="등록일자"
              value={searchParams.regDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, regDate: e.target.value }))}
          />
          <Input
              label="견적명"
              placeholder="견적명 입력"
              value={searchParams.rfqSubject}
              onChange={(e) => setSearchParams(prev => ({ ...prev, rfqSubject: e.target.value }))}
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
              value={searchParams.progressCd}
              onChange={(e) => setSearchParams(prev => ({ ...prev, progressCd: e.target.value }))}
              options={[
                { value: '', label: '전체' },
                { value: 'T', label: '임시저장' },
                { value: 'RFQS', label: '요청중' },
                { value: 'RFQC', label: '제출완료' },
                { value: 'M', label: '마감' },
                { value: 'G', label: '개찰' },
                { value: 'J', label: '선정' },
              ]}
          />
          <Input
              label="구매담당자"
              placeholder="담당자명 입력"
              value={searchParams.ctrlUserNm}
              onChange={(e) => setSearchParams(prev => ({ ...prev, ctrlUserNm: e.target.value }))}
          />
        </SearchPanel>

        <Card
            title="견적진행 목록"
            padding={false}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEdit}>수정</Button>
                <Button variant="primary" onClick={handleSend} loading={loading}>전송</Button>
                <Button variant="warning" onClick={handleClose} loading={loading}>마감</Button>
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
                      onChange={(e) => setSelectedRfqNums(e.target.checked ? data.map(d => d.rfqNum) : [])}
                  />
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">RFQ번호</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-left">견적명</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">견적유형</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">구매담당자</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">등록일</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">상태</th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">제출현황</th>
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
                    const isExpanded = expandedRows.includes(row.rfqNum);
                    const isSelected = selectedRfqNums.includes(row.rfqNum);
                    const submittedCount = row.vendors.filter(v => v.progressCd === 'RFQC').length;
                    const totalVendors = row.vendors.length;

                    return (
                        <React.Fragment key={row.rfqNum}>
                          <tr
                              className={`hover:bg-teal-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-teal-50/50' : ''}`}
                              onClick={() => toggleRow(row.rfqNum)}
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
                                  onChange={(e) => handleSelectRfq(row.rfqNum, e.target.checked)}
                              />
                            </td>

                            {/* ✅ RFQ번호 클릭 시 상세 모달 */}
                            <td className="px-4 py-3 text-sm font-medium text-center">
                          <span
                              className="text-blue-600 hover:underline cursor-pointer"
                              onClick={(e) => handleViewRfqDetail(row.rfqNum, e)}
                              title="RFQ 상세 보기"
                          >
                            {row.rfqNum}
                          </span>
                            </td>

                            <td className="px-4 py-3 text-sm text-stone-700">{row.rfqSubject}</td>
                            <td className="px-4 py-3 text-sm text-stone-500 text-center">{row.rfqTypeNm}</td>
                            <td className="px-4 py-3 text-sm text-stone-600 text-center">{row.ctrlUserNm}</td>
                            <td className="px-4 py-3 text-sm text-stone-500 text-center">{formatDate(row.regDate)}</td>
                            <td className="px-4 py-3 text-center">{getStatusBadge(row.progressCd, row.progressNm)}</td>
                            <td className="px-4 py-3 text-center text-sm font-semibold">
                          <span className={submittedCount === totalVendors && totalVendors > 0 ? 'text-teal-600' : 'text-stone-600'}>
                            {submittedCount} / {totalVendors}
                          </span>
                            </td>
                          </tr>

                          {isExpanded && (
                              <tr className="bg-stone-50/50">
                                <td colSpan={9} className="px-12 py-4">
                                  <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-inner">
                                    <table className="w-full">
                                      <thead className="bg-stone-100/50">
                                      <tr>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center w-1/4">협력사명</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">코드</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">상태</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">전송일</th>
                                        <th className="px-4 py-2 text-xs font-semibold text-stone-500 text-center">제출일</th>
                                      </tr>
                                      </thead>
                                      <tbody className="divide-y divide-stone-100">
                                      {row.vendors.map(vendor => (
                                          <tr key={vendor.vendorCd} className="hover:bg-stone-50/50">
                                            <td className="px-4 py-2 text-sm text-stone-500 text-center font-medium">{vendor.vendorNm}</td>
                                            <td className="px-4 py-2 text-sm text-stone-500 text-center">{vendor.vendorCd}</td>
                                            <td className="px-4 py-2 text-center text-xs">
                                              <Badge variant={vendor.progressCd === 'RFQC' ? 'blue' : vendor.progressCd === 'F' ? 'red' : 'gray'}>
                                                {vendor.progressNm}
                                              </Badge>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-stone-400 text-center">
                                              {vendor.sendDate ? formatDate(vendor.sendDate) : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-stone-600 text-center font-medium">
                                              {vendor.submitDate ? formatDate(vendor.submitDate) : '-'}
                                            </td>
                                          </tr>
                                      ))}
                                      {row.vendors.length === 0 && (
                                          <tr>
                                            <td colSpan={5} className="py-4 text-center text-xs text-stone-400">등록된 협력사가 없습니다.</td>
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

        {/* 기존: 작성/수정 모달 */}
        <RfqRequestModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setTargetRfqNum(null);
            }}
            rfqNum={targetRfqNum}
            onSaveSuccess={() => {
              fetchData();
              setSelectedRfqNums([]);
            }}
        />

        {/* ✅ 추가: RFQ 상세 모달 (입고 화면 스타일 그대로) */}
        <Modal
            isOpen={isRfqDetailOpen}
            onClose={() => setIsRfqDetailOpen(false)}
            title="RFQ 상세"
            size="lg"
            footer={
              <Button variant="secondary" onClick={() => setIsRfqDetailOpen(false)}>
                닫기
              </Button>
            }
        >
          {selectedRfqDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">RFQ번호</label>
                    <p className="font-medium">{selectedRfqDetail?.header?.rfqNum || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">견적명</label>
                    <p className="font-medium">{selectedRfqDetail?.header?.rfqSubject || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">요청일자</label>
                    <p className="font-medium">
                      {(selectedRfqDetail?.header?.rfqDate || '')?.split('T')[0] || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">담당자</label>
                    <p className="font-medium">{selectedRfqDetail?.header?.ctrlUserNm || '-'}</p>
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
                    {(selectedRfqDetail?.items || []).map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.itemCd || '-'}</td>
                          <td className="p-3">{item.itemDesc || '-'}</td>
                          <td className="p-3 text-right">{formatNumber(Number(item.rfqQt || 0))}</td>
                          <td className="p-3 text-right">₩{formatNumber(Number(item.estUnitPrc || 0))}</td>
                          <td className="p-3 text-right font-medium">₩{formatNumber(Number(item.estAmt || 0))}</td>
                        </tr>
                    ))}

                    {(!selectedRfqDetail?.items || selectedRfqDetail.items.length === 0) && (
                        <tr className="border-t">
                          <td colSpan={5} className="p-4 text-center text-xs text-gray-400">
                            품목 정보가 없습니다.
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="text-right">
                    <span className="text-gray-500 mr-4">총 금액:</span>
                    <span className="text-xl font-bold text-blue-600">
                  ₩{formatNumber(
                        Number(
                            selectedRfqDetail?.items?.reduce(
                                (sum: number, it: any) => sum + Number(it.estAmt || 0),
                                0
                            ) || 0
                        )
                    )}
                </span>
                  </div>
                </div>
              </div>
          ) : (
              <div className="py-10 text-center text-stone-500">상세 데이터가 없습니다.</div>
          )}
        </Modal>
      </div>
  );
}
