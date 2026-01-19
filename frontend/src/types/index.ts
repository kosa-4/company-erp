// ============================================
// 공통 타입 정의
// ============================================
export * from './purchaseOrder';

// 사용자 타입
export interface User {
  id: string;
  userId: string;
  userName: string;
  userNameEn?: string;
  email: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  companyCode: string;
  companyName: string;
  departmentCode: string;
  departmentName: string;
  userType: 'ADMIN' | 'BUYER' | 'VENDOR';
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

// 페이지네이션
export interface Pagination {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// API 응답 공통
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

// 상태 타입
export type StatusType = 
  | 'TEMP'      // 임시저장
  | 'APPROVED'  // 승인
  | 'REJECTED'  // 반려

// 네비게이션 아이템
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

// 품목 타입
export interface Item {
  itemCode: string;
  itemName: string;
  itemNameEn?: string;
  itemType: string;
  categoryL?: string;
  categoryM?: string;
  categoryS?: string;
  spec?: string;
  unit: string;
  unitPrice: number;
  manufacturerCode?: string;
  manufacturerName?: string;
  modelNo?: string;
  useYn: 'Y' | 'N';
  stopReason?: string;
  remark?: string;
  createdAt: string;
  createdBy: string;
}

// 협력업체 타입
export interface Vendor {
  vendorCode: string;
  vendorName: string;
  vendorNameEn?: string;
  status: 'NEW' | 'PENDING' | 'APPROVED' | 'REJECTED';
  businessType: 'CORP' | 'INDIVIDUAL';
  businessNo: string;
  ceoName: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  phone?: string;
  fax?: string;
  email: string;
  businessCategory?: string;
  businessItem?: string;
  establishDate?: string;
  useYn: 'Y' | 'N';
  stopReason?: string;
  remark?: string;
  createdAt: string;
  createdBy: string;
}

// 구매요청 헤더
export interface PurchaseRequestHeader {
  prNo: string;
  prName: string;
  requesterId: string;
  requesterName: string;
  departmentCode: string;
  departmentName: string;
  requestDate: string;
  totalAmount: number;
  purchaseType: 'GENERAL' | 'CONTRACT' | 'URGENT';
  status: StatusType;
  remark?: string;
  createdAt: string;
}

// 구매요청 상세
export interface PurchaseRequestDetail {
  prNo: string;
  lineNo: number;
  itemCode: string;
  itemName: string;
  spec?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  requestDeliveryDate: string;
  remark?: string;
}

// RFQ 헤더
export interface RfqHeader {
  rfqNo: string;
  rfqName: string;
  prNo: string;
  purchaseType: 'GENERAL' | 'CONTRACT' | 'URGENT';
  rfqType: 'PRIVATE' | 'COMPETITIVE';
  buyerId: string;
  buyerName: string;
  departmentCode: string;
  departmentName: string;
  dueDate: string;
  status: StatusType;
  remark?: string;
  createdAt: string;
}

// RFQ 상세
export interface RfqDetail {
  rfqNo: string;
  lineNo: number;
  itemCode: string;
  itemName: string;
  spec?: string;
  unit: string;
  quantity: number;
  estimatedPrice?: number;
  requestDeliveryDate: string;
  storageLocation?: string;
  vendorCode: string;
  vendorName: string;
  vendorStatus: 'SENT' | 'SUBMITTED' | 'SELECTED' | 'REJECTED';
  submittedPrice?: number;
  submittedDate?: string;
  remark?: string;
}

// PO 헤더
export interface PoHeader {
  poNo: string;
  poName: string;
  prNo: string;
  rfqNo?: string;
  purchaseType: 'GENERAL' | 'CONTRACT' | 'URGENT';
  buyerId: string;
  buyerName: string;
  vendorCode: string;
  vendorName: string;
  poDate: string;
  totalAmount: number;
  progressStatus: 'SAVED' | 'CONFIRMED' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'DELIVERED' | 'CLOSED';
  approvalStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  remark?: string;
  createdAt: string;
}

// PO 상세
export interface PoDetail {
  poNo: string;
  lineNo: number;
  vendorCode: string;
  vendorName: string;
  itemCode: string;
  itemName: string;
  spec?: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  amount: number;
  deliveryDate: string;
  paymentTerms?: string;
  storageLocation?: string;
  remark?: string;
}

// 입고 헤더
export interface GrHeader {
  grNo: string;
  poNo: string;
  documentDate: string;
  postingDate: string;
  totalAmount: number;
  status: 'PARTIAL' | 'COMPLETE' | 'CANCELED';
  remark?: string;
  createdAt: string;
  createdBy: string;
}

// 입고 상세
export interface GrDetail {
  grNo: string;
  lineNo: number;
  poNo: string;
  poLineNo: number;
  itemCode: string;
  itemName: string;
  spec?: string;
  unit: string;
  unitPrice: number;
  orderQuantity: number;
  receivedQuantity: number;
  cumulativeQuantity: number;
  orderAmount: number;
  receivedAmount: number;
  vendorCode: string;
  vendorName: string;
  receiverId?: string;
  receiverName?: string;
  storageLocation?: string;
  receivedDateTime: string;
  status: 'NORMAL' | 'CANCELED';
  remark?: string;
}

// 공지사항
export interface Notice {
  noticeNo: string;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  modDate?: string;
  viewCnt?: number;
}

// 테이블 컬럼 정의
export interface ColumnDef<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

