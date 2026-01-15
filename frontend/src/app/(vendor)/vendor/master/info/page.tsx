'use client';

import React, { useState } from 'react';
import { Building2, Save, Search, MapPin, Phone, FileText, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';

export default function VendorInfoChangePage() {
  const [formData, setFormData] = useState({
    vendorName: '(주)협력사',
    vendorNameEn: 'Partner Co., Ltd.',
    businessType: '법인',
    businessNo: '123-45-67890',
    ceoName: '김대표',
    zipCode: '06234',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '협력빌딩 5층',
    phone: '02-1234-5678',
    industry: 'IT서비스',
  });

  const [changeReason, setChangeReason] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    handleRequestChange();
  };

  // 수정 요청
  const handleRequestChange =  async () => {
    // 1. 변경 사유 작성 필수
    if (!changeReason.trim()) {
      alert('변경 사유를 입력해주세요.');
      return;
    }

    // 2. 변경 사유 추가
    const updatedData = { ...formData, remark:changeReason };
    
    // 3.API 요청
    try{
      const response = await fetch('/api/v1/vendors/users/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
  
      // 4. 응답 처리
      if(!response.ok) {
        alert('변경 신청에 실패했습니다.');
        return;
      }
  
      alert('협력업체 변경 신청이 접수되었습니다.\n관리자 승인 후 반영됩니다.');
    } catch (error) {
      console.error('변경 신청 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">협력업체 변경신청</h1>
          <p className="text-sm text-gray-500">협력업체 정보 변경을 신청합니다. 관리자 승인 후 반영됩니다.</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-900">변경 신청 안내</p>
          <p className="text-sm text-gray-600 mt-1">
            사업자등록번호는 변경할 수 없습니다. 변경이 필요한 경우 담당자에게 문의해주세요.
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">협력업체 정보</h2>
            <div className="h-4 w-px bg-gray-200" />
            <p className="text-sm text-gray-500">현재 등록된 정보를 수정합니다.</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-gray-900 rounded-full"/>
              기본 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">협력사명 *</label>
                <Input
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">협력사명 (영문)</label>
                <Input
                  name="vendorNameEn"
                  value={formData.vendorNameEn}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">사업형태 *</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="법인">법인</option>
                  <option value="개인">개인</option>
                  <option value="일반과세자">일반과세자</option>
                  <option value="간이과세자">간이과세자</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">사업자등록번호</label>
                <Input
                  name="businessNo"
                  value={formData.businessNo}
                  disabled
                  className="bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">대표자명 *</label>
                <Input
                  name="ceoName"
                  value={formData.ceoName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">업종 *</label>
                <Input
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100" />

          {/* 주소 및 연락처 */}
          <section>
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gray-900 rounded-full"/>
                주소 및 연락처
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">주소</label>
                        <div className="flex gap-2 max-w-md">
                            <Input
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                placeholder="우편번호"
                                readOnly
                                className="w-32 bg-gray-50"
                            />
                            <Button variant="outline" className="gap-2">
                                <Search className="w-3.5 h-3.5" />
                                검색
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            <Input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="기본주소"
                            />
                            <Input
                                name="addressDetail"
                                value={formData.addressDetail}
                                onChange={handleChange}
                                placeholder="상세주소"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">전화번호 *</label>
                    <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
            </div>
          </section>

          <div className="h-px bg-gray-100" />

          {/* 변경 사유 */}
          <section>
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gray-900 rounded-full"/>
                변경 사유
            </h3>
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">상세 사유 *</label>
                <textarea
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="변경 사유를 상세히 입력해주세요."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <Button
            onClick={handleSubmit}
            variant="primary"
            icon={<Save className="w-4 h-4" />}
          >
            변경 신청
          </Button>
        </div>
      </Card>
    </div>
  );
}
