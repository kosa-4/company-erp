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
  Modal,
  ModalFooter
} from '@/components/ui';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { prApi, PrItemDTO } from '@/lib/api/pr';

interface PrItem {
  lineNo: number;
  itemCode: string;
  itemName: string;
  spec: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  requestDeliveryDate: string;
  remark: string;
}

export default function PurchaseRequestPage() {
  const router = useRouter();
  const [prItems, setPrItems] = useState<PrItem[]>([]);
  const [selectedPrItems, setSelectedPrItems] = useState<PrItem[]>([]); // 체크된 품목들
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itemList, setItemList] = useState<PrItemDTO[]>([]); // 품목 선택 모달용
  const [selectedItemCodes, setSelectedItemCodes] = useState<string[]>([]); // 품목 선택 모달에서 선택된 품목코드
  const [itemSearchParams, setItemSearchParams] = useState({
    itemCode: '',
    itemName: '',
  });

  // 첨부파일 상태
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // 타이머 ID 관리 (중복 네비게이션 방지)
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    prNo: '',
    prName: '',
    requester: '',
    department: '',
    requestDate: new Date().toISOString().split('T')[0],
    purchaseType: 'GENERAL',
    totalAmount: 0,
    remark: '',
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitData = async () => {
      try {
        setIsLoading(true);
        const initData = await prApi.getInitData();
        setFormData(prev => ({
          ...prev,
          requester: initData.reqUserNm || '',
          department: initData.deptNm || '',
        }));
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        toast.error('초기 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitData();
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
    };
  }, []);

  // 품목 목록 로드 함수
  const loadItemList = async () => {
    try {
      const items = await prApi.getItemList({
        itemCode: itemSearchParams.itemCode || undefined,
        itemName: itemSearchParams.itemName || undefined,
      });
      setItemList(items);
    } catch (error) {
      console.error('품목 목록 로드 실패:', error);
      toast.error('품목 목록을 불러오는데 실패했습니다.');
    }
  };

  // 품목 목록 로드 (품목 선택 모달 열 때)
  useEffect(() => {
    if (isItemModalOpen) {
      loadItemList();
    }
  }, [isItemModalOpen]);

  // 품목 검색 핸들러
  const handleItemSearch = () => {
    loadItemList();
  };



  // 품목 수량/단가 변경 핸들러
  const handleItemChange = (lineNo: number, field: keyof PrItem, value: string | number) => {
    const updatedItems = prItems.map(item => {
      if (item.lineNo === lineNo) {
        const updated = { ...item, [field]: value };
        // 수량이나 단가가 변경되면 금액 자동 계산
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }
      return item;
    });

    setPrItems(updatedItems);

    // selectedPrItems도 동기화하여 실시간 계산 반영
    setSelectedPrItems(prev => prev.map(item => {
      const updatedItem = updatedItems.find(updated => updated.lineNo === item.lineNo);
      return updatedItem || item;
    }));
  };

  const columns: ColumnDef<PrItem>[] = [
    { key: 'lineNo', header: 'No', width: 50, align: 'center' },
    { key: 'itemCode', header: '품목코드', width: 140, align: 'center' },
    { key: 'itemName', header: '품목명', align: 'left' },
    { key: 'spec', header: '규격', width: 200, align: 'left' },
    { key: 'unit', header: '단위', width: 60, align: 'center' },
    {
      key: 'quantity',
      header: (
        <span>
          수량
          <span className="text-red-500 ml-0.5">*</span>
        </span>
      ),
      width: 100,
      align: 'right',
      render: (value, row) => (
          <input
              type="number"
              value={value as number || ''}
              onChange={(e) => handleItemChange(row.lineNo, 'quantity', Number(e.target.value) || 0)}
              className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
              required
          />
      ),
    },
    {
      key: 'unitPrice',
      header: (
        <span>
          단가
          <span className="text-red-500 ml-0.5">*</span>
        </span>
      ),
      width: 130,
      align: 'right',
      render: (value, row) => (
          <input
              type="number"
              value={value as number || ''}
              onChange={(e) => handleItemChange(row.lineNo, 'unitPrice', Number(e.target.value) || 0)}
              className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
              required
          />
      ),
    },
    {
      key: 'amount',
      header: '금액',
      width: 130,
      align: 'right',
      render: (value) => `₩${formatNumber(Number(value))}`,
    },
    {
      key: 'requestDeliveryDate',
      header: (
        <span>
          희망납기일
          <span className="text-red-500 ml-0.5">*</span>
        </span>
      ),
      width: 130,
      align: 'center',
      render: (value, row) => (
          <input
              type="date"
              value={value as string || ''}
              onChange={(e) => handleItemChange(row.lineNo, 'requestDeliveryDate', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
          />
      ),
    },
    {
      key: 'remark',
      header: '비고',
      width: 150,
      align: 'left',
      render: (value, row) => (
          <input
              type="text"
              value={value as string || ''}
              onChange={(e) => handleItemChange(row.lineNo, 'remark', e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
      ),
    },
  ];

  // 총 금액 계산 (prItems 변경 시 자동 업데이트) - 전체 품목 계산
  useEffect(() => {
    const total = prItems.reduce((sum, item) => sum + item.amount, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [prItems]);

  // 구매유형 영문 값을 한글 값으로 변환 (백엔드 CODD 테이블과 매칭)
  const convertPurchaseTypeToKorean = (purchaseType: string): string => {
    const typeMap: Record<string, string> = {
      'GENERAL': '일반구매',
      'CONTRACT': '단가계약',
      'URGENT': '긴급구매',
    };
    // 매핑되지 않은 값이거나 빈 값일 경우 기본값 '일반' 반환
    return typeMap[purchaseType] || '일반구매';
  };

  const handleSave = async () => {
    if (!formData.prName.trim()) {
      toast.warning('구매요청명을 입력해주세요.');
      return;
    }
    if (prItems.length === 0) {
      toast.warning('품목을 추가해주세요.');
      return;
    }


    // 품목의 수량, 단가, 희망납기일 검증 (전체 품목)
    const invalidItems = prItems.filter(item =>
      !item.quantity || item.quantity <= 0 ||
      !item.unitPrice || item.unitPrice <= 0 ||
      !item.requestDeliveryDate
    );

    if (invalidItems.length > 0) {
      toast.warning('모든 품목의 수량, 단가, 희망납기일을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      // 구매유형 변환: 선택되지 않았거나 빈 값일 경우 '일반'으로 설정
      const purchaseType = formData.purchaseType || 'GENERAL';
      const pcTypeKorean = convertPurchaseTypeToKorean(purchaseType);

      // 백엔드 API 형식에 맞게 데이터 변환 (전체 품목)
      const requestData = {
        prHd: {
          prSubject: formData.prName,
          pcType: pcTypeKorean, // 한글 값으로 변환하여 전송
          regUser: formData.requester,
          deptName: formData.department,
          rmk: formData.remark || '',
        },
        prDtList: prItems.map(item => ({
          itemCode: item.itemCode,
          prQt: item.quantity,
          unitPrc: item.unitPrice,
          delyDate: item.requestDeliveryDate || null,
          rmk: item.remark || '',
        })),
      };
      const result = await prApi.save(requestData);

      // 생성된 PR번호
      const prNum = (result as any).prNum;

      // 첨부파일 업로드 (실패해도 PR 자체는 저장된 상태 유지)
      if (uploadedFiles.length > 0) {
        if (!prNum) {
          toast.warning('구매요청 번호를 받지 못해 파일을 업로드할 수 없습니다.');
        } else {
          for (const file of uploadedFiles) {
            try {
              await prApi.uploadFile(prNum, file);
            } catch (e) {
              console.error('파일 업로드 실패:', e);
            }
          }
        }
      }

      toast.success("구매요청 등록이 완료되었습니다.", {
        action: {
          label: '목록으로 이동',
          onClick: () => {
            // 액션 클릭 시 타이머 취소 후 즉시 이동
            if (navigationTimerRef.current) {
              clearTimeout(navigationTimerRef.current);
              navigationTimerRef.current = null;
            }
            router.push('/purchase/request-list');
          }
        }
      });
      
      // 성공 후 1초 뒤 자동 이동 (액션 클릭 시 취소됨)
      navigationTimerRef.current = setTimeout(() => {
        router.push('/purchase/request-list');
        navigationTimerRef.current = null;
      }, 1000);
      
    } catch (error) {
      // 에러 객체에서 메시지 추출
      const errorMessage = error instanceof Error ? error.message : '구매요청 등록에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadedFiles(prev => [...prev, ...files]);
  };

  // 파일 제거 핸들러
  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAddItem = () => {
    setIsItemModalOpen(true);
  };

  const handleRemoveItem = () => {
    // 체크된 아이템 삭제
    if (selectedPrItems.length === 0) {
      toast.warning('삭제할 품목을 선택해주세요.');
      return;
    }

    const selectedLineNos = selectedPrItems.map(item => item.lineNo);
    const prevItems = [...prItems];
    
    setPrItems(prItems.filter(item => !selectedLineNos.includes(item.lineNo)));
    setSelectedPrItems([]);
    
    toast.success(`${selectedPrItems.length}건의 품목이 삭제되었습니다.`, {
      action: {
        label: '실행취소',
        onClick: () => {
          setPrItems(prevItems);
          toast.success('삭제가 취소되었습니다.');
        }
      },
      duration: 4000,
    });
  };

  // 품목 선택 모달에서 품목 추가
  const handleAddSelectedItems = async () => {
    if (selectedItemCodes.length === 0) {
      toast.warning('추가할 품목을 선택해주세요.');
      return;
    }

    try {
      // 선택된 품목코드로 품목 정보 조회
      const itemInfos = await prApi.getItemInfo(selectedItemCodes);

      // 조회된 품목 정보를 PrItem 형식으로 변환하여 추가
      // 수량과 단가는 사용자가 직접 입력해야 하므로 기본값 0으로 설정
      const newItems: PrItem[] = itemInfos.map((item, index) => ({
        lineNo: prItems.length + index + 1,
        itemCode: item.itemCd,
        itemName: item.itemNm,
        spec: item.itemSpec || '',
        unit: item.unitCd || '',
        quantity: 0, // 사용자가 입력해야 함
        unitPrice: 0, // 사용자가 입력해야 함
        amount: 0,
        requestDeliveryDate: '',
        // 품목 마스터의 비고는 가져오지 않고, 구매요청에서 직접 입력하도록 기본값만 설정
        remark: '',
      }));

      setPrItems([...prItems, ...newItems]);
      setSelectedItemCodes([]);
      setIsItemModalOpen(false);
    } catch (error) {
      console.error('품목 정보 조회 실패:', error);
      toast.error('품목 정보를 불러오는데 실패했습니다.');
    }
  };

  // 품목 선택 모달에서 체크박스 변경
  const handleItemCheckboxChange = (itemCode: string, checked: boolean) => {
    if (checked) {
      setSelectedItemCodes([...selectedItemCodes, itemCode]);
    } else {
      setSelectedItemCodes(selectedItemCodes.filter(code => code !== itemCode));
    }
  };

  return (
      <div>
        <PageHeader
            title="구매요청"
            subtitle="새로운 구매요청을 등록합니다."
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
        >
          <div className="flex gap-2">
            <Button variant="primary" loading={isSaving} onClick={handleSave}>
              저장
            </Button>
          </div>
        </PageHeader>

        {/* 기본 정보 */}
        <Card title="기본 정보" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
                label="PR번호"
                value={formData.prNo}
                readOnly
            />
            <Input
                label="구매요청명"
                value={formData.prName}
                onChange={(e) => setFormData(prev => ({ ...prev, prName: e.target.value }))}
                placeholder="구매요청명 입력"
                required
            />
            <Input
                label="요청자"
                value={formData.requester}
                readOnly
            />
            <Input
                label="부서"
                value={formData.department}
                readOnly
            />
            <DatePicker
                label="요청날짜"
                value={formData.requestDate}
                disabled
            />
            <Select
                label="구매유형"
                value={formData.purchaseType}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseType: e.target.value }))}
                required
                options={[
                  { value: 'GENERAL', label: '일반' },
                  { value: 'CONTRACT', label: '단가계약' },
                  { value: 'URGENT', label: '긴급' },
                ]}
            />
            <Input
                label="요청금액"
                value={`₩${formatNumber(formData.totalAmount)}`}
                readOnly
            />
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">첨부파일</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                />
                <Button
                    variant="secondary"
                    className="h-[42px]"
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                  파일 선택
                </Button>
              </div>
              {/* 선택된 파일 목록 */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 rounded px-2 py-1"
                    >
                      <span className="truncate mr-2">
                        {file.name} ({formatFileSize(file.size)})
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleFileRemove(index)}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Textarea
                label="비고"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="구매요청 비고 입력"
                rows={2}
            />
          </div>

        </Card>

        {/* 품목 정보 */}
        <Card
            title="품목 정보"
            actions={
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleRemoveItem}>
                  삭제
                </Button>
                <Button variant="primary" size="sm" onClick={handleAddItem}>
                  품목추가
                </Button>
              </div>
            }
            padding={false}
        >
          <DataGrid
              columns={columns}
              data={prItems}
              keyField="lineNo"
              emptyMessage="품목을 추가해주세요."
              selectable
              selectedRows={selectedPrItems}
              onSelectionChange={setSelectedPrItems}
          />

          {/* 합계 */}
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <div className="text-right">
              <span className="text-gray-500 mr-4">총 요청금액:</span>
              <span className="text-xl font-bold text-blue-600">
              ₩{formatNumber(prItems.reduce((sum, item) => sum + item.amount, 0))}
            </span>
            </div>
          </div>
        </Card>

        {/* 품목 선택 모달 */}
        <Modal
            isOpen={isItemModalOpen}
            onClose={() => {
              setIsItemModalOpen(false);
              setItemSearchParams({ itemCode: '', itemName: '' });
              setSelectedItemCodes([]);
            }}
            title="품목 선택"
            size="xl"
            footer={
              <ModalFooter
                  onClose={() => {
                    setIsItemModalOpen(false);
                    setItemSearchParams({ itemCode: '', itemName: '' });
                    setSelectedItemCodes([]);
                  }}
                  onConfirm={handleAddSelectedItems}
                  confirmText="추가"
              />
            }
        >
          <div className="space-y-4">
            {/* 검색 영역 */}
            <div className="grid grid-cols-3 gap-4">
              <Input 
                label="품목코드" 
                placeholder="품목코드 입력"
                value={itemSearchParams.itemCode}
                onChange={(e) => setItemSearchParams(prev => ({ ...prev, itemCode: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleItemSearch();
                  }
                }}
              />
              <Input 
                label="품목명" 
                placeholder="품목명 입력"
                value={itemSearchParams.itemName}
                onChange={(e) => setItemSearchParams(prev => ({ ...prev, itemName: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleItemSearch();
                  }
                }}
              />
              <div className="flex items-end">
                <Button variant="primary" onClick={handleItemSearch}>검색</Button>
              </div>
            </div>

            {/* 품목 목록 */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 p-3 text-center">
                    <input
                        type="checkbox"
                        checked={itemList.length > 0 && selectedItemCodes.length === itemList.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItemCodes(itemList.map(item => item.itemCd));
                          } else {
                            setSelectedItemCodes([]);
                          }
                        }}
                    />
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">품목코드</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">품목명</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">규격</th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-600">단위</th>
                </tr>
                </thead>
                <tbody>
                {itemList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        품목이 없습니다.
                      </td>
                    </tr>
                ) : (
                    itemList.map((item) => (
                        <tr key={item.itemCd} className="border-t hover:bg-blue-50 cursor-pointer">
                          <td className="p-3 text-center">
                            <input
                                type="checkbox"
                                checked={selectedItemCodes.includes(item.itemCd)}
                                onChange={(e) => handleItemCheckboxChange(item.itemCd, e.target.checked)}
                            />
                          </td>
                          <td className="p-3 text-sm">{item.itemCd}</td>
                          <td className="p-3 text-sm">{item.itemNm}</td>
                          <td className="p-3 text-sm">{item.itemSpec || '-'}</td>
                          <td className="p-3 text-sm text-center">{item.unitCd || '-'}</td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      </div>
  );
}