'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Save } from 'lucide-react';

export default function VendorProfilePage() {
  const [formData, setFormData] = useState({
    userName: '홍길동',
    userId: 'vendor01',
    email: 'vendor@partner.com',
    phone: '010-1234-5678',
    department: '영업팀',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('프로필이 저장되었습니다.');
    setIsEditing(false);
  };

  const inputClassName = (editable: boolean) => `
    w-full px-4 py-3 rounded-lg text-sm transition-all
    ${editable 
      ? 'bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
      : 'bg-gray-100 border border-gray-100 cursor-not-allowed text-gray-600'
    }
  `;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로필</h1>
          <p className="text-gray-500 mt-1">내 계정 정보를 확인하고 수정합니다.</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            수정하기
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{formData.userName}</h2>
              <p className="text-emerald-100">{formData.department} · 담당자</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">사용자명</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClassName(isEditing)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">아이디</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              disabled
              className={inputClassName(false)}
            />
            <p className="text-xs text-gray-400 mt-1">아이디는 변경할 수 없습니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                이메일
              </div>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClassName(isEditing)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                연락처
              </div>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClassName(isEditing)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">부서</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClassName(isEditing)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
