import { api } from './client';

/**
 * 협력사 사용자 정보 응답 DTO
 */
export interface VendorUserInfoResponse {
  userName: string;
  email: string;
  vendorName: string;
  vendorNameEn: string;
  businessNo: string;
  address: string;
  ceoName: string;
  industry: string;
  phone: string;
  zipCode: string;
  businessType: string;
}

/**
 * 협력사 비밀번호 업데이트 요청 DTO
 */
export interface VendorPasswordUpdateRequest {
  password: string;
}

export const vendorMypageApi = {
  /**
   * 협력사 사용자 정보 조회
   */
  getUserInfo: () => api.get<VendorUserInfoResponse>('/v1/mypage/vendor/user-info'),

  /**
   * 협력사 비밀번호 업데이트
   */
  updatePassword: (password: string) =>
    api.put<{ message: string }>('/v1/mypage/vendor/update-password', { password }),
};
