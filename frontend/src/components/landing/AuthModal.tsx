'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Search, Loader2 } from 'lucide-react';
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
  // 인증 컨텍스트에서 login 함수 가져오기
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

  /**
   * 로그인 처리
   * - 성공 시 AuthContext의 login 함수가 role에 따라 자동 라우팅
   *   - VENDOR 외 (구매사) → /home
   *   - VENDOR (협력사) → /vendor/home
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(loginId, loginPassword);
      // 로그인 성공 시 AuthContext에서 라우팅 처리
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSignup = async () => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const response = await fetch('/api/v1/signup', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(formData),
  //     });

  //     // 1. 백엔드에서 리턴한 "success" 문자열을 받기 위해 text() 사용
  //     const resultText = await response.text();

  //     // 2. 성공 처리: 응답이 "success"인 경우
  //     if (response.ok && resultText === "success") {
  //       alert('회원가입이 완료되었습니다.');
        
  //       // 데이터 초기화: 선언된 formData 구조 그대로 리셋
  //       setFormData({
  //         vendorName: '',
  //         vendorNameEn: '',
  //         businessType: '',
  //         businessNo: '',
  //         ceoName: '',
  //         zipCode: '',
  //         address: '',
  //         addressDetail: '',
  //         phone: '',
  //         industry: '',
  //         userName: '',
  //         userId: '',
  //         email: '',
  //         password: '',
  //         passwordConfirm: '',
  //       });

  //       // 로그인 화면으로 전환
  //       onSwitchMode('login');
  //       return; // 성공했으므로 여기서 중단
  //     }

  //     // 3. 실패 처리: 400 에러 등 JSON 에러 메시지 파싱
  //     try {
  //       const errorJson = JSON.parse(resultText);
  //       // Validation 에러 메시지 추출
  //       const errorMsg = errorJson.data ? Object.values(errorJson.data)[0] : errorJson.message;
  //       throw new Error(errorMsg as string || '회원가입에 실패했습니다.');
  //     } catch (e: any) {
  //       // JSON 파싱 실패 시 원문 텍스트 사용
  //       throw new Error(e.name === 'SyntaxError' ? resultText : e.message);
  //     }

  //   } catch (err: any) {
  //     setError(err.message);
  //     alert(err.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
   // 파일 첨부
  // 1. 파일 관련 상태 및 Ref 추가
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. 파일 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]); // 파일 누적
    }
  };
  // 특정 파일 제거 기능
  const removeFile = (index: number) => {
    // 인덱스가 일치하지 않는 파일들만 걸러서(filter) 새로운 배열로 세팅
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSignup = async () => {
  setIsLoading(true);
  setError(null);

  try {
    // 0. 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // --- [STEP 1] 회원가입 데이터 전송 (JSON) ---
    // 결과값으로 백엔드가 생성한 vendorCode(VN...)를 받습니다.
    const response = await fetch('/api/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    // 백엔드가 ResponseEntity.ok(vendorCode)로 문자열만 주므로 text()로 받습니다.
    const resultText = await response.text();

    if (!response.ok) {
      throw new Error(resultText || '회원가입 신청 중 오류가 발생했습니다.');
    }

    // 서버에서 방금 생성된 vendorCode (예: VN20260121001)
    const generatedVendorCode = resultText;

    // --- [STEP 2] 파일이 있으면 업로드 실행 ---
    if (selectedFiles.length > 0 && generatedVendorCode) {
      try {
        const fileFormData = new FormData();
        
        // 백엔드 @RequestPart("file") 키값과 일치시킴
        selectedFiles.forEach(file => {
          fileFormData.append('file', file);
        });

        // URL 경로에 vendorCode를 넣어서 전송 (백엔드 @PathVariable 매칭)
        const fileRes = await fetch(`/api/v1/signup/files/${generatedVendorCode}`, {
          method: 'POST',
          body: fileFormData, // Content-Type 헤더는 브라우저가 자동 생성하게 둡니다.
        });

        if (!fileRes.ok) {
          throw new Error('서류 업로드 중 오류가 발생했습니다.');
        }
      } catch (fileErr: any) {
        // 가입은 성공했으나 파일만 실패한 경우
        alert('가입 신청은 완료되었으나 서류 업로드에 실패했습니다. 관리자에게 문의하세요.');
      }
    }

    // --- [STEP 3] 최종 완료 ---
    alert(`회원가입 신청이 완료되었습니다.\n업체코드: ${generatedVendorCode}`);
    
    // 상태 초기화
    setFormData({
      vendorName: '', vendorNameEn: '', businessType: '', businessNo: '',
      ceoName: '', zipCode: '', address: '', addressDetail: '',
      phone: '', industry: '', userName: '', userId: '',
      email: '', password: '', passwordConfirm: '',
    });
    setSelectedFiles([]);
    
    // 로그인 화면으로 전환
    onSwitchMode('login');

  } catch (err: any) {
    setError(err.message);
    alert(err.message);
  } finally {
    setIsLoading(false);
  }
};
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

 

  const inputClassName = "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-2.5 transition-all outline-none";
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        
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
                <div className="p-3 bg-emerald-50 rounded-full">
                  <Building2 className="w-6 h-6 text-emerald-600" />
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
                <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
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
                            className="px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm rounded-lg transition-colors flex items-center gap-1 font-medium"
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
                {/* 증빙 서류 첨부 섹션 */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="text-sm font-medium text-slate-700">첨부파일 (다중 선택 가능)</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {/* 1. 파일 선택 버튼 (VendorPage 스타일) */}
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded-md transition-colors font-medium"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        파일 추가
                      </button>

                      {/* 2. 숨겨진 Input */}
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

                    {/* 3. 선택된 파일 목록 (VendorPage 로직 그대로 사용) */}
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
                              {/* Lucide X 아이콘 대신 텍스트나 기본 SVG 사용 가능 */}
                              <X className="w-4 h-4" /> 
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
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
                        type="userEmail"
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
                {/* 로그인 에러 메시지 */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className={labelClassName}>아이디</label>
                  <input 
                    type="text" 
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className={inputClassName}
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
                    className={inputClassName}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <motion.button 
              type={mode === 'login' ? 'submit' : 'button'}
              onClick={mode === 'login' ? handleLogin : handleSignup}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full text-white font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors shadow-lg flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-emerald-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
              }`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? (isLoading ? '로그인 중...' : '로그인') : '회원가입 신청'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <button onClick={() => onSwitchMode('signup')} className="text-emerald-600 hover:text-emerald-500 font-medium hover:underline">
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button onClick={() => onSwitchMode('login')} className="text-emerald-600 hover:text-emerald-500 font-medium hover:underline">
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
