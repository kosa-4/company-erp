'use client';

import React, { useState } from 'react';
import { Trophy, XCircle, Calendar, Search, FileText } from 'lucide-react';

// 임시 Mock 데이터 - 견적 결과
const mockResults = [
  {
    rfqNo: 'RFQ-2024-0050',
    rfqName: '2024년 12월 사무용품',
    buyerName: '(주)구매회사',
    resultDate: '2024-12-20',
    result: 'WIN', // 낙찰
    totalAmount: 5500000,
  },
  {
    rfqNo: 'RFQ-2024-0048',
    rfqName: 'IT 장비 연간 유지보수',
    buyerName: '(주)구매회사',
    resultDate: '2024-12-15',
    result: 'LOSE', // 탈락
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적결과</h1>
          <p className="text-gray-500 mt-1">견적 선정 결과를 확인합니다.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체 결과</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{results.length}건</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">낙찰</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{winCount}건</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">탈락</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{loseCount}건</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterResult('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterResult === 'ALL'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterResult('WIN')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterResult === 'WIN'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              낙찰
            </button>
            <button
              onClick={() => setFilterResult('LOSE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterResult === 'LOSE'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              탈락
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">견적번호</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">견적명</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">결과일</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">결과</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">낙찰금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredResults.map((result) => (
              <tr key={result.rfqNo} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{result.rfqNo}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700">{result.rfqName}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{result.resultDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {result.result === 'WIN' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <Trophy className="w-4 h-4" />
                      낙찰
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      탈락
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-semibold ${result.result === 'WIN' ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {result.result === 'WIN' ? formatCurrency(result.totalAmount) : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredResults.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>조회된 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
