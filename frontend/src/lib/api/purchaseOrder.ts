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

export const purchaseOrderApi = {
  // 목록 조회
  getList: (params?: PurchaseOrderListParams) =>
    api.get<PurchaseOrderDTO[]>('/purchase-orders', { ...params }),

  // 상세 조회
  getDetail: (poNo: string) =>
    api.get<PurchaseOrderDTO>(`/purchase-orders/${poNo}`),

  // 등록
  create: (data: PurchaseOrderDTO) =>
    api.post<PurchaseOrderDTO>('/purchase-orders', data),

  // 수정
  update: (poNo: string, data: PurchaseOrderDTO) =>
    api.put<PurchaseOrderDTO>(`/purchase-orders/${poNo}`, data),

  // 삭제
  delete: (poNo: string) =>
    api.delete<void>(`/purchase-orders/${poNo}`),

  // 확정
  confirm: (poNo: string) =>
    api.post<void>(`/purchase-orders/${poNo}/confirm`),

  // 승인
  approve: (poNo: string) =>
    api.post<void>(`/purchase-orders/${poNo}/approve`),

  // 반려
  reject: (poNo: string, rejectReason: string) =>
    api.post<void>(`/purchase-orders/${poNo}/reject`, { rejectReason }),

  // 발주 전송
  send: (poNo: string) =>
    api.post<void>(`/purchase-orders/${poNo}/send`),

  // 종결
  close: (poNo: string) =>
    api.post<void>(`/purchase-orders/${poNo}/close`),
};