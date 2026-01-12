'use client';

import React, { useState } from 'react';
import { FileText, Upload, Calendar, Building2, Search, Eye, Send } from 'lucide-react';

// 임시 Mock 데이터 - 견적 요청 목록
const mockRfqList = [
  {
    rfqNo: 'RFQ-2025-0001',
    rfqName: '2025년 상반기 사무용품 견적',
    buyerName: '(주)구매회사',
    requestDate: '2025-01-08',
    dueDate: '2025-01-15',
    status: 'WAITING', // 접수대기
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
    status: 'SUBMITTED', // 제출완료
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
  const [rfqList] = useState(mockRfqList);
  const [selectedRfq, setSelectedRfq] = useState<typeof mockRfqList[0] | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchText, setSearchText] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert('견적서 파일을 첨부해주세요.');
      return;
    }
    alert('견적서가 제출되었습니다.');
    setShowSubmitModal(false);
    setUploadedFile(null);
    setSelectedRfq(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">접수대기</span>;
      case 'SUBMITTED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">제출완료</span>;
      default:
        return null;
    }
  };

  const filteredRfqList = rfqList.filter(rfq =>
    rfq.rfqNo.toLowerCase().includes(searchText.toLowerCase()) ||
    rfq.rfqName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적현황</h1>
          <p className="text-gray-500 mt-1">견적 요청을 확인하고 견적서를 작성합니다.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="견적번호 또는 견적명으로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>접수대기:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full font-semibold">
              {rfqList.filter(r => r.status === 'WAITING').length}건
            </span>
          </div>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">견적번호</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">견적명</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">발주사</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">마감일</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">상태</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRfqList.map((rfq) => (
              <tr key={rfq.rfqNo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{rfq.rfqNo}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700">{rfq.rfqName}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{rfq.buyerName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{rfq.dueDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(rfq.status)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedRfq(rfq)}
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="상세보기"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {rfq.status === 'WAITING' && (
                      <button
                        onClick={() => {
                          setSelectedRfq(rfq);
                          setShowSubmitModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        견적제출
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRfqList.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>조회된 견적 요청이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">견적서 제출</h2>
              <p className="text-gray-500 mt-1">{selectedRfq.rfqNo} - {selectedRfq.rfqName}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  견적서 파일 첨부 *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    {uploadedFile ? (
                      <p className="text-emerald-600 font-medium">{uploadedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium">클릭하여 파일 업로드</p>
                        <p className="text-sm text-gray-400 mt-1">PDF, Excel, Word 파일 지원</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">요청 품목</p>
                <ul className="space-y-1">
                  {selectedRfq.items.map(item => (
                    <li key={item.itemCode} className="text-sm text-gray-700">
                      • {item.itemName} ({item.spec}) - {item.quantity}개
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setUploadedFile(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                제출하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
