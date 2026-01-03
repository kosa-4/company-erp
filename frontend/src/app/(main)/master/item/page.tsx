'use client';

import React, { useState, useEffect } from 'react';
import { 
  PageHeader, 
  Card, 
  Button, 
  Input, 
  Select,
  DatePicker,
  Textarea,
  DataGrid,
  SearchPanel,
  Modal,
  ModalFooter
} from '@/components/ui';
import { Item, ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { data } from 'framer-motion/client';
import { Console } from 'console';

// Mock 데이터
// const mockItems: Item[] = [
//   {
//     itemCode: 'ITM-2024-0001',
//     itemName: '노트북 (15인치)',
//     itemNameEn: 'Laptop 15 inch',
//     itemType: '전자기기',
//     categoryL: '전산장비',
//     categoryM: '컴퓨터',
//     categoryS: '노트북',
//     spec: '15.6" FHD, i7, 16GB, 512GB SSD',
//     unit: 'EA',
//     unitPrice: 1500000,
//     manufacturerCode: 'MFR001',
//     manufacturerName: '삼성전자',
//     modelNo: 'NT950XCR-A58A',
//     useYn: 'Y',
//     remark: '업무용 표준 사양',
//     createdAt: '2024-01-15',
//     createdBy: 'admin',
//   },
//   {
//     itemCode: 'ITM-2024-0002',
//     itemName: '27인치 모니터',
//     itemNameEn: '27 inch Monitor',
//     itemType: '전자기기',
//     categoryL: '전산장비',
//     categoryM: '모니터',
//     categoryS: 'LED 모니터',
//     spec: '27" QHD, IPS, 75Hz',
//     unit: 'EA',
//     unitPrice: 350000,
//     manufacturerCode: 'MFR002',
//     manufacturerName: 'LG전자',
//     modelNo: '27QN880',
//     useYn: 'Y',
//     createdAt: '2024-01-20',
//     createdBy: 'admin',
//   },
//   {
//     itemCode: 'ITM-2024-0003',
//     itemName: '무선 키보드 마우스 세트',
//     itemNameEn: 'Wireless Keyboard Mouse Set',
//     itemType: '전자기기',
//     categoryL: '전산장비',
//     categoryM: '주변기기',
//     categoryS: '입력장치',
//     spec: '무선 2.4GHz, USB 수신기',
//     unit: 'SET',
//     unitPrice: 45000,
//     manufacturerCode: 'MFR003',
//     manufacturerName: '로지텍',
//     modelNo: 'MK540',
//     useYn: 'Y',
//     createdAt: '2024-02-01',
//     createdBy: 'admin',
//   },
//   {
//     itemCode: 'ITM-2024-0004',
//     itemName: 'A4 복사용지',
//     itemNameEn: 'A4 Copy Paper',
//     itemType: '사무용품',
//     categoryL: '사무용품',
//     categoryM: '용지',
//     categoryS: '복사용지',
//     spec: 'A4, 80g, 500매/박스',
//     unit: 'BOX',
//     unitPrice: 25000,
//     manufacturerCode: 'MFR004',
//     manufacturerName: '한솔제지',
//     modelNo: 'COPY-A4-80',
//     useYn: 'Y',
//     createdAt: '2024-02-10',
//     createdBy: 'admin',
//   },
// ];

export default function ItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  const fetchItems = async () => {
  try {
      const response = await fetch("http://localhost:8080/master/item");

      if (!response.ok) {
        console.error("품목 조회 실패", response.statusText);
        return;
      }

      const data: Item[] = await response.json();
      setItems(data);
      

    } catch (err) {
      console.error("품목 조회 중 오류 발생", err);
    }
  };

  useEffect(() => {
    fetchItems();
    
  }, []); 

  const [searchParams, setSearchParams] = useState({
    itemCode: '',
    itemName: '',
    useYn: '',
    startDate: '',
    endDate: '',
    manufacturer: '',
  });
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleReset = () => {
    setSearchParams({
      itemCode: '',
      itemName: '',
      useYn: '',
      startDate: '',
      endDate: '',
      manufacturer: '',
    });
  };

  const handleRowClick = (item: Item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // db 컬럼과 key 일치 필요
  const columns: ColumnDef<Item>[] = [
    {
      key: 'item_CD',
      header: '품목코드',
      width: 140,
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'item_NM',
      header: '품목명',
      align: 'left',
    },
    {
      key: 'itemType',
      header: '품목종류',
      width: 100,
      align: 'center',
    },
    {
      key: 'item_SPEC',
      header: '규격',
      width: 200,
      align: 'left',
    },
    {
      key: 'unit_CD',
      header: '단위',
      width: 60,
      align: 'center',
    },
    {
      key: 'unit',
      header: '단가',
      width: 120,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    {
      key: 'maker_CD',
      header: '제조사코드',
      width: 100,
      align: 'center',
    },
    {
      key: 'maker_NM',
      header: '제조사명',
      width: 120,
      align: 'left',
    },
  ];

  return (
    <div>
      <PageHeader 
        title="품목 현황" 
        subtitle="품목 정보를 조회하고 관리합니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />

      <SearchPanel onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <Input
          label="품목코드"
          placeholder="품목코드 입력"
          value={searchParams.itemCode}
          onChange={(e) => setSearchParams(prev => ({ ...prev, itemCode: e.target.value }))}
        />
        <Input
          label="품목명"
          placeholder="품목명 입력"
          value={searchParams.itemName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, itemName: e.target.value }))}
        />
        <Select
          label="사용여부"
          value={searchParams.useYn}
          onChange={(e) => setSearchParams(prev => ({ ...prev, useYn: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'Y', label: '사용' },
            { value: 'N', label: '미사용' },
          ]}
        />
        <DatePicker
          label="등록일자 시작"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        />
        <DatePicker
          label="등록일자 종료"
          value={searchParams.endDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
        />
        <Input
          label="제조사"
          placeholder="제조사명 입력"
          value={searchParams.manufacturer}
          onChange={(e) => setSearchParams(prev => ({ ...prev, manufacturer: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="품목 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            등록
          </Button>
        }
      >
        {(() => {
          console.log(items);
          return null;
        })()}
        <DataGrid
          columns={columns}
          data={items}
          keyField="itemCode"
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="등록된 품목이 없습니다."
        />
        
      </Card>

      {/* 상세/수정 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="품목 상세"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>닫기</Button>
            <Button variant="primary">수정</Button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="품목코드" value={selectedItem.itemCode} readOnly />
              <Input label="품목명" value={selectedItem.itemName} />
              <Input label="품목명(영문)" value={selectedItem.itemNameEn || ''} />
              <Select
                label="품목종류"
                value={selectedItem.itemType}
                options={[
                  { value: '전자기기', label: '전자기기' },
                  { value: '사무용품', label: '사무용품' },
                  { value: '소모품', label: '소모품' },
                ]}
              />
              <Input label="규격" value={selectedItem.spec || ''} />
              <Select
                label="단위"
                value={selectedItem.unit}
                options={[
                  { value: 'EA', label: 'EA (개)' },
                  { value: 'SET', label: 'SET (세트)' },
                  { value: 'BOX', label: 'BOX (박스)' },
                ]}
              />
              <Input label="단가" value={formatNumber(selectedItem.unitPrice)} />
              <Input label="제조사코드" value={selectedItem.manufacturerCode || ''} />
              <Input label="제조사명" value={selectedItem.manufacturerName || ''} />
              <Input label="제조모델번호" value={selectedItem.modelNo || ''} />
              <Input label="등록일자" value={selectedItem.createdAt} readOnly />
              <Input label="등록자" value={selectedItem.createdBy} readOnly />
            </div>
            <Textarea label="비고" value={selectedItem.remark || ''} rows={3} />
          </div>
        )}
      </Modal>

      {/* 등록 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="품목 등록"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => setIsCreateModalOpen(false)}
            onConfirm={() => {
              alert('저장되었습니다.');
              setIsCreateModalOpen(false);
            }}
            confirmText="저장"
          />
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="품목코드" value="자동채번" readOnly />
            <Input label="품목명" placeholder="품목명 입력" required />
            <Input label="품목명(영문)" placeholder="영문 품목명 입력" />
            <Select
              label="품목종류"
              placeholder="선택"
              required
              options={[
                { value: '전자기기', label: '전자기기' },
                { value: '사무용품', label: '사무용품' },
                { value: '소모품', label: '소모품' },
              ]}
            />
            <Input label="규격" placeholder="규격 입력" />
            <Select
              label="단위"
              placeholder="선택"
              required
              options={[
                { value: 'EA', label: 'EA (개)' },
                { value: 'SET', label: 'SET (세트)' },
                { value: 'BOX', label: 'BOX (박스)' },
              ]}
            />
            <Input label="단가" type="number" placeholder="0" />
            <Input label="제조사코드" placeholder="제조사코드 입력" />
            <Input label="제조사명" placeholder="제조사명 입력" />
            <Input label="제조모델번호" placeholder="모델번호 입력" />
          </div>
          
          <div className="flex gap-6">
            <label className="text-sm font-medium text-gray-700">사용여부</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="useYn" value="Y" defaultChecked className="text-blue-600" />
                <span className="text-sm">사용</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="useYn" value="N" className="text-blue-600" />
                <span className="text-sm">미사용</span>
              </label>
            </div>
          </div>

          <Textarea label="비고" placeholder="비고 입력" rows={3} />
        </div>
      </Modal>
    </div>
  );
}

