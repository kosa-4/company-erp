package com.company.erp.common.signup.mapper;

import com.company.erp.common.signup.dto.SignUpDto;
import org.apache.ibatis.annotations.Param;


public interface SignUpMapper {
    // 1. 요청 번호 유효성 검사
    // param으로 전달 시
    // (DTO 의존성을 제거하여, 다른 기능에서도 재사용 가능하도록 개별 파라미터로 수신 (결합도 느슨))
    int countVNCHByAskNumAndVendorCode(@Param("askNum") String askNum,
                                       @Param("vendorCode") String vendorCode);

}
