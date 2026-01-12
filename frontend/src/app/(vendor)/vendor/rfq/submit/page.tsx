'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Calendar, Building2, Search, Eye, Send, X, CheckCircle, Clock } from 'lucide-react';
import { toast, Toaster } from 'sonner';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

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

  const getStatusBadge = (status: string) => {
    if (status === 'WAITING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          접수대기
        </span>
      );
    }
    return (
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        제출완료
      </motion.span>
    );
  };

  const filteredRfqList = rfqList.filter(rfq =>
    rfq.rfqNo.toLowerCase().includes(searchText.toLowerCase()) ||
    rfq.rfqName.toLowerCase().includes(searchText.toLowerCase())
  );

  const waitingCount = rfqList.filter(r => r.status === 'WAITING').length;

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          },
        }}
      />
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Page Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              견적현황
            </h1>
            <p className="text-stone-500 mt-1">견적 요청을 확인하고 견적서를 작성합니다.</p>
          </div>
          {waitingCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl"
            >
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-600 font-medium">{waitingCount}건 접수대기</span>
            </motion.div>
          )}
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-stone-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="견적번호 또는 견적명으로 검색"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>
        </motion.div>

        {/* RFQ Table */}
        <motion.div 
          className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-stone-50 to-stone-100/50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">견적번호</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">견적명</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">발주사</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">마감일</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-stone-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredRfqList.map((rfq) => (
                  <motion.tr 
                    key={rfq.rfqNo} 
                    variants={rowVariants}
                    whileHover={{ backgroundColor: "rgba(20, 184, 166, 0.02)" }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900">{rfq.rfqNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-stone-700">{rfq.rfqName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-stone-600">{rfq.buyerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-stone-500">
                        <Calendar className="w-4 h-4" />
                        <span>{rfq.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(rfq.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedRfq(rfq)}
                          className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                          title="상세보기"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        {rfq.status === 'WAITING' && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedRfq(rfq);
                              setShowSubmitModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Send className="w-4 h-4" />
                            견적제출
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {filteredRfqList.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-stone-500">조회된 견적 요청이 없습니다.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Submit Modal */}
        <AnimatePresence>
          {showSubmitModal && selectedRfq && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSubmitModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-stone-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-stone-900">견적서 제출</h2>
                      <p className="text-stone-500 mt-1">{selectedRfq.rfqNo} - {selectedRfq.rfqName}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSubmitModal(false)}
                      className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-stone-700 mb-3">
                      견적서 파일 첨부 <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                        isDragging 
                          ? 'border-teal-500 bg-teal-50' 
                          : uploadedFile 
                            ? 'border-emerald-300 bg-emerald-50' 
                            : 'border-stone-200 hover:border-teal-400 hover:bg-teal-50/30'
                      }`}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.xlsx,.xls,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <motion.div
                          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                          className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                            uploadedFile 
                              ? 'bg-emerald-500' 
                              : 'bg-gradient-to-br from-stone-100 to-stone-200'
                          }`}
                        >
                          {uploadedFile ? (
                            <CheckCircle className="w-7 h-7 text-white" />
                          ) : (
                            <Upload className="w-7 h-7 text-stone-400" />
                          )}
                        </motion.div>
                        {uploadedFile ? (
                          <div>
                            <p className="text-emerald-600 font-semibold">{uploadedFile.name}</p>
                            <p className="text-sm text-emerald-500 mt-1">파일이 첨부되었습니다</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-stone-700 font-medium">클릭하거나 파일을 드래그하세요</p>
                            <p className="text-sm text-stone-400 mt-1">PDF, Excel, Word 파일 지원</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-stone-600 mb-3">📋 요청 품목</p>
                    <ul className="space-y-2">
                      {selectedRfq.items.map(item => (
                        <li key={item.itemCode} className="flex items-center gap-2 text-sm text-stone-700">
                          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                          <span className="font-medium">{item.itemName}</span>
                          <span className="text-stone-400">({item.spec})</span>
                          <span className="text-stone-500 ml-auto">{item.quantity}개</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowSubmitModal(false);
                      setUploadedFile(null);
                    }}
                    className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    제출하기
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
