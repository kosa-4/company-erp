"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Building2, Save, Search, MapPin, Phone, FileText, AlertCircle, Lock, UploadCloud, Paperclip, X } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { Can } from '@/auth/Can';
import { toast } from 'sonner';

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

export default function VendorInfoChangePage() {
  // 1. DTO 필드명과 100% 일치시킨 초기 상태
  const [formData, setFormData] = useState({
    vendorCode: '',
    vendorName: '',
    vendorNameEng: '',   // DTO: vendorNameEng
    businessType: '',    // DTO: businessType
    businessNo: '',      // [추가됨] 사업자번호
    ceoName: '',         // DTO: ceoName
    zipCode: '',         // DTO: zipCode
    address: '',         // DTO: address
    addressDetail: '',   // DTO: addressDetail
    tel: '',             // DTO: tel
    fax: '',             // [추가됨] 팩스번호
    email: '',           // DTO: email
    industry: '',        // DTO: industry
    foundationDate: '',  // [추가됨] 설립일자
    remark: '',          // DTO: remark
    status: '',
    editable: true,
  });

  const [changeReason, setChangeReason] = useState(''); // 변경 사유(remark에 담김)
  const [loading, setLoading] = useState(true);

  // 원본 저장
  const [originalData, setOriginalData] = useState<typeof formData | null>(null);

  // [2] 초기 데이터 로드 수정
useEffect(() => {
  const loadInitialData = async () => {
    try {
      // 1. 내 업체 정보 가져오기
      const infoRes = await fetch('/api/v1/vendor-portal/info');
      if (!infoRes.ok) throw new Error('정보 조회 실패');
      
      const infoData = await infoRes.json();
      
      // formData 업데이트
      setFormData(prev => ({ ...prev, ...infoData }));
      
      // ⭐ 핵심 1: textarea와 연결된 changeReason 상태도 같이 업데이트해줘야 비고가 보입니다.
      if (infoData.remark) {
        setChangeReason(infoData.remark);
      }

      // ⭐ 핵심 2: vendorCode 필드명이 정확한지 확인 (vendorCode vs vendorCd)
      // 만약 백엔드 DTO가 vendorCd를 사용한다면 infoData.vendorCd로 바꿔야 합니다.
      const vCode = infoData.vendorCode || infoData.vendorCd; 

      if (vCode) {
        // 백엔드 컨트롤러 경로: /api/v1/vendor-portal/info/{vendorCode}/files
        const fileRes = await fetch(`/api/v1/vendor-portal/info/${vCode}/files`);
        
        if (!fileRes.ok) {
          toast.error('첨부 파일을 불러오지 못했습니다.');
        } else {
          const fileResult = await fileRes.json();
          // ApiResponse.ok(files)로 보냈으므로 .data 안에 리스트가 들어있습니다.
          setAttachedFiles(fileResult.data || []);
        }
      } 
    } catch (err) {
      console.error("데이터 로딩 에러:", err);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  loadInitialData();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. 주소 검색 핸들러 (AuthModal 로직 적용)
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.roadAddress || (data as any).autoRoadAddress || data.jibunAddress;
        if (data.buildingName) {
          fullAddress += ` (${data.buildingName})`;
        }

        setFormData(prev => ({
          ...prev,
          zipCode: data.zonecode,
          address: fullAddress,
        }));
        
        // 주소 입력 후 상세주소 칸으로 포커스 이동을 원할 경우 사용
        // document.getElementsByName('addressDetail')[0]?.focus();
      }
    }).open();
  };
  

  const handleRequestChange = async () => {
    if (!formData.editable) return;
    if (!changeReason.trim()) {
      toast.warning('변경 사유를 입력해주세요.');
      return;
    }

    setLoading(true);

    const requestBody = {
      ...formData,
      remark: changeReason 
    };
    
    try {
      // 1. 정보 수정 신청 전송
      const response = await fetch('/api/v1/vendor-portal/info/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });
      
      // 2. 응답 JSON 파싱 (여기서 askNum을 꺼냅니다)
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || '정보 변경 신청에 실패했습니다.');
      }

      // ⭐ [핵심 수정] 서버가 준 askNum (MD26...)을 받습니다.
      const askNum = result.data;

      // 선택한 파일은 존재하나 요청 번호가 없을 시 예외 처리
      if (selectedFiles.length > 0 && !askNum) {
        toast.error('파일 업로드용 신청 번호를 받지 못했습니다. 잠시 후 다시 시도해주세요.');
        setLoading(false);
        return;
      }
      console.log("생성된 신청 번호:", askNum);

      // 3. 파일 업로드 시도 (askNum 사용)
      let uploadOk = true;
      if (selectedFiles.length > 0 && askNum) {
        try {
          // 🚀 formData.vendorCode가 아니라 'askNum'을 넘깁니다!
          await uploadFiles(askNum);
        } catch (fileErr) {
          uploadOk = false;
          console.error("파일 업로드 실패:", fileErr);
          toast.error('변경 신청은 완료되었으나, 파일 업로드에 실패했습니다.');
        }
      }

      
      // 4. 성공 후 새로고침
      if (!uploadOk) {
        setLoading(false);
        return;
      }

      toast.success('변경 신청이 접수되었습니다.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      toast.error(error.message || '네트워크 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 파일 관련
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  // --- 파일 핸들러 (동일 파일 재선택 버그 수정) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // 기존 선택된 파일들과 중복 체크를 하고 싶다면 여기서 로직 추가 가능
      setSelectedFiles(prev => [...prev, ...filesArray]);

      // [중요] input의 value를 초기화해야 동일한 파일을 다시 올릴 때 onChange가 발생함
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // 혹시 모를 상황을 대비해 ref를 통해서도 한 번 더 비워줌
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- 파일 업로드 실행 함수 ---
  // 인자명을 vendorCode -> askNum으로 변경하여 명확하게 함
  const uploadFiles = async (askNum: string) => {
    console.log("파일 업로드 시작 - 번호:", askNum);

    const fileFormData = new FormData();
    selectedFiles.forEach(file => {
        fileFormData.append('file', file);
        // 필요하다면 백엔드 요구사항에 따라 askNum을 body에도 추가
        // fileFormData.append('askNum', askNum); 
    });

    // 🚀 URL 끝부분에 askNum(MD...)이 들어가도록 수정
    const response = await fetch(`/api/v1/vendor-portal/info/files/${askNum}`, {
      method: 'POST',
      body: fileFormData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errText = await response.text();
      
      console.error('파일 업로드 실패 상세:', errText);
      throw new Error('파일 업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) return <div className="p-10 text-center">데이터 로딩 중...</div>;

  const labelClassName = "text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Banner 생략 (기존과 동일) */}

      <Card className={`overflow-hidden ${!formData.editable ? 'opacity-85' : ''}`}>
        <div className="p-8 space-y-8">
          
          {/* 1. 기본 정보 섹션 */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Building2 className="w-5 h-5 text-blue-600" />
              기본 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClassName}>협력사명 *</label>
                <Input
                  name="vendorName"
                  value={formData.vendorName || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                  className="font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className={labelClassName}>협력사명 (영문)</label>
                <Input
                  name="vendorNameEng"
                  value={formData.vendorNameEng || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClassName}>사업형태 *</label>
                <select
                  name="businessType"
                  value={formData.businessType || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all outline-none"
                >
                  <option value="">선택</option>
                  <option value="INDIVIDUAL">개인</option>
                  <option value="CORP">법인</option>
                </select>
              </div>
              
              {/* [수정됨] 사업자 번호: 수정 불가(Read Only) 처리 */}
              <div className="space-y-1">
                <label className={labelClassName}>
                  사업자등록번호
                  <span className="text-[10px] text-gray-400 font-normal ml-auto">(수정 불가)</span>
                </label>
                <Input
                  name="businessNo"
                  value={formData.businessNo || ''}
                  readOnly
                  disabled={true} 
                  className="bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className={labelClassName}>대표자명 *</label>
                <Input
                  name="ceoName"
                  value={formData.ceoName || ''}
                  onChange={handleChange}
                  disabled={!formData.editable}
                />
              </div>
              
              <div className="space-y-1">
                <label className={labelClassName}>
                  설립일자
                  <span className="text-[10px] text-gray-400 font-normal ml-auto"> (수정 불가)</span>
                </label>
                <Input
                  type="date"
                  name="foundationDate"
                  // T00:00:00 포맷 대응을 위해 잘라내기 유지
                  value={(formData.foundationDate || '').substring(0, 10)}
                  readOnly
                  disabled={true} 
                  className="bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                />
              </div>
            </div>
          </section>

          {/* 2. 연락처 및 업종 */}
          <section className="pt-2">
             <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-blue-600">#</span> 연락처 및 상세
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className={labelClassName}>전화번호 *</label>
                    <Input
                      name="tel"
                      value={formData.tel || ''}
                      onChange={handleChange}
                      disabled={!formData.editable}
                      placeholder="02-0000-0000"
                    />
                </div>
                {/* [수정됨] 팩스 번호 불러오기 */}
                <div className="space-y-1">
                    <label className={labelClassName}>팩스번호</label>
                    <Input
                      name="fax"
                      value={formData.fax || ''}
                      onChange={handleChange}
                      disabled={!formData.editable}
                      placeholder="02-0000-0000"
                    />
                </div>
                <div className="space-y-1">
                    <label className={labelClassName}>이메일 *</label>
                    <Input
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      disabled={!formData.editable}
                      type="email"
                    />
                </div>
                <div className="space-y-1">
                    <label className={labelClassName}>업종 *</label>
                    <Input
                      name="industry"
                      value={formData.industry || ''}
                      onChange={handleChange}
                      disabled={!formData.editable}
                    />
                </div>
            </div>
          </section>

          {/* 3. 주소 섹션 (디자인 개선) */}
          <section className="pt-2">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-5 h-5 text-blue-600" />
              사업장 소재지
            </h3>
            <div className="space-y-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <div className="flex flex-col space-y-1">
                <label className={labelClassName}>우편번호 *</label>
                <div className="flex gap-2 max-w-md">
                  <Input
                    name="zipCode"
                    value={formData.zipCode || ''}
                    readOnly
                    placeholder="00000"
                    className="bg-white border-gray-300 w-32 text-center"
                  />
                  {/* [수정됨] 주소 검색 버튼 디자인 */}
                  <Button 
                    type="button"
                    disabled={!formData.editable}
                    onClick={handleAddressSearch}
                    className={`
                      shrink-0 flex items-center gap-1.5 px-4
                      ${!formData.editable 
                        ? 'bg-gray-200 text-gray-400 border-gray-200' 
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'}
                      transition-all duration-200
                    `}
                  >
                    <Search className="w-4 h-4" />
                    주소 검색
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className={labelClassName}>기본주소</label>
                  <Input
                    name="address"
                    value={formData.address || ''}
                    readOnly
                    placeholder="주소 검색 시 자동 입력"
                    className="bg-gray-100 border-gray-200 text-gray-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClassName}>상세주소</label>
                  <Input
                    name="addressDetail"
                    value={formData.addressDetail || ''}
                    onChange={handleChange}
                    disabled={!formData.editable}
                    placeholder="동, 호수 등 상세 주소를 입력하세요"
                    className="bg-white border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>
          {/* 4. 증빙 서류 관리 섹션 (구분형) */}
          <section className="pt-2">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Paperclip className="w-5 h-5 text-blue-600" /> 증빙 서류 관리
            </h3>

            <div className="space-y-6 bg-slate-50/50 p-6 rounded-xl border border-slate-200">
              
              {/* (1) 기존 등록 서류 그룹 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-slate-700">기본 등록 서류</span>
                  <span className="text-[10px] text-slate-400 font-normal">이미 서버에 업로드된 파일입니다.</span>
                </div>
                
                {attachedFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {attachedFiles.map((file, idx) => (
                      <div key={`attached-${idx}`} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                          <div className="p-2 bg-slate-100 rounded-md text-slate-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-slate-600 truncate">
                              {file.originName}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Verified (기본)</span>
                          </div>
                        </div>
                        <div className="text-slate-300 shrink-0">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    등록된 기본 서류가 없습니다.
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* (2) 신규 첨부 서류 그룹 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-700">추가 첨부 서류</span>
                    <span className="text-[10px] text-blue-400 font-normal">변경 사항을 증빙할 신규 파일입니다.</span>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    disabled={!formData.editable} 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 shadow-sm h-8"
                  >
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> 파일 추가
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </div>

                {selectedFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={`selected-${index}`} className="flex items-center justify-between p-3 bg-blue-50/30 border border-blue-200 rounded-lg shadow-sm group animate-in fade-in slide-in-from-bottom-1 overflow-hidden">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                          <div className="p-2 bg-blue-100 rounded-md text-blue-500 shrink-0">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-blue-900 truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">New (신규)</span>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)} 
                          aria-label={`파일 삭제: ${file.name}`}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-white/50">
                    새로 첨부할 파일을 선택해주세요.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 5. 변경 사유 */}
          <section className="pt-2">
            <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
               변경 사유 입력 (필수)
            </h3>
            <textarea
                name="remark"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="변경 사유를 구체적으로 입력하세요. (예: 본점 소재지 이전, 대표자 변경 등)"
                rows={3}
                disabled={!formData.editable}
                className="flex w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none bg-white"
            />
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
        <Can roles={['VENDOR']}>
          <Button
            onClick={handleRequestChange}
            variant={formData.editable ? "primary" : "outline"}
            disabled={!formData.editable}
          >
            {formData.editable ? "변경 신청 하기" : "수정 불가"}
          </Button>
        </Can>
        </div>
      </Card>
    </div>
  );
}