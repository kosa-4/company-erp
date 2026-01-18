package com.company.erp.rfq.vendor.management.service;

import com.company.erp.rfq.vendor.management.dto.request.VendorRfqSearchRequest;
import com.company.erp.rfq.vendor.management.dto.response.VendorRfqDetailResponse;
import com.company.erp.rfq.vendor.management.dto.response.VendorRfqListResponse;
import com.company.erp.rfq.vendor.management.mapper.RfqVendorManagementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 협력사 견적관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RfqVendorManagementService {

    private final RfqVendorManagementMapper mapper;

    /**
     * 협력사별 RFQ 목록 조회
     */
    public List<VendorRfqListResponse> getVendorRfqList(String vendorCd, VendorRfqSearchRequest search) {
        return mapper.selectVendorRfqList(vendorCd, search);
    }

    /**
     * 협력사별 RFQ 상세 조회
     */
    public VendorRfqDetailResponse getVendorRfqDetail(String rfqNum, String vendorCd) {
        // 헤더 조회
        VendorRfqDetailResponse detail = mapper.selectVendorRfqDetail(rfqNum, vendorCd);
        if (detail == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        // 품목 목록 조회
        List<VendorRfqDetailResponse.RfqItemInfo> items = mapper.selectVendorRfqItems(rfqNum);
        detail.setItems(items);

        return detail;
    }

    /**
     * RFQ 접수 (RFQS → RFQJ)
     */
    @Transactional
    public void acceptRfq(String rfqNum, String vendorCd, String userId) {
        // 현재 상태 확인
        Map<String, Object> vnStatus = mapper.selectRfqVnStatus(rfqNum, vendorCd);
        if (vnStatus == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        String currentStatus = (String) vnStatus.get("progressCd");

        // 상태 검증: RFQS 상태만 접수 가능
        if (!"RFQS".equals(currentStatus)) {
            throw new IllegalStateException("요청 상태의 견적만 접수할 수 있습니다. 현재 상태: " + currentStatus);
        }

        // RFQ 전체 상태 확인 (마감/개찰/선정 완료된 경우 접수 불가)
        String rfqHdStatus = mapper.selectRfqHdStatus(rfqNum);
        if ("M".equals(rfqHdStatus) || "G".equals(rfqHdStatus) || "J".equals(rfqHdStatus)) {
            throw new IllegalStateException("이미 마감되거나 처리 완료된 견적입니다.");
        }

        // 상태 업데이트: RFQS → RFQJ
        int updated = mapper.updateRfqVnStatus(rfqNum, vendorCd, "RFQJ", userId);
        if (updated == 0) {
            throw new IllegalStateException("견적 접수에 실패했습니다.");
        }
    }

    /**
     * RFQ 포기 (RFQS/RFQJ/RFQT → F)
     */
    @Transactional
    public void rejectRfq(String rfqNum, String vendorCd, String userId) {
        // 현재 상태 확인
        Map<String, Object> vnStatus = mapper.selectRfqVnStatus(rfqNum, vendorCd);
        if (vnStatus == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        String currentStatus = (String) vnStatus.get("progressCd");

        // 상태 검증: RFQC(제출완료), F(이미 포기) 상태에서는 포기 불가
        if ("RFQC".equals(currentStatus)) {
            throw new IllegalStateException("이미 제출된 견적은 포기할 수 없습니다.");
        }
        if ("F".equals(currentStatus)) {
            throw new IllegalStateException("이미 포기한 견적입니다.");
        }

        // 상태 업데이트: → F
        int updated = mapper.updateRfqVnStatus(rfqNum, vendorCd, "F", userId);
        if (updated == 0) {
            throw new IllegalStateException("견적 포기에 실패했습니다.");
        }
    }
}
