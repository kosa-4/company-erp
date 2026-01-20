import api from './client';
import { PurchaseOrderDTO, PurchaseOrderItemDTO } from '../../types/purchaseOrder';

export interface PurchaseOrderListParams {
  poNo?: string;
  poName?: string;
  purchaseManager?: string;
  vendorName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// RFQ 선정완료 조회용 타입 (발주대기목록에서 사용)
export interface RfqSelectedDTO {
  rfqNo?: string;
  rfqName?: string;
  rfqDate?: string;
  rfqAmount?: number;
  purchaseType?: string;
  vendorCode?: string;
  vendorName?: string;
  ctrlUserId?: string;
  ctrlUserName?: string;
  prNo?: string;
  remark?: string;
  items?: RfqSelectedItemDTO[];
}

export interface RfqSelectedItemDTO {
  rfqNo?: string;
  itemCode?: string;
  itemName?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  deliveryDate?: string;
  storageLocation?: string;
  remark?: string;
}

export interface RfqSelectedListParams {
  rfqNo?: string;
  rfqName?: string;
  vendorName?: string;
  purchaseType?: string;
  startDate?: string;
  endDate?: string;
}

export const purchaseOrderApi = {
  // ========== RFQ 선정완료 조회 (발주대기목록) ==========
  getRfqSelectedList: (params?: RfqSelectedListParams) =>
    api.get<RfqSelectedDTO[]>('/v1/purchase-orders/pending', { ...params }),

  // 목록 조회
  getList: (params?: PurchaseOrderListParams) =>
    api.get<PurchaseOrderDTO[]>('/v1/purchase-orders', { ...params }),

  // 상세 조회
  getDetail: (poNo: string) =>
    api.get<PurchaseOrderDTO>(`/v1/purchase-orders/${poNo}`),

  // 등록
  create: (data: PurchaseOrderDTO) =>
    api.post<PurchaseOrderDTO>('/v1/purchase-orders', data),

  // 수정
  update: (poNo: string, data: PurchaseOrderDTO) =>
    api.put<PurchaseOrderDTO>(`/v1/purchase-orders/${poNo}`, data),

  // 삭제
  delete: (poNo: string) =>
    api.delete<void>(`/v1/purchase-orders/${poNo}`),

  // 확정
  confirm: (poNo: string) =>
    api.post<void>(`/v1/purchase-orders/${poNo}/confirm`),

  // 승인
  approve: (poNo: string) =>
    api.post<void>(`/v1/purchase-orders/${poNo}/approve`),

  // 반려
  reject: (poNo: string, rejectReason: string) =>
    api.post<void>(`/v1/purchase-orders/${poNo}/reject`, { rejectReason }),

  // 발주 전송
  send: (poNo: string) =>
    api.post<void>(`/v1/purchase-orders/${poNo}/send`),

  // 종결
  close: (poNo: string) =>
    api.post<void>(`/v1/purchase-orders/${poNo}/close`),
};