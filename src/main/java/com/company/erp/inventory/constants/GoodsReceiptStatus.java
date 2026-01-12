package com.company.erp.inventory.constants;

public final class GoodsReceiptStatus {
    
    private GoodsReceiptStatus() {} // 인스턴스화 방지

    public static final String NOT_RECEIVED = "GRN"; //미입고
    public static final String PARTIAL = "GRP"; //부분입고
    public static final String COMPLETED = "GRE"; //입고완료
    public static final String CANCELLED = "GRX"; //입고취소
}
