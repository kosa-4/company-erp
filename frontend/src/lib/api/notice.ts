import api from './client';

/**
 * 공지사항 초기 데이터 응답
 */
export interface NoticeInitData {
    regUserName: string;    // 등록자명
}

/**
 * 공지사항 등록 요청
 */
export interface NoticeRequest {
    subject: string;        // 제목
    content: string;        // 공지내용
    startDate: string;      // 시작일 (YYYY-MM-DD)
    endDate: string;        // 종료일 (YYYY-MM-DD)
    buyerCd?: string;       // 구매사코드 (선택)
    vendorCd?: string;      // 협력사코드 (선택)
}

/**
 * 공지사항 목록 조회 파라미터
 */
export interface NoticeListParams {
    startDate?: string;    // 공지기간 시작 (YYYY-MM-DD)
    endDate?: string;      // 공지기간 종료 (YYYY-MM-DD)
    subject?: string;      // 공지명
}

/**
 * 공지사항 목록 응답
 */
export interface NoticeListResponse {
    noticeNum: string;      // 공지사항번호
    subject: string;        // 제목
    regDate: string;        // 등록일
    regUserId: string;     // 등록자ID
    regUserName: string;    // 등록자명
    startDate: string;      // 시작일
    endDate: string;        // 종료일
    viewCnt: number;        // 조회수
}

/**
 * 공지사항 상세 응답
 */
export interface NoticeDetailResponse {
    noticeNum: string;      // 공지사항번호
    subject: string;        // 제목
    content: string;        // 공지내용
    regDate: string;        // 등록일
    regUserId: string;     // 등록자ID
    regUserName: string;    // 등록자명
    startDate: string;      // 시작일
    endDate: string;        // 종료일
    viewCnt: number;        // 조회수
    modDate?: string;       // 수정일
    modUserId?: string;     // 수정자ID
    files?: FileListItemResponse[];  // 첨부파일 목록
}

export const noticeApi = {
    /**
     * 공지사항 등록 화면 초기 데이터 조회
     */
    getInitData: () => api.get<NoticeInitData>('/v1/notice/init'),

    /**
     * 공지사항 등록
     */
    save: (data: NoticeRequest) => api.post<{ message: string }>('/v1/notice/save', data),

    /**
     * 공지사항 목록 조회
     */
    getList: (params?: NoticeListParams) => {
        const mappedParams: Record<string, string> = {};
        if (params?.startDate) mappedParams.startDate = params.startDate;
        if (params?.endDate) mappedParams.endDate = params.endDate;
        if (params?.subject) mappedParams.subject = params.subject;
        
        return api.get<NoticeListResponse[]>('/v1/notice/list', mappedParams);
    },

    /**
     * 공지사항 상세 조회
     */
    getDetail: (noticeNum: string) => api.get<NoticeDetailResponse>(`/v1/notice/${noticeNum}/detail`),
    
    /**
     * 공지사항 수정 (제목, 내용만)
     */
    update: (noticeNum: string, data: { subject: string; content: string }) => 
        api.put<{ message: string }>(`/v1/notice/${noticeNum}/update`, data),
    
    /**
     * 공지사항 삭제
     */
    delete: (noticeNum: string) => 
        api.delete<{ message: string }>(`/v1/notice/${noticeNum}`),
    
    /**
     * 공지사항 첨부파일 업로드
     */
    uploadFile: async (noticeNum: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`/api/v1/notice/${noticeNum}/files`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || '파일 업로드에 실패했습니다.');
        }
        
        return response.json();
    },
    
    /**
     * 공지사항 첨부파일 목록 조회 (FileController 사용)
     */
    getFileList: (noticeNum: string) => 
        api.get<FileListItemResponse[]>('/files', { refType: 'NOTICE', refNo: noticeNum }),
    
    /**
     * 파일 다운로드 (FileController 사용)
     */
    downloadFile: (fileNum: string) => {
        window.open(`/api/files/${fileNum}`, '_blank');
    },
    
    /**
     * 파일 삭제 (FileController 사용)
     */
    deleteFile: (fileNum: string) => 
        api.delete<{ message: string }>(`/files/${fileNum}`),
};

/**
 * 첨부파일 목록 응답
 */
export interface FileListItemResponse {
    fileNum: string;
    originName: string;
    fileSize: number;
    contentType: string;
    regDate: string;
    regUserId: string;
}
