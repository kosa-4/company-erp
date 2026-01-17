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

export default function RfqPendingPage() {
  const [searchParams, setSearchParams] = useState<RfqWaitingSearchRequest>({
    prNum: '',
    prSubject: '',
    fromDate: '',
    toDate: '',
    reqUserNm: '',
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PrGroup[]>([]);
  const [selectedRows, setSelectedRows] = useState<PrGroup[]>([]);
  const [selectedPrNum, setSelectedPrNum] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      fromDate: '',
      toDate: '',
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
    { key: 'prNum', header: 'PR번호', width: 140, align: 'center' },
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
          label="요청일(시작)"
          value={searchParams.fromDate}
          onChange={(e) => setSearchParams({ ...searchParams, fromDate: e.target.value })}
        />
        <DatePicker
          label="요청일(종료)"
          value={searchParams.toDate}
          onChange={(e) => setSearchParams({ ...searchParams, toDate: e.target.value })}
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
          />
        </div>
      </Card>

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
