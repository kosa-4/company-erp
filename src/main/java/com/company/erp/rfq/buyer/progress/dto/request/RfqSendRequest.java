package com.company.erp.rfq.buyer.progress.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RfqSendRequest {
    @NotEmpty(message = "전송할 협력사가 하나 이상 선택되어야 합니다.")
    private List<String> vendorCodes;
}
