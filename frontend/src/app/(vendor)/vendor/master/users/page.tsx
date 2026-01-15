'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, X, Save, Lock } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';

export default function VendorUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 1. DTO 구조와 필드명 일치 (userId, userName, userEmail, phone, deptNm, password)
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    userEmail: '',
    phone: '',
    password: '', // 신규 등록용 비밀번호 추가
  });

  // 2. 페이지 로드 시 사용자 목록 조회
  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/vendor-portal/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
+      console.error('사용자 목록 로드 실패:', response.status);
+      alert('사용자 목록을 불러오는데 실패했습니다.');
     }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        userName: user.userName,
        userId: user.userId,
        userEmail: user.userEmail,
        phone: user.phone,
        password: '', // 수정 시 비밀번호는 별도로 처리하거나 비워둠
      });
    } else {
      setEditingUser(null);
      setFormData({
        userName: '',
        userId: '',
        userEmail: '',
        phone: '',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 실제 백엔드 저장 로직 (fetch)
  const handleSave = async () => {
    // 필수값 검증
     if (!formData.userId || !formData.userName || !formData.userEmail || !formData.phone || (!editingUser && !formData.password)) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    try {
      const url = editingUser 
        ? `/api/v1/vendor-portal/users/${editingUser.userId}` 
        : `/api/v1/vendor-portal/users`;
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch("/api/v1/vendor-portal/users/add", {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingUser ? '수정 요청이 완료되었습니다.' : '신규 등록 요청이 완료되었습니다.');
        handleCloseModal();
        fetchUserList(); // 목록 새로고침
      } else {
        const err = await response.json();
        alert(err.message || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('해당 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/v1/vendor-portal/users/${userId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('삭제되었습니다.');
          fetchUserList();
        }
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.userName?.includes(searchText) ||
    user.userId?.includes(searchText) ||
    user.userEmail?.includes(searchText)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">담당자관리</h1>
            <p className="text-sm text-gray-500">협력사 소속 담당자를 관리합니다. (승인 후 이용 가능)</p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary" icon={<Plus className="w-4 h-4" />}>
          담당자 추가
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 아이디, 이메일로 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <Card key={user.userId} className="p-5 hover:border-gray-400 transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                    <span className="text-indigo-600 font-semibold text-lg">{user.userName?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{user.userName}</h3>
                      {user.status === 'N' && <Badge variant="secondary" className="text-[10px]">대기</Badge>}
                    </div>
                    <p className="text-xs text-gray-400">{user.userId}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)} className="h-8 w-8 p-0">
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(user.userId)} className="h-8 w-8 p-0 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{user.userEmail}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">{editingUser ? '담당자 수정' : '신규 담당자 등록'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">사용자명 *</label>
                <Input name="userName" value={formData.userName} onChange={handleChange} placeholder="성함 입력" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">아이디 *</label>
                <Input name="userId" value={formData.userId} onChange={handleChange} disabled={!!editingUser} placeholder="아이디 입력" />
              </div>
              {!editingUser && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">초기 비밀번호 *</label>
                  <div className="relative">
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호 입력" />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">이메일 *</label>
                <Input type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} placeholder="example@email.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">연락처 *</label>
                <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>취소</Button>
              <Button variant="primary" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
                {editingUser ? '수정 요청' : '등록 신청'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}