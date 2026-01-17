import api from './client';

export interface PrItemRow {
    prNum: string;
    lineNo: number;
    itemCd: string;
    itemDesc: string;
    itemSpec: string;
    unitCd: string;
    prQt: number;
    unitPrc: number;
    prAmt: number;
    delyDate: string;
    rmk: string;
}

export interface PrGroup {
    prNum: string;
    prSubject: string;
    prDate: string;
    requester: string;
    reqDeptNm: string;
    progressCd: string;
    progressNm: string;
    pcType: string;
    pcTypeNm: string;
    itemCount: number;
    totalAmount: number;
    items: PrItemRow[];
}

export interface RfqWaitingSearchRequest {
    prNum?: string;
    prSubject?: string;
    fromDate?: string;
    toDate?: string;
    reqDeptCd?: string;
    reqUserNm?: string;
}

export interface RfqDetailResponse {
    header: {
        rfqNum: string;
        rfqSubject: string;
        rfqDate: string;
        progressCd: string;
        progressNm: string;
        rfqType: string;
        rfqTypeNm: string;
        reqCloseDate: string;
        rmk: string;
        ctrlUserId: string;
        ctrlUserNm: string;
        prNum: string;
        pcType: string;
    };
    items: {
        lineNo: number;
        itemCd: string;
        itemDesc: string;
        itemSpec: string;
        unitCd: string;
        rfqQt: number;
        estUnitPrc: number;
        estAmt: number;
        delyDate: string;
        whNm: string;
        rmk: string;
    }[];
    vendors: {
        vendorCd: string;
        vendorNm: string;
        progressCd: string;
        progressNm: string;
        sendDate?: string;
        submitDate?: string;
        totalAmt?: number;
        selectYn: string;
    }[];
}

export interface RfqSaveRequest {
    rfqNum?: string;
    prNum?: string;
    pcType?: string;
    rfqSubject: string;
    rfqType: string;
    reqCloseDate: string;
    rmk?: string;
    vendorCodes?: string[];
    items: {
        lineNo: number;
        itemCd: string;
        itemDesc?: string;
        itemSpec?: string;
        unitCd?: string;
        rfqQt: number;
        estUnitPrc?: number;
        delyDate?: string;
        whNm?: string;
        rmk?: string;
    }[];
}

export const rfqApi = {
    /**
     * 견적대기목록 조회
     */
    getWaitingList: (params: RfqWaitingSearchRequest) =>
        api.get<PrGroup[]>('/v1/rfq/buyer/waiting/list', { ...params }),

    /**
     * RFQ 상세 조회
     */
    getRfqDetail: (rfqNum: string) =>
        api.get<RfqDetailResponse>(`/v1/buyer/rfqs/${rfqNum}`),

    /**
     * [신규] PR 기반 견적 초안 초기 데이터 조회
     * - 기존 /v1/rfq/buyer/waiting/create (삭제됨) 대신 사용
     */
    getRfqInitFromPr: (prNum: string) =>
        api.get<RfqDetailResponse>(`/v1/buyer/rfqs/init/${prNum}`),

    /**
     * [신규] RFQ 최초 생성 (저장 시점에 호출)
     * - 백엔드 컨트롤러가 ApiResponse<String>으로 감싸서 내려주면,
     *   client.ts에서 unwrap 해주는지에 따라 타입이 달라질 수 있음.
     *   (프로젝트 다른 API들과 동일 패턴이면 그대로 사용)
     */
    createRfq: (data: RfqSaveRequest) =>
        api.post<string>('/v1/buyer/rfqs', data),

    /**
     * RFQ 저장 (임시저장 상태)
     */
    saveRfq: (rfqNum: string, data: RfqSaveRequest) =>
        api.put<void>(`/v1/buyer/rfqs/${rfqNum}`, data),

    /**
     * 협력업체 전송
     */
    sendRfq: (rfqNum: string, vendorCodes: string[]) =>
        api.post<void>(`/v1/buyer/rfqs/${rfqNum}/send`, { vendorCodes }),

    /**
     * 업체 선정
     */
    selectVendor: (rfqNum: string, vendorCd: string) =>
        api.post<void>(`/v1/buyer/rfqs/${rfqNum}/select`, { vendorCd }),
};
