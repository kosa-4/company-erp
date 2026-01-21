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
import TreeItem from './TreeItem';
import { formatNumber } from '@/lib/utils';
import { data } from 'framer-motion/client';
import { Console } from 'console';
import { useRouter } from 'next/navigation';
import { register } from 'module';
import { Router } from 'lucide-react';
import { Category } from './TreeItem';
import { Can } from '@/auth/Can';
import { User } from '@/types';

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
  editable: boolean
}



export default function ItemPage() {
  /* 검색 및 조회 */

  // 1. 상태 정의
  // 1-1. 품목 목록 출력용 상태 변수
  const [items, setItems] = useState<ItemDetail[]>([]);
  const [page, setPage] = useState("1");
  const [totalPage, setTotalPage] = useState("");
  const [loading, setLoading] = useState(false);

  // 1-2. 검색 조건 상태 변수
  // * URL 파라미터를 ItemSearchDto의 필드명과 동일하게 전달
  const [searchParams, setSearchParams] = useState({
    itemCode: '',
    itemName: '',
    useYn: '',
    date: '',
    manufacturerName: '',
    page: "1",
  });

  // 1-3. 모달 및 상세 페이지 관련 상태
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 2. 품목 조회
  const fetchItems = async () => {
    setLoading(true);
    try {
      
      // 2-1. searchParams에 입력된 page 값이 없을 시 1로 초기화
      const initPageParam = {
          ...searchParams,
          page: searchParams.page || "1" 
      };

      // 2-2. API 요청
      const response = await fetch ("/api/v1/items?" +
        new URLSearchParams(initPageParam as any) 
      );
      
      if (!response.ok) {

        // 1) 오류 발생 시 catch로 이동
        throw new Error(`조회 실패 ${response.status}`);
      }
  
      // 2-3. 데이터 파싱
      const data: {[k:string]: any} = await response.json(); // k = key

      // 2-4. 상태 업데이트
      setItems(data.items);
      setTotalPage(data.totalPage);

    } catch(error: any){
      console.error("데이터 가져오는 중 오류 발생", error);
      alert(error.message || "데이터 로드에 실패하였습니다.");
    } finally{

      // 2-5. 검색 로딩 표시      
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    }    
};

  // 3. 페이징 처리
  // 3-1. 이전 페이지
  const handlePrevPage = () => {
    const prevPage = (Number(page) - 1).toString()
    setPage(prevPage);  
    setSearchParams(prev => ({...prev, page: prevPage}));
  }

  // 3-2. 다음 페이지
  const handleNextPage = () => {
    const nextPage = (Number(page) + 1).toString()
    setPage(nextPage);  
    setSearchParams(prev => ({...prev, page: nextPage}));
  }
  // 3-3. 검색 시 1페이지로 이동
  const handleSearchList = () => {
    setPage(String(1));
    setSearchParams(prev => ({...prev, page:page}));
  }
  // 3-4. 목록 초기화
  const handleReset = () => {
    // 1) 검색 파라미터 초기화
    setSearchParams({
      itemCode: '',
      itemName: '',
      useYn: '',
      date: '',
      manufacturerName: '',
      page: '',
    });
  };

  // 4. 검색 파라미터 변경 시 목록 재조회
  useEffect(() => {
    fetchItems();
    
  }, [searchParams]); 

  // 5. 컬럼 정의
  const columns: ColumnDef<ItemDetail>[] = [ // response 키와 일치 필요
    
    {
      key: 'itemCode',
      header: '품목코드',
      width: 80,
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
      width: 80, 
      align: 'left',
    },
    {
      key: 'itemType',
      header: '품목종류',
      width: 50,
      align: 'left',
    },
    {
      key: 'spec',
      header: '규격',
      width: 50,
      align: 'left',
    },
    {
      key: 'unit',
      header: '단위',
      width: 10,
      align: 'left',
    },
    {
      key: 'manufacturerName',
      header: '제조사명',
      width: 10,
      align: 'left',
    },
    {
      key: 'createdAt', // 서버에서 내려주는 키값이 createdAt 인지 확인하세요
      header: '등록일자',
      width: 50,
      align: 'center',
      render: (value) => (
        // 데이터가 "2026-01-20T15:30:00" 형태라면 앞의 10자리만 추출
        <span className="text-gray-600 text-sm">
          {value ? String(value).substring(0, 10) : '-'}
        </span>
      ),
    },
    
  ];

  /* 품목 상세 정보 */

  // 1. 행 클릭 시 실행
  const handleRowClick = async (item: ItemDetail) => {
  // DataGrid 내부에서 map을 사용해 전달한 data를 쪼개서 각 row에 입력
  // onRowClick?: (row: T) => void; 함수에 담아 실행
    try{
      // 1-1. 품목 코드 추출
      const code = item.itemCode;
      
      // 1-2. 품목 상세 데이터 요청
      const response = await fetch(`/api/v1/items/${code}`)
      
      // 1-3. 네트워크 오류 체크
      if(!response.ok) throw new Error("서버 응답 오류");
  
      const data = await response.json();
      
      // 1-4. 데이터 상태 저장 및 모달 오픈
      setSelectedItem(data);
      setIsDetailModalOpen(true);     
    } catch(error){
      console.error("데이터를 가져오는 중 오류 발생:", error);
      alert("데이터 로드에 실패했습니다.");
    }
  };
  
  
  /* 저장 */

  // 1. useRef 정의
  // form 태그 내 input 참조
  const saveForm = useRef<HTMLFormElement>(null); 

  // 2. 품목 저장
  const saveItem = async () => {
    
    // 2-1. form 태그 null 처리
    if(!saveForm.current){
      return;
    }
    // 2-2. form 데이터 저장
    const formData = new FormData(saveForm.current);
    const data = Object.fromEntries(formData.entries());
    
    try{
      // 2-3. API 요청
      const response = await fetch ("/api/v1/items/new",{
        method: 'POST',
        headers:{
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || `입력 실패 ${response.status}`)
      };
      alert('저장되었습니다.');

      // 1. 카테고리 관련 상태 초기화
      setSelectedPath([]); 
      setSelectedCate(undefined);

      // 2. 입력 폼 초기화 (인풋 초기화)
      saveForm.current.reset();

      // 3. UI 상태 정리 (모달 닫고 리스트 새로고침)
      setIsCreateModalOpen(false);
      fetchItems();
    } catch(error: any){
      console.error("데이터 입력 중 오류 발생:", error);
      alert(error.message || "데이터 로드에 실패하였습니다.");
    }
  };

  /* 수정 */

  // 1. 품목 수정
  const updateItem = async () => {

    // 1-1. form 태그 null 처리
    if(!saveForm.current){
      return
    }
    // 1-2. form 데이터 저장
    const formData = new FormData(saveForm.current);    
    const data = Object.fromEntries(formData.entries());
    
    try{
      // 2-3. form 데이터 전송
      const response = await fetch ("/api/v1/items/update",{
        method: 'PUT',
        headers:{
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if(!response.ok){
        throw new Error(`수정 실패 ${response.status}`)
      };

      // 2-4. 수정 완료 알림
      alert('수정되었습니다.');

      // 2-5. 모달 닫기 및 리스트 갱신
      setIsDetailModalOpen(false);
      fetchItems(); 
    } catch(error){
      console.error("데이터 수정 중 오류 발생:", error);
    }
  }
  
  /* 카테고리 영역 */

  // 1. 카테고리 상태 정의

  // 1-1. 트리 구조를 위한 map 정의
  // 불필요한 랜더링 방지 및 데이터 성격 상 useRef 사용
  const cateMap = useRef<{[key: string]: Category}>({});

  // 1-2. 카테고리 리스트 출력
  const [categories, setCategories] = useState<Category[] | undefined>(undefined);

  // 1-3. 선택된 카테고리
  const [selectedCate, setSelectedCate] = useState<Category | undefined>(undefined);

  // 1-4. 카테고리 모달 상태
  const [isCateModalOpen, setIsCateModalOpen] = useState(false);

  // 2. 카테고리 조회
  const fetchCategories = async () => {
    try{
      // 2-1. 카테고리 데이터 요청
      const response = await fetch(`/api/v1/categories/all`);

      // 2-2. 네트워크 오류 체크
      if(!response.ok) throw new Error("서버 응답 오류");
      
      // 2-3. 데이터 파싱 및 트리 구조 변환
      const data = await response.json(); 

      const tree:Category[] = makeTree(data);
      setCategories(tree);     

    } catch(err){
      console.error("데이터 로딩 중 오류 발생")
      alert("데이터 로드 실패")
    }
  }
  // 3. 트리 구조 변환 함수
  const makeTree = (categories: Category[]) => {
    const top: Category[] = [];

    // 3-1. 모든 카테고리 맵에 등록
    categories.forEach(c => {
      cateMap.current[c.itemCls] = {...c, children: []};
    });

    // 3-2. 부모-자식 관계 연결
    categories.forEach(c => {
      const parentCls = c.parentItemCls;
      
      // 3-3. 부모 카테고리 존재 여부 확인 
      if(parentCls && cateMap.current[parentCls]){ 
        // 1) map에 존재하는 경우 자식으로 추가       
        cateMap.current[parentCls].children?.push(cateMap.current[c.itemCls]);
      } else{
        // 2) 부모가 없는 경우 최상위 카테고리 배열에 추가
        top.push(cateMap.current[c.itemCls]);
      }
    });

    // 4. 최상위 카테고리 반환
    return top;
  }
  
  // 4. 카테고리 선택 처리
  const [selectedPath, setSelectedPath] = useState<Category[]>([])
  const handleSelect = (category: Category | undefined) => {

    // 4-1. 경로 배열 / 최근 카테고리 변수 생성 및 초기화
    const path:Category[] = [];
    let currentCate: Category | undefined = category;
    
    // 4-2. 상위 카테고리가 없는 최상위 카테고리까지 순회
    while(currentCate && currentCate.parentItemCls){
      // 1) 선택된 카테고리 배열에 추가
      path.push(currentCate);

      // 2) 상위 카테고리로 교체
      const parentId = currentCate.parentItemCls;
      currentCate = cateMap.current[parentId]

      // 3) 상위 카테고리가 없으면 중단
      if(!currentCate) break;
    }

    // 4-3. 최상위 카테고리에 추가
    if(currentCate) path.push(currentCate);

    // 4-4. 배열 역순 정렬 및 상태 저장
    const reversePath:Category[] = path.reverse()

    // 4-5. 선택된 경로 상태 저장
    setSelectedPath(reversePath);
  }

  // 권한


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
        {/* <DatePicker
          label="등록일자"
          value={searchParams.startDate}
          onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
        /> */}
        <DatePicker
          label="등록일자"
          value={searchParams.date}
          // (e) => e.target.value 가 아니라, 들어오는 값(date)을 그대로 넣어줍니다.
          onChange={(e) => {
            const date = e.target.value;

            setSearchParams(prev => ({ 
            ...prev, 
            date: date
          }))}}
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
            <Can roles={['ADMIN','BUYER']}>
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                등록
              </Button>
            </Can>
          
        }
      >
        {/* items 요소 출력 */}        
        <DataGrid
          columns={columns}
          data={items || []}
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
            <Can roles={['ADMIN', 'BUYER']}>
              <Button variant="primary" onClick={updateItem}>수정</Button>
            </Can>
          </>
        }
      >
        
        {selectedItem && (

          <form ref={saveForm}>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">               
                  <Input name='itemCode' label="품목코드" value={selectedItem.itemCode} readOnly />
                  <Input name='itemName' label="품목명" defaultValue={selectedItem.itemName || ''} />
                  <Input name='itemNameEn' label="품목명(영문)" defaultValue={selectedItem.itemNameEn || ''} />
                  <Input name='itemType'label="품목 종류" value={selectedItem.itemType || ''} readOnly/>
                  
                  <Input name='spec' label="규격" value={selectedItem.spec || ''} readOnly/>
                  <Input name='unit' label="단위" value={selectedItem.unit || ''} readOnly/>
                  
                  {/* <Input label="제조사코드" value={selectedItem.manufacturerCode || ''} readOnly/> */}
                  <Input name='manufacturerName' label="제조사명" value={selectedItem.manufacturerName || ''} readOnly/>
                  <Input name='modelNo' label="제조모델번호" value={selectedItem.modelNo || ''} readOnly/>
                  <Input name='createdAt' label="등록일자" value={selectedItem.createdAt ? selectedItem.createdAt.substring(0, 10) : ""} readOnly />
                  <Input name='createdBy' label="등록자" value={selectedItem.createdBy} readOnly />
                </div>
                <Textarea name='remark' label="비고" defaultValue={selectedItem.remark || ''} rows={3}/>
            </div>
          </form>
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
              saveItem();            

            }}
            confirmText="저장"
          />
        }
      >
        <form ref={saveForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              
              <Input name='itemCode' label="품목코드" value="-" readOnly />
              <Input name='itemName' label="품목명" placeholder="품목명 입력" required />
              <Input name='itemNameEn' label="품목명(영문)" placeholder="영문 품목명 입력" />              
              <Input 
              name='itemType' 
              label="품목 분류" 
              placeholder="품목 분류 입력" 
              defaultValue={selectedPath[0] ? selectedPath[0].itemClsNm : ''} 
              onClick={() => {
                setIsCateModalOpen(true)
                fetchCategories();
                }}/>
              <Input 
              name='categoryL' 
              label="품목 대분류" 
              placeholder="품목 대분류" 
              value={selectedPath[1] ? selectedPath[1].itemClsNm : ''} 
              readOnly/>
              <Input 
              name='categoryM' 
              label="품목 중분류" 
              placeholder="품목 중분류"
              value={selectedPath[2] ? selectedPath[2].itemClsNm : ''}  
              readOnly/>
              <Input 
              name='categoryS' 
              label="품목 소분류" 
              placeholder="품목 소분류 입력" 
              value={selectedPath[3] ? selectedPath[3].itemClsNm : ''}  
              readOnly/>
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
              <Input name='manufacturerName' label="제조사명" placeholder="제조사명 입력" />
              <Input name='modelNo' label="제조모델번호" placeholder="모델번호 입력" />
              <Input name='createdBy' label="등록자" placeholder="등록자 입력" readOnly/>
            </div>
            <Textarea name='stopReason' label="중지 사유" placeholder="중지 사유" rows={3} readOnly/>
            <Textarea name='remark' label="비고" placeholder="비고 입력" rows={3} />
          </div>
        </form>
      </Modal>

      {/* 카테고리 모달 */}      
      {isCateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCateModalOpen(false)}
          title="품목 카테고리"
          size="lg"
          footer={
            <ModalFooter
              onClose={() => setIsCateModalOpen(false)}
              onConfirm={() => {
                
                handleSelect(selectedCate);
                // console.log(selectedCate)
                setIsCateModalOpen(false);
              }}
              confirmText="저장"
            />
          }
        >
          {/* <button onClick={fetchItems}>조회</button> */}
          <div className="flex flex-col h-[500px] w-full bg-white">
              {/* 상단 검색바 (선택 사항) */}
              <div className="p-4 border-b">
                <input 
                  type="text" 
                  placeholder="분류명 검색..." 
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 트리 리스트 영역 */}
              <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
                {categories && categories.length > 0 ? (
                  categories.map((root) => (
                    <TreeItem 
                      key={root.itemCls} 
                      root={root} 
                      onSelect={setSelectedCate} 
                      selectedId={selectedCate?.itemCls} 
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    데이터를 불러오는 중입니다...
                  </div>
                )}
              </div>

              {/* 하단 선택 정보 표시 */}
              <div className="p-4 border-t bg-white flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-500">선택된 분류: </span>
                  <span className="font-bold text-blue-600">{selectedCate?.itemClsNm || '없음'}</span>
                </div>
              </div>
            </div>
          
          
        </Modal>
      )}
      
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