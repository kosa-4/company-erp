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
    try {
      // [수정] 백엔드 에러 방지: page가 없거나 빈 문자열("")이면 "1"을 기본값으로 사용
      // 이렇게 하면 절대 빈 값이 넘어가지 않아 서버가 좋아합니다.
      const safeParams = {
          ...searchParams,
          page: searchParams.page || "1" 
      };

      // 1. url로 파라미터 전달
      // searchParams 대신 위에서 만든 safeParams를 넣습니다.
      const response = await fetch ("/api/v1/items?" +
        new URLSearchParams(safeParams as any) 
      );
      
      // console.log("보낸 파라미터 확인: ", safeParams);

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
    
  }, [searchParams]); 

  

  /* 품목 상세 정보 */
    
  const handleRowClick = async (item: Item) => {
  // DataGrid 내부에서 map을 사용해 전달한 data를 쪼개서 각 row에 입력
  // onRowClick?: (row: T) => void; 함수에 담아 실행
    try{
      // 1. 선택한 컬럼의 code 설정
      const code = item.itemCode;
      
      // 2. back 연동
      const response = await fetch(`/api/v1/items/${code}`)
      
      // 2-1 네트워크 오류 체크
      if(!response.ok) throw new Error("서버 응답 오류");
  
      const data = await response.json(); // k = key
      
      // 3. 데이터 존재 시 처리
      setSelectedItem(data);
      console.log("data ",data);
      setIsDetailModalOpen(true);     
      // console.log("type of data ",typeof data);
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
    // {
    //   key: 'unitPrice',
    //   header: '단가',
    //   width: 120,
    //   align: 'right',
    //   render: (value) => `₩${formatNumber(Number(value))}`,
    // },
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
    
  ];
  /* 저장 */
  // form 내부 input 값을 한번에 긁어옴
  const saveForm = useRef<HTMLFormElement>(null); 

  // 품목 저장
  const saveItem = async () => {
    
    // form 태그가 null일 시 -> 오류 방지
    if(!saveForm.current){
      return;
    }
    // 1. form 데이터 저장
    const formData = new FormData(saveForm.current);
    const data = Object.fromEntries(formData.entries());
    
    try{
      // form 데이터 전송
      const response = await fetch ("/api/v1/items/new",{
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
    }
  };

  /* 수정 */
  const updateItem = async () => {
    console.log("수정 데이터 확인: ", saveForm.current);
    if(!saveForm.current){
      return
    }
    // 1. form input 끌어와서 저장
    const formData = new FormData(saveForm.current);
    
    const data = Object.fromEntries(formData.entries());
    
    try{
      // form 데이터 전송
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
      alert('수정되었습니다.');
      setIsDetailModalOpen(false); // 수정 후 모달 닫기
      fetchItems(); // 수정 후 리스트 갱신
    } catch(error){
      console.error("데이터 수정 중 오류 발생:", error);
    }
  }
  
  /* 카테고리 영역 */
  const cateMap = useRef<{[key: string]: Category}>({});
  // 불필요한 랜더링 방지 및 데이터 성격 상 useRef 사용

  const [selectedCate, setSelectedCate] = useState<Category | undefined>(undefined);
  const [categories, setCategories] = useState<Category[] | undefined>(undefined);
  const [isCateModalOpen, setIsCateModalOpen] = useState(false);
  // 1. 데이터 요청
  const fetchCategories = async () => {
    try{
      const response = await fetch(`/api/v1/categories/all`);

      if(!response.ok) throw new Error("서버 응답 오류");
      
      const data = await response.json(); 

      const tree:Category[] = makeTree(data);
      setCategories(tree);     

    } catch(err){
      console.error("데이터 로딩 중 오류 발생")
      alert("데이터 로드 실패")
    }
  }
  // 2. 트리구조로 변환  

  const makeTree = (categories: Category[]) => {
    const top: Category[] = [];

    // 2-1. 모든 카테고리 맵에 등록
    categories.forEach(c => {
      cateMap.current[c.itemCls] = {...c, children: []};
    });

    // 2-2. 부모-자식 관계 연결
    categories.forEach(c => {
      const parentCls = c.parentItemCls;
      // 부모 클래스가 일치할 시 부모 클래스의 children 배열에 추가
      
      if(parentCls && cateMap.current[parentCls]){        
        cateMap.current[parentCls].children?.push(cateMap.current[c.itemCls]);
      } else{
        top.push(cateMap.current[c.itemCls]);
      }
    });
    // console.log("map ", map);
    return top;
  }
  
  // 3. 부모 카테고리 입력
  const [selectedPath, setSelectedPath] = useState<Category[]>([])
  const handleSelect = (category: Category | undefined) => {
    // 3-1. 현재 클릭한 카테고리 저장
    // setSelectedCate(category);

    const path:Category[] = [];
    let currentCate: Category | undefined = category;
    
    // 3-2. 상위 카테고리가 없는 최상위 카테고리까지 순회
    while(currentCate && currentCate.parentItemCls){
      // 선택된 카테고리 배열에 추가
      path.push(currentCate);

      // 상위 카테고리로 교체
      const parentId = currentCate.parentItemCls;
      currentCate = cateMap.current[parentId]

      // 상위 카테고리가 없으면 중단
      if(!currentCate) break;
    }
    if(currentCate) path.push(currentCate);

    const reversePath:Category[] = path.reverse()

    setSelectedPath(reversePath);
  }
  


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
            <Button variant="primary" onClick={updateItem}>수정</Button>
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
                  <Input name='createdAt' label="등록일자" value={selectedItem.createdAt || ""} readOnly />
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
              setIsCreateModalOpen(false);
            }}
            confirmText="저장"
          />
        }
      >
        <form ref={saveForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              
              <Input name='itemCode' label="품목코드" value="자동 증가" readOnly />
              <Input name='itemName' label="품목명" placeholder="품목명 입력" required />
              <Input name='itemNameEn' label="품목명(영문)" placeholder="영문 품목명 입력" />              
              <Input 
              name='itemType' 
              label="품목 분류" 
              placeholder="품목 분류 입력" 
              value={selectedPath[0] ? selectedPath[0].itemClsNm : ''} 
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
              
              {/* <Input name='manufacturerCode' label="제조사코드" placeholder="제조사코드 입력" readOnly/> */}
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
              
            <Textarea name='stopReason' label="중지 사유" placeholder="중지 사유" rows={3} />
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