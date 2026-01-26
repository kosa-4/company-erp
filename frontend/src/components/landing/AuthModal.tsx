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

// 서버 응답 데이터 타입 정의 (새로 추가됨)
interface SignupResponse {
  vendorCode: string;
  askNum: string;
  userId: string;
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
  fax: string; // 추가
  email: string;
  foundationDate: string; // 추가
  industry: string;
  remark: string; // 추가
  
  // 계정 정보
  userName: string;
  userId: string;
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
    fax: '',
    email: '',
    foundationDate: '',
    industry: '',
    remark: '',
    userName: '',
    userId: '',
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

  
  // 회원가입 성공 데이터 상태 
  const [signupSuccessData, setSignupSuccessData] = useState<SignupResponse | null>(null);

  // 회원가입 처리 
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. 비밀번호 확인
      if (formData.password !== formData.passwordConfirm) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      // 2. [1차 요청] 회원가입 정보 전송 (JSON)
      const response = await fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(jsonResponse.message || '가입 중 오류가 발생했습니다.');
      }

      // 백엔드에서 온 데이터 (vendorCode, askNum, userId 포함)
      // 백엔드 응답 구조에 따라 jsonResponse.data 혹은 jsonResponse 자체일 수 있음
      const resultData: SignupResponse = jsonResponse.data || jsonResponse;

      if (!resultData || !resultData.vendorCode || !resultData.askNum) {
       throw new Error('응답 데이터에서 업체코드/요청번호를 확인할 수 없습니다.');
      }


      // 3. [2차 요청] 파일 업로드 (Multipart/form-data)
      let fileUploadFailed = false;

      if (selectedFiles.length > 0) {
        try {
          const fileFormData = new FormData();

          // (1) 파일 담기 (@RequestPart("file")에 대응)
          selectedFiles.forEach((file) => fileFormData.append('file', file));

          // (2) 가입 정보를 JSON Blob으로 담기 (@RequestPart("data")에 대응)
          // 중요: 그냥 문자열이 아니라 type을 application/json으로 명시한 Blob이어야 함
          const dtoBlob = new Blob([JSON.stringify(resultData)], {
            type: 'application/json',
          });
          
          fileFormData.append('data', dtoBlob);

          // (3) 전송 (URL에 PathVariable 제거됨)
          const fileRes = await fetch('/api/v1/signup/files', {
            method: 'POST',
            body: fileFormData,
            // headers: Content-Type은 브라우저가 자동으로 'multipart/form-data'로 설정하므로 생략
          });

          if (!fileRes.ok) {
            throw new Error('서류 업로드 중 오류가 발생했습니다.');
          }

          toast.success('서류 업로드 완료');
        } catch (fileErr) {
          console.error('파일 업로드 오류:', fileErr);
          // 가입은 성공했으나 파일만 실패한 경우
          toast.warning('가입은 완료되었으나 서류 업로드에 실패했습니다. 관리자에게 문의하세요.');
          fileUploadFailed = true;
        }
      }

      // 4. 결과 처리
      if (!fileUploadFailed) {
        toast.success('회원가입 신청이 완료되었습니다.');
      }

      // 성공 화면 데이터 설정
      setSignupSuccessData(resultData);

      // 폼 초기화
      setFormData({
        vendorName: '', vendorNameEn: '', businessType: '', businessNo: '', ceoName: '',
        zipCode: '', address: '', addressDetail: '', phone: '', fax: '', email: '',
        foundationDate: '', industry: '', remark: '', userName: '', userId: '',
        password: '', passwordConfirm: ''
      });
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: unknown) {
      let msg = '가입 중 오류가 발생했습니다.';
      if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
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

          <form className="space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            {mode === 'signup' ? (
              <>
                {/* 1. 기본 정보 섹션 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/60"
                >
                  <h3 className="text-sm font-semibold text-[#6366f1] border-b border-[#e0e7ff] pb-2 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
                    기본 정보
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 협력사 코드 (시스템 채번) */}
                    <div>
                      <label className={labelClassName}>협력사코드</label>
                      <input 
                        type="text" 
                        value="-" 
                        className={`${inputClassName} text-slate-400 bg-slate-100`} 
                        readOnly 
                        disabled 
                      />
                    </div>

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

                    {/* 영문 협력사명 */}
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

                    {/* 사업 형태 */}
                    <div>
                      <label className={labelClassName}>사업형태 *</label>
                      <select 
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className={inputClassName}
                        required
                      >
                        <option value="">선택</option>
                        <option value="CORP">법인</option>
                        <option value="INDIVIDUAL">개인</option>
                      </select>
                    </div>

                    {/* 사업자 번호 */}
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
                        placeholder="대표자 성명"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* 2. 주소 및 상세 정보 섹션 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/60"
                >
                  <h3 className="text-sm font-semibold text-[#6366f1] border-b border-[#e0e7ff] pb-2 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
                    주소 및 상세 정보
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 주소 검색 */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex gap-2">
                         <div className="w-1/3">
                            <label className={labelClassName}>우편번호 *</label>
                            <input 
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              className={inputClassName}
                              placeholder="00000"
                              readOnly
                              required
                            />
                         </div>
                         <div className="flex items-end">
                            <button 
                              type="button"
                              onClick={handleAddressSearch}
                              className="h-[42px] px-4 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#6366f1] text-sm rounded-lg transition-colors flex items-center gap-1 font-medium border border-[#c7d2fe]"
                            >
                              <Search className="w-4 h-4" /> 주소 검색
                            </button>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                           <input 
                             type="text"
                             name="address"
                             value={formData.address}
                             className={`${inputClassName} bg-slate-100`}
                             placeholder="기본 주소"
                             readOnly
                             required
                           />
                        </div>
                        <div>
                           <input 
                             type="text"
                             name="addressDetail"
                             value={formData.addressDetail}
                             onChange={handleInputChange}
                             className={inputClassName}
                             placeholder="상세 주소 입력"
                           />
                        </div>
                      </div>
                    </div>

                    {/* 연락처 정보 */}
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

                    <div>
                      <label className={labelClassName}>팩스번호</label>
                      <input 
                        type="text"
                        name="fax"
                        value={formData.fax}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="02-0000-0000"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>이메일 *</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="company@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>설립일자</label>
                      <input 
                        type="date"
                        name="foundationDate"
                        value={formData.foundationDate}
                        onChange={handleInputChange}
                        className={inputClassName}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClassName}>업종</label>
                      <input 
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className={inputClassName}
                        placeholder="주요 업종 입력"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* 3. 첨부파일 및 비고 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/60"
                >
                  <h3 className="text-sm font-semibold text-[#6366f1] border-b border-[#e0e7ff] pb-2 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
                    서류 및 기타
                  </h3>

                  <div className="space-y-4">
                    {/* 파일 업로드 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">첨부파일 (다중 선택)</label>
                         <button 
                           type="button" 
                           className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded transition-colors font-medium"
                           onClick={() => fileInputRef.current?.click()}
                         >
                           + 파일 추가
                         </button>
                      </div>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        multiple 
                        onChange={handleFileChange}
                      />

                      {selectedFiles.length > 0 ? (
                        <ul className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-sm text-slate-600 truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              >
                                <X className="w-4 h-4" /> 
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-4 bg-slate-100/50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                           사업자등록증, 통장사본 등 필수 서류를 등록해주세요.
                        </div>
                      )}
                    </div>
                    
                  </div>
                </motion.div>

                {/* 4. 계정 정보 섹션 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                  className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/60"
                >
                  <h3 className="text-sm font-semibold text-[#6366f1] border-b border-[#e0e7ff] pb-2 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
                    계정 생성
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
                        placeholder="담당자 성명"
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
                        placeholder="영문, 숫자 6자 이상"
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
