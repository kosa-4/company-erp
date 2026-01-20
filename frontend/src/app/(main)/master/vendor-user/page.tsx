'use client';

import React, { useState, useEffect } from 'react';

// 백엔드 VendorUserListDto와 인터페이스 일치화
interface VendorUser {
  askUserNum: string;
  vendorCode: string;
  vendorName: string;
  userId: string;
  userName: string;
  phone: string;
  email: string;
  status: 'C' | 'A' | 'R' | 'N';
  createdAt: string;
  blockFlag: 'Y' | 'N'; // isBlocked에서 변경
  reqtype?: 'I' | 'D' | 'U'; // 등록/삭제/수정 요청 타입
}

export default function VendorUserPage() {
  const [vendorUsers, setVendorUsers] = useState<VendorUser[]>([]);
  const [selectedRows, setSelectedRows] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState(false);

  // 검색 조건 (백엔드 VendorUserSearchDto 필드명과 일치화)
  const [searchParams, setSearchParams] = useState({
    vendorCode: '',
    vendorName: '',
    userId: '',
    userName: '',
    blockFlag: '', // isBlocked에서 변경
    startDate: '',
    endDate: '',
    phone: '',
  });

  useEffect(() => {
    fetchVendorUsers();
  }, []);

  // 데이터 조회 로직
  const fetchVendorUsers = async (params = searchParams) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      // 값이 있는 경우만 쿼리 스트링에 추가
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });

      const response = await fetch(`/api/v1/vendor-users?${queryParams.toString()}`);

      if (!response.ok) throw new Error('데이터 로드 실패');

      const data = await response.json();
      // 백엔드에서 List로 바로 내려주는 경우와 items에 담아주는 경우 모두 대응
      const list = Array.isArray(data) ? data : (data.items || []);
      setVendorUsers(list);
    } catch (error) {
      console.error('Fetch Error:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchVendorUsers();

  const handleReset = () => {
    const resetParams = {
      vendorCode: '', vendorName: '', userId: '', userName: '',
      blockFlag: '', startDate: '', endDate: '', phone: '',
    };
    setSearchParams(resetParams);
    fetchVendorUsers(resetParams);
  };

  // 상태 배지 컴포넌트
  const getStatusBadge = (status: VendorUser['status']) => {
    const config = {
      C: { color: 'bg-blue-100 text-blue-800', label: '변경대기' },
      A: { color: 'bg-green-100 text-green-800', label: '정상' },
      R: { color: 'bg-red-100 text-red-800', label: '반려' },
      N: { color: 'bg-yellow-100 text-yellow-800', label: '신규신청' },
    };
    const { color, label } = config[status] || { color: 'bg-gray-100', label: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  // 체크박스 로직
  const toggleRow = (user: VendorUser) => {
    const isSelected = selectedRows.some(row => row.userId === user.userId && row.askUserNum === user.askUserNum);
    setSelectedRows(isSelected 
      ? selectedRows.filter(row => !(row.userId === user.userId && row.askUserNum === user.askUserNum))
      : [...selectedRows, user]
    );
  };

  const toggleAll = () => {
    setSelectedRows(selectedRows.length === vendorUsers.length ? [] : [...vendorUsers]);
  };

  // 승인/반려 공통 처리 (앞서 만든 배열 전송 로직 유지)
  const handleAction = async (type: 'approve' | 'reject') => {
    if (selectedRows.length === 0) return alert('항목을 선택해주세요.');

    // 1. 상태 검증: 승인(A)이나 반려(R) 상태인 '이미 처리가 끝난' 데이터가 있는지 확인
    const invalidUser = selectedRows.find(u => u.status === 'A' || u.status === 'R');

    if (invalidUser) {
      const statusText = invalidUser.status === 'A' ? '이미 승인된' : '이미 반려된';
      const actionText = type === 'approve' ? '승인' : '반려';
      
      // 여기서 return을 하기 때문에 아래 confirm 창은 절대 뜨지 않습니다.
      return alert(
        `[작업 불가]\n\n` +
        `선택하신 [${invalidUser.userName}]님은 ${statusText} 상태입니다.\n` +
        `이미 처리가 완료된 요청이 섞여 있어 일괄 ${actionText}이 불가능합니다.\n` +
        `대기 중인(신규/변경) 항목만 다시 선택해주세요.`
      );
    }

    // 2. 모든 데이터가 검증을 통과했을 때만 실행
    const actionLabel = type === 'approve' ? '승인' : '반려';
    if (!confirm(`선택한 ${selectedRows.length}건을 정말로 ${actionLabel}하시겠습니까?`)) return;
    

    try {
      const response = await fetch(`/api/v1/vendor-users/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRows),
      });

      if (response.ok) {
        alert('처리가 완료되었습니다.');
        
        // [핵심] 수동 필터링 대신 서버 데이터를 다시 호출하여 목록 최신화
        await fetchVendorUsers(); 
        
        // 선택했던 체크박스 초기화
        setSelectedRows([]);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header 영역 생략 (동일) */}
      
      {/* Search Panel */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Input label="담당자ID" value={searchParams.userId} onChange={v => setSearchParams(p => ({...p, userId: v}))} />
          <Input label="담당자명" value={searchParams.userName} onChange={v => setSearchParams(p => ({...p, userName: v}))} />
          <Input label="협력 업체 코드" value={searchParams.vendorCode} onChange={v => setSearchParams(p => ({...p, vendorCode: v}))} />
          <Input label="협력 업체명" value={searchParams.vendorName} onChange={v => setSearchParams(p => ({...p, vendorName: v}))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BLOCK여부</label>
            <select 
              className="w-full px-3 py-2 border rounded-md"
              value={searchParams.blockFlag}
              onChange={e => setSearchParams(p => ({...p, blockFlag: e.target.value}))}
            >
              <option value="">전체</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={handleReset} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">초기화</button>
          <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">조회</button>
        </div>
      </div>

      {/* Table 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-700">사용자 목록 ({vendorUsers.length}건)</h2>
          <div className="flex gap-2">
            <button onClick={() => handleAction('approve')} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">일괄승인</button>
            <button onClick={() => handleAction('reject')} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700">일괄반려</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3"><input type="checkbox" onChange={toggleAll} checked={selectedRows.length === vendorUsers.length && vendorUsers.length > 0} /></th>
                <th className="p-3">상태</th>
                <th className="p-3">협력사코드</th>
                <th className="p-3">협력사명</th>
                <th className="p-3">담당자ID</th>
                <th className="p-3">담당자명</th>
                <th className="p-3">전화번호</th>
                <th className="p-3">이메일</th>
                <th className="p-3">등록일</th>
                <th className="p-3">BLOCK</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendorUsers.map((user, idx) => (
                <tr key={user.askUserNum || idx} className="hover:bg-blue-50 transition-colors">
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={selectedRows.some(r => r.userId === user.userId && r.askUserNum === user.askUserNum)} onChange={() => toggleRow(user)} />
                  </td>
                  <td className="p-3 text-center">{getStatusBadge(user.status)}</td>
                  <td className="p-3 text-center text-gray-600 font-mono">{user.vendorCode}</td>
                  <td className="p-3 font-medium">{user.vendorName}</td>
                  <td className="p-3 text-center text-blue-600">{user.userId}</td>
                  <td className="p-3 text-center">{user.userName}</td>
                  <td className="p-3 text-center">{user.phone}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 text-center text-gray-500">{user.createdAt}</td>
                  <td className="p-3 text-center">
                    <span className={user.blockFlag === 'Y' ? 'text-red-600 font-bold' : 'text-gray-400'}>{user.blockFlag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && vendorUsers.length === 0 && (
            <div className="p-10 text-center text-gray-400">조회된 데이터가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// 재사용 가능한 입력 컴포넌트
function Input({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input 
        type={type}
        className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}