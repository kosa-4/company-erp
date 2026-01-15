'use client';

import React, { useState } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';

// 임시 Mock 데이터
const mockResults = [
  {
    rfqNo: 'RFQ-2024-0050',
    rfqName: '2024년 12월 사무용품',
    buyerName: '(주)구매회사',
    resultDate: '2024-12-20',
    result: 'WIN',
    totalAmount: 5500000,
  },
  {
    rfqNo: 'RFQ-2024-0048',
    rfqName: 'IT 장비 연간 유지보수',
    buyerName: '(주)구매회사',
    resultDate: '2024-12-15',
    result: 'LOSE',
    totalAmount: 0,
  },
  {
    rfqNo: 'RFQ-2024-0045',
    rfqName: '청소용품 정기 구매',
    buyerName: '(주)구매회사',
    resultDate: '2024-12-10',
    result: 'WIN',
    totalAmount: 1200000,
  },
];

export default function VendorRfqResultPage() {
  const [results] = useState(mockResults);
  const [searchText, setSearchText] = useState('');
  const [filterResult, setFilterResult] = useState<'ALL' | 'WIN' | 'LOSE'>('ALL');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const filteredResults = results.filter(r => {
    const matchSearch = r.rfqNo.toLowerCase().includes(searchText.toLowerCase()) ||
      r.rfqName.toLowerCase().includes(searchText.toLowerCase());
    const matchFilter = filterResult === 'ALL' || r.result === filterResult;
    return matchSearch && matchFilter;
  });

  const winCount = results.filter(r => r.result === 'WIN').length;
  const loseCount = results.filter(r => r.result === 'LOSE').length;
  const totalWinAmount = results.filter(r => r.result === 'WIN').reduce((acc, r) => acc + r.totalAmount, 0);
  const winRate = Math.round((winCount / results.length) * 100);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">견적결과</h1>
          <p className="text-sm text-gray-500">견적 선정 결과를 확인합니다.</p>
        </div>
      </div>

      {/* Stats Cards - 미니멀 스타일 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
           <div className="text-sm text-gray-500">전체 결과</div>
           <div className="text-2xl font-semibold text-gray-900 mt-1">{results.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
           <div className="text-sm text-gray-500">낙찰</div>
           <div className="text-2xl font-semibold text-emerald-600 mt-1">{winCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
           <div className="text-sm text-gray-500">탈락</div>
           <div className="text-2xl font-semibold text-red-600 mt-1">{loseCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
           <div className="text-sm text-gray-500">낙찰률</div>
           <div className="text-2xl font-semibold text-gray-900 mt-1">{winRate}%</div>
        </div>
      </div>
      
      {/* Total Amount Panel */}
      <div className="bg-gray-900 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">총 낙찰금액</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalWinAmount)}</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <Trophy className="w-6 h-6 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center gap-4">
            <div className="w-full max-w-sm">
                <Input 
                    placeholder="견적번호 또는 견적명으로 검색"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant={filterResult === 'ALL' ? 'primary' : 'outline'} 
                    onClick={() => setFilterResult('ALL')}
                    size="sm"
                >
                    전체
                </Button>
                <Button 
                    variant={filterResult === 'WIN' ? 'primary' : 'outline'} 
                    onClick={() => setFilterResult('WIN')}
                    size="sm"
                >
                    낙찰
                </Button>
                <Button 
                    variant={filterResult === 'LOSE' ? 'primary' : 'outline'} 
                    onClick={() => setFilterResult('LOSE')}
                    size="sm"
                >
                    탈락
                </Button>
            </div>
        </div>
      </div>

      {/* Grid */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">견적번호</th>
                <th className="px-6 py-3 font-medium">견적명</th>
                <th className="px-6 py-3 font-medium">결과일</th>
                <th className="px-6 py-3 font-medium text-center">결과</th>
                <th className="px-6 py-3 font-medium text-right">낙찰금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        조회된 결과가 없습니다.
                    </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                    <tr key={result.rfqNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{result.rfqNo}</td>
                    <td className="px-6 py-4 text-gray-600">{result.rfqName}</td>
                    <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {result.resultDate}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant={result.result === 'WIN' ? 'green' : 'red'}>
                            {result.result === 'WIN' ? '낙찰' : '탈락'}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {result.result === 'WIN' ? formatCurrency(result.totalAmount) : '-'}
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
