'use client';

import React, { useState } from 'react';
import { Package, Check, Eye, Calendar, Building2, Search } from 'lucide-react';

// 임시 Mock 데이터
const mockOrders = [
  {
    poNo: 'PO-2025-0001',
    poName: '2025년 1월 사무용품 구매',
    vendorName: '(주)협력사',
    poDate: '2025-01-10',
    totalAmount: 5500000,
    status: 'S', // 발주전송
    checkFlag: 'N', // 미확인
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
    checkFlag: 'Y', // 확인완료
    items: [
      { itemCode: 'ITEM006', itemName: '청소도구 세트', quantity: 10, unitPrice: 80000, amount: 800000 },
      { itemCode: 'ITEM007', itemName: '세정제', quantity: 20, unitPrice: 20000, amount: 400000 },
    ],
  },
];

export default function VendorOrderListPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleConfirm = (poNo: string) => {
    if (confirm('해당 발주서를 수신확인 하시겠습니까?')) {
      setOrders(prev => 
        prev.map(order => 
          order.poNo === poNo 
            ? { ...order, checkFlag: 'Y' }
            : order
        )
      );
      alert('수신확인이 완료되었습니다.');
    }
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">발주서 조회</h1>
          <p className="text-gray-500 mt-1">수신된 발주서를 확인하고 수신확인을 합니다.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="발주번호 또는 발주명으로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>미확인 발주:</span>
            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full font-semibold">
              {orders.filter(o => o.checkFlag === 'N').length}건
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">발주번호</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">발주명</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">발주일자</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">발주금액</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">수신상태</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.poNo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{order.poNo}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700">{order.poName}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{order.poDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {order.checkFlag === 'Y' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <Check className="w-4 h-4" />
                      확인완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      미확인
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="상세보기"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {order.checkFlag === 'N' && (
                      <button
                        onClick={() => handleConfirm(order.poNo)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        수신확인
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>조회된 발주서가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOrder.poNo}</h2>
                  <p className="text-gray-500 mt-1">{selectedOrder.poName}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">발주일자</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.poDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">발주금액</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              {/* Items Table */}
              <h3 className="font-semibold text-gray-900 mb-3">품목 목록</h3>
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">품목코드</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">품목명</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">수량</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">단가</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">금액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedOrder.items.map((item) => (
                    <tr key={item.itemCode}>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.itemCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                닫기
              </button>
              {selectedOrder.checkFlag === 'N' && (
                <button
                  onClick={() => {
                    handleConfirm(selectedOrder.poNo);
                    setShowDetail(false);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  수신확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
