'use client';

import React, { useState, useEffect } from 'react';
import {
  PageHeader,
  Card,
  Input,
  DatePicker,
  DataGrid,
  SearchPanel,
  Badge,
  Modal,
  Button
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { rfqApi, RfqSelectionResultResponse, RfqResultItem } from '@/lib/api/rfq';
import { toast } from 'sonner';

export default function RfqSelectionResultPage() {
  const [data, setData] = useState<RfqSelectionResultResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    rfqNo: '',
    rfqName: '',
    startDate: '',
    endDate: '',
  });

  // 상세 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<{
    header: RfqSelectionResultResponse | null;
    items: RfqResultItem[];
  }>({
    header: null,
    items: [],
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await rfqApi.getSelectionResultList({
        rfqNum: searchParams.rfqNo,
        rfqSubject: searchParams.rfqName,
        fromDate: searchParams.startDate,
        toDate: searchParams.endDate,
      });
      setData(response);
    } catch (error) {
      toast.error('선정 결과 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      rfqNo: '',
      rfqName: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleRowClick = async (row: RfqSelectionResultResponse) => {
    try {
      setLoading(true);
      const response = await rfqApi.getSelectionResultDetail(row.rfqNum);
      setDetailData(response);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error('상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const columns: ColumnDef<RfqSelectionResultResponse>[] = [
    {
      key: 'rfqNum',
      header: '견적번호',
      width: 120,
      align: 'center',
      render: (value, row) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer font-medium"
          onClick={() => handleRowClick(row)}
        >
          {String(value)}
        </span>
      ),
    },
    { key: 'rfqSubject', header: '견적명', width: 250, align: 'left' },
    { key: 'rfqTypeNm', header: '견적유형', width: 100, align: 'center' },
    { key: 'vendorNm', header: '선정 협력사', width: 180, align: 'left' },
    {
      key: 'totalAmt',
      header: '총 견적금액',
      width: 140,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    { key: 'ctrlUserNm', header: '담당자', width: 100, align: 'center' },
    {
      key: 'selectDate',
      header: '선정일',
      width: 120,
      align: 'center',
      render: (value) => value ? String(value).substring(0, 10) : '-'
    },
    {
      key: 'regDate',
      header: '등록일',
      width: 120,
      align: 'center',
      render: (value) => value ? String(value).substring(0, 10) : '-'
    },
  ];

  const detailColumns: ColumnDef<RfqResultItem>[] = [
    { key: 'itemCd', header: '품목코드', width: 120, align: 'center' },
    { key: 'itemNm', header: '품목명', width: 200, align: 'left' },
    { key: 'spec', header: '규격', width: 150, align: 'left' },
    { key: 'unit', header: '단위', width: 80, align: 'center' },
    {
      key: 'qty',
      header: '수량',
      width: 100,
      align: 'right',
      render: (value) => formatNumber(Number(value))
    },
    {
      key: 'unitPrice',
      header: '단가',
      width: 120,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`
    },
    {
      key: 'amt',
      header: '금액',
      width: 130,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`
    },
    { key: 'dlvyDate', header: '납기가능일', width: 110, align: 'center' },
    { key: 'rmk', header: '비고', width: 200, align: 'left' },
  ];

  return (
    <div>
      <PageHeader
        title="협력업체 선정 결과"
        subtitle="최종 선정된 협력업체 및 견적 상세 내용을 확인합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="견적번호"
          placeholder="번호 입력"
          value={searchParams.rfqNo}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqNo: e.target.value }))}
        />
        <Input
          label="견적명"
          placeholder="견적명 입력"
          value={searchParams.rfqName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, rfqName: e.target.value }))}
        />
        <DatePicker
          label="조회 시작일"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="조회 종료일"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
      </SearchPanel>

      <Card title="선정 결과 목록" padding={false}>
        <DataGrid
          columns={columns}
          data={data}
          keyField="rfqNum"
          loading={loading}
          emptyMessage="선정 완료된 견적이 없습니다."
        />
      </Card>

      {/* 상세 조회 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="견적 선정 상세 결과"
        size="xl"
      >
        {detailData.header && (
          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500 text-sm">견적번호</span>
                <span className="font-semibold text-gray-900">{detailData.header.rfqNum}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500 text-sm">견적명</span>
                <span className="font-semibold text-gray-900">{detailData.header.rfqSubject}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500 text-sm">견적유형</span>
                <span className="font-semibold text-gray-900">{detailData.header.rfqTypeNm}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500 text-sm">선정 협력사</span>
                <span className="font-semibold text-blue-700">{detailData.header.vendorNm}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500 text-sm">총 견적금액</span>
                <span className="font-bold text-red-600">₩{formatNumber(detailData.header.totalAmt)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500 text-sm">선정일</span>
                <span className="font-semibold text-gray-900">{detailData.header.selectDate?.substring(0, 10)}</span>
              </div>
            </div>

            {/* 품목 상세 섹션 */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                품목별 견적 내역
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <DataGrid
                  columns={detailColumns}
                  data={detailData.items}
                  keyField="itemCd"
                  maxHeight={400}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
