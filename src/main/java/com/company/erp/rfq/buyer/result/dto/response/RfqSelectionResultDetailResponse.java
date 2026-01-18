package com.company.erp.rfq.buyer.result.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RfqSelectionResultDetailResponse {
    private RfqSelectionResultResponse header;
    private List<RfqResultItem> items;
}
