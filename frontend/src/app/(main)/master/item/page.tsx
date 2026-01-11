'use client';

import React, { useState, useEffect, useRef, use } from 'react';
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
import { useRouter } from 'next/navigation';
import { register } from 'module';
import { Router } from 'lucide-react';

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

interface ItemDetail{
  itemCode: string,
  itemName: string,
  itemNameEn: string,
  itemType: string,
  spec: string,
  unit: string,
  unitPrice: number,
  manufacturerName: string,
  manufacturerCode: string,
  modelNo: string,
  createdAt: string,
  createdBy: string,
  remark: string,
}

export default function ItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  // const fetchItems = async () => {
  // try {
  //     const response = await fetch("http://localhost:8080/items");

  //     if (!response.ok) {
  //       console.error("품목 조회 실패", response.statusText);
  //       return;
  //     }

  //     const data: {[k:string]: any} = await response.json();

  //     // 검색 결과가 존재할 때만 리스트 출력
  //     if(data.items.length > 0){
  //       setItems(data.items);
  //     }

  //   } catch (err) {
  //     console.error("품목 조회 중 오류 발생", err);
  //     alert("데이터 로드에 실패하였습니다.");
  //   }
  // };

  

  // URL 파라미터를 ItemSearchDto의 필드명과 동일하게 전달
  const [searchParams, setSearchParams] = useState({
    itemCode: '',
    itemName: '',
    useYn: '',
    startDate: '',
    endDate: '',
    manufacturerName: '',
    page: String(1),
  });
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(String(1));
  const [totalPage, setTotalPage] = useState("");

  /* 검색 및 조회 */

  const fetchItems = async () => {
    setLoading(true);
    try{
      // 1. url로 파라미터 전달
      const response = await fetch ("http://localhost:8080/items?" +
        new URLSearchParams(searchParams)
      );
      // console.log("searchparam ", searchParams.page);
      
      if (!response.ok) {
        // 오류 발생 시 catch로 이동
        throw new Error(`조회 실패 ${response.status}`);
      }
  
      // 2. item 리스트 입력
      const data: {[k:string]: any} = await response.json(); // k = key
      setItems(data.items);
      setTotalPage(data.totalPage);

    } catch(error){
      console.error("데이터 가져오는 중 오류 발생", error);
      alert("데이터 로드에 실패하였습니다.");
    } finally{

      // 3. 성공 여부 상관없이 실행      
      await new Promise(resolve => setTimeout(resolve, 500)); // 검색 로딩
      setLoading(false);
    }    
    
  };

  const handlePrevPage = () => {
    const prevPage = (Number(page) - 1).toString()
    setPage(prevPage);  
    setSearchParams(prev => ({...prev, page: prevPage}));
  }

  const handleNextPage = () => {
    const nextPage = (Number(page) + 1).toString()
    setPage(nextPage);  
    setSearchParams(prev => ({...prev, page: nextPage}));
  }

  const handleSearchList = () => {
    setPage(String(1));
    setSearchParams(prev => ({...prev, page:page}));
  }

  const handleReset = () => {
    // 검색창 초기화
    setSearchParams({
      itemCode: '',
      itemName: '',
      useYn: '',
      startDate: '',
      endDate: '',
      manufacturerName: '',
      page: '',
    });
    // 리스트 초기화
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
    
  }, [searchParams.page]); 

  

  /* 품목 상세 정보 */
    
  const handleRowClick = async (item: Item) => {
  // DataGrid 내부에서 map을 사용해 전달한 data를 쪼개서 각 row에 입력
  // onRowClick?: (row: T) => void; 함수에 담아 실행
    try{
      // 1. 선택한 컬럼의 code 설정
      const code = item.itemCode;
      
      // 2. back 연동
      const response = await fetch(`http://localhost:8080/items/${code}`)
      
      // 2-1 네트워크 오류 체크
      if(!response.ok) throw new Error("서버 응답 오류");
  
      const data = await response.json(); // k = key
      
      // 3. 데이터 존재 시 처리
      setSelectedItem(data);
       
      setIsDetailModalOpen(true);     
      console.log("type of data ",typeof data);
    } catch(error){
      console.error("데이터를 가져오는 중 오류 발생:", error);
      alert("데이터 로드에 실패했습니다.");
    }
  };
  
  const columns: ColumnDef<Item>[] = [
    // response 키와 일치 필요
    {
      key: 'itemCode',
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
      key: 'itemName',
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
      key: 'spec',
      header: '규격',
      width: 200,
      align: 'left',
    },
    {
      key: 'unit',
      header: '단위',
      width: 60,
      align: 'center',
    },
    {
      key: 'unitPrice',
      header: '단가',
      width: 120,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    {
      key: 'manufacturerCode',
      header: '제조사코드',
      width: 100,
      align: 'center',
    },
    {
      key: 'manufacturerName',
      header: '제조사명',
      width: 120,
      align: 'left',
    },
    // {
    //   key: 'reg_DATE',
    //   header: '등록 일자',
    //   width: 120,
    //   align: 'left',
    // },
    // {
    //   key: 'use_FLAG',
    //   header: '사용 여부',
    //   width: 100,
    //   align: 'center',
    // },
    
  ];
  /* 등록 */
  const registerForm = useRef<HTMLFormElement>(null); // form 태그 첨조

  // 품목 등록
  const handleSaveItem = async () => {
    
    // form 태그가 null일 시 -> 오류 방지
    if(!registerForm.current){
      return;
    }
    // 1. form 데이터 저장
    const formData = new FormData(registerForm.current);
    const data = Object.fromEntries(formData.entries());
    
    try{
      // form 데이터 전송
      const response = await fetch ("http://localhost:8080/items/new",{
        method: 'POST',
        headers:{
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if(!response.ok){
        throw new Error(`입력 실패 ${response.status}`)
      };
      alert('저장되었습니다.');
    } catch(error){
      console.error("데이터 입력 중 오류 발생:", error);
      alert();
    }
  };
  
  // 체번 표시
  // const router = useRouter();
  
  // const [docNum, setDocNum] = useState<string>("");
  // const fetchDocNum = async () => {
    
  //   // 데이터 요청
  //   try{
  //     const response = await fetch("http://localhost:8080/items/docNum");

  //     if(!response.ok){
  //       console.error("문서 번호 조회 실패", response.statusText);
  //     }
      
  //     const data = await response.text(); // json 형태가 아니라 text 형태일 시
  //     // console.log("data ",data);
  //     setDocNum(data);
  //     router.push(`?code=${data}`);
  //   } catch(err){
  //     console.error("문서 번호 조회 중 오류 발생", err);
  //     alert("문서 번호 로드에 실패하였습니다.");
  //   }
  // };

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

      <SearchPanel onSearch={handleSearchList} onReset={handleReset} loading={loading}>
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
          value={searchParams.manufacturerName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, manufacturerName: e.target.value }))}
        />
      </SearchPanel>

      <Card 
        title="품목 목록"
        padding={false}
        actions={
          <Button variant="primary" onClick={() =>  {
              setIsCreateModalOpen(true); 
            }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            등록
          </Button>
        }
      >
        {/* items 요소 출력 */}        
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
              <Input label="품목명" value={selectedItem.itemName} readOnly/>
              <Input label="품목명(영문)" value={selectedItem.itemNameEn || ''} readOnly/>
              <Input label="품목 종류" value={selectedItem.itemType || ''} readOnly/>
              {/* <Select
                label="품목종류"
                value={selectedItem.itemType}
                options={[
                  { value: '전자기기', label: '전자기기' },
                  { value: '사무용품', label: '사무용품' },
                  { value: '소모품', label: '소모품' },
                ]}
              /> */}
              <Input label="규격" value={selectedItem.spec || ''} readOnly/>
              <Input label="단위" value={selectedItem.unit || ''} readOnly/>
              {/* <Select
                label="단위"
                value={selectedItem.unit}
                options={[
                  { value: 'EA', label: 'EA (개)' },
                  { value: 'SET', label: 'SET (세트)' },
                  { value: 'BOX', label: 'BOX (박스)' },
                ]}
              /> */}
              <Input label="단가" value={formatNumber(selectedItem.unitPrice)} readOnly/>
              <Input label="제조사코드" value={selectedItem.manufacturerCode || ''} readOnly/>
              <Input label="제조사명" value={selectedItem.manufacturerName || ''} readOnly/>
              <Input label="제조모델번호" value={selectedItem.modelNo || ''} readOnly/>
              <Input label="등록일자" value={selectedItem.createdAt} readOnly />
              <Input label="등록자" value={selectedItem.createdBy} readOnly />
            </div>
            <Textarea label="비고" value={selectedItem.remark || ''} rows={3} readOnly/>
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
              handleSaveItem();              
              setIsCreateModalOpen(false);
            }}
            confirmText="저장"
          />
        }
      >
        <form ref={registerForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input name='itemCode' label="품목코드" value="자동 증가" readOnly />
              <Input name='itemName' label="품목명" placeholder="품목명 입력" required />
              <Input name='itemNameEn' label="품목명(영문)" placeholder="영문 품목명 입력" />
              <Select
                name='itemType'
                label="품목종류"
                placeholder="선택"
                required
                options={[
                  { value: '전자기기', label: '전자기기' },
                  { value: '사무용품', label: '사무용품' },
                  { value: '소모품', label: '소모품' },
                ]}
              />
              <Input name='categoryL' label="품목 대분류" placeholder="품목 대분류 입력" />
              <Input name='categoryM' label="품목 중분류" placeholder="품목 중분류 입력" />
              <Input name='categoryS' label="품목 소분류" placeholder="품목 소분류 입력" />
              
              <Input name='stopReason' label="중지 사유" placeholder="중지 사유" readOnly/>
              <Input name='createdAt' label="등록 일자" placeholder="등록 일자" readOnly/>
              <Input name='spec' label="규격" placeholder="규격 입력" />
              <Select
                name='unit'
                label="단위"
                placeholder="선택"
                required
                options={[
                  { value: 'EA', label: 'EA (개)' },
                  { value: 'SET', label: 'SET (세트)' },
                  { value: 'BOX', label: 'BOX (박스)' },
                ]}
              />
              
              <Input name='manufacturerCode' label="제조사코드" placeholder="제조사코드 입력" readOnly/>
              <Input name='manufacturerName' label="제조사명" placeholder="제조사명 입력" />
              <Input name='modelNo' label="제조모델번호" placeholder="모델번호 입력" />
              <Input name='createdBy' label="등록자" placeholder="등록자 입력" readOnly/>
            </div>
            <div className="flex gap-6">
              <label className="text-sm font-medium text-gray-700">사용여부</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="useYn" value="Y" defaultChecked className="text-blue-600"/>
                      <span className="text-sm">사용</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="useYn" value="N" className="text-blue-600" disabled/>
                      <span className="text-sm">미사용</span>
                    </label>
                  </div>
                </div>              
              
            <Textarea name='remark' label="비고" placeholder="비고 입력" rows={3} />
          </div>
        </form>
      </Modal>
      {/* {console.log(page)} */}
      <section className='mt-8'>
        <div className='flex justify-center gap-x-4'>
          <button
            onClick={handlePrevPage}
            disabled={page === "1"}
          >
            &lt;
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPage}
          >
            &gt;
          </button>
            
        </div>
      </section>
    </div>
  );
}