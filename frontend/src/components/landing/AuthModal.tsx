'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { login } = useAuth();

  // 로그인 폼 상태
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 회원가입 폼 상태
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

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(loginId, loginPassword);
      toast.success('로그인 성공');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 첨부
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      e.target.value = '';
      toast.message(`${filesArray.length}개 파일이 추가되었습니다.`);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.message('파일이 제거되었습니다.');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.passwordConfirm) {
        const msg = '비밀번호가 일치하지 않습니다.';
        setError(msg);
        toast.error(msg);
        return;
      }

      const response = await fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resultText = await response.text();

      if (!response.ok) {
        let serverMsg = resultText;
        try {
          const errorJson = JSON.parse(resultText);
          serverMsg = errorJson.data ? (Object.values(errorJson.data)[0] as string) : errorJson.message;
        } catch {
          // JSON이 아니면 원문 유지
        }
        throw new Error(serverMsg);
      }

      const generatedVendorCode = resultText.trim();
      if (!generatedVendorCode) {
        throw new Error('업체코드를 확인할 수 없습니다.');
      }

      let fileUploadFailed = false;
      if (selectedFiles.length > 0) {
        try {
          const fileFormData = new FormData();
          selectedFiles.forEach((file) => fileFormData.append('file', file));

          const fileRes = await fetch(`/api/v1/signup/files/${generatedVendorCode}`, {
            method: 'POST',
            body: fileFormData,
          });

          if (!fileRes.ok) {
            throw new Error('서류 업로드 중 오류가 발생했습니다.');
          }

          toast.success('서류 업로드 완료');
        } catch (fileErr: any) {
          console.error('파일 업로드 오류:', fileErr);
          toast.warning('가입 신청은 완료되었으나 서류 업로드에 실패했습니다. 관리자에게 문의하세요.');
          fileUploadFailed = true;
        }
      }

      if (!fileUploadFailed) {
        toast.success('회원가입 신청이 완료되었습니다.');
      } else {
        toast.message('회원가입 신청은 접수되었습니다.');
      }

      setFormData({
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

      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      onSwitchMode('login');
    } catch (err: any) {
      const msg = err?.message || '가입 중 오류가 발생했습니다.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 다음 우편번호 검색
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      toast.info('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.roadAddress;
        if (data.buildingName) {
          fullAddress += ` (${data.buildingName})`;
        }

        setFormData((prev) => ({
          ...prev,
          zipCode: data.zonecode,
          address: fullAddress,
        }));

        toast.success('주소가 입력되었습니다.');
      },
    }).open();
  };

  // ============================================
  // 스타일 (파스텔 인디고 테마)
  // ============================================
  const inputClassName = "w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-[#a5b4fc] focus:border-transparent block p-2.5 transition-all outline-none hover:bg-white hover:shadow-inner placeholder:text-slate-400";
  const labelClassName = "block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 selection:bg-[#e0e7ff] selection:text-[#4338ca]">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
      />

      {/* Modal Content - Glassy & 3D Effect */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full ${mode === 'signup' ? 'max-w-2xl' : 'max-w-md'} 
          bg-white/95 backdrop-blur-xl border border-white/40 
          rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col
          ring-1 ring-black/5
        `}
        style={{ perspective: '1000px' }}
      >
        {/* Decorative Gradient - Top Bar (Pastel) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#a5b4fc] via-[#818cf8] to-[#a5b4fc]"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100/80 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 overflow-y-auto flex-1">
          <div className="text-center mb-8">
            {mode === 'signup' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                className="flex items-center justify-center mb-4"
              >
                <div className="p-4 bg-[#eef2ff] rounded-2xl shadow-sm">
                  <Building2 className="w-8 h-8 text-[#818cf8]" />
                </div>
              </motion.div>
            )}
            <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Partner Sign Up'}
            </h2>
            <p className="text-slate-500">
              {mode === 'login' ? '로그인을 위해 계정 정보를 입력해주세요.' : '새로운 파트너십을 위한 첫 걸음입니다.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            {mode === 'signup' ? (
              <>
                {/* 협력사 정보 섹션 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="bg-slate-50/50 rounded-xl p-5 space-y-4 border border-slate-200/60"
                >
                  <h3 className="text-sm font-semibold text-[#6366f1] border-b border-[#e0e7ff] pb-2 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
                    협력사 정보
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="px-4 py-2.5 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#6366f1] text-sm rounded-lg transition-colors flex items-center gap-1 font-medium border border-[#c7d2fe]"
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
                </motion.div>
                
                {/* 증빙 서류 첨부 섹션 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60"
                >
                  <label className="text-sm font-medium text-slate-700">첨부파일 (다중 선택 가능)</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-md transition-colors font-medium"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        파일 추가
                      </button>

                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        multiple 
                        onChange={handleFileChange}
                      />
                      
                      <p className="text-xs text-slate-500">
                        사업자등록증 등 필수 서류를 첨부해주세요.
                      </p>
                    </div>

                    {selectedFiles.length > 0 && (
                      <ul className="bg-white border rounded-md divide-y divide-slate-200 shadow-sm">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between p-2 px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-sm text-slate-600 truncate max-w-[200px]">{file.name}</span>
                              <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" /> 
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>

                {/* 계정 정보 섹션 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="bg-slate-50/50 rounded-xl p-5 space-y-4 border border-slate-200/60"
                >
                  <h3 className="text-sm font-semibold text-[#6366f1] border-b border-[#e0e7ff] pb-2 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
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
                </motion.div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* 로그인 에러 메시지 */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {error}
                  </div>
                )}

                <div>
                  <label className={labelClassName}>아이디</label>
                  <input 
                    type="text" 
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className={`${inputClassName} py-3.5`}
                    placeholder="ID"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className={labelClassName}>비밀번호</label>
                  <input 
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`${inputClassName} py-3.5`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}

            <motion.button 
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02, translateY: -1 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full text-white font-bold rounded-xl text-md px-5 py-3.5 text-center transition-all shadow-lg flex items-center justify-center gap-2 mt-4 ${
                isLoading 
                  ? 'bg-[#a5b4fc] cursor-not-allowed' 
                  : 'bg-[#818cf8] hover:bg-[#6366f1] shadow-[#818cf8]/30 ring-1 ring-white/20'
              }`}
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {mode === 'login' ? (isLoading ? '로그인 중...' : '로그인') : '회원가입 신청'}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <button onClick={() => onSwitchMode('signup')} className="text-[#6366f1] hover:text-[#4f46e5] font-semibold hover:underline ml-1">
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button onClick={() => onSwitchMode('login')} className="text-[#6366f1] hover:text-[#4f46e5] font-semibold hover:underline ml-1">
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
