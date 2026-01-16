'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Save, Search, MapPin, Phone, FileText, AlertCircle, Lock } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';

export default function VendorInfoChangePage() {
  // 1. DTO 필드명과 100% 일치시킨 초기 상태
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    vendorNameEng: '',   // DTO: vendorNameEng
    businessType: '',    // DTO: businessType (A 또는 B)
    businessNo: '',      // DTO: businessNo
    ceoName: '',         // DTO: ceoName
    zipCode: '',         // DTO: zipCode
    address: '',         // DTO: address
    addressDetail: '',   // DTO: addressDetail
    tel: '',             // DTO: tel
    industry: '',        // DTO: industry
    remark: '',          // DTO: remark
    status: '',
    editable: true,
  });

  const [changeReason, setChangeReason] = useState(''); // 변경 사유(remark에 담김)
  const [loading, setLoading] = useState(true);

  // 2. 초기 데이터 패치
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await fetch('/api/v1/vendor-portal/info', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          // DTO 필드명과 일치하므로 데이터 그대로 세팅
          setFormData(data);
          // 기존에 적혀있던 remark(비고)가 있다면 사유 칸에 미리 보여줄 수도 있음
          if(data.remark) setChangeReason(data.remark);
        } else {
          alert('정보를 불러오지 못했습니다. 다시 로그인해주세요.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestChange = async () => {
    if (!formData.editable) return;
    if (!changeReason.trim()) {
      alert('변경 사유를 입력해주세요.');
      return;
    }

    // DTO 구조와 동일하게 전달
    const requestBody = {
      ...formData,
      remark: changeReason // 상세 사유를 remark 필드에 담아 전송
    };
    
    try {
      const response = await fetch('/api/v1/vendor-portal/info/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });
  
      if (response.ok) {
        alert('협력업체 변경 신청이 접수되었습니다.');
        window.location.reload(); 
      } else {
        alert('신청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-10 text-center">데이터 로딩 중...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Banner 생략 (기존과 동일) */}

      <Card className={`overflow-hidden ${!formData.editable ? 'opacity-85' : ''}`}>
        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-gray-900 rounded-full"/> 기본 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">협력사명 *</label>
                <Input
                  name="vendorName"
                  value={formData.vendorName || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">협력사명 (영문)</label>
                <Input
                  name="vendorNameEng" // DTO 필드명 일치
                  value={formData.vendorNameEng || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">사업형태 *</label>
                <select
                  name="businessType" // DTO 필드명 일치
                  value={formData.businessType || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:bg-gray-100"
                >
                  <option value="">선택</option>
                  <option value="A">개인</option>
                  <option value="B">법인</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">대표자명 *</label>
                <Input
                  name="ceoName" // DTO 필드명 일치
                  value={formData.ceoName || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">전화번호 *</label>
                <Input
                  name="tel" // DTO 필드명 일치 (phone -> tel)
                  value={formData.tel || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">업종 *</label>
                <Input
                  name="industry" // DTO 필드명 일치
                  value={formData.industry || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
            </div>
          </section>

          {/* 주소 섹션 */}
          <section className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">주소 *</label>
                <div className="flex gap-2 w-full max-w-sm">
                    <Input
                        name="zipCode" // DTO 필드명 일치
                        value={formData.zipCode || ''}
                        readOnly
                        className="bg-gray-50"
                    />
                    <Button variant="outline" size="sm" disabled={!formData.editable}>검색</Button>
                </div>
                <Input
                    name="address" // DTO 필드명 일치
                    value={formData.address || ''}
                    onChange={handleChange}
                    disabled={!formData.editable}
                    className="mt-2"
                />
                <Input
                    name="addressDetail" // DTO 필드명 일치
                    value={formData.addressDetail || ''}
                    onChange={handleChange}
                    disabled={!formData.editable}
                    className="mt-2"
                />
             </div>
          </section>

          {/* 변경 사유 */}
          {formData.editable && (
            <section className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-600 rounded-full"/> 변경 사유 입력
              </h3>
              <textarea
                  name="remark"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="변경 사유를 입력하세요."
                  rows={3}
                  className="flex w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </section>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <Button
            onClick={handleRequestChange}
            variant={formData.editable ? "primary" : "outline"}
            disabled={!formData.editable}
          >
            {formData.editable ? "변경 신청 하기" : "승인 심사 대기 중"}
          </Button>
        </div>
      </Card>
    </div>
  );
}