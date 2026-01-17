package com.company.erp.rfq.buyer.waiting.service;

import com.company.erp.rfq.buyer.waiting.dto.request.RfqWaitingSearchRequest;
import com.company.erp.rfq.buyer.waiting.dto.response.PrGroup;
import com.company.erp.rfq.buyer.waiting.dto.response.PrHeaderRow;
import com.company.erp.rfq.buyer.waiting.dto.response.PrItemRow;
import com.company.erp.rfq.buyer.waiting.mapper.RfqBuyerWaitingMapper;
import com.company.erp.rfq.workflow.RfqWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 견적대기목록 서비스
 */
@Service
@RequiredArgsConstructor
public class RfqBuyerWaitingService {

    private final RfqBuyerWaitingMapper mapper;
    private final RfqWorkflowService rfqWorkflowService;

    /**
     * 견적대기목록 조회 (PR 그룹 + items)
     */
    public List<PrGroup> getWaitingList(RfqWaitingSearchRequest request) {

        // 1. PR 헤더 목록 조회
        List<PrHeaderRow> headers = mapper.selectPrHeaders(request);

        if (headers.isEmpty()) {
            return List.of();
        }

        // 2. PR 번호 추출
        List<String> prNums = headers.stream()
                .map(PrHeaderRow::getPrNum)
                .collect(Collectors.toList());

        // 빈 리스트 방어
        if (prNums.isEmpty()) {
            return headers.stream()
                    .map(header -> {
                        PrGroup group = new PrGroup();
                        group.setPrNum(header.getPrNum());
                        group.setPrSubject(header.getPrSubject());
                        group.setPrDate(header.getPrDate());
                        group.setRequester(header.getRequester());
                        group.setReqDeptNm(header.getReqDeptNm());
                        group.setProgressCd(header.getProgressCd());
                        group.setProgressNm(header.getProgressNm());
                        group.setPcType(header.getPcType());
                        group.setPcTypeNm(header.getPcTypeNm());
                        group.setItemCount(header.getItemCount());
                        group.setTotalAmount(header.getTotalAmount());
                        group.setItems(List.of()); // 빈 item 리스트
                        return group;
                    })
                    .collect(Collectors.toList());
        }

        // 3. PR 품목 목록 조회
        List<PrItemRow> items = mapper.selectPrItems(prNums);

        // 4. prNum 기준으로 그룹핑
        Map<String, List<PrItemRow>> itemMap = items.stream()
                .collect(Collectors.groupingBy(PrItemRow::getPrNum));

        // 5. PrGroup 조립
        return headers.stream()
                .map(header -> {
                    PrGroup group = new PrGroup();
                    group.setPrNum(header.getPrNum());
                    group.setPrSubject(header.getPrSubject());
                    group.setPrDate(header.getPrDate());
                    group.setRequester(header.getRequester());
                    group.setReqDeptNm(header.getReqDeptNm());
                    group.setProgressCd(header.getProgressCd());
                    group.setProgressNm(header.getProgressNm());
                    group.setPcType(header.getPcType());
                    group.setPcTypeNm(header.getPcTypeNm());
                    group.setItemCount(header.getItemCount());
                    group.setTotalAmount(header.getTotalAmount());
                    group.setItems(itemMap.getOrDefault(header.getPrNum(), List.of()));
                    return group;
                })
                .collect(Collectors.toList());
    }

}
