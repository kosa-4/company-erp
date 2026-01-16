package com.company.erp.rfq.buyer.request.service;

import com.company.erp.rfq.buyer.request.dto.request.RfqSaveRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSelectRequest;
import com.company.erp.rfq.buyer.request.dto.response.RfqDetailResponse;
import com.company.erp.rfq.buyer.request.mapper.RfqBuyerRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * RFQ 관리(구매사) 서비스
 */
@Service
@RequiredArgsConstructor
public class RfqBuyerRequestService {

    private final RfqBuyerRequestMapper mapper;

    /**
     * RFQ 상세 조회 및 상태 명칭 매핑
     * - [피드백 보완] DTO 및 NPE 방어 기반 코드 매핑
     */
    @Transactional(readOnly = true)
    public RfqDetailResponse getRfqDetail(String rfqNum) {
        RfqDetailResponse response = new RfqDetailResponse();

        RfqDetailResponse.Header header = mapper.selectRfqHeader(rfqNum);
        if (header == null) {
            throw new IllegalArgumentException("존재하지 않거나 삭제된 견적입니다. 번호: " + rfqNum);
        }
        response.setHeader(header);
        response.setItems(mapper.selectRfqItems(rfqNum));

        List<RfqDetailResponse.Vendor> vendors = mapper.selectRfqVendors(rfqNum);

        // [복구] 프로젝트 일관성을 위해 Map 기반 공통 코드 조회 및 매핑
        List<Map<String, Object>> codes = mapper.selectCodeNames("PROGRESS_CD");
        Map<String, String> statusMap = codes.stream()
                .collect(Collectors.toMap(
                        c -> String.valueOf(c.get("code")),
                        c -> String.valueOf(c.get("codeName")),
                        (existing, replacement) -> existing));

        // 정책: 구매사 화면에서 RFQT는 '접수'로 고정 (Override)
        statusMap.put("RFQT", "접수");

        vendors.forEach(v -> {
            v.setProgressNm(statusMap.getOrDefault(v.getProgressCd(), v.getProgressCd()));
        });
        response.setVendors(vendors);

        return response;
    }

    /**
     * RFQ 저장 (임시저장 단계)
     * - [피드백 보완] LINE_NO 중복/Null 검증 및 PRDT 기반 필수 항목 보존
     */
    @Transactional
    public void saveRfq(RfqSaveRequest request, String userId) {
        String rfqNum = request.getRfqNum();

        // [피드백 반영] 서비스 레이어 단독 호출 시 대비용 rfqNum 필수 체크
        if (rfqNum == null || rfqNum.isBlank()) {
            throw new IllegalArgumentException("견적 번호(rfqNum)가 없습니다.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("저장할 품목이 하나 이상 있어야 합니다.");
        }

        // [피드백 반영] LINE_NO 중복 및 Null 검증 (가독성 및 견고함 강화)
        if (request.getItems().stream().anyMatch(i -> i.getLineNo() == null)) {
            throw new IllegalArgumentException("모든 품목에는 라인번호(LINE_NO)가 있어야 합니다.");
        }

        Set<Integer> lineNos = request.getItems().stream()
                .map(RfqSaveRequest.RfqItemDTO::getLineNo)
                .collect(Collectors.toSet());

        if (lineNos.size() != request.getItems().size()) {
            throw new IllegalArgumentException("품목 라인번호(LINE_NO)가 중복되었습니다.");
        }

        RfqDetailResponse.Header currentHeader = mapper.selectRfqHeader(rfqNum);
        if (currentHeader == null)
            throw new IllegalArgumentException("대상 견적이 없습니다.");
        if (!"T".equals(currentHeader.getProgressCd()))
            throw new IllegalStateException("임시저장 상태에서만 수정 가능합니다.");
        if (!userId.equals(currentHeader.getCtrlUserId()))
            throw new SecurityException("작성자만 수정 가능합니다.");

        // [피드백 반영] PRDT 기반 필수 품목 보존 검증
        if (currentHeader.getPrNum() != null && !currentHeader.getPrNum().isBlank()) {
            List<Integer> mandatoryLines = mapper.selectPrItemLineNos(currentHeader.getPrNum());
            for (Integer lineNo : mandatoryLines) {
                if (!lineNos.contains(lineNo)) {
                    throw new IllegalStateException("원본 PR 품목(라인: " + lineNo + ")은 삭제할 수 없습니다.");
                }
            }
        }

        // 금액 선계산 및 사용자 세팅
        for (RfqSaveRequest.RfqItemDTO item : request.getItems()) {
            if (item.getRfqQt() != null && item.getEstUnitPrc() != null) {
                item.setEstAmt(item.getRfqQt().multiply(item.getEstUnitPrc()));
            } else {
                item.setEstAmt(BigDecimal.ZERO);
            }
        }

        int updated = mapper.updateRfqHeader(request, userId);
        if (updated != 1)
            throw new IllegalStateException("저장 중 오류가 발생했습니다. (권한 또는 상태 확인)");

        mapper.deleteRfqItems(rfqNum);
        mapper.insertRfqItems(rfqNum, request.getItems(), userId);
    }

    /**
     * 협력업체 전송
     */
    @Transactional
    public void sendRfq(String rfqNum, List<String> vendorCodes, String userId) {
        if (vendorCodes == null || vendorCodes.isEmpty()) {
            throw new IllegalArgumentException("전송할 협력사가 선택되지 않았습니다.");
        }

        // [피드백 반영] 중복 코드 필터링
        List<String> distinctVendors = vendorCodes.stream()
                .distinct()
                .collect(Collectors.toList());

        int hdUpdated = mapper.updateRfqStatusToSend(rfqNum, userId);
        if (hdUpdated != 1) {
            throw new IllegalStateException("전송 권한이 없거나 전송 가능한 상태(임시저장)가 아닙니다.");
        }

        mapper.deleteRfqVendors(rfqNum);
        int vnInserted = mapper.insertRfqVendorsOnSend(rfqNum, distinctVendors, userId);

        if (vnInserted != distinctVendors.size()) {
            throw new IllegalStateException("일부 협력사 정보 전송에 실패했습니다.");
        }
    }

    /**
     * 업체 선정
     */
    @Transactional
    public void selectVendor(RfqSelectRequest request, String userId) {
        String rfqNum = request.getRfqNum();
        String vendorCd = request.getVendorCd();

        int hdUpdated = mapper.updateRfqStatusToSelected(rfqNum, userId);
        if (hdUpdated != 1) {
            throw new IllegalStateException("선정 권한이 없거나 개찰(G) 상태가 아닙니다.");
        }

        mapper.resetRfqVendorsSelection(rfqNum);
        int vnUpdated = mapper.updateRfqVendorSelection(rfqNum, vendorCd, userId);
        if (vnUpdated != 1) {
            throw new IllegalStateException("선정된 협력사 정보 업데이트에 실패했습니다.");
        }
    }
}
