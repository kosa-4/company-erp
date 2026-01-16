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

export interface RfqCreateFromPrResponse {
    rfqNum: string;
    message: string;
}

export const rfqApi = {
    /**
     * 견적대기목록 조회
     */
    getWaitingList: (params: RfqWaitingSearchRequest) =>
        api.get<PrGroup[]>('/rfq/buyer/waiting/list', { ...params }),

    /**
     * PR 기반 RFQ 초안 생성
     */
    createFromPr: (prNum: string) =>
        api.post<RfqCreateFromPrResponse>('/rfq/buyer/waiting/create', { prNum }),
};
