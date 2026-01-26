package com.company.erp.rfq.buyer.request.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.rfq.buyer.request.dto.request.RfqSaveRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSendRequest;
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
    private final DocNumService docNumService;

    /**
     * [신규] PR 기반 견적 초안 초기 데이터 조회
     */
    @Transactional(readOnly = true)
    public RfqDetailResponse getRfqInitFromPr(String prNum, String userId) {
        RfqDetailResponse response = new RfqDetailResponse();

        RfqDetailResponse.Header header = mapper.selectRfqInitHeader(prNum, userId);
        if (header == null) {
            throw new IllegalArgumentException("존재하지 않거나 승인되지 않은 구매요청입니다. 번호: " + prNum);
        }
        response.setHeader(header);
        response.setItems(mapper.selectRfqInitItems(prNum));
        // 초기 단계에서는 벤더 없음
        response.setVendors(java.util.Collections.emptyList());
        return response;
    }

    /**
     * [신규] RFQ 최초 생성
     */
    @Transactional
    public String createRfq(RfqSaveRequest request, String userId) {
        // 1. 필수 파라미터 검증
        if (request.getPrNum() == null || request.getPrNum().isBlank()) {
            throw new IllegalArgumentException("PR 번호는 필수입니다.");
        }
        if (request.getPcType() == null || request.getPcType().isBlank()) {
            throw new IllegalArgumentException("구매유형은 필수입니다.");
        }
        // 2. 번호 채번
        String rfqNum = docNumService.generateDocNumStr(DocKey.RQ);
        request.setRfqNum(rfqNum);

        // 3. HD 저장
        mapper.insertRfqHeader(request, request.getPrNum(), request.getPcType(), userId);

        // 3. DT/VN 저장
        saveRfqSubData(request, userId);

        return rfqNum;
    }

    /**
     * RFQ 상세 조회 및 상태 명칭 매핑
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

        // 정책: 구매사 화면에서 전송 전 상태(T)는 '요청 전', RFQS는 '발송', RFQT는 '접수'로 고정 (Override)
        statusMap.put("T", "요청 전");
        statusMap.put("RFQS", "발송");
        statusMap.put("RFQT", "접수");

        vendors.forEach(v -> {
            v.setProgressNm(statusMap.getOrDefault(v.getProgressCd(), v.getProgressCd()));
        });
        response.setVendors(vendors);

        return response;
    }

    @Transactional
    public void saveRfq(RfqSaveRequest request, String userId) {
        String rfqNum = request.getRfqNum();

        // 1. 상태 및 권한 체크
        RfqDetailResponse.Header currentHeader = mapper.selectRfqHeader(rfqNum);
        if (currentHeader == null)
            throw new IllegalArgumentException("대상 견적이 없습니다.");
        if (!"T".equals(currentHeader.getProgressCd()))
            throw new IllegalStateException("임시저장 상태에서만 수정 가능합니다.");
//        if (!userId.equals(currentHeader.getCtrlUserId()))
//            throw new SecurityException("작성자만 수정 가능합니다.");

        // 2. HD 업데이트
        int updated = mapper.updateRfqHeader(request, userId);
        if (updated != 1)
            throw new IllegalStateException("저장 중 오류가 발생했습니다.");

        // 3. DT/VN 저장
        saveRfqSubData(request, userId);
    }

    /**
     * 하위 데이터(품목, 업체) 공통 저장 로직
     */
    private void saveRfqSubData(RfqSaveRequest request, String userId) {
        String rfqNum = request.getRfqNum();

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("저장할 품목이 하나 이상 있어야 합니다.");
        }

        validateRfqItems(request);

        // DT 동기화
        mapper.deleteRfqItems(rfqNum);
        mapper.insertRfqItems(rfqNum, request.getItems(), userId);

        // VN 동기화
        mapper.deleteRfqVendors(rfqNum);

        List<String> vendorCodes = request.getVendorCodes();
        if (vendorCodes != null && !vendorCodes.isEmpty()) {

            // 중복 제거 + 공백/NULL 제거
            List<String> distinctVendors = vendorCodes.stream()
                    .filter(v -> v != null && !v.isBlank())
                    .distinct()
                    .collect(Collectors.toList());

            if (!distinctVendors.isEmpty()) {
                mapper.insertRfqVendors(rfqNum, distinctVendors, userId);
            }
        }
    }

    private void validateRfqItems(RfqSaveRequest request) {
        // LINE_NO 중복 및 Null 검증
        if (request.getItems().stream().anyMatch(i -> i.getLineNo() == null)) {
            throw new IllegalArgumentException("모든 품목에는 라인번호가 있어야 합니다.");
        }
        Set<Integer> lineNos = request.getItems().stream()
                .map(RfqSaveRequest.RfqItemDTO::getLineNo)
                .collect(Collectors.toSet());
        if (lineNos.size() != request.getItems().size()) {
            throw new IllegalArgumentException("품목 라인번호가 중복되었습니다.");
        }

        // 금액 선계산
        for (RfqSaveRequest.RfqItemDTO item : request.getItems()) {
            if (item.getRfqQt() != null && item.getEstUnitPrc() != null) {
                item.setEstAmt(item.getRfqQt().multiply(item.getEstUnitPrc()));
            } else {
                item.setEstAmt(BigDecimal.ZERO);
            }
        }
    }

    /**
     * 협력업체 전송
     */
    @Transactional
    public void sendRfq(String rfqNum, List<String> vendorCodes, String userId) {
        if (vendorCodes == null || vendorCodes.isEmpty()) {
            throw new IllegalArgumentException("전송할 협력사가 선택되지 않았습니다.");
        }

        List<String> reqVendors = vendorCodes.stream()
                .filter(v -> v != null && !v.isBlank())
                .distinct()
                .sorted()
                .toList();

        // DB에 저장된 VN 목록 조회 (T 상태에서 구성된 “현재 협력사 리스트”)
        List<String> dbVendors = mapper.selectRfqVendorCodes(rfqNum).stream()
                .sorted()
                .toList();

        if (!reqVendors.equals(dbVendors)) {
            throw new IllegalStateException("전송 대상 협력사 목록이 현재 RFQ 협력사 목록과 일치하지 않습니다. 새로고침 후 다시 시도해주세요.");
        }

        int hdUpdated = mapper.updateRfqStatusToSend(rfqNum, userId);
        if (hdUpdated != 1) {
            throw new IllegalStateException("전송 가능한 상태(임시저장)가 아닙니다.");
        }

        // RFQ_NUM 전체 업데이트 (정책 A)
        int vnUpdated = mapper.updateRfqVendorsStatusToSend(rfqNum, userId);
        if (vnUpdated == 0) {
            throw new IllegalStateException("전송할 협력사 정보가 없거나 전송에 실패했습니다.");
        }
    }

    /**
     * 견적 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteRfq(String rfqNum, String userId) {
        int updated = mapper.deleteRfq(rfqNum, userId);
        if (updated != 1) {
            throw new IllegalStateException("삭제가 불가능한 상태(임시저장만 가능)이거나 권한이 없습니다.");
        }
    }
}
