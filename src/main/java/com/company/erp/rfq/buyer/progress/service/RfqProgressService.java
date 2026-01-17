package com.company.erp.rfq.buyer.progress.service;

import com.company.erp.rfq.buyer.progress.dto.request.RfqProgressSearchRequest;
import com.company.erp.rfq.buyer.progress.dto.response.RfqProgressGroupResponse;
import com.company.erp.rfq.buyer.progress.mapper.RfqProgressMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RfqProgressService {

    private final RfqProgressMapper mapper;

    /**
     * 견적 진행 현황 목록 조회
     */
    @Transactional(readOnly = true)
    public List<RfqProgressGroupResponse> getProgressList(RfqProgressSearchRequest request) {
        List<RfqProgressGroupResponse> list = mapper.selectRfqProgressList(request);

        // 명칭 보정 정책 (T -> 요청 전, RFQS -> 발송, RFQT/RFQC -> 접수 가능성 고려)
        list.forEach(rfq -> {
            if (rfq.getVendors() != null) {
                rfq.getVendors().forEach(v -> {
                    if ("T".equals(v.getProgressCd()))
                        v.setProgressNm("요청 전");
                    else if ("RFQS".equals(v.getProgressCd()))
                        v.setProgressNm("발송");
                });
            }
        });

        return list;
    }

    /**
     * 협력사 전송 (T -> RFQS)
     */
    @Transactional
    public void sendRfq(String rfqNum, List<String> vendorCodes, String userId) {
        if (vendorCodes == null || vendorCodes.isEmpty()) {
            throw new IllegalArgumentException("전송할 협력사가 없습니다.");
        }

        // 현재 DB의 협력사 리스트와 요청 리스트 정합성 체크
        List<String> dbVendors = mapper.selectRfqVendorCodes(rfqNum).stream().sorted().collect(Collectors.toList());
        List<String> reqVendors = vendorCodes.stream().distinct().sorted().collect(Collectors.toList());

        if (!dbVendors.equals(reqVendors)) {
            throw new IllegalStateException("전송 대상 협력사 정보가 변경되었습니다. 새로고침 후 다시 시도하세요.");
        }

        // 헤더 상태 변경 (T -> RFQS)
        int hdUpdated = mapper.updateRfqStatus(rfqNum, "RFQS", userId);
        if (hdUpdated != 1) {
            throw new IllegalStateException("전송 가능한 상태(임시저장)가 아니거나 권한이 없습니다.");
        }

        // 모든 협력사 상태 변경
        mapper.updateAllVendorStatus(rfqNum, "RFQS", userId);
    }

    /**
     * 견적 마감 (RFQS/RFQC -> M)
     */
    @Transactional
    public void closeRfq(String rfqNum, String userId) {
        int updated = mapper.updateRfqStatus(rfqNum, "M", userId);
        if (updated != 1) {
            throw new IllegalStateException("마감 가능한 상태(발송/진행)가 아니거나 권한이 없습니다.");
        }
    }

}
