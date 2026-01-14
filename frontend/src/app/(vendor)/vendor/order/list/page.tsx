'use client';

import React, { useState, useEffect } from 'react';
import { Package, Check, Eye, Calendar, Search, X, FileText, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Card, Button, Input, Badge } from '@/components/ui';

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirm = async (poNo: string) => {
    try {
      const response = await fetch(`/api/v1/purchase-orders/${poNo}/vendor-confirm`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('수신확인에 실패했습니다.');
      }

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
    <div className="space-y-6">
      <Toaster position="top-center" richColors />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">발주서 조회</h1>
            <p className="text-sm text-gray-500">수신된 발주서를 확인하고 수신확인을 합니다.</p>
          </div>
        </div>
        
        {unconfirmedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 text-sm font-medium">{unconfirmedCount}건 미확인</span>
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
              placeholder="발주번호 또는 발주명으로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
            />
          </div>
          <Button onClick={fetchOrders} disabled={loading} variant="primary">
            {loading ? '조회중...' : '조회'}
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">발주번호</th>
                <th className="px-6 py-3 font-medium">발주명</th>
                <th className="px-6 py-3 font-medium">발주일자</th>
                <th className="px-6 py-3 font-medium text-right">발주금액</th>
                <th className="px-6 py-3 font-medium text-center">수신상태</th>
                <th className="px-6 py-3 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300 mb-2" />
                      <p>수신된 발주서가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.poNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.poNo}</td>
                    <td className="px-6 py-4 text-gray-600">{order.poName}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {order.poDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={order.checkFlag === 'Y' ? 'green' : 'orange'}>
                        {order.checkFlag === 'Y' ? '확인완료' : '미확인'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(order)}
                          className="w-8 h-8 p-0"
                          title="상세보기"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        {order.checkFlag === 'N' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirm(order.poNo)}
                            className="h-8 text-xs gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            수신확인
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

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">발주서 상세</h2>
                <p className="text-sm text-gray-500">{selectedOrder.poNo}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">발주일자</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.poDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">발주금액</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>

              {/* Items Table */}
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                품목 목록
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">품목코드</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">품목명</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">수량</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">단가</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-500">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.itemCode}>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.itemCode}</td>
                        <td className="px-4 py-3 text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowDetail(false)}
              >
                닫기
              </Button>
              {selectedOrder.checkFlag === 'N' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleConfirm(selectedOrder.poNo);
                    setShowDetail(false);
                  }}
                  icon={<Check className="w-4 h-4" />}
                >
                  수신확인
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
