'use client';

import React, { useState, useEffect } from 'react';
import { User, Building2, Lock, Phone, Mail, Save, X, Shield, Briefcase } from 'lucide-react';
import { Card, Input, Button } from '@/components/ui';
import { toast } from 'sonner';
import { mypageApi } from '@/lib/api/mypage';

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
    userType: '',
    role: '',
    companyCode: '',
    companyName: '',
    departmentCode: '',
    departmentName: '',
    userId: '',
    password: '',
    passwordConfirm: '',
    userNameKo: '',
    userNameEn: '',
    phone: '',
    email: '',
    mobile: '',
    fax: '',
  });

  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        setIsLoading(true);
        const data = await mypageApi.getInitData();

     
        
        setForm({
          userType: data.userType || '',
          role: data.role || '',
          companyCode: data.companyCode || '',
          companyName: data.companyName || '',
          departmentCode: data.departmentCode || '',
          departmentName: data.departmentName || '',
          userId: data.userId || '',
          password: '',
          passwordConfirm: '',
          userNameKo: data.userNameKo || '',
          userNameEn: data.userNameEn || '',
          phone: data.phone || '',
          email: data.email || '',
          mobile: data.mobile || '',
          fax: data.fax || '',
        });
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        toast.error('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitData();
  }, []);

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
    
    if (!validateForm()) {
      toast.error('입력값을 확인해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      
      // 업데이트할 데이터만 전송 (비밀번호는 입력했을 때만)
      const updateData: any = {
        userNameEn: form.userNameEn,
        phone: form.phone,
        email: form.email,
        fax: form.fax,
      };
      
      // 비밀번호가 입력되었을 때만 포함
      if (form.password && form.password.trim()) {
        updateData.password = form.password;
      }
      
      console.log('프로필 업데이트 요청:', updateData);
      
      await mypageApi.updateProfile(updateData);
      
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      
      // 비밀번호 필드 초기화
      setForm(prev => ({
        ...prev,
        password: '',
        passwordConfirm: '',
      }));
      
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      const errorMessage = error?.response?.data?.error || '프로필 업데이트에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-500">사용자 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">

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
