import api from './client';

/**
 * 구매요청 품목 정보 DTO
 */
export interface PrItemDTO {
    itemCd: string;        // 품목코드
    itemNm: string;        // 품목명
    itemSpec: string;      // 규격
    unitCd: string;        // 단위
    prQt?: number;         // 수량
    unitPrc?: number;     // 단가
    prAmt?: number;       // 금액
    delyDate?: string;    // 희망납기일 (YYYY-MM-DD)
    rmk?: string;         // 비고
}

/**
 * 구매요청 등록 요청 DTO
 */
export interface PrRequest {
    prHd: {
        prSubject: string;   // 구매요청명
        pcType: string;      // 구매유형 (GENERAL, CONTRACT, URGENT)
        reqUser?: string;    // 요청자
        deptName?: string;   // 부서명
        rmk?: string;        // 비고
    };
    prDtList: {
        itemCode: string;   // 품목코드
        prQt: number;       // 수량
        unitPrc: number;    // 단가
        delyDate: string | null;   // 희망납기일 (YYYY-MM-DD, null 가능)
    }[];
}

/**
 * 구매요청 현황 목록 응답 DTO (헤더 정보만)
 */
export interface PrListResponse {
    prNum: string;              // PR번호
    prSubject?: string | null;  // 구매요청명 (optional)
    progressCd?: string | null; // 진행상태 (CODE_NAME)
    pcType?: string | null;     // 구매유형 (CODE_NAME)
    requester?: string | null;  // 요청자명
    deptName?: string | null;   // 부서명
    regDate?: string | Date | null; // 등록일
    prAmt?: number | null;      // 총 금액
    rmk?: string | null;        // 비고 (optional)
}

/**
 * 구매요청 상세 품목 정보 DTO (PrDtDTO)
 */
export interface PrDtDTO {
    prNum: string;              // PR번호
    regUserId: string;          // 등록자ID
    delFlag: string;            // 삭제여부
    itemCd: string;             // 품목코드
    itemDesc: string;           // 품목명
    itemSpec: string;           // 품목규격
    unitCd: string;             // 단위코드
    prQt: number;               // 수량
    unitPrc: number;            // 단가
    prAmt: number;              // 금액
    delyDate: string | Date;    // 희망납기일
    rmk: string;                // 비고
}

/**
 * 구매요청 초기 데이터 응답
 */
export interface PrInitData {
    reqUserNm: string;    // 요청자명
    deptNm: string;       // 부서명
    prAmt: number;       // 초기 금액
}

/**
 * 구매요청현황 목록 검색 조회 파라미터
 */
export interface PrListParams {
    prNum?: string;       // PR번호
    prSubject?: string;   // 구매요청명
    requester?: string;   // 요청자
    deptName?: string;    // 부서명
    progressCd?: string;  // 진행상태코드 (한국어: '임시저장', '승인대기', '승인', '반려' 등)
    startDate?: string;   // 요청일자 시작 (YYYY-MM-DD)
    endDate?: string;     // 요청일자 종료 (YYYY-MM-DD)
}

export const prApi = {
    /**
     * 구매요청 화면 초기 데이터 조회
     */
    getInitData: () => api.get<PrInitData>('/v1/pr/init'),

    /**
     * 품목선택 팝업에서의 품목 목록 조회
     */
    getItemList: () => api.get<PrItemDTO[]>('/v1/pr/item/list'),

    /**
     * 구매요청 화면에서 품목정보 조회 (품목코드 리스트로 조회)
     * @param itemCodes 품목코드 배열
     */
    getItemInfo: (itemCodes: string[]) => {
        // URLSearchParams를 사용하여 배열 파라미터 처리 (Spring은 같은 파라미터명으로 배열을 받음)
        const searchParams = new URLSearchParams();
        itemCodes.forEach(code => searchParams.append('itemCodes', code));
        return api.get<PrItemDTO[]>(`/v1/pr/item-info/list?${searchParams.toString()}`);
    },

    /**
     * 구매요청 등록
     */
    save: (data: PrRequest) => api.post<{ message: string }>('/v1/pr/save', data),

    /**
     * 구매요청 현황 목록 조회 (헤더만)
     */
    getList: (params?: PrListParams) => {
        // 프론트엔드 파라미터명을 백엔드 파라미터명으로 매핑
        const mappedParams: Record<string, string> = {};
        if (params?.prNum) mappedParams.prNum = params.prNum;
        if (params?.prSubject) mappedParams.prSubject = params.prSubject;
        if (params?.requester) mappedParams.requester = params.requester;
        if (params?.deptName) mappedParams.deptName = params.deptName;
        if (params?.progressCd) mappedParams.progressCd = params.progressCd;
        if (params?.startDate) mappedParams.startDate = params.startDate;
        if (params?.endDate) mappedParams.endDate = params.endDate;

        return api.get<PrListResponse[]>('/v1/pr/list', mappedParams);
    },



    /**
     * 구매요청 삭제 (논리적 삭제: DEL_FLAG='Y')
     */
    delete: (prNum: string) => {
        const endpoint = `/pr/${prNum}/delete`;
        console.log('삭제 API 호출:', endpoint);
        console.log('전체 URL:', `/api/v1${endpoint}`);
        console.log('HTTP Method: PUT');
        return api.put<{ message: string }>(`/v1${endpoint}`);
    },

    /**
     * 구매요청 승인
     */
    approve: (prNum: string) => {
        console.log('prApi.approve 호출 - prNum:', prNum);
        console.log('API URL:', `/pr/${prNum}/approve`);
        return api.post<void>(`/v1/pr/${prNum}/approve`);
    },

    /**
     * 구매요청 반려
     */
    reject: (prNum: string) => {
        console.log('prApi.reject 호출 - prNum:', prNum);
        console.log('API URL:', `/pr/${prNum}/reject`);
        return api.post<void>(`/v1/pr/${prNum}/reject`);
    },

    /**
     * 구매요청 상세 품목 목록 조회
     */
    getDetail: (prNum: string) => api.get<PrDtDTO[]>(`/v1/pr/${prNum}/detail`),
};