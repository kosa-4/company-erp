'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Building2, Search, Send, X, CheckCircle2, XCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Card, Button, Badge } from '@/components/ui';
import { rfqApi } from '@/lib/api/rfq';
import { useRouter } from 'next/navigation';

export default function VendorRfqSubmitPage() {
  const router = useRouter();
  const [rfqList, setRfqList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // RFQ 목록 조회
  const fetchRfqList = async () => {
    try {
      setLoading(true);
      const data = await rfqApi.getVendorRfqList({
        searchText: searchText || undefined,
        progressCd: filterStatus || undefined,
      });
      setRfqList(data);
    } catch (error: any) {
      toast.error('견적 목록 조회에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqList();
  }, []);

  // 검색
  const handleSearch = () => {
    fetchRfqList();
  };

  // RFQ 접수
  const handleAccept = async (rfqNum: string) => {
    if (!confirm('이 견적 요청을 접수하시겠습니까?')) return;

    try {
      await rfqApi.acceptRfq(rfqNum);
      toast.success('견적 요청을 접수했습니다.');
      fetchRfqList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '접수에 실패했습니다.');
    }
  };

  // RFQ 포기
  const handleReject = async (rfqNum: string) => {
    if (!confirm('이 견적을 포기하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      await rfqApi.rejectRfq(rfqNum);
      toast.success('견적을 포기했습니다.');
      fetchRfqList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '포기 처리에 실패했습니다.');
    }
  };

  // 견적 작성 페이지로 이동
  const handleGoToQuote = (rfqNum: string) => {
    router.push(`/vendor/rfq/submit/${rfqNum}`);
  };

  const filteredRfqList = rfqList.filter(rfq =>
    (searchText === '' || 
     rfq.rfqNum.toLowerCase().includes(searchText.toLowerCase()) ||
     rfq.rfqSubject.toLowerCase().includes(searchText.toLowerCase())) &&
    (filterStatus === '' || rfq.vendorProgressCd === filterStatus)
  );

  const waitingCount = rfqList.filter(r => r.vendorProgressCd === 'RFQS').length;

  // 상태별 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'RFQS': return 'yellow';
      case 'RFQJ': return 'blue';
      case 'RFQT': return 'gray';
      case 'RFQC': return 'green';
      case 'F': return 'red';
      default: return 'gray';
    }
  };

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
            <h1 className="text-xl font-semibold text-gray-900">견적관리</h1>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={filterStatus === '' ? 'primary' : 'outline'} 
              onClick={() => { setFilterStatus(''); fetchRfqList(); }}
              size="sm"
            >
              전체
            </Button>
            <Button 
              variant={filterStatus === 'RFQS' ? 'primary' : 'outline'} 
              onClick={() => { setFilterStatus('RFQS'); fetchRfqList(); }}
              size="sm"
            >
              요청
            </Button>
            <Button 
              variant={filterStatus === 'RFQJ' ? 'primary' : 'outline'} 
              onClick={() => { setFilterStatus('RFQJ'); fetchRfqList(); }}
              size="sm"
            >
              접수
            </Button>
            <Button 
              variant={filterStatus === 'RFQT' ? 'primary' : 'outline'} 
              onClick={() => { setFilterStatus('RFQT'); fetchRfqList(); }}
              size="sm"
            >
              임시저장
            </Button>
            <Button 
              variant={filterStatus === 'RFQC' ? 'primary' : 'outline'} 
              onClick={() => { setFilterStatus('RFQC'); fetchRfqList(); }}
              size="sm"
            >
              제출완료
            </Button>
          </div>
          <Button variant="primary" onClick={handleSearch}>
            검색
          </Button>
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
                <th className="px-6 py-3 font-medium">견적유형</th>
                <th className="px-6 py-3 font-medium">마감일</th>
                <th className="px-6 py-3 font-medium text-center">상태</th>
                <th className="px-6 py-3 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredRfqList.length === 0 ? (
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
                  <tr key={rfq.rfqNum} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{rfq.rfqNum}</td>
                    <td className="px-6 py-4 text-gray-600">{rfq.rfqSubject}</td>
                    <td className="px-6 py-4 text-gray-600">{rfq.rfqTypeName || rfq.rfqType}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{rfq.reqCloseDate ? new Date(rfq.reqCloseDate).toLocaleDateString('ko-KR') : '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={getStatusBadgeVariant(rfq.vendorProgressCd)}>
                        {rfq.vendorProgressName}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {rfq.vendorProgressCd === 'RFQS' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAccept(rfq.rfqNum)}
                              className="h-8 text-xs gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              접수
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(rfq.rfqNum)}
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              포기
                            </Button>
                          </>
                        )}
                        {(rfq.vendorProgressCd === 'RFQJ' || rfq.vendorProgressCd === 'RFQT') && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleGoToQuote(rfq.rfqNum)}
                              className="h-8 text-xs gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              견적작성
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(rfq.rfqNum)}
                              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              포기
                            </Button>
                          </>
                        )}
                        {rfq.vendorProgressCd === 'RFQC' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-8 text-xs text-gray-400"
                          >
                            제출완료
                          </Button>
                        )}
                        {rfq.vendorProgressCd === 'F' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-8 text-xs text-gray-400"
                          >
                            포기됨
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
    </div>
  );
}
