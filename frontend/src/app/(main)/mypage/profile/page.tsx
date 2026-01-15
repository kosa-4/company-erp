'use client';

import React, { useState } from 'react';
import { User, Building2, Lock, Phone, Mail, Save, X, Shield, Briefcase } from 'lucide-react';
import { Card, Input, Button } from '@/components/ui';
import { toast, Toaster } from 'sonner';

interface ProfileForm {
  userType: string;
  role: string;
  companyCode: string;
  companyName: string;
  departmentCode: string;
  departmentName: string;
  userId: string;
  password: string;
  passwordConfirm: string;
  userNameKo: string;
  userNameEn: string;
  phone: string;
  email: string;
  mobile: string;
  fax: string;
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    userType: '구매사',
    role: '담당자',
    companyCode: 'COMP001',
    companyName: '(주)테스트회사',
    departmentCode: 'DEPT001',
    departmentName: '구매팀',
    userId: 'hong.gildong',
    password: '',
    passwordConfirm: '',
    userNameKo: '홍길동',
    userNameEn: 'Hong Gildong',
    phone: '02-1234-5678',
    email: 'hong.gildong@company.com',
    mobile: '010-1234-5678',
    fax: '02-1234-5679',
  });

  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof ProfileForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ProfileForm> = {};

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
    toast.success('저장되었습니다.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Toaster richColors position="top-center" />

      {/* Page Header - 무채색 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">내 정보 수정</h1>
          <p className="text-sm text-gray-500">개인 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
      </div>

      {/* Profile Card - 무채색 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {form.userNameKo.charAt(0)}
          </div>
          <div className="text-white">
            <h2 className="text-xl font-semibold">{form.userNameKo}</h2>
            <p className="text-gray-300 text-sm">{form.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-gray-600 rounded text-xs">
                {form.userType}
              </span>
              <span className="px-2 py-0.5 bg-gray-600 rounded text-xs">
                {form.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900">기본 정보</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="사용자 구분" name="userType" value={form.userType} readOnly 
              leftIcon={<Shield className="w-4 h-4" />} />
            <Input label="업무 권한" name="role" value={form.role} readOnly 
              leftIcon={<Briefcase className="w-4 h-4" />} />
            <Input label="회사코드" name="companyCode" value={form.companyCode} readOnly />
            <Input label="회사명" name="companyName" value={form.companyName} readOnly />
            <Input label="부서코드" name="departmentCode" value={form.departmentCode} readOnly />
            <Input label="부서명" name="departmentName" value={form.departmentName} readOnly />
            <Input label="사용자 ID" name="userId" value={form.userId} readOnly />
            <Input label="사용자명(국문)" name="userNameKo" value={form.userNameKo} readOnly />
          </div>
        </Card>

        {/* 비밀번호 변경 */}
        <Card>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900">비밀번호 변경</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* 연락처 정보 */}
        <Card>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900">연락처 정보</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="사용자명(영문)"
              name="userNameEn"
              value={form.userNameEn}
              onChange={handleChange}
            />
            <Input
              label="전화번호"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="02-0000-0000"
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="이메일"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="휴대폰"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              placeholder="010-0000-0000"
            />
            <Input
              label="팩스번호"
              name="fax"
              type="tel"
              value={form.fax}
              onChange={handleChange}
              placeholder="02-0000-0000"
            />
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" icon={<X className="w-4 h-4" />}>
            취소
          </Button>
          <Button type="submit" variant="primary" loading={isSaving} icon={<Save className="w-4 h-4" />}>
            저장
          </Button>
        </div>
      </form>
    </div>
  );
}
