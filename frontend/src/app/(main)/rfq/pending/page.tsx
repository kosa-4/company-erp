'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PageHeader,
  Card,
  Button,
  Input,
  DatePicker,
  DataGrid,
  Badge,
  SearchPanel,
} from '@/components/ui';
import { ColumnDef } from '@/types';
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
  const [selectedRows, setSelectedRows] = useState<PrGroup[]>([]);
  const [selectedPrNum, setSelectedPrNum] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PR 상세 모달 상태
  const [prDetailModalOpen, setPrDetailModalOpen] = useState(false);
  const [selectedPrData, setSelectedPrData] = useState<PrGroup | null>(null);

  // 초기 로딩
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await rfqApi.getWaitingList(searchParams);
      setData(result);
      setSelectedRows([]); // 검색 시 선택 초기화
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      prNum: '',
      prSubject: '',
      reqDate: '',
      reqUserNm: '',
    });
  };

  const handleCreateRfq = () => {
    if (selectedRows.length === 0) {
      return toast.warning('작성할 구매요청을 선택해주세요.');
    }
    if (selectedRows.length > 1) {
      return toast.warning('한 번에 하나의 견적만 작성이 가능합니다.');
    }
    setSelectedPrNum(selectedRows[0].prNum);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<PrGroup>[] = [
    {
      key: 'prNum',
      header: 'PR번호',
      width: 140,
      align: 'center',
      render: (val, row) => (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPrData(row);
            setPrDetailModalOpen(true);
          }}
        >
          {String(val)}
        </span>
      )
    },
    { key: 'prSubject', header: '구매요청명', width: 300, align: 'left' },
    { key: 'prDate', header: '요청일자', width: 120, align: 'center' },
    { key: 'reqDeptNm', header: '요청부서', width: 120, align: 'center' },
    { key: 'requester', header: '요청자', width: 100, align: 'center' },
    {
      key: 'pcTypeNm',
      header: '구매유형',
      width: 100,
      align: 'center',
      render: (val) => <Badge variant="blue">{String(val)}</Badge>
    },
    {
      key: 'itemCount',
      header: '품목수',
      width: 80,
      align: 'right',
      render: (val) => `${val}건`
    },
    {
      key: 'totalAmount',
      header: '총금액',
      width: 140,
      align: 'right',
      render: (val) => `₩${formatNumber(Number(val))}`
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="견적 대기 목록"
        subtitle="견적 작성이 필요한 구매요청 목록입니다."
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PR번호"
          value={searchParams.prNum}
          onChange={(e) => setSearchParams({ ...searchParams, prNum: e.target.value })}
        />
        <Input
          label="구매요청명"
          value={searchParams.prSubject}
          onChange={(e) => setSearchParams({ ...searchParams, prSubject: e.target.value })}
        />
        <DatePicker
          label="요청일자"
          value={searchParams.reqDate}
          onChange={(e) => setSearchParams({ ...searchParams, reqDate: e.target.value })}
        />
        <Input
          label="요청자"
          value={searchParams.reqUserNm}
          onChange={(e) => setSearchParams({ ...searchParams, reqUserNm: e.target.value })}
        />
      </SearchPanel>

      <Card
        title="작성 대상 목록"
        padding={false}
        actions={
          <Button
            variant="primary"
            onClick={handleCreateRfq}
            disabled={selectedRows.length !== 1}
          >
            견적 작성
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <DataGrid
            columns={columns}
            data={data}
            keyField="prNum"
            loading={loading}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            emptyMessage="견적 대기 중인 구매요청이 없습니다."
            expandable
            expandedRowRender={(row) => (
              <div className="bg-stone-50 p-4 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-500 border-b border-stone-200">
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
                  <tbody>
                    {row.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-stone-100 last:border-0 hover:bg-stone-100/50">
                        <td className="py-2 px-3">{item.itemCd}</td>
                        <td className="py-2 px-3">{item.itemDesc}</td>
                        <td className="py-2 px-3">{item.itemSpec || '-'}</td>
                        <td className="py-2 px-3 text-center">{item.unitCd}</td>
                        <td className="py-2 px-3 text-right text-blue-600 font-medium">{formatNumber(item.prQt)}</td>
                        <td className="py-2 px-3 text-right">₩{formatNumber(item.unitPrc)}</td>
                        <td className="py-2 px-3 text-right">₩{formatNumber(item.prAmt)}</td>
                        <td className="py-2 px-3 text-center">{item.delyDate}</td>
                        <td className="py-2 px-3 text-center text-stone-400">본사 창고</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          />
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
