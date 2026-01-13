'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, XCircle, Calendar, Search, FileText, TrendingUp, Award, Target } from 'lucide-react';

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
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            견적결과
          </h1>
          <p className="text-stone-500 mt-1">견적 선정 결과를 확인합니다.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Total */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
          className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500 font-medium">전체 결과</p>
              <p className="text-3xl font-bold text-stone-900 mt-1">{results.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-stone-500" />
            </div>
          </div>
        </motion.div>

        {/* Win */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)" }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5 shadow-sm transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">낙찰</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{winCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Lose */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.1)" }}
          className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100 p-5 shadow-sm transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">탈락</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{loseCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)" }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5 shadow-sm transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">낙찰률</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{winRate}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Total Win Amount Banner */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium">총 낙찰금액</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalWinAmount)}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-emerald-100">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">이번 달 실적</span>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-stone-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-wrap items-center gap-4">
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
          <div className="flex items-center gap-2">
            {(['ALL', 'WIN', 'LOSE'] as const).map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterResult(filter)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterResult === filter
                    ? filter === 'WIN'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : filter === 'LOSE'
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25'
                        : 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filter === 'ALL' ? '전체' : filter === 'WIN' ? '낙찰' : '탈락'}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results Table */}
      <motion.div 
        className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-stone-50 to-stone-100/50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">견적번호</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">견적명</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">결과일</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-wider">결과</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">낙찰금액</th>
              </tr>
            </thead>
            <motion.tbody 
              className="divide-y divide-stone-100"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredResults.map((result) => (
                <motion.tr 
                  key={result.rfqNo} 
                  variants={rowVariants}
                  whileHover={{ backgroundColor: result.result === 'WIN' ? "rgba(16, 185, 129, 0.03)" : "rgba(239, 68, 68, 0.02)" }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-stone-900">{result.rfqNo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-stone-700">{result.rfqName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-stone-500">
                      <Calendar className="w-4 h-4" />
                      <span>{result.resultDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {result.result === 'WIN' ? (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-semibold"
                      >
                        <Trophy className="w-4 h-4" />
                        낙찰
                      </motion.span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        탈락
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-lg font-bold ${result.result === 'WIN' ? 'text-emerald-600' : 'text-stone-300'}`}>
                      {result.result === 'WIN' ? formatCurrency(result.totalAmount) : '-'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-500">조회된 결과가 없습니다.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
