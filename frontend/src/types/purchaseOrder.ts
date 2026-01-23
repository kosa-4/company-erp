// PurchaseOrderItemDTO를 먼저 정의
export interface PurchaseOrderItemDTO {
    poNo?: string;
    itemCode: string;
    itemName: string;
    specification?: string;
    unit: string;
    orderQuantity: number;
    unitPrice: number;
    amount: number;
    deliveryDate?: string;
    paymentTerms?: string;
    storageLocation?: string;
    remark?: string;
    vendorCode?: string;
    vendorName?: string;
    receivedQuantity?: number;
  }
  
  // PurchaseOrderDTO는 나중에 정의 (PurchaseOrderItemDTO 참조)
  export interface PurchaseOrderDTO {
    poNo?: string;
    poName: string;
    poDate?: string;
    totalAmount?: number;
    status?: string;
    approvalStatus?: string;
    purchaseManager?: string;
    vendorCode: string;
    vendorName?: string;
    prNo?: string;
    rfqNo?: string;
    purchaseType: string;
    remark?: string;
    items: PurchaseOrderItemDTO[];
    receivedQuantity?: number;
    checkFlag?: string;
  }