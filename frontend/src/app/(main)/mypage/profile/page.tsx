'use client';

import React, { useState } from 'react';
import { PageHeader, Card, Input, Button } from '@/components/ui';

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
    
    // 에러 초기화
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
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    alert('저장되었습니다.');
  };

  return (
    <div className="max-w-4xl">
      <PageHeader 
        title="내 정보 수정" 
        subtitle="개인 정보를 확인하고 수정할 수 있습니다."
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            기본 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="사용자 구분"
              name="userType"
              value={form.userType}
              readOnly
            />
            <Input
              label="업무 권한"
              name="role"
              value={form.role}
              readOnly
            />
            <Input
              label="회사코드"
              name="companyCode"
              value={form.companyCode}
              readOnly
            />
            <Input
              label="회사명"
              name="companyName"
              value={form.companyName}
              readOnly
            />
            <Input
              label="부서코드"
              name="departmentCode"
              value={form.departmentCode}
              readOnly
            />
            <Input
              label="부서명"
              name="departmentName"
              value={form.departmentName}
              readOnly
            />
            <Input
              label="사용자 ID"
              name="userId"
              value={form.userId}
              readOnly
            />
            <Input
              label="사용자명(국문)"
              name="userNameKo"
              value={form.userNameKo}
              readOnly
            />
          </div>
        </Card>

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

        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            연락처 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            />
            <Input
              label="이메일"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
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

