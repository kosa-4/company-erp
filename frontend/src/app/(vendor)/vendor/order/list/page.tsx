'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Check, Eye, Calendar, Search, X, FileText, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// 임시 Mock 데이터
const mockOrders = [
  {
    poNo: 'PO-2025-0001',
    poName: '2025년 1월 사무용품 구매',
    vendorName: '(주)협력사',
    poDate: '2025-01-10',
    totalAmount: 5500000,
    status: 'S',
    checkFlag: 'N',
    items: [
      { itemCode: 'ITEM001', itemName: '복사용지 A4', quantity: 100, unitPrice: 25000, amount: 2500000 },
      { itemCode: 'ITEM002', itemName: '볼펜 세트', quantity: 50, unitPrice: 30000, amount: 1500000 },
      { itemCode: 'ITEM003', itemName: '노트북 거치대', quantity: 10, unitPrice: 150000, amount: 1500000 },
    ],
  },
  {
    poNo: 'PO-2025-0002',
    poName: '전산장비 유지보수',
    vendorName: '(주)협력사',
    poDate: '2025-01-08',
    totalAmount: 12000000,
    status: 'S',
    checkFlag: 'N',
    items: [
      { itemCode: 'ITEM004', itemName: 'PC 유지보수', quantity: 20, unitPrice: 500000, amount: 10000000 },
      { itemCode: 'ITEM005', itemName: '네트워크 점검', quantity: 1, unitPrice: 2000000, amount: 2000000 },
    ],
  },
  {
    poNo: 'PO-2025-0003',
    poName: '청소용품 정기 구매',
    vendorName: '(주)협력사',
    poDate: '2025-01-05',
    totalAmount: 1200000,
    status: 'S',
    checkFlag: 'Y',
    items: [
      { itemCode: 'ITEM006', itemName: '청소도구 세트', quantity: 10, unitPrice: 80000, amount: 800000 },
      { itemCode: 'ITEM007', itemName: '세정제', quantity: 20, unitPrice: 20000, amount: 400000 },
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

export default function VendorOrderListPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleConfirm = (poNo: string) => {
    setOrders(prev => 
      prev.map(order => 
        order.poNo === poNo 
          ? { ...order, checkFlag: 'Y' }
          : order
      )
    );
    toast.success('수신확인이 완료되었습니다!', {
      description: `발주번호: ${poNo}`,
      duration: 3000,
    });
  };

  const handleViewDetail = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const filteredOrders = orders.filter(order => 
    order.poNo.toLowerCase().includes(searchText.toLowerCase()) ||
    order.poName.toLowerCase().includes(searchText.toLowerCase())
  );

  const unconfirmedCount = orders.filter(o => o.checkFlag === 'N').length;

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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              발주서 조회
            </h1>
            <p className="text-stone-500 mt-1">수신된 발주서를 확인하고 수신확인을 합니다.</p>
          </div>
          {unconfirmedCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-2xl"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-medium">{unconfirmedCount}건 미확인</span>
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
                placeholder="발주번호 또는 발주명으로 검색"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">발주번호</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">발주명</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">발주일자</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">발주금액</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">수신상태</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-stone-100"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredOrders.map((order, index) => (
                  <motion.tr 
                    key={order.poNo} 
                    variants={rowVariants}
                    whileHover={{ backgroundColor: "rgba(20, 184, 166, 0.02)" }}
                    className="transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900">{order.poNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-stone-700">{order.poName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-stone-500">
                        <Calendar className="w-4 h-4" />
                        <span>{order.poDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-stone-900">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.checkFlag === 'Y' ? (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          확인완료
                        </motion.span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-sm font-medium animate-pulse">
                          미확인
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetail(order)}
                          className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                          title="상세보기"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        {order.checkFlag === 'N' && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirm(order.poNo)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            수신확인
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-stone-500">조회된 발주서가 없습니다.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetail && selectedOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDetail(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-100 text-sm mb-1">
                        <FileText className="w-4 h-4" />
                        발주서 상세
                      </div>
                      <h2 className="text-2xl font-bold text-white">{selectedOrder.poNo}</h2>
                      <p className="text-emerald-100 mt-1">{selectedOrder.poName}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDetail(false)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[55vh]">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl p-4">
                      <p className="text-sm text-stone-500 mb-1">발주일자</p>
                      <p className="font-bold text-stone-900 text-lg">{selectedOrder.poDate}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4">
                      <p className="text-sm text-emerald-600 mb-1">발주금액</p>
                      <p className="font-bold text-emerald-700 text-lg">{formatCurrency(selectedOrder.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    품목 목록
                  </h3>
                  <div className="border border-stone-200 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-stone-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase">품목코드</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase">품목명</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase">수량</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase">단가</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase">금액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {selectedOrder.items.map((item, idx) => (
                          <motion.tr 
                            key={item.itemCode}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <td className="px-4 py-3 text-sm text-stone-600 font-mono">{item.itemCode}</td>
                            <td className="px-4 py-3 text-sm text-stone-900 font-medium">{item.itemName}</td>
                            <td className="px-4 py-3 text-sm text-stone-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-stone-900 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-stone-900 text-right">{formatCurrency(item.amount)}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetail(false)}
                    className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-medium transition-colors"
                  >
                    닫기
                  </motion.button>
                  {selectedOrder.checkFlag === 'N' && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleConfirm(selectedOrder.poNo);
                        setShowDetail(false);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      수신확인
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
