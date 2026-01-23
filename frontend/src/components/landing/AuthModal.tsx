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
   */
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
      setSelectedFiles((prev) => [...prev, ...filesArray]); // 파일 누적
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
      // 0. 비밀번호 확인
      if (formData.password !== formData.passwordConfirm) {
        const msg = '비밀번호가 일치하지 않습니다.';
        setError(msg);
        toast.error(msg);
        return;
      }

      // --- [STEP 1] 회원가입 데이터 전송 (JSON) ---
      const response = await fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // 1) 일단 무조건 텍스트로 받음
      const resultText = await response.text();

      // 2) 에러일 때만 JSON 파싱해서 메시지 추출
      if (!response.ok) {
        let serverMsg = resultText;
        try {
          const errorJson = JSON.parse(resultText);
          serverMsg = errorJson.data ? (Object.values(errorJson.data)[0] as string) : errorJson.message;
        } catch {
          // JSON 아니면 원문 유지
        }
        throw new Error(serverMsg);
      }

      // 3) 성공: resultText가 vendorCode
      const generatedVendorCode = resultText.trim();
      if (!generatedVendorCode) {
        throw new Error('업체코드를 확인할 수 없습니다.');
      }

      // --- [STEP 2] 파일 업로드 ---
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

      // --- [STEP 3] 완료 처리 ---
      if (!fileUploadFailed) {
        toast.success('회원가입 신청이 완료되었습니다.');
      } else {
        // 가입은 완료된 상태이므로 사용자 입장 혼동 방지
        toast.message('회원가입 신청은 접수되었습니다.');
      }

      // 상태 초기화
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

      // 로그인 화면으로 전환
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

  const inputClassName =
      'w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent block p-2.5 transition-all outline-none';
  const labelClassName = 'block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide';

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
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`relative w-full ${
                mode === 'signup' ? 'max-w-2xl' : 'max-w-md'
            } bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
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

            <form className="space-y-4" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
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

                          <p className="text-xs text-slate-500">사업자등록증 등 필수 서류를 첨부해주세요.</p>
                        </div>

                        {selectedFiles.length > 0 && (
                            <ul className="bg-white border rounded-md divide-y divide-slate-200 shadow-sm">
                              {selectedFiles.map((file, index) => (
                                  <li key={index} className="flex items-center justify-between p-2 px-3">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-sm text-slate-600 truncate max-w-[200px]">{file.name}</span>
                                      <span className="text-xs text-slate-400">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
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
                  type="submit"
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
                {mode === 'login' ? (isLoading ? '로그인 중...' : '로그인') : isLoading ? '신청 중...' : '회원가입 신청'}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? (
                  <>
                    계정이 없으신가요?{' '}
                    <button
                        onClick={() => onSwitchMode('signup')}
                        className="text-emerald-600 hover:text-emerald-500 font-medium hover:underline"
                    >
                      회원가입
                    </button>
                  </>
              ) : (
                  <>
                    이미 계정이 있으신가요?{' '}
                    <button
                        onClick={() => onSwitchMode('login')}
                        className="text-emerald-600 hover:text-emerald-500 font-medium hover:underline"
                    >
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
