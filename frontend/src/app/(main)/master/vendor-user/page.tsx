'use client';

import React, { useState, useEffect } from 'react';

interface VendorUser {
  askUserNum: string;
  id: string;
  status: 'C' | 'A' | 'R' | 'N';
  vendorCode: string;
  vendorName: string;
  userId: string;
  userName: string;
  phone: string;
  email: string;
  createdAt: string;
  isBlocked: boolean;
}

export default function VendorUserPage() {
  const [vendorUsers, setVendorUsers] = useState<VendorUser[]>([]);
  const [selectedRows, setSelectedRows] = useState<VendorUser[]>([]);
  const [searchParams, setSearchParams] = useState({
    askUserNum: '',
    vendorCode: '',
    vendorName: '',
    isBlocked: '',
    startDate: '',
    endDate: '',
    businessType: '',
    businessItem: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVendorUsers();
  }, []);

  const fetchVendorUsers = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/v1/vendor-users?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      const normalizedData = (data.items || data || []).map((item: any, index: number) => ({
        ...item,
        id: item.userId || item.id || `${item.vendorCode}-${index}`,
      }));
      
      setVendorUsers(normalizedData);
    } catch (error) {
      console.error('Error fetching vendor users:', error);
      alert('데이터를 불러오는데 실패했습니다.');
      setVendorUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const params = {
      vendorCode: searchParams.vendorCode,
      vendorName: searchParams.vendorName,
      isBlocked: searchParams.isBlocked,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      businessType: searchParams.businessType,
      businessItem: searchParams.businessItem,
    };
    await fetchVendorUsers(params);
  };

  const handleReset = () => {
    setSearchParams({
      askUserNum: '',
      vendorCode: '',
      vendorName: '',
      isBlocked: '',
      startDate: '',
      endDate: '',
      businessType: '',
      businessItem: '',
    });
    fetchVendorUsers();
  };

  const getStatusBadge = (status: VendorUser['status']) => {
    const config = {
      C: { color: 'bg-yellow-100 text-yellow-800', label: '승인대기' },
      A: { color: 'bg-green-100 text-green-800', label: '승인' },
      R: { color: 'bg-red-100 text-red-800', label: '반려' },
      N: { color: 'bg-yellow-100 text-yellow-800', label: '신규신청' },
    };
    const { color, label } = config[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const toggleRow = (user: VendorUser) => {
    const isSelected = selectedRows.some(
      row => row.askUserNum === user.askUserNum
    );

    if (isSelected) {
      setSelectedRows(
        selectedRows.filter(row => row.askUserNum !== user.askUserNum)
      );
    } else {
      setSelectedRows([...selectedRows, user]);
    }
  };


  const toggleAll = () => {
    if (selectedRows.length === vendorUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...vendorUsers]);
    }
  };


  const handleApprove = async () => {
    if (selectedRows.length === 0) {
      alert('승인할 항목을 선택해주세요.');
      return;
    }

    const pendingUsers = selectedRows.filter(
      u => u.status === 'C' || u.status === 'N'
    );

    if (pendingUsers.length === 0) {
      alert('승인대기 또는 신규신청 상태만 승인할 수 있습니다.');
      return;
    }
    console.log(pendingUsers);
    try {
      const response = await fetch('/api/v1/vendor-users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingUsers), // ✅ 배열 그대로
      });

      if (!response.ok) {
        throw new Error('승인 처리 실패');
      }

      alert(`${pendingUsers.length}건 승인 완료`);
      setSelectedRows([]);
      fetchVendorUsers();
    } catch (e) {
      console.error(e);
      alert('승인 처리 중 오류 발생');
    }
  };


  const handleReject = async () => {
    if (selectedRows.length === 0) {
      alert('반려할 항목을 선택해주세요.');
      return;
    }

    const pendingUsers = selectedRows
      .filter(u => u.status === 'C' || u.status === 'N')
      .map(u => ({
        askUserNum: u.askUserNum,
        status: 'R',
      }));

    if (pendingUsers.length === 0) {
      alert('승인대기 또는 신규신청 상태의 항목만 반려할 수 있습니다.');
      return;
    }

    try {
      const response = await fetch('/api/v1/vendor-users/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingUsers), // 🔥 배열 그대로
      });

      if (!response.ok) {
        throw new Error('반려 처리 실패');
      }

      alert(`${pendingUsers.length}건이 반려되었습니다.`);
      setSelectedRows([]);
      fetchVendorUsers();
    } catch (error) {
      console.error(error);
      alert('반려 처리 중 오류가 발생했습니다.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-blue-600 rounded-lg p-6 mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-white">협력업체 사용자 관리</h1>
            <p className="text-blue-100 text-sm mt-1">협력업체 담당자 계정을 관리합니다.</p>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">협력사코드</label>
            <input
              type="text"
              placeholder="협력사코드 입력"
              value={searchParams.vendorCode}
              onChange={(e) => setSearchParams(prev => ({ ...prev, vendorCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">협력사명</label>
            <input
              type="text"
              placeholder="협력사명 입력"
              value={searchParams.vendorName}
              onChange={(e) => setSearchParams(prev => ({ ...prev, vendorName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BLOCK여부</label>
            <select
              value={searchParams.isBlocked}
              onChange={(e) => setSearchParams(prev => ({ ...prev, isBlocked: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">등록일자 시작</label>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">등록일자 종료</label>
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사업형태</label>
            <select
              value={searchParams.businessType}
              onChange={(e) => setSearchParams(prev => ({ ...prev, businessType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="CORP">법인</option>
              <option value="INDIVIDUAL">개인</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업종</label>
            <input
              type="text"
              placeholder="업종 입력"
              value={searchParams.businessItem}
              onChange={(e) => setSearchParams(prev => ({ ...prev, businessItem: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '검색중...' : '검색'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">사용자 목록</h2>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              승인
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              반려
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : vendorUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 협력업체 사용자가 없습니다.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === vendorUsers.length && vendorUsers.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">상태</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">협력사코드</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">협력사명</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">담당자ID</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">담당자명</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">담당자 전화번호</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">담당자 이메일</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">등록일자</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">BLOCK여부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendorUsers.map((user) => (
                 <tr key={user.askUserNum} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.some(
                          row => row.askUserNum === user.askUserNum
                        )}
                        onChange={() => toggleRow(user)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{user.vendorCode}</td>
                    <td className="px-4 py-3 text-left text-sm text-gray-900">{user.vendorName}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{user.userId}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{user.userName}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{user.phone}</td>
                    <td className="px-4 py-3 text-left text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{user.createdAt}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={user.isBlocked ? 'text-red-500 font-medium' : 'text-gray-500'}>
                        {user.isBlocked ? 'Y' : 'N'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}