'use client';

import React, { useState } from 'react';
import { PageHeader, Card, Input, Button, Select } from '@/components/ui';

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
    
    // 에러 초기화
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
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    alert('저장되었습니다.');
  };

  const businessTypeOptions = [
    { value: '법인', label: '법인' },
    { value: '개인', label: '개인' },
    { value: '일반과세자', label: '일반과세자' },
    { value: '간이과세자', label: '간이과세자' },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader 
        title="내 정보 수정" 
        subtitle="협력사 및 계정 정보를 확인하고 수정할 수 있습니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* 협력사 정보 */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            협력사 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="협력사명"
              name="vendorName"
              value={form.vendorName}
              readOnly
              required
            />
            <Input
              label="협력사명 (영문)"
              name="vendorNameEn"
              value={form.vendorNameEn}
              onChange={handleChange}
            />
            <Select
              label="사업형태"
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              options={businessTypeOptions}
              required
            />
            <Input
              label="사업자등록번호"
              name="businessNo"
              value={form.businessNo}
              readOnly
              helperText="사업자등록번호는 변경할 수 없습니다."
            />
            <Input
              label="대표자명"
              name="ceoName"
              value={form.ceoName}
              onChange={handleChange}
              required
            />
            <Input
              label="업종"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              required
            />
          </div>

          {/* 주소 */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <div className="w-32">
                <Input
                  label="우편번호"
                  name="zipCode"
                  value={form.zipCode}
                  readOnly
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="secondary">
                  검색
                </Button>
              </div>
            </div>
            <Input
              label="기본주소"
              name="address"
              value={form.address}
              readOnly
              required
            />
            <Input
              label="상세주소"
              name="addressDetail"
              value={form.addressDetail}
              onChange={handleChange}
            />
          </div>

          {/* 전화번호 */}
          <div className="mt-6">
            <Input
              label="전화번호"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="02-0000-0000"
              required
            />
          </div>
        </Card>

        {/* 계정 정보 */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            계정 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="사용자명"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              required
            />
            <Input
              label="아이디"
              name="userId"
              value={form.userId}
              readOnly
              helperText="아이디는 변경할 수 없습니다."
            />
            <div className="md:col-span-2">
              <Input
                label="이메일"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>
          </div>
        </Card>

        {/* 비밀번호 변경 */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            비밀번호 변경
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="새 비밀번호"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8자 이상 입력"
              error={errors.password}
              helperText="영문, 숫자, 특수문자 조합 권장"
            />
            <Input
              label="비밀번호 확인"
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력"
              error={errors.passwordConfirm}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary">
            취소
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            저장
          </Button>
        </div>
      </form>
    </div>
  );
}
