'use client';

import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, X, Save } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';

// 임시 Mock 데이터
const mockUsers = [
  {
    id: '1',
    userName: '홍길동',
    userId: 'vendor01',
    email: 'hong@partner.com',
    phone: '010-1234-5678',
    department: '영업팀',
    role: '담당자',
    isMain: true,
  },
  {
    id: '2',
    userName: '김철수',
    userId: 'vendor02',
    email: 'kim@partner.com',
    phone: '010-2345-6789',
    department: '관리팀',
    role: '담당자',
    isMain: false,
  },
  {
    id: '3',
    userName: '이영희',
    userId: 'vendor03',
    email: 'lee@partner.com',
    phone: '010-3456-7890',
    department: '영업팀',
    role: '담당자',
    isMain: false,
  },
];

export default function VendorUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof mockUsers[0] | null>(null);
  const [searchText, setSearchText] = useState('');
  
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    email: '',
    phone: '',
    department: '',
  });

  const handleOpenModal = (user?: typeof mockUsers[0]) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        userName: user.userName,
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        department: user.department,
      });
    } else {
      setEditingUser(null);
      setFormData({
        userName: '',
        userId: '',
        email: '',
        phone: '',
        department: '',
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

  const handleSave = () => {
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
      alert('담당자 정보가 수정되었습니다.');
    } else {
      const newUser = {
        id: String(users.length + 1),
        ...formData,
        role: '담당자',
        isMain: false,
      };
      setUsers(prev => [...prev, newUser]);
      alert('담당자가 추가되었습니다.');
    }
    handleCloseModal();
  };

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.isMain) {
      alert('대표 담당자는 삭제할 수 없습니다.');
      return;
    }
    if (confirm('해당 담당자를 삭제하시겠습니까?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('담당자가 삭제되었습니다.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.userName.includes(searchText) ||
    user.userId.includes(searchText) ||
    user.email.includes(searchText)
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
            <p className="text-sm text-gray-500">협력사 소속 담당자를 관리합니다.</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          담당자 추가
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 아이디, 이메일로 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <span className="text-gray-700 font-semibold text-lg">{user.userName.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{user.userName}</h3>
                    {user.isMain && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">대표</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.department}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)} className="h-8 w-8 p-0">
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </Button>
                {!user.isMain && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-50">
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
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-500">등록된 담당자가 없습니다.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUser ? '담당자 수정' : '담당자 추가'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">사용자명 *</label>
                <Input
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">아이디 *</label>
                <Input
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  disabled={!!editingUser}
                  className={editingUser ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
                  placeholder="user01"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">이메일 *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@partner.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">연락처 *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">부서</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="영업팀"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                취소
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editingUser ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
