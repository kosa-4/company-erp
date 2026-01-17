import { api } from './client';

/**
 * 마이페이지 사용자 정보 DTO
 */
export interface MyInfoDTO {
  userId: string;
  userNameKo: string;
  userNameEn?: string;
  userType: string;
  role: string;
  companyCode?: string;
  companyName?: string;
  departmentCode?: string;
  departmentName?: string;
  phone?: string;
  email?: string;
  mobile?: string;
  fax?: string;
}

/**
 * 마이페이지 업데이트 요청 DTO
 */
export interface MyInfoUpdateRequest {
  userNameEn?: string;
  phone?: string;
  email?: string;
  fax?: string;
  password?: string; // 비밀번호 변경 시에만 포함
}

export const mypageApi = {
  /**
   * 마이페이지 초기 데이터 조회
   */
  getInitData: () => api.get<MyInfoDTO>('/v1/mypage/init'),

  /**
   * 마이페이지 정보 업데이트
   */
  updateProfile: (data: MyInfoUpdateRequest) =>
    api.put<{ message: string }>('/v1/mypage/update', data),
};
