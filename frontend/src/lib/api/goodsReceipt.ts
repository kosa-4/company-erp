import api from './client';

// 입고 DTO 타입
export interface GoodsReceiptDTO {
  grNo?: string;
  poNo?: string;
  grDate?: string;
  totalAmount?: number;
  status?: string;
  remark?: string;
  vendorName?: string;
  ctrlUserName?: string;
  items?: GoodsReceiptItemDTO[];
}

export interface GoodsReceiptItemDTO {
  grNo?: string;
  itemCode?: string;
  itemDesc?: string;
  itemSpec?: string;
  unitCode?: string;
  grQuantity?: number;
  grAmount?: number;
  vendorCode?: string;
  vendorName?: string;
  ctrlUserId?: string;
  warehouseCode?: string;
  grDate?: string;
  remark?: string;
  statusCode?: string;
  cancelRemark?: string;
  unitPrice?: number;
  orderQty?: number;
  orderAmount?: number;
  accumulatedQty?: number;
}

// 입고대상(PO) 조회용 타입 (PurchaseOrderDTO 축소형)
export interface PendingPODTO {
  poNo?: string;
  poName?: string;
  poDate?: string;
  ctrlUserName?: string;
  vendorName?: string;
  vendorCode?: string;
  items?: Array<{
    itemCode?: string;
    itemName?: string;
    specification?: string;
    unit?: string;
    orderQuantity?: number;
    unitPrice?: number;
    amount?: number;
    storageLocation?: string;
  }>;
}

export interface GoodsReceiptListParams {
  grNo?: string;
  vendorName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface PendingPOListParams {
  poNo?: string;
  poName?: string;
  vendorName?: string;
  startDate?: string;
  endDate?: string;
}

// 백엔드 API 경로: /v1/goods-receipts (주의: /api/v1/ 형식이 아님)
// client.ts가 자동으로 /api/v1을 붙이므로 경로 조정
const GR_BASE = '/goods-receipts';

export const goodsReceiptApi = {
  // 입고대상조회: 입고 가능한 PO 목록
  getPendingPOList: (params?: PendingPOListParams) =>
    api.get<PendingPODTO[]>(`${GR_BASE}/pending`, { ...params }),

  // 입고현황 목록 조회
  getList: (params?: GoodsReceiptListParams) =>
    api.get<GoodsReceiptDTO[]>(GR_BASE, { ...params }),

  // 입고 상세 조회
  getDetail: (grNo: string) =>
    api.get<GoodsReceiptDTO>(`${GR_BASE}/${grNo}`),

  // 입고 등록
  create: (data: GoodsReceiptDTO) =>
    api.post<GoodsReceiptDTO>(GR_BASE, data),

  // 입고 품목 수정
  updateItem: (grNo: string, itemCode: string, data: GoodsReceiptItemDTO) =>
    api.put<GoodsReceiptDTO>(`${GR_BASE}/${grNo}/items/${itemCode}`, data),

  // 입고 품목 취소
  cancelItem: (grNo: string, itemCode: string, cancelRemark: string) =>
    api.post<GoodsReceiptDTO>(`${GR_BASE}/${grNo}/items/${itemCode}/cancel`, { cancelRemark }),
};
