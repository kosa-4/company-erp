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
 * 구매요청 현황 목록 응답 DTO
 */
export interface PrListResponse {
    progressCd: string;    // 상태코드
    prNum: string;         // PR번호
    pcType: string;       // 구매유형
    reqUserId: string;    // 요청자ID
    deptNm: string;       // 부서명
    regDate: string;      // 요청일 (YYYY-MM-DD)
    itemCd: string;       // 품목코드
    itemDesc: string;     // 품목명
    prQt: number;         // 수량
    unitPrc: number;      // 단가
    prAmt: number;        // 금액
    delyDate: string;     // 희망납기일 (YYYY-MM-DD)
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
 * 구매요청 목록 조회 파라미터
 */
export interface PrListParams {
    prNum?: string;       // PR번호
    prSubject?: string;   // 구매요청명
    requester?: string;   // 요청자
    deptName?: string;    // 부서명
    progressCd?: string;  // 진행상태코드
}

export const prApi = {
    /**
     * 구매요청 화면 초기 데이터 조회
     */
    getInitData: () => api.get<PrInitData>('/pr/init'),

    /**
     * 품목선택 팝업에서의 품목 목록 조회
     */
    getItemList: () => api.get<PrItemDTO[]>('/pr/item/list'),

    /**
     * 구매요청 화면에서 품목정보 조회 (품목코드 리스트로 조회)
     * @param itemCodes 품목코드 배열
     */
    getItemInfo: (itemCodes: string[]) => {
        // URLSearchParams를 사용하여 배열 파라미터 처리 (Spring은 같은 파라미터명으로 배열을 받음)
        const searchParams = new URLSearchParams();
        itemCodes.forEach(code => searchParams.append('itemCodes', code));
        return api.get<PrItemDTO[]>(`/pr/item-info/list?${searchParams.toString()}`);
    },

    /**
     * 구매요청 등록
     */
    save: (data: PrRequest) => api.post<{ message: string }>('/pr/save', data),

    /**
     * 구매요청 현황 목록 조회
     */
    getList: (params?: PrListParams) => {
        // 프론트엔드 파라미터명을 백엔드 파라미터명으로 매핑
        const mappedParams: Record<string, string> = {};
        if (params?.prNum) mappedParams.prNum = params.prNum;
        if (params?.prSubject) mappedParams.prSubject = params.prSubject;
        if (params?.requester) mappedParams.requester = params.requester;
        if (params?.deptName) mappedParams.deptName = params.deptName;
        if (params?.progressCd) mappedParams.progressCd = params.progressCd;
        return api.get<PrListResponse[]>('/pr/list', mappedParams);
    },

    /**
     * 구매요청 삭제
     */
    delete: (prNum: string) => api.put<string>(`/pr/${prNum}/delete`),
};