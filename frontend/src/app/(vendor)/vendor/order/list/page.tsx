'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Check, Eye, Calendar, Search, X, FileText, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface OrderItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Order {
  poNo: string;
  poName: string;
  vendorName: string;
  poDate: string;
  totalAmount: number;
  status: string;
  checkFlag: string;
  items: OrderItem[];
}

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // 발주서 조회 API 호출 (발주전송 상태 'S' 조회)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // 발주전송(S) 상태만 조회
      const response = await fetch('/api/v1/purchase-orders?status=S');
      
      if (!response.ok) {
        throw new Error('발주서 조회에 실패했습니다.');
      }

      const data = await response.json();
      console.log('조회된 발주서:', data);

      // API 응답을 화면에 맞게 변환
      const transformed: Order[] = data.map((po: any) => ({
        poNo: po.poNo || '',
        poName: po.poName || '',
        vendorName: po.vendorName || '',
        poDate: po.poDate || '',
        totalAmount: po.totalAmount || 0,
        status: po.status || 'S',
        checkFlag: po.checkFlag || 'N',
        items: (po.items || []).map((item: any) => ({
          itemCode: item.itemCode || '',
          itemName: item.itemName || '',
          quantity: item.orderQuantity || 0,
          unitPrice: item.unitPrice || 0,
          amount: item.amount || 0,
        })),
      }));

      setOrders(transformed);
    } catch (error) {
      console.error('발주서 조회 오류:', error);
      toast.error('발주서 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchOrders();
  }, []);

  // 수신확인 API 호출
  const handleConfirm = async (poNo: string) => {
    try {
      const response = await fetch(`/api/v1/purchase-orders/${poNo}/vendor-confirm`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('수신확인에 실패했습니다.');
      }

      // 로컬 상태 업데이트
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

      // 목록 재조회
      await fetchOrders();
    } catch (error) {
      console.error('수신확인 오류:', error);
      toast.error('수신확인에 실패했습니다.');
    }
  };

  const handleViewDetail = (order: Order) => {
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {loading ? '조회중...' : '조회'}
            </motion.button>
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

          {loading && (
            <div className="py-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-stone-500">발주서를 조회하고 있습니다...</p>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-stone-500">수신된 발주서가 없습니다.</p>
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
