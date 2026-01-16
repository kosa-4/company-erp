'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { rfqApi, PrGroup, RfqWaitingSearchRequest } from '@/lib/api/rfq';
import { getErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

export default function RfqPendingPage() {
  const router = useRouter();
  const [data, setData] = useState<PrGroup[]>([]);
  const [selectedRows, setSelectedRows] = useState<PrGroup[]>([]);
  const [searchParams, setSearchParams] = useState<RfqWaitingSearchRequest>({
    prNum: '',
    prSubject: '',
    fromDate: '',
    toDate: '',
    reqUserNm: '',
  });
  const [loading, setLoading] = useState(false);

  // 초기 로딩
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await rfqApi.getWaitingList(searchParams);
      setData(result);
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

  const handleCreateRfq = async () => {
    if (selectedRows.length === 0) {
      toast.warning('견적을 작성할 구매요청을 선택해주세요.');
      return;
    }
    if (selectedRows.length > 1) {
      toast.warning('한 번에 하나의 구매요청에 대해서만 견적 작성이 가능합니다.');
      return;
    }

    const targetPr = selectedRows[0];

    // 확인 컨펌
    if (!confirm(`[PR 번호 : ${targetPr.prNum}] 건으로 견적 작성을 시작 하시겠습니까?`)) {
      return;
    }

    try {
      const response = await rfqApi.createFromPr(targetPr.prNum);
      toast.success(response.message);
      // 생성 후 상세 페이지로 이동 (가정: /rfq/progress/{rfqNum})
      router.push(`/rfq/progress/${response.rfqNum}`);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const columns: ColumnDef<PrGroup>[] = [
    {
      key: 'progressNm',
      header: '상태',
      width: 80,
      align: 'center',
      render: (val) => <Badge variant="blue">{String(val)}</Badge>
    },
    { key: 'prNum', header: 'PR번호', width: 130, align: 'center' },
    { key: 'prSubject', header: '구매요청명', align: 'left' },
    { key: 'pcTypeNm', header: '구매유형', width: 90, align: 'center' },
    { key: 'reqDeptNm', header: '요청부서', width: 100, align: 'center' },
    { key: 'requester', header: '요청자', width: 90, align: 'center' },
    { key: 'prDate', header: '요청일자', width: 100, align: 'center' },
    {
      key: 'itemCount',
      header: '품목수',
      width: 80,
      align: 'right',
      render: (val) => formatNumber(Number(val ?? 0))
    },
    {
      key: 'totalAmount',
      header: '총금액',
      width: 120,
      align: 'right',
      render: (val) => `₩${formatNumber(Number(val ?? 0))}`
    }
  ];

  return (
    <div>
      <PageHeader
        title="견적대기목록"
        subtitle="승인된 구매요청(PR)을 조회하여 견적요청(RFQ)을 작성합니다."
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="PR번호"
          placeholder="PR번호"
          value={searchParams.prNum}
          onChange={(e) => setSearchParams(prev => ({ ...prev, prNum: e.target.value }))}
        />
        <Input
          label="구매요청명"
          placeholder="구매요청명"
          value={searchParams.prSubject}
          onChange={(e) => setSearchParams(prev => ({ ...prev, prSubject: e.target.value }))}
        />
        <Input
          label="요청자"
          placeholder="요청자명"
          value={searchParams.reqUserNm}
          onChange={(e) => setSearchParams(prev => ({ ...prev, reqUserNm: e.target.value }))}
        />
        <DatePicker
          label="요청일(From)"
          value={searchParams.fromDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, fromDate: e.target.value }))}
        />
        <DatePicker
          label="요청일(To)"
          value={searchParams.toDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, toDate: e.target.value }))}
        />
      </SearchPanel>

      <Card
        title="PR 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={handleCreateRfq}>
            견적작성
          </Button>
        }
      >
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
      </Card>
    </div>
  );
}
