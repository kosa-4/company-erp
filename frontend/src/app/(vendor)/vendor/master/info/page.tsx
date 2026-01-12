'use client';

import React, { useState } from 'react';
import { Building2, Save, Search, MapPin, Phone, FileText, AlertCircle } from 'lucide-react';

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
    if (!changeReason.trim()) {
      alert('변경 사유를 입력해주세요.');
      return;
    }
    alert('협력업체 변경 신청이 접수되었습니다.\n관리자 승인 후 반영됩니다.');
  };

  const inputClassName = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";
  const labelClassName = "block text-sm font-medium text-gray-600 mb-2";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">협력업체 변경신청</h1>
        <p className="text-gray-500 mt-1">협력업체 정보 변경을 신청합니다. 관리자 승인 후 반영됩니다.</p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">변경 신청 안내</p>
          <p className="text-sm text-amber-700 mt-1">
            사업자등록번호는 변경할 수 없습니다. 변경이 필요한 경우 담당자에게 문의해주세요.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">협력업체 정보</h2>
              <p className="text-sm text-gray-500">현재 등록된 정보를 수정합니다.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>협력사명 *</label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>협력사명 (영문)</label>
              <input
                type="text"
                name="vendorNameEn"
                value={formData.vendorNameEn}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>사업형태 *</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="법인">법인</option>
                <option value="개인">개인</option>
                <option value="일반과세자">일반과세자</option>
                <option value="간이과세자">간이과세자</option>
              </select>
            </div>
            <div>
              <label className={labelClassName}>사업자등록번호</label>
              <input
                type="text"
                name="businessNo"
                value={formData.businessNo}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className={labelClassName}>대표자명 *</label>
              <input
                type="text"
                name="ceoName"
                value={formData.ceoName}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>업종 *</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>

          {/* 주소 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">주소</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="우편번호"
                className="w-32 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm"
                readOnly
              />
              <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Search className="w-4 h-4" />
                검색
              </button>
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="기본주소"
              className={inputClassName}
            />
            <input
              type="text"
              name="addressDetail"
              value={formData.addressDetail}
              onChange={handleChange}
              placeholder="상세주소"
              className={inputClassName}
            />
          </div>

          {/* 연락처 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <label className="font-medium text-gray-700">전화번호 *</label>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          {/* 변경 사유 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <label className="font-medium text-gray-700">변경 사유 *</label>
            </div>
            <textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="변경 사유를 입력해주세요."
              rows={3}
              className={inputClassName}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            변경 신청
          </button>
        </div>
      </div>
    </div>
  );
}
