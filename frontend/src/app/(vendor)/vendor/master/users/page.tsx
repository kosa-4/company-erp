'use client';

import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Mail, Phone, X, Save } from 'lucide-react';

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

  const inputClassName = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">담당자관리</h1>
          <p className="text-gray-500 mt-1">협력사 소속 담당자를 관리합니다.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          담당자 추가
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 아이디, 이메일로 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold">{user.userName.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{user.userName}</h3>
                    {user.isMain && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        대표
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.department}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal(user)}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!user.isMain && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 담당자가 없습니다.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? '담당자 수정' : '담당자 추가'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">사용자명 *</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">아이디 *</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  disabled={!!editingUser}
                  className={editingUser ? "w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed" : inputClassName}
                  placeholder="user01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">이메일 *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="example@partner.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">연락처 *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">부서</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="영업팀"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingUser ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
