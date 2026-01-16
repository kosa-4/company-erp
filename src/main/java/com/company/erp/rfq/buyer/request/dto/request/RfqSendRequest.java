package com.company.erp.rfq.buyer.request.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * RFQ 전송 요청 DTO
 */
@Getter
@Setter
public class RfqSendRequest {
    private List<String> vendorCodes;
}
