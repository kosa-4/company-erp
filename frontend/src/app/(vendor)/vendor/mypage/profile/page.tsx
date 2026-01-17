'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle, Save, Key } from 'lucide-react';
import { Card, Input, Button, Badge } from '@/components/ui';
import { vendorMypageApi } from '@/lib/api/vendorMypage';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// 다음 우편번호 API 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          roadAddress: string;
          jibunAddress: string;
          buildingName: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

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
  const { user: authUser } = useAuth();
  const [form, setForm] = useState<VendorProfileForm>({
    // 협력사 정보
    vendorName: '',
    vendorNameEn: '',
    businessType: '',
    businessNo: '',
    ceoName: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    phone: '',
    industry: '',
    // 계정 정보
    userName: '',
    userId: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [errors, setErrors] = useState<Partial<VendorProfileForm>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        setIsLoading(true);
        const data = await vendorMypageApi.getUserInfo();
        
        console.log('협력사 사용자 정보 조회 성공:', data);
        
        setForm(prev => ({
          ...prev,
          userName: data.userName || '',
          userId: authUser?.userId || '', // 세션에서 userId 가져오기
          email: data.email || '',
          vendorName: data.vendorName || '',
          vendorNameEn: data.vendorNameEn || '',
          businessNo: data.businessNo || '',
          address: data.address || '',
          zipCode: data.zipCode || '',
          ceoName: data.ceoName || '',
          industry: data.industry || '',
          phone: data.phone || '',
        }));
      } catch (error: any) {
        console.error('초기 데이터 로드 실패:', error);
        toast.error(error?.data?.error || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitData();
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof VendorProfileForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // 다음 우편번호 검색
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      toast.error('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 도로명 주소 + 건물명 조합
        let fullAddress = data.roadAddress;
        if (data.buildingName) {
          fullAddress += ` (${data.buildingName})`;
        }

        setForm(prev => ({
          ...prev,
          zipCode: data.zonecode,
          address: fullAddress,
        }));
      }
    }).open();
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
    try {
      // 비밀번호가 입력된 경우에만 비밀번호 업데이트 API 호출
      if (form.password && form.password.trim() !== '') {
        await vendorMypageApi.updatePassword(form.password);
        toast.success('비밀번호가 변경되었습니다.');
        
        // 비밀번호 필드 초기화
        setForm(prev => ({
          ...prev,
          password: '',
          passwordConfirm: '',
        }));
      } else {
        toast.info('변경할 내용이 없습니다.');
      }
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      toast.error(error?.data?.error || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
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
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      className="whitespace-nowrap"
                                      onClick={handleAddressSearch}
                                    >
                                        우편번호 검색
                                    </Button>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 gap-2">
                                <Input
                                    name="address"
                                    value={form.address}
                                    readOnly
                                    className="bg-gray-50 text-gray-500"
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
                                placeholder="로그인 시 확인 가능"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">사용자명</label>
                            <Input
                                name="userName"
                                value={form.userName}
                                readOnly
                                className="bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500">이메일</label>
                            <Input
                                name="email"
                                type="email"
                                value={form.email}
                                readOnly
                                className="bg-gray-50 text-gray-500"
                            />
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
