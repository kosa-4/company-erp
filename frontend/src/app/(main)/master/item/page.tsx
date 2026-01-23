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

import { ColumnDef } from '@/types';
import TreeItem from './TreeItem';
import { Category } from './TreeItem';
import { Can } from '@/auth/Can';
import { useAuth } from '@/contexts/AuthContext';

interface ItemDetail {
  itemCode: string;
  itemName: string;
  itemNameEn: string;
  itemType: string;
  categoryL: string;
  categoryM: string;
  categoryS: string;
  spec: string;
  unit: string;
  unitPrice: number;
  manufacturerName: string;
  manufacturerCode: string;
  modelNo: string;
  createdAt: string;
  createdBy: string;
  remark: string;
  editable: boolean;
  useYn: string;
}

export default function ItemPage() {
  const { user, isLoading } = useAuth();

  // ✅ USER 권한이면 체크박스(선택 컬럼) 숨김
  // - 로딩 중엔 안전하게 false 처리
  const canSelect = !isLoading && user?.role !== 'USER';

  /* 검색 및 조회 */

  const [items, setItems] = useState<ItemDetail[]>([]);
  const [page, setPage] = useState('1');
  const [totalPage, setTotalPage] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState({
    itemCode: '',
    itemName: '',
    useYn: '',
    date: '',
    manufacturerName: '',
    page: '1',
  });

  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 체크박스 선택 상태
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 전체 선택/해제
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canSelect) return;

    if (e.target.checked) {
      const allIds = items.map((item) => item.itemCode);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택/해제
  const handleSelectRow = (id: string) => {
    if (!canSelect) return;

    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  // 품목 조회
  const fetchItems = async () => {
    setLoading(true);
    setSelectedIds([]);

    try {
      const initPageParam = {
        ...searchParams,
        page: searchParams.page || '1',
      };

      const response = await fetch(
          '/api/v1/items?' + new URLSearchParams(initPageParam as any)
      );

      if (!response.ok) {
        throw new Error(`조회 실패 ${response.status}`);
      }

      const data: { [k: string]: any } = await response.json();

      setItems(data.items);
      setTotalPage(data.totalPage);
    } catch (error: any) {
      console.error('데이터 가져오는 중 오류 발생', error);
      alert(error.message || '데이터 로드에 실패하였습니다.');
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
    }
  };

  // 페이징 처리
  const handlePrevPage = () => {
    const prevPage = (Number(page) - 1).toString();
    setPage(prevPage);
    setSearchParams((prev) => ({ ...prev, page: prevPage }));
  };

  const handleNextPage = () => {
    const nextPage = (Number(page) + 1).toString();
    setPage(nextPage);
    setSearchParams((prev) => ({ ...prev, page: nextPage }));
  };

  const handleSearchList = () => {
    setPage(String(1));
    setSearchParams((prev) => ({ ...prev, page: '1' }));
  };

  const handleReset = () => {
    setSearchParams({
      itemCode: '',
      itemName: '',
      useYn: '',
      date: '',
      manufacturerName: '',
      page: '',
    });
  };

  // 검색 파라미터 변경 시 목록 재조회
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ✅ 컬럼 정의 (USER면 selection 컬럼 자체를 안 넣음)
  const columns: ColumnDef<ItemDetail>[] = [
    ...(canSelect
        ? ([
          {
            key: 'selection',
            header: (
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={handleSelectAll}
                />
            ),
            width: 5,
            align: 'center',
            render: (_: any, row: ItemDetail) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.includes(row.itemCode)}
                      onChange={() => handleSelectRow(row.itemCode)}
                  />
                </div>
            ),
          } as ColumnDef<ItemDetail>,
        ] as ColumnDef<ItemDetail>[])
        : []),

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
      key: 'createdAt',
      header: '등록일자',
      width: 50,
      align: 'center',
      render: (value) => (
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
      if (!response.ok) throw new Error('서버 응답 오류');

      const data = await response.json();
      setSelectedItem(data);

      const newPath: any = [
        { itemClsNm: data.itemType || '' },
        { itemClsNm: data.categoryL || '' },
        { itemClsNm: data.categoryM || '' },
        { itemClsNm: data.categoryS || '' },
      ];

      setSelectedPath(newPath);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('상세 정보를 조회할 수 없습니다.');
    }
  };

  const fetchDetailItem = async (code: string) => {
    try {
      const response = await fetch(`/api/v1/items/${code}`);
      if (!response.ok) throw new Error('서버 응답 오류');

      const data = await response.json();
      setSelectedItem(data);
      setOriginalItem(data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
      alert('데이터 로드에 실패했습니다.');
    }
  };

  /* 저장 */

  const createForm = useRef<HTMLFormElement>(null);
  const editForm = useRef<HTMLFormElement>(null);

  const saveItem = async () => {
    if (!createForm.current) return;

    const formData = new FormData(createForm.current);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/v1/items/new', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `입력 실패 ${response.status}`);
      }

      alert('저장되었습니다.');

      setSelectedPath([]);
      setSelectedCate(undefined);

      createForm.current.reset();

      setIsCreateModalOpen(false);
      fetchItems();
    } catch (error: any) {
      console.error('데이터 입력 중 오류 발생:', error);
      alert(error.message || '데이터 로드에 실패하였습니다.');
    }
  };

  /* 수정 */

  const [isEditMode, setIsEditMode] = useState(false);
  const [originalItem, setOriginalItem] = useState<ItemDetail | null>(null);

  const updateItem = async () => {
    if (!editForm.current) return;

    const formData = new FormData(editForm.current);
    const currentData = Object.fromEntries(formData.entries());
    const data = Object.fromEntries(formData.entries());
    delete (data as any).createdAt;

    const isChanged =
        currentData.itemName !== originalItem?.itemName ||
        currentData.itemNameEn !== originalItem?.itemNameEn ||
        currentData.remark !== originalItem?.remark ||
        currentData.useYn !== originalItem?.useYn;

    if (!isChanged) {
      alert('수정된 내용이 없습니다.');
      return;
    }

    try {
      const response = await fetch('/api/v1/items/update', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`수정 실패 ${response.status}`);

      alert('수정되었습니다.');

      setIsDetailModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('데이터 수정 중 오류 발생:', error);
    }
  };

  const handleEditButton = () => {
    if (selectedIds.length === 0) {
      alert('수정할 품목을 선택해주세요.');
      return;
    }
    if (selectedIds.length > 1) {
      alert('수정은 한 번에 하나의 품목만 가능합니다.');
      return;
    }

    setIsEditMode(true);
    fetchDetailItem(selectedIds[0]);
  };

  /* 카테고리 영역 */

  const cateMap = useRef<{ [key: string]: Category }>({});

  const [categories, setCategories] = useState<Category[] | undefined>(undefined);
  const [selectedCate, setSelectedCate] = useState<Category | undefined>(undefined);
  const [isCateModalOpen, setIsCateModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/v1/categories/all`);
      if (!response.ok) throw new Error('서버 응답 오류');

      const data = await response.json();
      const tree: Category[] = makeTree(data);
      setCategories(tree);
    } catch (err) {
      console.error('데이터 로딩 중 오류 발생');
      alert('데이터 로드 실패');
    }
  };

  const makeTree = (categories: Category[]) => {
    const top: Category[] = [];

    categories.forEach((c) => {
      cateMap.current[c.itemCls] = { ...c, children: [] };
    });

    categories.forEach((c) => {
      const parentCls = c.parentItemCls;

      if (parentCls && cateMap.current[parentCls]) {
        cateMap.current[parentCls].children?.push(cateMap.current[c.itemCls]);
      } else {
        top.push(cateMap.current[c.itemCls]);
      }
    });

    return top;
  };

  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const handleSelect = (category: Category | undefined) => {
    const path: Category[] = [];
    let currentCate: Category | undefined = category;

    while (currentCate && currentCate.parentItemCls) {
      path.push(currentCate);

      const parentId = currentCate.parentItemCls;
      currentCate = cateMap.current[parentId];

      if (!currentCate) break;
    }

    if (currentCate) path.push(currentCate);

    const reversePath: Category[] = path.reverse();
    setSelectedPath(reversePath);
  };

  return (
      <div>
        <PageHeader
            title="품목 현황"
            subtitle="품목 정보를 조회하고 관리합니다."
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
        />

        <SearchPanel onSearch={handleSearchList} onReset={handleReset} loading={loading}>
          <Input
              label="품목코드"
              placeholder="품목코드 입력"
              value={searchParams.itemCode}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, itemCode: e.target.value }))}
          />
          <Input
              label="품목명"
              placeholder="품목명 입력"
              value={searchParams.itemName}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, itemName: e.target.value }))}
          />
          <Select
              label="사용여부"
              value={searchParams.useYn}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, useYn: e.target.value }))}
              options={[
                { value: '', label: '전체' },
                { value: 'Y', label: '사용' },
                { value: 'N', label: '미사용' },
              ]}
          />
          <DatePicker
              label="등록일자"
              value={searchParams.date}
              onChange={(e) => {
                const date = e.target.value;
                setSearchParams((prev) => ({
                  ...prev,
                  date: date,
                }));
              }}
          />
          <Input
              label="제조사"
              placeholder="제조사명 입력"
              value={searchParams.manufacturerName}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, manufacturerName: e.target.value }))}
          />
        </SearchPanel>

        <Card
            title="품목 목록"
            padding={false}
            actions={
              <Can roles={['ADMIN', 'BUYER']}>
                <Button
                    variant="secondary"
                    onClick={handleEditButton}
                    disabled={selectedIds.length === 0}
                >
                  수정
                </Button>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  등록
                </Button>
              </Can>
            }
        >
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
            title={isEditMode ? '품목 수정' : '품목 상세'}
            size="lg"
            footer={
              <>
                <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                  {isEditMode ? '취소' : '닫기'}
                </Button>

                {isEditMode && (
                    <Can roles={['ADMIN', 'BUYER']}>
                      <Button variant="primary" onClick={updateItem}>
                        저장
                      </Button>
                    </Can>
                )}
              </>
            }
        >
          {selectedItem && (
              <form ref={editForm} key={selectedItem.itemCode}>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="itemCode" label="품목코드" value={selectedItem.itemCode} readOnly />

                    <Input
                        name="itemName"
                        label="품목명"
                        defaultValue={selectedItem.itemName || ''}
                        readOnly={!isEditMode}
                        required
                    />

                    <Input
                        name="itemNameEn"
                        label="품목명(영문)"
                        defaultValue={selectedItem.itemNameEn || ''}
                        readOnly={!isEditMode}
                    />

                    <Input
                        name="itemType"
                        label="품목 분류"
                        placeholder="품목 분류"
                        value={selectedPath[0] ? selectedPath[0].itemClsNm : ''}
                        readOnly
                    />

                    <Input
                        name="categoryL"
                        label="품목 대분류"
                        placeholder="품목 대분류"
                        value={selectedPath[1] ? selectedPath[1].itemClsNm : ''}
                        readOnly
                    />
                    <Input
                        name="categoryM"
                        label="품목 중분류"
                        placeholder="품목 중분류"
                        value={selectedPath[2] ? selectedPath[2].itemClsNm : ''}
                        readOnly
                    />
                    <Input
                        name="categoryS"
                        label="품목 소분류"
                        placeholder="품목 소분류"
                        value={selectedPath[3] ? selectedPath[3].itemClsNm : ''}
                        readOnly
                    />

                    <Input
                        name="createdAt"
                        label="등록 일자"
                        value={selectedItem.createdAt ? selectedItem.createdAt.substring(0, 10) : ''}
                        readOnly
                    />

                    <Input name="spec" label="규격" defaultValue={selectedItem.spec || ''} readOnly />

                    <Select
                        name="unit"
                        label="단위"
                        placeholder="선택"
                        defaultValue={selectedItem.unit || ''}
                        disabled
                        required
                        options={[
                          { value: 'EA', label: 'EA (개)' },
                          { value: 'SET', label: 'SET (세트)' },
                          { value: 'BOX', label: 'BOX (박스)' },
                        ]}
                    />

                    <Input
                        name="manufacturerName"
                        label="제조사명"
                        defaultValue={selectedItem.manufacturerName || ''}
                        readOnly
                    />

                    <Input
                        name="modelNo"
                        label="제조모델번호"
                        defaultValue={selectedItem.modelNo || ''}
                        readOnly
                    />

                    <Input name="createdBy" label="등록자" value={selectedItem.createdBy || ''} readOnly />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">사용 여부</label>
                    <div className="flex items-center gap-6 h-10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="useYn"
                            value="Y"
                            defaultChecked={selectedItem.useYn === 'Y'}
                            disabled={!isEditMode}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-900'}`}>
                      사용
                    </span>
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
                        <span className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-900'}`}>
                      미사용
                    </span>
                      </label>
                    </div>
                  </div>

                  <Textarea
                      name="remark"
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
          <form ref={createForm}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input name="itemCode" label="품목코드" value="-" readOnly disabled />
                <Input name="itemName" label="품목명" placeholder="품목명 입력" required />
                <Input name="itemNameEn" label="품목명(영문)" placeholder="영문 품목명 입력" />

                <Input
                    name="itemType"
                    label="품목 분류"
                    placeholder="품목 분류 입력"
                    defaultValue={selectedPath[0] ? selectedPath[0].itemClsNm : ''}
                    onClick={() => {
                      setIsCateModalOpen(true);
                      fetchCategories();
                    }}
                />

                <Input
                    name="categoryL"
                    label="품목 대분류"
                    placeholder="품목 대분류"
                    value={selectedPath[1] ? selectedPath[1].itemClsNm : ''}
                    readOnly
                />
                <Input
                    name="categoryM"
                    label="품목 중분류"
                    placeholder="품목 중분류"
                    value={selectedPath[2] ? selectedPath[2].itemClsNm : ''}
                    readOnly
                />
                <Input
                    name="categoryS"
                    label="품목 소분류"
                    placeholder="품목 소분류 입력"
                    value={selectedPath[3] ? selectedPath[3].itemClsNm : ''}
                    readOnly
                />

                <Input name="spec" label="규격" placeholder="규격 입력" />

                <Select
                    name="unit"
                    label="단위"
                    placeholder="선택"
                    required
                    options={[
                      { value: 'EA', label: 'EA (개)' },
                      { value: 'SET', label: 'SET (세트)' },
                      { value: 'BOX', label: 'BOX (박스)' },
                    ]}
                />

                <Input name="manufacturerName" label="제조사명" placeholder="제조사명 입력" />
                <Input name="modelNo" label="제조모델번호" placeholder="모델번호 입력" />
              </div>

              <Textarea name="remark" label="비고" placeholder="비고 입력" rows={3} />
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
                        setIsCateModalOpen(false);
                      }}
                      confirmText="저장"
                  />
                }
            >
              <div className="flex flex-col h-[500px] w-full bg-white">
                <div className="p-4 border-b">
                  <input
                      type="text"
                      placeholder="분류명 검색..."
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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

                <div className="p-4 border-t bg-white flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">선택된 분류: </span>
                    <span className="font-bold text-blue-600">{selectedCate?.itemClsNm || '없음'}</span>
                  </div>
                </div>
              </div>
            </Modal>
        )}

        <section className="mt-8">
          <div className="flex justify-center gap-x-4">
            <button onClick={handlePrevPage} disabled={page === '1'}>
              &lt;
            </button>
            <button onClick={handleNextPage} disabled={page === totalPage}>
              &gt;
            </button>
          </div>
        </section>
      </div>
  );
}