'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PageHeader,
  Card,
  Button,
  Input,
  DatePicker,
  Badge,
  SearchPanel,
} from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { rfqApi, PrGroup, RfqWaitingSearchRequest } from '@/lib/api/rfq';
import { getErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';
import RfqRequestModal from './RfqRequestModal';
import PrDetailModal from './PrDetailModal';

export default function RfqPendingPage() {
  const [searchParams, setSearchParams] = useState<RfqWaitingSearchRequest>({
    prNum: '',
    prSubject: '',
    reqDate: '',
    reqUserNm: '',
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PrGroup[]>([]);

  // 라디오 선택 (PR 단위로 1건만)
  const [selectedPrNum, setSelectedPrNum] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // PR 상세 모달 상태
  const [prDetailModalOpen, setPrDetailModalOpen] = useState(false);
  const [selectedPrData, setSelectedPrData] = useState<PrGroup | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await rfqApi.getWaitingList(searchParams);
      setData(result || []);
      setSelectedPrNum(null);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev })); // 새 객체로 바꿔서 useEffect 트리거
  };

  const handleReset = () => {
    setSearchParams({
      prNum: '',
      prSubject: '',
      reqDate: '',
      reqUserNm: '',
    });
    setSelectedPrNum(null);
  };

  const handleCreateRfq = () => {
    if (!selectedPrNum) {
      return toast.warning('작성할 구매요청을 선택해주세요.');
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="견적 대기 목록"
        subtitle="견적 작성이 필요한 구매요청 목록입니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PR번호"
          placeholder="PR번호 입력"
          value={searchParams.prNum}
          onChange={(e) =>
            setSearchParams(prev => ({ ...prev, prNum: e.target.value }))
          }
        />
        <Input
          label="구매요청명"
          placeholder="구매요청명 입력"
          value={searchParams.prSubject}
          onChange={(e) =>
            setSearchParams(prev => ({ ...prev, prSubject: e.target.value }))
          }
        />
        <DatePicker
          label="요청일자"
          value={searchParams.reqDate}
          onChange={(e) =>
            setSearchParams(prev => ({ ...prev, reqDate: e.target.value }))
          }
        />
        <Input
          label="요청자"
          placeholder="요청자명 입력"
          value={searchParams.reqUserNm}
          onChange={(e) =>
            setSearchParams(prev => ({ ...prev, reqUserNm: e.target.value }))
          }
        />
      </SearchPanel>

      <Card
        title="작성 대상 목록"
        padding={false}
        actions={
          <Button
            variant="primary"
            onClick={handleCreateRfq}
            disabled={!selectedPrNum}
          >
            견적 작성
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="w-14 px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center" />
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  PR번호
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-left">
                  구매요청명
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  요청일자
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  요청부서
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  요청자
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-center">
                  구매유형
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-right">
                  품목수
                </th>
                <th className="px-4 py-3.5 text-xs font-medium text-stone-500 uppercase text-right">
                  총금액
                </th>
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
                  <td colSpan={9} className="py-16 text-center text-stone-500">
                    견적 대기 중인 구매요청이 없습니다.
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const isSelected = selectedPrNum === row.prNum;

                  return (
                    <React.Fragment key={row.prNum}>
                      <tr
                        className={`hover:bg-teal-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-teal-50/50' : ''
                          }`}
                        onClick={() => setSelectedPrNum(row.prNum)}
                      >
                        <td
                          className="px-4 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="radio"
                            name="pr-select"
                            className="w-4 h-4 text-teal-600"
                            checked={isSelected}
                            onChange={() => setSelectedPrNum(row.prNum)}
                          />
                        </td>

                        <td className="px-4 py-3 text-sm font-medium text-blue-600 text-center">
                          <span
                            className="hover:text-blue-800 hover:underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPrData(row);
                              setPrDetailModalOpen(true);
                            }}
                          >
                            {row.prNum}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-stone-700">
                          {row.prSubject}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-500 text-center">
                          {row.prDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-center">
                          {row.reqDeptNm}
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600 text-center">
                          {row.requester}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <Badge variant="blue">
                            {String((row as any).pcTypeNm ?? '')}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-sm text-stone-700 text-right">
                          {(row as any).itemCount ?? 0}건
                        </td>

                        <td className="px-4 py-3 text-sm text-stone-700 text-right font-semibold">
                          ₩{formatNumber(Number((row as any).totalAmount ?? 0))}
                        </td>
                      </tr>

                      {isSelected && (
                        <tr className="bg-stone-50/50">
                          <td colSpan={9} className="px-8 py-4">
                            <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-inner">
                              <table className="w-full text-xs">
                                <thead className="bg-stone-100/50">
                                  <tr className="text-stone-500 border-b border-stone-200">
                                    <th className="py-2 px-3 text-left">품목코드</th>
                                    <th className="py-2 px-3 text-left">품목명</th>
                                    <th className="py-2 px-3 text-left">규격</th>
                                    <th className="py-2 px-3 text-center">단위</th>
                                    <th className="py-2 px-3 text-right">수량</th>
                                    <th className="py-2 px-3 text-right">단가</th>
                                    <th className="py-2 px-3 text-right">금액</th>
                                    <th className="py-2 px-3 text-center">납기희망일</th>
                                    <th className="py-2 px-3 text-center">저장위치</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                  {row.items?.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-stone-50/50">
                                      <td className="py-2 px-3">{item.itemCd}</td>
                                      <td className="py-2 px-3">{item.itemDesc}</td>
                                      <td className="py-2 px-3">{item.itemSpec || '-'}</td>
                                      <td className="py-2 px-3 text-center">{item.unitCd}</td>
                                      <td className="py-2 px-3 text-right text-blue-600 font-medium">
                                        {formatNumber(item.prQt)}
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        ₩{formatNumber(item.unitPrc)}
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        ₩{formatNumber(item.prAmt)}
                                      </td>
                                      <td className="py-2 px-3 text-center">{item.delyDate}</td>
                                      <td className="py-2 px-3 text-center text-stone-400">
                                        본사 창고
                                      </td>
                                    </tr>
                                  ))}

                                  {(!row.items || row.items.length === 0) && (
                                    <tr>
                                      <td
                                        colSpan={9}
                                        className="py-6 text-center text-xs text-stone-400"
                                      >
                                        품목 정보가 없습니다.
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

      {/* PR 상세 모달 */}
      <PrDetailModal
        isOpen={prDetailModalOpen}
        onClose={() => setPrDetailModalOpen(false)}
        data={selectedPrData}
      />

      {/* 견적 작성 모달 */}
      <RfqRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPrNum(null);
        }}
        prNum={selectedPrNum}
        onSaveSuccess={handleSearch}
      />
    </div>
  );
}
