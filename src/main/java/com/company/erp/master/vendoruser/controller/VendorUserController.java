package com.company.erp.master.vendoruser.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.dto.VendorUserUpdateDto;
import com.company.erp.master.vendoruser.service.VendorUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("api/v1/vendor-users")
public class VendorUserController {
    @Autowired
    VendorUserService vendorUserService;

    /* 조회 */
    @GetMapping
    public ResponseEntity<?> getVendorUserList(@ModelAttribute VendorUserSearchDto vendorUserSearchDto) {
        List<VendorUserListDto> vendorUsers = vendorUserService.getVendorUserList(vendorUserSearchDto);
        System.out.println("vendorUsers "+ vendorUsers);
        if(vendorUsers == null || vendorUsers.isEmpty()) {
            return ResponseEntity.ok("검색 결과가 없습니다");
        }
        return ResponseEntity.ok(vendorUsers);
    }

    /* 저장 */
    // 1. 협력 업체 사용자 승인
    @PostMapping("/approve")
    public ApiResponse approveVendorUser(@RequestBody List<VendorUserRegisterDto> vendorUserRegisterDtoList, HttpSession session) {
        // 1) 세션 정보 조회
        String sessionId = session.getId();

        // 2) 승인 함수 실행
        vendorUserService.approveVendorUser(vendorUserRegisterDtoList, sessionId);
        return ApiResponse.ok("사용자 승인이 완료되었습니다.");
    }

    // 2. 구매사에서 반려
    @PostMapping("/reject")
    public ApiResponse rejectVendorUser(
            @RequestBody List<VendorUserUpdateDto> vendorUserUpdateDtoList,
            HttpSession session
    ) {
        // 1) 객체 통쨰로 반환
        Object sessionAttr = session.getAttribute(SessionUser.class.getName());
        if(!(sessionAttr instanceof SessionUser)){
            return ApiResponse.fail("세션이 만료되었습니다.");
        }
        SessionUser userObj = (SessionUser) sessionAttr;

        // 여기서 .getUserId() 같은 메서드를 써야 진짜 아이디가 나옵니다!
        String userId = userObj.getUserId();
//        System.out.println("진짜 사용자 아이디: " + userId);

        // 이제 이 realId를 서비스에 넘기세요.
        vendorUserService.rejectVendorUser(vendorUserUpdateDtoList, userId);

        return ApiResponse.ok("반려 처리 되었습니다.");
        
    }
}
