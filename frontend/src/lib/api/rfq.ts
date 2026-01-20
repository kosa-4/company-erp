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

// Vendor 관련 타입 재사용 또는 새로 정의 (여기선 편의상 import 대신 직접 정의하거나 any 사용 최소화)
export interface RfqVendorResponse {
    vendors: {
        vendorCode: string;
        vendorName: string;
        ceoName: string;
        industry: string;
    }[];
}

export interface RfqWaitingSearchRequest {
    prNum?: string;
    prSubject?: string;
    reqDate?: string;
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
        totalAmt?: number | string;
        selectYn: string;
    }[];
}

export interface RfqProgressGroup {
    rfqNum: string;
    rfqSubject: string;
    rfqDate: string;
    rfqType: string;
    rfqTypeNm: string;
    progressCd: string;
    progressNm: string;
    ctrlUserNm: string;
    regDate: string;
    vendors: {
        vendorCd: string;
        vendorNm: string;
        progressCd: string;
        progressNm: string;
        sendDate?: string;
        submitDate?: string;
        totalAmt?: number | string;
        selectYn?: string;
    }[];
}

export interface RfqSelectionResponse {
    rfqNum: string;
    rfqSubject: string;
    rfqType: string;
    rfqTypeNm: string;
    progressCd: string;
    progressNm: string;
    ctrlUserId: string;
    ctrlUserNm: string;
    regDate: string;
    vendorCd: string;
    vendorNm: string;
    vnProgressCd: string;
    vnProgressNm: string;
    sendDate?: string;
    submitDate?: string;
    totalAmt?: number | string;
    selectYn?: string;
    rmk?: string;
}

export interface RfqSelectionSearchRequest {
    rfqNum?: string;
    rfqSubject?: string;
    fromDate?: string;
    toDate?: string;
    rfqType?: string;
    progressCd?: string;
    ctrlUserNm?: string;
}

export interface RfqProgressSearchRequest {
    rfqNum?: string;
    rfqSubject?: string;
    fromDate?: string;
    toDate?: string;
    rfqType?: string;
    progressCd?: string;
    ctrlUserNm?: string;
}

export interface RfqSelectionResultResponse {
    rfqNum: string;
    rfqSubject: string;
    rfqType: string;
    rfqTypeNm: string;
    vendorCd: string;
    vendorNm: string;
    totalAmt: number | string;
    ctrlUserId: string;
    ctrlUserNm: string;
    regDate: string;
    selectDate: string;
}

export interface RfqResultItem {
    itemCd: string;
    itemNm: string;
    spec: string;
    unit: string;
    qty: number;
    unitPrice: number | string;
    amt: number | string;
    dlvyDate: string;
    rmk: string;
}

export interface RfqSelectionResultDetailResponse {
    header: RfqSelectionResultResponse;
    items: RfqResultItem[];
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
     * 협력업체 전송 (T -> RFQS)
     */
    sendRfq: (rfqNum: string, vendorCodes: string[]) =>
        api.post<void>(`/v1/buyer/rfqs/progress/${rfqNum}/send`, { vendorCodes }),

    /**
     * 업체 선정
     */
    selectVendor: (rfqNum: string, vendorCd: string, selectRmk?: string) =>
        api.post<void>(`/v1/buyer/rfq-selections/${rfqNum}/select`, { vendorCd, selectRmk }),

    /**
     * 견적 개찰 (M -> G)
     */
    openRfq: (rfqNum: string) =>
        api.post<void>(`/v1/buyer/rfq-selections/${rfqNum}/open`, {}),

    /**
     * 선정 대상 견적 목록 조회
     */
    getSelectionList: (params: RfqSelectionSearchRequest) =>
        api.get<RfqSelectionResponse[]>(`/v1/buyer/rfq-selections`, { ...params }),

    /**
     * 견적 진행 현황 목록 조회 (그룹화)
     */
    getProgressList: (params: RfqProgressSearchRequest) =>
        api.get<RfqProgressGroup[]>(`/v1/buyer/rfqs/progress`, { ...params }),

    /**
     * RFQ 마감 (M 상태로 전환)
     */
    closeRfq: (rfqNum: string) =>
        api.post<void>(`/v1/buyer/rfqs/progress/${rfqNum}/close`, {}),

    /**
     * RFQ 삭제 (Soft Delete)
     */
    deleteRfq: (rfqNum: string) => api.delete<{ message: string }>(`/v1/buyer/rfqs/${rfqNum}`),

    /**
     * [신규] RFQ용 승인된 협력사 목록 조회
     */
    getApprovedVendors: (params: { vendorCode?: string; vendorName?: string }) =>
        api.get<RfqVendorResponse>('/v1/buyer/rfqs/vendors', params),

    /**
     * 선정 결과 목록 조회
     */
    getSelectionResultList: (params: RfqSelectionSearchRequest) =>
        api.get<RfqSelectionResultResponse[]>('/v1/buyer/rfq-selection-results', { ...params }),

    /**
     * 선정 결과 상세 조회
     */
    getSelectionResultDetail: (rfqNum: string) =>
        api.get<RfqSelectionResultDetailResponse>(`/v1/buyer/rfq-selection-results/${rfqNum}`),

    // ========== 협력사 API ==========

    /**
     * 협력사 RFQ 목록 조회
     */
    getVendorRfqList: (params?: { searchText?: string; progressCd?: string; startDate?: string; endDate?: string }) =>
        api.get<any[]>('/v1/vendor/rfqs', { ...params }),

    /**
     * 협력사 RFQ 상세 조회
     */
    getVendorRfqDetail: (rfqNum: string) =>
        api.get<any>(`/v1/vendor/rfqs/${rfqNum}`),

    /**
     * RFQ 접수
     */
    acceptRfq: (rfqNum: string) =>
        api.post<void>(`/v1/vendor/rfqs/${rfqNum}/accept`, {}),

    /**
     * RFQ 포기
     */
    rejectRfq: (rfqNum: string) =>
        api.post<void>(`/v1/vendor/rfqs/${rfqNum}/reject`, {}),

    /**
     * 견적 데이터 조회 (편집용)
     */
    getVendorQuote: (rfqNum: string) =>
        api.get<any>(`/v1/vendor/rfqs/${rfqNum}/quote`),

    /**
     * 견적 임시저장
     */
    saveVendorQuote: (rfqNum: string, data: { items: any[] }) =>
        api.post<void>(`/v1/vendor/rfqs/${rfqNum}/quote/save`, data),

    /**
     * 견적 제출
     */
    submitVendorQuote: (rfqNum: string, data: { items: any[] }) =>
        api.post<void>(`/v1/vendor/rfqs/${rfqNum}/quote/submit`, data),
};

