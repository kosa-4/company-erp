'use client';

import React, { useState } from 'react';
import { FileText, Upload, Calendar, Building2, Search, Send, X, CheckCircle, Clock } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Card, Button, Input, Badge } from '@/components/ui';

// 임시 Mock 데이터
const mockRfqList = [
  {
    rfqNo: 'RFQ-2025-0001',
    rfqName: '2025년 상반기 사무용품 견적',
    buyerName: '(주)구매회사',
    requestDate: '2025-01-08',
    dueDate: '2025-01-15',
    status: 'WAITING',
    items: [
      { itemCode: 'ITEM001', itemName: '복사용지 A4', quantity: 100, spec: 'A4, 80g' },
      { itemCode: 'ITEM002', itemName: '볼펜 세트', quantity: 50, spec: '0.7mm, 흑색' },
    ],
  },
  {
    rfqNo: 'RFQ-2025-0002',
    rfqName: 'IT 장비 유지보수 견적',
    buyerName: '(주)구매회사',
    requestDate: '2025-01-06',
    dueDate: '2025-01-13',
    status: 'SUBMITTED',
    items: [
      { itemCode: 'ITEM003', itemName: 'PC 유지보수', quantity: 20, spec: '월간 정기점검' },
    ],
  },
  {
    rfqNo: 'RFQ-2025-0003',
    rfqName: '청소용품 정기 견적',
    buyerName: '(주)구매회사',
    requestDate: '2025-01-05',
    dueDate: '2025-01-12',
    status: 'WAITING',
    items: [
      { itemCode: 'ITEM004', itemName: '청소도구 세트', quantity: 10, spec: '표준형' },
      { itemCode: 'ITEM005', itemName: '세정제', quantity: 20, spec: '다목적' },
    ],
  },
];

export default function VendorRfqSubmitPage() {
  const [rfqList, setRfqList] = useState(mockRfqList);
  const [selectedRfq, setSelectedRfq] = useState<typeof mockRfqList[0] | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('파일이 첨부되었습니다.', {
        description: file.name,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('파일이 첨부되었습니다.', {
        description: file.name,
      });
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      toast.error('견적서 파일을 첨부해주세요.');
      return;
    }
    if (selectedRfq) {
      setRfqList(prev => prev.map(r => 
        r.rfqNo === selectedRfq.rfqNo 
          ? { ...r, status: 'SUBMITTED' }
          : r
      ));
    }
    toast.success('견적서가 제출되었습니다!', {
      description: selectedRfq?.rfqNo,
    });
    setShowSubmitModal(false);
    setUploadedFile(null);
    setSelectedRfq(null);
  };

  const filteredRfqList = rfqList.filter(rfq =>
    rfq.rfqNo.toLowerCase().includes(searchText.toLowerCase()) ||
    rfq.rfqName.toLowerCase().includes(searchText.toLowerCase())
  );

  const waitingCount = rfqList.filter(r => r.status === 'WAITING').length;

  return (
    <div className="space-y-6">
      <Toaster position="top-center" richColors />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">견적현황</h1>
            <p className="text-sm text-gray-500">견적 요청을 확인하고 견적서를 작성합니다.</p>
          </div>
        </div>
        
        {waitingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-600 text-sm font-medium">{waitingCount}건 접수대기</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="견적번호 또는 견적명으로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* RFQ Table */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">견적번호</th>
                <th className="px-6 py-3 font-medium">견적명</th>
                <th className="px-6 py-3 font-medium">발주사</th>
                <th className="px-6 py-3 font-medium">마감일</th>
                <th className="px-6 py-3 font-medium text-center">상태</th>
                <th className="px-6 py-3 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRfqList.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-300 mb-2" />
                      <p>조회된 견적 요청이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRfqList.map((rfq) => (
                  <tr key={rfq.rfqNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{rfq.rfqNo}</td>
                    <td className="px-6 py-4 text-gray-600">{rfq.rfqName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{rfq.buyerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{rfq.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={rfq.status === 'WAITING' ? 'yellow' : 'green'}>
                        {rfq.status === 'WAITING' ? '접수대기' : '제출완료'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {rfq.status === 'WAITING' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedRfq(rfq);
                              setShowSubmitModal(true);
                            }}
                            className="h-8 text-xs gap-1.5"
                          >
                             <Send className="w-3.5 h-3.5" />
                             견적제출
                          </Button>
                        ) : (
                           <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-8 text-xs text-gray-400"
                           >
                            제출됨
                           </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Submit Modal */}
      {showSubmitModal && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">견적서 제출</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedRfq.rfqNo} - {selectedRfq.rfqName}</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  견적서 파일 첨부 <span className="text-red-500">*</span>
                </label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    isDragging 
                      ? 'border-gray-500 bg-gray-50' 
                      : uploadedFile 
                        ? 'border-emerald-300 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                      uploadedFile 
                        ? 'bg-emerald-500 shadow-md shadow-emerald-200' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {uploadedFile ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    {uploadedFile ? (
                      <div>
                        <p className="text-emerald-700 font-semibold">{uploadedFile.name}</p>
                        <p className="text-xs text-emerald-600 mt-1">파일이 준비되었습니다</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-900 font-medium">파일을 선택하거나 이곳에 드래그하세요</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, Excel, Word 파일 지원</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Item List */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">요청 품목</p>
                <ul className="space-y-3">
                  {selectedRfq.items.map(item => (
                    <li key={item.itemCode} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{item.itemName}</span>
                            <span className="text-gray-600">{item.quantity}개</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{item.spec}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSubmitModal(false);
                  setUploadedFile(null);
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={<Send className="w-4 h-4" />}
              >
                제출하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
