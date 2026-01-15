'use client';

import React, { useState } from 'react';
import { UserCircle, Save, Key } from 'lucide-react';
import { Card, Input, Button, Badge } from '@/components/ui';

interface VendorProfileForm {
  // 협력사 정보
  vendorName: string;
  vendorNameEn: string;
  businessType: string;
  businessNo: string;
  ceoName: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  phone: string;
  industry: string;
  // 계정 정보
  userName: string;
  userId: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export default function VendorProfilePage() {
  const [form, setForm] = useState<VendorProfileForm>({
    // 협력사 정보
    vendorName: '(주)협력사',
    vendorNameEn: 'Vendor Co., Ltd.',
    businessType: '법인',
    businessNo: '123-45-67890',
    ceoName: '홍길동',
    zipCode: '06234',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '협력빌딩 5층',
    phone: '02-1234-5678',
    industry: 'IT서비스',
    // 계정 정보
    userName: '홍길동',
    userId: 'vendor01',
    email: 'vendor@partner.com',
    password: '',
    passwordConfirm: '',
  });

  const [errors, setErrors] = useState<Partial<VendorProfileForm>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof VendorProfileForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<VendorProfileForm> = {};

    if (form.password && form.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (form.password && form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('저장되었습니다.');
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">내 정보 수정</h1>
          <p className="text-sm text-gray-500">협력사 및 계정 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Vendor Info */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-900">협력사 정보</h2>
                    </div>
                    <div className="p-6 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">협력사명</label>
                                <Input
                                    name="vendorName"
                                    value={form.vendorName}
                                    readOnly
                                    className="bg-gray-50 text-gray-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">협력사명 (영문)</label>
                                <Input
                                    name="vendorNameEn"
                                    value={form.vendorNameEn}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">사업자등록번호</label>
                                <Input
                                    name="businessNo"
                                    value={form.businessNo}
                                    readOnly
                                    className="bg-gray-50 text-gray-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">대표자명</label>
                                <Input
                                    name="ceoName"
                                    value={form.ceoName}
                                    onChange={handleChange}
                                />
                            </div>
                             <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">사업형태</label>
                                <select
                                    name="businessType"
                                    value={form.businessType}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="법인">법인</option>
                                    <option value="개인">개인</option>
                                    <option value="일반과세자">일반과세자</option>
                                    <option value="간이과세자">간이과세자</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">업종</label>
                                <Input
                                    name="industry"
                                    value={form.industry}
                                    onChange={handleChange}
                                />
                            </div>
                         </div>
                         
                         <div className="h-px bg-gray-100" />
                         
                         <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">주소</label>
                                <div className="flex gap-2 max-w-xs">
                                    <Input
                                        name="zipCode"
                                        value={form.zipCode}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                    <Button type="button" variant="outline" className="whitespace-nowrap">
                                        우편번호 검색
                                    </Button>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                    name="address"
                                    value={form.address}
                                    readOnly
                                    className="bg-gray-50"
                                />
                                <Input
                                    name="addressDetail"
                                    value={form.addressDetail}
                                    onChange={handleChange}
                                    placeholder="상세주소 입력"
                                />
                            </div>
                         </div>

                         <div className="space-y-1.5">
                             <label className="text-xs font-medium text-gray-500">대표 전화번호</label>
                             <Input
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                className="max-w-md"
                             />
                         </div>
                    </div>
                </Card>
            </div>

            {/* Right Column: Account Info & Password */}
            <div className="space-y-6">
                <Card>
                   <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-900">계정 정보</h2>
                    </div>
                    <div className="p-6 space-y-4">
                         <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">아이디</label>
                            <Input
                                name="userId"
                                value={form.userId}
                                readOnly
                                className="bg-gray-50 text-gray-500"
                            />
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">사용자명</label>
                            <Input
                                name="userName"
                                value={form.userName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">이메일</label>
                            <Input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <h2 className="font-semibold text-gray-900">비밀번호 변경</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">새 비밀번호</label>
                            <Input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="8자 이상 입력"
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">비밀번호 확인</label>
                            <Input
                                name="passwordConfirm"
                                type="password"
                                value={form.passwordConfirm}
                                onChange={handleChange}
                                placeholder="비밀번호 재입력"
                            />
                             {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>}
                        </div>
                    </div>
                </Card>
            </div>
         </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            취소
          </Button>
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
            저장하기
          </Button>
        </div>
      </form>
    </div>
  );
}
