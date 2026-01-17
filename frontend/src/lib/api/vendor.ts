import api from './client';

export interface VendorSearchRequest {
    vendorCode?: string;
    vendorName?: string;
    businessType?: string;
    industry?: string;
    useYn?: string;
    page?: number;
    pageSize?: number;
}

export interface VendorListResponse {
    vendors: VendorDTO[];
    totalCount: number;
}

export interface VendorDTO {
    vendorCode: string;
    vendorName: string;
    ceoName: string;
    address: string;
    industry: string;
    status: string;
}

export const vendorApi = {
    getVendorList: (params: VendorSearchRequest) =>
        api.get<VendorListResponse>('/v1/vendors', { ...params }),
};
