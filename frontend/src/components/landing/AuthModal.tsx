'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Search } from 'lucide-react';

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

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

interface VendorFormData {
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
  userName: string;
  userId: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSwitchMode }) => {
  const [formData, setFormData] = useState<VendorFormData>({
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
    userName: '',
    userId: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 다음 우편번호 검색
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 도로명 주소 + 건물명 조합
        let fullAddress = data.roadAddress;
        if (data.buildingName) {
          fullAddress += ` (${data.buildingName})`;
        }

        setFormData(prev => ({
          ...prev,
          zipCode: data.zonecode,
          address: fullAddress,
        }));
      }
    }).open();
  };

  const inputClassName = "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-2.5 transition-all outline-none";
  const labelClassName = "block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#fdfbf7]/80 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={`relative w-full ${mode === 'signup' ? 'max-w-2xl' : 'max-w-md'} bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {/* Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-md hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 overflow-y-auto flex-1">
          <div className="text-center mb-6">
            {mode === 'signup' && (
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {mode === 'login' ? '로그인' : '협력사 회원가입'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'login' ? 'ID / PW 입력' : '협력사 회원가입을 위해 아래 정보를 입력해주세요.'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {mode === 'signup' ? (
              <>
                {/* 협력사 정보 섹션 */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-3">
                    협력사 정보
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 협력사명 */}
                    <div>
                      <label className={labelClassName}>협력사명 *</label>
                      <input 
                        type="text"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="(주)협력사"
                        required
                      />
                    </div>

                    {/* 협력사명 (영문) */}
                    <div>
                      <label className={labelClassName}>협력사명 (영문)</label>
                      <input 
                        type="text"
                        name="vendorNameEn"
                        value={formData.vendorNameEn}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="Vendor Co., Ltd."
                      />
                    </div>

                    {/* 사업형태 */}
                    <div>
                      <label className={labelClassName}>사업형태 *</label>
                      <select 
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className={inputClassName}
                        required
                      >
                        <option value="">선택해주세요</option>
                        <option value="법인">법인</option>
                        <option value="개인">개인</option>
                        <option value="일반과세자">일반과세자</option>
                        <option value="간이과세자">간이과세자</option>
                      </select>
                    </div>

                    {/* 사업자등록번호 */}
                    <div>
                      <label className={labelClassName}>사업자등록번호 *</label>
                      <input 
                        type="text"
                        name="businessNo"
                        value={formData.businessNo}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="000-00-00000"
                        required
                      />
                    </div>

                    {/* 대표자명 */}
                    <div>
                      <label className={labelClassName}>대표자명 *</label>
                      <input 
                        type="text"
                        name="ceoName"
                        value={formData.ceoName}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="홍길동"
                        required
                      />
                    </div>

                    {/* 업종 */}
                    <div>
                      <label className={labelClassName}>업종 *</label>
                      <input 
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="제조업, IT서비스 등"
                        required
                      />
                    </div>
                  </div>

                  {/* 주소 */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className={labelClassName}>우편번호 *</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={`${inputClassName} flex-1`}
                            placeholder="00000"
                            readOnly
                          />
                          <button 
                            type="button"
                            onClick={handleAddressSearch}
                            className="px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm rounded-lg transition-colors flex items-center gap-1 font-medium"
                          >
                            <Search className="w-4 h-4" />
                            검색
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelClassName}>기본주소 *</label>
                      <input 
                        type="text"
                        name="address"
                        value={formData.address}
                        className={`${inputClassName} bg-slate-100 cursor-not-allowed`}
                        placeholder="우편번호 검색 시 자동 입력됩니다"
                        readOnly
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClassName}>상세주소</label>
                      <input 
                        type="text"
                        name="addressDetail"
                        value={formData.addressDetail}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="동/호수 등 상세주소를 입력해주세요"
                      />
                    </div>
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label className={labelClassName}>전화번호 *</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="02-0000-0000"
                      required
                    />
                  </div>
                </div>

                {/* 계정 정보 섹션 */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-3">
                    계정 정보
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClassName}>사용자명 *</label>
                      <input 
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="홍길동"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>아이디 *</label>
                      <input 
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="영문, 숫자 조합 6자 이상"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClassName}>이메일 *</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="example@company.com"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>비밀번호 *</label>
                      <input 
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>비밀번호 확인 *</label>
                      <input 
                        type="password"
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelClassName}>아이디</label>
                  <input 
                    type="text" 
                    className={inputClassName}
                    placeholder="ID"
                  />
                </div>

                <div>
                  <label className={labelClassName}>비밀번호</label>
                  <input 
                    type="password" 
                    className={inputClassName}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors shadow-lg shadow-indigo-500/30"
            >
              {mode === 'login' ? '로그인' : '회원가입 신청'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <button onClick={() => onSwitchMode('signup')} className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline">
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button onClick={() => onSwitchMode('login')} className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline">
                  로그인
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;

