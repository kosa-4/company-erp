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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '처리에 실패했습니다.');
      }
      alert('처리가 완료되었습니다.');
      await fetchVendorUsers();
      setSelectedRows([]);
    } catch (e: any) {
      alert(e.message);
    }
  };

  /* 수정*/
  // 컴포넌트 내부 상단에 추가
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<VendorUser | null>(null);

  const handleEditClick = () => {
    // 1. 체크박스 선택 개수 체크
    if (selectedRows.length !== 1) {
      return alert("수정할 항목을 한 건만 선택해주세요.");
    }

    const user = selectedRows[0];

    // [수정됨] 2-1. 반려(R) 상태 체크: 수정 불가 처리
    if (user.status === 'R') {
      return alert("반려된 사용자는 수정이 불가능합니다.");
    }

    // [수정됨] 2-2. 상태 체크: 이제 '정상(A)' 상태만 수정 가능
    // (기존에는 A와 R이 가능했으나, R은 위에서 막혔으므로 A만 허용)
    if (user.status !== 'A') {
      return alert("정상(A) 상태인 사용자만 수정할 수 있습니다.\n(신규/변경 신청 건은 승인 또는 반려 처리를 해주세요.)");
    }

    // 3. 데이터 복사 및 모달 오픈
    setEditUserData({ ...user });
    setIsEditModalOpen(true);
  };
  const updateVendorUser = async () => {
    // 1. 데이터 존재 확인
    if (!editUserData) return;

    // 2. 간단한 유효성 검사 (이름이나 전화번호 등)
    if (!editUserData.userName.trim()) return alert("담당자명은 필수 입력 항목입니다.");
    if (!editUserData.email.trim()) return alert("이메일은 필수 입력 항목입니다.");

    // 3. 진행 확인
    if (!confirm("입력하신 정보로 담당자 정보를 수정하시겠습니까?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/vendor-users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // 수정된 editUserData 객체를 그대로 전송
        body: JSON.stringify(editUserData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '정보 수정에 실패했습니다.');
      }

      // 4. 성공 처리
      alert('정보 수정 요청이 완료되었습니다.');
      
      // 모달 닫고 상태 초기화
      setIsEditModalOpen(false);
      setEditUserData(null);
      setSelectedRows([]); // 체크박스 선택 해제
      
      // 목록 다시 불러오기
      await fetchVendorUsers();

    } catch (error: any) {
      console.error("수정 중 오류 발생:", error);
      alert(error.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
          <Input label="협력사 코드" value={searchParams.vendorCode} onChange={v => setSearchParams(p => ({...p, vendorCode: v}))} />
          <Input label="협력사명" value={searchParams.vendorName} onChange={v => setSearchParams(p => ({...p, vendorName: v}))} />
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
            <button 
              onClick={handleEditClick} 
              className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              disabled={selectedRows.length !== 1} // 한 건이 아닐 때 시각적 비활성화
            >
              수정
            </button>
            <button onClick={() => handleAction('approve')} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">승인</button>
            <button onClick={() => handleAction('reject')} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700">반려</button>
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
      {/* 담당자 정보 수정 모달 */}
      {isEditModalOpen && editUserData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-bold text-gray-700">담당자 정보 수정</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* 반려 상태일 경우 안내 (선택 사항) */}
              {editUserData.status === 'R' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
                  {/* <strong>반려 사유:</strong> {editUserData.rejectRemark || '사유 없음'} */}
                </div>
              )}

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  
                  <Input 
                    label="담당자ID" 
                    value={editUserData.userId} 
                    onChange={() => {}} 
                    readOnly={true} 
                    className="bg-gray-100" 
                  />
                  <Input 
                    label="담당자명" 
                    value={editUserData.userName} 
                    onChange={v => setEditUserData(p => p ? ({...p, userName: v}) : null)} 
                  />
                  <Input 
                    label="전화번호" 
                    value={editUserData.phone} 
                    onChange={v => setEditUserData(p => p ? ({...p, phone: v}) : null)} 
                  />
                  <Input 
                    label="이메일" 
                    value={editUserData.email} 
                    onChange={v => setEditUserData(p => p ? ({...p, email: v}) : null)} 
                  />
                  
                  {/* [핵심] blockFlag 선택 박스 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">차단여부(BLOCK)</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                      value={editUserData.blockFlag}
                      onChange={e => setEditUserData(p => p ? ({...p, blockFlag: e.target.value as 'Y' | 'N'}) : null)}
                    >
                      <option value="N">N (정상)</option>
                      <option value="Y">Y (차단)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer (검색 패널 버튼 스타일 참고) */}
            <div className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                취소
              </button>
              <button 
                onClick={updateVendorUser} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                수정 저장
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    
  );
  
}

// 재사용 가능한 입력 컴포넌트
// 컴포넌트 하단에 있는 Input 함수를 이 코드로 덮어쓰세요
function Input({ 
    label, 
    value, 
    onChange, 
    type = "text", 
    readOnly = false, // 새로 추가
    className = ""    // 새로 추가
  }: { 
    label: string; 
    value: string; 
    onChange: (v: string) => void; 
    type?: string; 
    readOnly?: boolean; // 타입 정의 추가
    className?: string; // 타입 정의 추가
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
          type={type}
          readOnly={readOnly} // 여기에 적용
          className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none 
            ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} 
            ${className}`} // 여기에 적용
          value={value || ''} 
          onChange={e => !readOnly && onChange(e.target.value)} 
        />
      </div>
    );
  }