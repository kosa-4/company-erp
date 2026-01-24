'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter } from 'next/navigation';
import { Router } from 'lucide-react';
import { Category } from './TreeItem';
import { Can } from '@/auth/Can';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ItemDetail{
  itemCode: string,
  itemName: string,
  itemNameEn: string,
  itemType: string,
  categoryL: string,
  categoryM: string,
  categoryS: string, 
  spec: string,
  unit: string,
  unitPrice: number,
  manufacturerName: string,
  manufacturerCode: string,
  modelNo: string,
  createdAt: string,
  createdBy: string,
  remark: string,
  editable: boolean,
  useYn: string
}



export default function ItemPage() {
  const { user, isLoading } = useAuth();

  // ✅ USER 권한이면 체크박스(선택 컬럼) 숨김
  // - 로딩 중엔 안전하게 false 처리
  const canSelect = !isLoading && user?.role !== 'USER';

  /* 검색 및 조회 */

  // 1. 상태 정의
  // 1-1. 품목 목록 출력용 상태 변수
  const [items, setItems] = useState<ItemDetail[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
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
  
  // 1-3. 입력 폼 상태 (사용자가 타이핑 중인 값 저장용)
  // 초기값은 searchParams와 동일하게 설정
  const [formParams, setFormParams] = useState({
    itemCode: '',
    itemName: '',
    useYn: '',
    date: '',
    manufacturerName: '',
  });

  // 1-3. 모달 및 상세 페이지 관련 상태
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // [추가] 1-4. 체크박스 선택 상태 관리
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // // [추가] 전체 선택/해제 핸들러
  // const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.checked) {
  //     // 현재 페이지의 모든 itemCode를 선택
  //     const allIds = items.map((item) => item.itemCode);
  //     setSelectedIds(allIds);
  //   } else {
  //     // 전체 해제
  //     setSelectedIds([]);
  //   }
  // };

  const handleSelectRow = (id: string) => {
    // 이미 선택된 것을 다시 누르면 해제할지, 유지할지에 따라 다르지만
    // 보통 라디오 버튼은 다른 걸 누르기 전엔 유지됩니다.
    // 여기서는 클릭 시 무조건 해당 ID 하나만 선택되도록 합니다.
    setSelectedIds([id]);
  };
  
  // 2. 데이터 조회 함수 (동기화 로직 추가)
  const fetchItems = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      // searchParams의 page가 없으면 1로 취급
      const currentPageFromParam = Number(searchParams.page || 1);
      
      const initPageParam = {
          ...searchParams,
          page: String(currentPageFromParam)
      };

      const response = await fetch ("/api/v1/items?" +
        new URLSearchParams(initPageParam as any) 
      );
      
      if (!response.ok) throw new Error(`조회 실패 ${response.status}`);
  
      const data = await response.json();

      setItems(data.items);
      
      // [수정] totalPage 안전하게 파싱 (API 키값 확인 필요!)
      const serverTotalPage = Number(data.totalPages || data.totalPages || 1);
      setTotalPage(serverTotalPage);

      // [핵심] 현재 페이지 상태를 URL 파라미터와 동기화
      // 이 코드가 있어야 버튼의 disabled 상태가 올바르게 풀립니다.
      setPage(currentPageFromParam);

    } catch(error: any){
      console.error(error);
      alert(error.message);
    } finally{
      setLoading(false);
    }    
  };

  // 3. 페이징 처리
  // 3-1. 이전 페이지
  const handlePrevPage = () => {
    if (page <= 1) return;
    const prevPage = page - 1;
    // setPage(prevPage);
    setSearchParams(prev => ({...prev, page: String(prevPage)}));
  }

  // 3-2. 다음 페이지
  const handleNextPage = () => {
    if (page >= totalPage) return;
    const nextPage = page + 1;
    // setPage(nextPage);
    setSearchParams(prev => ({...prev, page: String(nextPage)}));
  }

  // 3-3. 검색 시 1페이지로 이동
  const handleSearchList = () => {
    // 조회 버튼을 누르면 formParams(입력된 값)을 searchParams(실제 쿼리)로 복사
    // 페이지는 1페이지로 초기화
    setSearchParams({
      ...formParams,
      page: "1"
    });
  }
  // 3-4. 목록 초기화
  const handleReset = () => {
    const emptyParams = {
      itemCode: '',
      itemName: '',
      useYn: '',
      date: '',
      manufacturerName: '',
    };

    // 입력폼과 실제 검색 조건 모두 초기화
    setFormParams(emptyParams);
    setSearchParams({ ...emptyParams, page: "1" });
  };

  // 4. 검색 파라미터 확정 시에만 목록 재조회
  useEffect(() => {
    fetchItems();
  }, [searchParams]); 

  // 5. 컬럼 정의
  const columns: ColumnDef<ItemDetail>[] = [ // response 키와 일치 필요
    {
      key: 'selection',
      // [수정] 헤더: 라디오 버튼은 전체 선택이 없으므로 텍스트로 대체
      header: '선택',
      width: 5,
      align: 'center',
      render: (_, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          {/* [수정] 체크박스 -> 라디오 버튼으로 변경 */}
          <input
            type="radio"
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            // 현재 행의 ID가 selectedIds 배열에 들어있는지 확인
            checked={selectedIds.includes(row.itemCode)}
            onChange={() => handleSelectRow(row.itemCode)}
          />
        </div>
      ),
    },
    {
      key: 'itemCode',
      header: '품목코드',
      width: 15,
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

  const handleRowClick = async (item: ItemDetail) => {
  setIsEditMode(false);
  
  try {
    const code = item.itemCode;
    const response = await fetch(`/api/v1/items/${code}`);
    if (!response.ok) throw new Error("서버 응답 오류");

    const data = await response.json();
    setSelectedItem(data);

    // [수정] 이름(Nm)과 코드(itemCls)를 모두 세팅해줍니다.
  const newPath: any = [
    {
      itemClsNm: data.itemType || '',      // 이름 (보여주기용)
      itemCls: data.itemTypeCode || ''     // 코드 (저장용) - SQL에서 가져와야 함!
    },
    {
      itemClsNm: data.categoryL || '',
      itemCls: data.categoryLCode || ''    // SQL 추가 필요
    },
    {
      itemClsNm: data.categoryM || '',
      itemCls: data.categoryMCode || ''
    },
    {
      itemClsNm: data.categoryS || '',
      itemCls: data.categorySCode || ''
    }
  ];

  setSelectedPath(newPath);
  setIsDetailModalOpen(true);

  } catch (error) {
    console.error("데이터 로드 실패:", error);
    alert("상세 정보를 조회할 수 없습니다.");
  }
};
  

  const fetchDetailItem = async (code: string) => {
  try {
    const response = await fetch(`/api/v1/items/${code}`);
    if (!response.ok) throw new Error("서버 응답 오류");

    const data = await response.json();
    setSelectedItem(data);
    setOriginalItem(data); // 원본 데이터 저장

    // [여기가 핵심!] 수정 버튼을 눌렀을 때도 경로를 만들어줘야 합니다.
    // handleRowClick에 있는 로직을 그대로 가져옵니다.
    const newPath: any = [
      {
        itemClsNm: data.itemType || '',
        itemCls: data.itemTypeCode || '' // SQL에서 가져온 코드값
      },
      {
        itemClsNm: data.categoryL || '',
        itemCls: data.categoryLCode || ''
      },
      {
        itemClsNm: data.categoryM || '',
        itemCls: data.categoryMCode || ''
      },
      {
        itemClsNm: data.categoryS || '',
        itemCls: data.categorySCode || ''
      }
    ];

    setSelectedPath(newPath); // [중요] 상태 업데이트

    setIsDetailModalOpen(true);
  } catch (error) {
    console.error("데이터를 가져오는 중 오류 발생:", error);
    alert("데이터 로드에 실패했습니다.");
  }
};
  
  
  /* 저장 */

  // 1. useRef 정의
  // form 태그 내 input 참조
  const saveForm = useRef<HTMLFormElement>(null); 
  const createForm = useRef<HTMLFormElement>(null);
  const editForm = useRef<HTMLFormElement>(null);

  // 2. 품목 저장
  const saveItem = async () => {
    
    // 2-1. form 태그 null 처리
    if(!createForm.current){
      return;
    }
    // 2-2. form 데이터 저장
    const formData = new FormData(createForm.current);
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
      createForm.current.reset();

      // 3. UI 상태 정리 (모달 닫고 리스트 새로고침)
      setIsCreateModalOpen(false);
      fetchItems();
    } catch(error: any){
      console.error("데이터 입력 중 오류 발생:", error);
      alert(error.message || "데이터 로드에 실패하였습니다.");
    }
  };

  /* 수정 */
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalItem, setOriginalItem] = useState<ItemDetail | null>(null);

  // 1. 품목 수정
  const updateItem = async () => {

    // 1-1. form 태그 null 처리
    if(!editForm.current){
      return
    }
    // 1-2. form 데이터 저장
    const formData = new FormData(editForm.current);
    const currentData = Object.fromEntries(formData.entries()); 
    const data = Object.fromEntries(formData.entries());
    delete data.createdAt; // createdAt를 서버로 보내지 않음

    // 변경 여부 체크 (중요한 필드들만 비교)
    const isChanged = 
      currentData.itemName !== originalItem?.itemName ||
      currentData.itemNameEn !== originalItem?.itemNameEn ||
      currentData.remark !== originalItem?.remark ||
      currentData.useYn !== originalItem?.useYn

    if (!isChanged) {
      alert("수정된 내용이 없습니다.");
      return; // 함수 종료 (서버에 요청 안 보냄)
    }
    
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

  // 2. 수정 버튼
  const handleEditButton = () => {
    // 1. 선택된 항목 개수 확인
    if (selectedIds.length === 0) {
      alert("수정할 품목을 선택해주세요.");
      return;
    }
    if (selectedIds.length > 1) {
      alert("수정은 한 번에 하나의 품목만 가능합니다.");
      return;
    }

    setIsEditMode(true); // 수정 모드로 설정
    // 2. 선택된 1개의 ID로 상세 조회 및 모달 오픈
    fetchDetailItem(selectedIds[0]);
  };
  
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
          value={formParams.itemCode} // formParams 사용
          onChange={(e) => setFormParams(prev => ({ ...prev, itemCode: e.target.value }))}
        />
        <Input
          label="품목명"
          placeholder="품목명 입력"
          value={formParams.itemName} // formParams 사용
          onChange={(e) => setFormParams(prev => ({ ...prev, itemName: e.target.value }))}
        />
        <Select
          label="사용여부"
          value={formParams.useYn} // formParams 사용
          onChange={(e) => setFormParams(prev => ({ ...prev, useYn: e.target.value }))}
          options={[
            { value: '', label: '전체' },
            { value: 'Y', label: '사용' },
            { value: 'N', label: '미사용' },
          ]}
        />
        <DatePicker
          label="등록일자"
          value={formParams.date} // formParams 사용
          onChange={(e) => {
            const date = e.target.value; // DatePicker 컴포넌트에 따라 e가 값일 수도 있습니다. 기존 로직 유지.
            setFormParams(prev => ({ 
            ...prev, 
            date: date
          }))}}
        />
        <Input
          label="제조사"
          placeholder="제조사명 입력"
          value={formParams.manufacturerName} // formParams 사용
          onChange={(e) => setFormParams(prev => ({ ...prev, manufacturerName: e.target.value }))}
        />

      </SearchPanel>

      <Card 
        title="품목 목록"
        padding={false}
        actions={
            <Can roles={['ADMIN','BUYER']}>
              {/* [신규] 수정 버튼: 등록 버튼 옆에 생성 */}
              <Button 
                variant="secondary" // 등록(Primary)과 구분하기 위해 secondary 사용 추천
                onClick={handleEditButton}
                // 선택된 항목이 없으면 비활성화
                disabled={selectedIds.length === 0} 
              >

                수정
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // [핵심] 모달 열기 전에 기존 선택된 카테고리/경로 정보 초기화
                  setSelectedPath([]);
                  setSelectedCate(undefined);
                  setIsCreateModalOpen(true);
                }}
              >
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

      {/* [수정됨] 상세/수정 모달 */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPath([]);        // [추가] 닫을 때 초기화
          setSelectedCate(undefined); // [추가] 닫을 때 초기화
        }}
        // 모드에 따라 타이틀 변경 (선택사항)
        title={isEditMode ? "품목 수정" : "품목 상세"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsDetailModalOpen(false);
              setSelectedPath([]);        // [추가] 닫을 때 초기화
              setSelectedCate(undefined); // [추가] 닫을 때 초기화
            }}>
              {isEditMode ? "취소" : "닫기"}
            </Button>
            
            {/* 수정 모드일 때만 저장(수정) 버튼 노출 */}
            {isEditMode && (
              <Can roles={['ADMIN', 'BUYER']}>
                <Button variant="primary" onClick={updateItem}>저장</Button>
              </Can>
            )}
          </>
        }
      >
        {selectedItem && (
          <form ref={editForm} key={selectedItem.itemCode}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                
                {/* 1. 품목코드 (수정 불가) */}
                <Input 
                  name='itemCode' 
                  label="품목코드" 
                  value={selectedItem.itemCode} 
                  readOnly={true} 
                />

                {/* 2. 품목명 (수정 가능) */}
                <Input 
                  name='itemName' 
                  label="품목명" 
                  defaultValue={selectedItem.itemName || ''} 
                  readOnly={!isEditMode}
                  required // 필수값 표시
                />

                {/* 3. 영문 품목명 (수정 가능) */}
                <Input 
                  name='itemNameEn' 
                  label="품목명(영문)" 
                  defaultValue={selectedItem.itemNameEn || ''} 
                  readOnly={!isEditMode} 
                />

                {/* 4. 품목 분류 (수정 모드일 때만 클릭 가능) */}
                {/* 로직: 새로 선택한 경로가 있으면 그걸 보여주고(selectedPath), 없으면 기존 DB값(selectedItem) 보여줌 */}
                <Input 
                  label="품목 분류" 
                  placeholder="품목 분류" 
                  value={selectedPath[0] ? selectedPath[0].itemClsNm : ''}
                  readOnly={true}
                />
                <input
                  type="hidden"
                  name="itemType"
                  value={selectedPath[0] ? selectedPath[0].itemCls : ''}
                />

                {/* 5. 대/중/소분류 (자동 입력 필드) */}
                {/* 주의: 상세 조회 시 서버에서 대/중/소분류 명칭을 따로 안 주면 빈카드로 나올 수 있음. 
                    수정 시에는 selectedPath 값으로 채워짐 */}
                <Input 
                  label="품목 대분류" 
                  placeholder="품목 대분류"
                  value={selectedPath[1] ? selectedPath[1].itemClsNm : ''} 
                  readOnly={true}
                />
                <input
                  type="hidden"
                  name="categoryL"
                  value={selectedPath[1] ? selectedPath[1].itemCls : ''}
                />
                <Input 
                  label="품목 중분류" 
                  placeholder="품목 중분류"
                  value={selectedPath[2] ? selectedPath[2].itemClsNm : ''} 
                  readOnly={true}
                />
                <input
                  type="hidden"
                  name="categoryM"
                  value={selectedPath[2] ? selectedPath[2].itemCls : ''}
                />
                <Input 
                  label="품목 소분류" 
                  placeholder="품목 소분류"
                  value={selectedPath[3] ? selectedPath[3].itemClsNm : ''} 
                  readOnly={true}
                />
                <input
                  type="hidden"
                  name="categoryS"
                  value={selectedPath[3] ? selectedPath[3].itemCls : ''}
                />

                {/* 6. 등록일자 (수정 불가) */}
                <Input 
                  name='createdAt' 
                  label="등록 일자" 
                  value={selectedItem.createdAt ? selectedItem.createdAt.substring(0, 10) : ""} 
                  readOnly={true}
                />

                {/* 7. 규격 (수정 불가) */}
                <Input 
                  name='spec' 
                  label="규격" 
                  defaultValue={selectedItem.spec || ''} 
                  readOnly={true} 
                />

                {/* 8. 단위 (Select 박스, 수정 불가) */}
                <Select
                  name='unit'
                  label="단위"
                  placeholder="선택"
                  defaultValue={selectedItem.unit || ''} // 기존 값 선택
                  disabled={true} // 수정 모드 아닐 땐 비활성화
                  required
                  options={[
                    { value: 'EA', label: 'EA (개)' },
                    { value: 'SET', label: 'SET (세트)' },
                    { value: 'BOX', label: 'BOX (박스)' },
                  ]}
                />

                {/* 9. 제조사명 (수정 불가) */}
                <Input 
                  name='manufacturerName' 
                  label="제조사명" 
                  defaultValue={selectedItem.manufacturerName || ''} 
                  readOnly={true} 
                />

                {/* 10. 모델번호 (수정 불가) */}
                <Input 
                  name='modelNo' 
                  label="제조모델번호" 
                  defaultValue={selectedItem.modelNo || ''} 
                  readOnly={true} 
                />

                {/* 11. 등록자 (수정 불가) */}
                <Input 
                  name='createdBy' 
                  label="등록자" 
                  value={selectedItem.createdBy || ''} 
                  readOnly={true} 
                />
              </div>
              {/* 12. 사용 여부 필드 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">사용 여부</label>
                <div className="flex items-center gap-6 h-10"> {/* 높이를 Input과 맞춤 */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="useYn"
                      value="Y"
                      defaultChecked={selectedItem.useYn === 'Y'}
                      disabled={!isEditMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-900'}`}>사용</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="useYn"
                      value="N"
                      defaultChecked={selectedItem.useYn === 'N'}
                      disabled={!isEditMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-900'}`}>미사용</span>
                  </label>
                </div>
              </div>

              {/* 13. 비고 (수정 가능) */}
              <Textarea 
                name='remark' 
                label="비고" 
                defaultValue={selectedItem.remark || ''} 
                rows={3} 
                readOnly={!isEditMode} 
              />
            </div>
          </form>
        )}
      </Modal>
      
      {/* 등록 모달 */}      
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPath([]);        // [추가] 닫을 때 초기화
          setSelectedCate(undefined); // [추가] 닫을 때 초기화
        }}
        title="품목 등록"
        size="lg"
        footer={
          <ModalFooter
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedPath([]);        // [추가] 닫을 때 초기화
              setSelectedCate(undefined); // [추가] 닫을 때 초기화
            }}
            onConfirm={() => {
              saveItem();

            }}
            confirmText="저장"
          />
        }
      >
        <form ref={createForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">

              <Input name='itemCode' label="품목코드" value="-" readOnly disabled/>
              <Input name='itemName' label="품목명" placeholder="품목명 입력" required />
              <Input name='itemNameEn' label="품목명(영문)" placeholder="영문 품목명 입력" />
              {/* 4. 품목 분류 (Type) */}
              {/* (1) 눈에 보이는 Input: 사용자용 (이름 표시) */}
              <Input
                label="품목 분류"
                placeholder="품목 분류 선택"
                // 보여주는 건 이름(Nm)
                value={selectedPath[0] ? selectedPath[0].itemClsNm : ''}
                readOnly={true}
                onClick={() => {
                  if (isCreateModalOpen || isEditMode) { // 수정/등록 모드일 때만 열림
                      setIsCateModalOpen(true);
                      fetchCategories();
                  }
                }}
                // 주의: name 속성을 제거하거나 view_ 등으로 바꿔서 서버 전송을 막거나 무시하게 함
              />
              {/* (2) 숨겨진 Input: 서버 전송용 (코드 전송) */}
              {/* name을 DTO와 일치시켜야 FormData가 이 값을 가져갑니다 */}
              <input
                type="hidden"
                name="itemType"
                value={selectedPath[0] ? selectedPath[0].itemCls : ''}
              />


              {/* 5. 대분류 (L) */}
              <Input
                label="품목 대분류"
                placeholder="품목 대분류"
                value={selectedPath[1] ? selectedPath[1].itemClsNm : ''}
                readOnly={true}
              />
              <input
                type="hidden"
                name="categoryL"
                value={selectedPath[1] ? selectedPath[1].itemCls : ''}
              />


              {/* 6. 중분류 (M) */}
              <Input
                label="품목 중분류"
                placeholder="품목 중분류"
                value={selectedPath[2] ? selectedPath[2].itemClsNm : ''}
                readOnly={true}
              />
              <input
                type="hidden"
                name="categoryM"
                value={selectedPath[2] ? selectedPath[2].itemCls : ''}
              />


              {/* 7. 소분류 (S) */}
              <Input
                label="품목 소분류"
                placeholder="품목 소분류"
                value={selectedPath[3] ? selectedPath[3].itemClsNm : ''}
                readOnly={true}
              />
              <input
                type="hidden"
                name="categoryS"
                value={selectedPath[3] ? selectedPath[3].itemCls : ''}
              />
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
              {/* <Input name='createdBy' label="등록자" placeholder="등록자 입력" readOnly/> */}
            </div>
            {/* <Textarea name='stopReason' label="중지 사유" placeholder="중지 사유" rows={3} readOnly/> */}
            <Textarea name='remark' label="비고" placeholder="비고 입력" rows={3} />
          </div>
        </form>
      </Modal>

      {/* 카테고리 모달 */}      
      {isCateModalOpen && (
        <Modal
          isOpen={isCateModalOpen}
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
            disabled={page <= 1} // == 1 대신 <= 1 사용 권장
            // 비활성화 시 흐릿하게 보이도록 스타일 추가 (Tailwind)
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          
          <span className="self-center text-sm">
              {page} / {totalPage}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={page >= totalPage}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      </section>
    </div>
  );
}