'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div 
      className="max-w-4xl space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Toaster richColors position="top-center" />

      {/* Page Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">내 정보 수정</h1>
            <p className="text-stone-500">개인 정보를 확인하고 수정할 수 있습니다.</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl">
            {form.userNameKo.charAt(0)}
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">{form.userNameKo}</h2>
            <p className="text-blue-100">{form.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {form.userType}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {form.role}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">기본 정보</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </motion.div>

        {/* 비밀번호 변경 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">비밀번호 변경</h3>
            </div>
            
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
        </motion.div>

        {/* 연락처 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">연락처 정보</h3>
            </div>
            
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
        </motion.div>

        {/* Submit Buttons */}
        <motion.div 
          className="flex justify-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button type="button" variant="secondary" icon={<X className="w-4 h-4" />}>
            취소
          </Button>
          <Button type="submit" variant="primary" loading={isSaving} icon={<Save className="w-4 h-4" />}>
            저장
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
