'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, X, Save, Lock, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';

export default function VendorUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/vendor-portal/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: any) => {
    if (user) {
      if (user.status === 'N' || user.status === 'C') {
        alert('승인 및 변경 요청 상태일 시 수정이 불가능합니다.');
        return;
      }

      setEditingUser(user);
      setFormData({
        userName: user.userName || '',
        userId: user.userId || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({ userName: '', userId: '', email: '', phone: '', password: '' });
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

  const handleSave = async () => {
    const isPasswordRequired = !editingUser;
    if (!formData.userId || !formData.userName || !formData.email || !formData.phone || (isPasswordRequired && !formData.password)) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/v1/vendor-portal/users/${editingUser.userId}` : "/api/v1/vendor-portal/users/add";

      const payload: any = {
        userName: formData.userName,
        userId: formData.userId,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingUser ? '수정 요청이 완료되었습니다.' : '신규 등록 요청이 완료되었습니다.');
        handleCloseModal();
        fetchUserList();
      }
    } catch (error) {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  /**
   * 삭제 함수: 이전의 방식(데이터 전체 전송)으로 복구
   */
  const handleDelete = async (user: any) => {
    if (user.status === 'N' || user.status === 'C') {
      alert('승인 및 변경 요청 상태일 시 삭제가 불가능합니다.');
      return;
    }

    if (confirm('해당 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/v1/vendor-portal/users/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            phone: user.phone,
            status: user.status,
            vendorCode: user.vendorCode
          })
        });

        if (response.ok) {
          alert('삭제 요청 되었습니다.');
          fetchUserList();
        } else {
          const err = await response.json();
          alert(err.message || '삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        alert('서버와 통신할 수 없습니다.');
      }
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'N': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px]">대기</Badge>;
      case 'C': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">변경 요청</Badge>;
      case 'R': return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">반려됨</Badge>;
      case 'A': return <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">승인완료</Badge>;
      default: return null;
    }
  };

  const filteredUsers = users.filter(user =>
    (user.userName || '').includes(searchText) ||
    (user.userId || '').includes(searchText) ||
    (user.email || '').includes(searchText)
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header & Search 생략... 동일함 */}
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

      {loading ? (
        <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const isPending = user.status === 'N' || user.status === 'C';
            
            return (
              <Card 
                key={user.userId} 
                className={`p-5 hover:border-gray-400 transition-all shadow-sm ${user.status === 'R' ? 'bg-red-50/30 border-red-100' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                      user.status === 'R' ? 'bg-red-100 border-red-200' : 'bg-indigo-50 border-indigo-100'
                    }`}>
                      <span className={`font-semibold text-lg ${user.status === 'R' ? 'text-red-600' : 'text-indigo-600'}`}>
                        {user.userName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${user.status === 'R' ? 'text-red-900' : 'text-gray-900'}`}>{user.userName}</h3>
                        {renderStatusBadge(user.status)}
                      </div>
                      <p className="text-xs text-gray-400">{user.userId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenModal(user)} 
                      className={`h-8 w-8 p-0 ${isPending ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <Edit2 className={`w-3.5 h-3.5 ${isPending ? 'text-gray-300' : 'text-gray-500'}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(user)} 
                      className={`h-8 w-8 p-0 ${isPending ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-600'}`}
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${isPending ? 'text-gray-300' : ''}`} />
                    </Button>
                  </div>
                </div>

                {isPending && (
                  <div className="mb-3 px-2 py-1.5 bg-yellow-50 rounded text-[11px] text-yellow-600 flex items-center gap-1.5 border border-yellow-100">
                    <AlertCircle className="w-3 h-3" />
                    <span>현재 승인 대기 중으로 정보 수정이 제한됩니다.</span>
                  </div>
                )}

                {user.status === 'R' && (
                  <div className="mb-3 px-2 py-1.5 bg-red-100/50 rounded text-[11px] text-red-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>정보를 수정하여 다시 등록 신청해주세요.</span>
                  </div>
                )}

                <div className="space-y-2 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col text-gray-900">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-semibold">{editingUser ? '담당자 수정' : '신규 담당자 등록'}</h2>
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
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">
                  {editingUser ? '비밀번호 변경 (변경 시에만 입력)' : '초기 비밀번호 *'}
                </label>
                <div className="relative">
                  <Input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder={editingUser ? "새 비밀번호 입력" : "비밀번호 입력"} 
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                {editingUser && (
                  <p className="text-[10px] text-gray-400 ml-1">정보만 수정하시려면 비밀번호란을 비워두세요.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">이메일 *</label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">연락처 *</label>
                <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseModal}>취소</Button>
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