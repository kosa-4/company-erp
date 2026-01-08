package com.company.erp.inventory.enums;


public final class GrStatusCode {
    
    public static final String GRN = "GRN";  // 미입고
    public static final String GRP = "GRP";  // 부분입고
    public static final String GRE = "GRE";  // 입고완료
    
    private GrStatusCode() {
        throw new AssertionError("상수 클래스는 인스턴스화할 수 없습니다");
    }
    
   
     
    /**
     * 기본 상태값 반환
     * 입고 등록 시 기본값으로 사용
     */
    public static String getDefault() {
        return GRP;
    }
    
    /**
     * 유효한 상태 코드인지 검증
     * 
     * @param code 상태 코드
     * @return 유효 여부
     */
    public static boolean isValid(String code) {
        return GRN.equals(code) || GRP.equals(code) || GRE.equals(code);
    }
    

    /**
     * 입고 완료 가능 여부 확인
     * 발주수량 대비 누적 입고수량이 충분한지 확인
     * 
     * @param orderQuantity 발주수량
     * @param receivedQuantity 누적 입고수량
     * @return 완료 가능 여부
     */
    public static boolean canComplete(int orderQuantity, int receivedQuantity) {
        return receivedQuantity >= orderQuantity;
    }
}