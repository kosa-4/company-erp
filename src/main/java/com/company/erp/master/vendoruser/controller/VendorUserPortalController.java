package com.company.erp.master.vendoruser.controller;

import com.company.erp.common.auth.RequireRole;
import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.service.VendorUserPortalService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("/api/v1/vendor-portal/users")
public class VendorUserPortalController {
    @Autowired
    VendorUserPortalService vendorUserPortalService;

    /* 협력 업체 사용자 조회 */
    @GetMapping
    public ResponseEntity<List<VendorUserListDto>> getVendorUserList(
            VendorUserSearchDto vendorUserSearchDto,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
//        // 1) 현재 로그인 정보 반환
//        Object sessionAttr = currentSession.getAttribute(SessionConst.LOGIN_USER);
//        SessionUser loginUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;
//
//        // 2) 로그인 정보 확인
//        if (loginUser == null) {
//            // userObj가 null인 경우 예외를 던지거나 401 에러 반환
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
//        } 오류 확인 후 삭제

        // 3) id 반환
        String loginId = loginUser.getUserId();

        List<VendorUserListDto> vendorUsers = vendorUserPortalService.getVendorUserListByVendorCode(vendorUserSearchDto, loginId);
        if(vendorUsers == null || vendorUsers.isEmpty()){
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok().body(vendorUsers);

    }

    /* 협력 업체 사용자 추가 */
    @PostMapping("/add")
    public ApiResponse addVendorUser(@Valid @RequestBody VendorUserRegisterDto vendorUserRegisterDto, HttpSession currentSession) {
        // 1) 현재 로그인 정보 반환
        Object sessionAttr = currentSession.getAttribute(SessionConst.LOGIN_USER);
        SessionUser loginUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;

        // 2) 로그인 정보 확인
        if (loginUser == null) {
            // userObj가 null인 경우 예외를 던지거나 401 에러 반환
            return ApiResponse.fail("로그인 정보가 없습니다.");
        }

        // 3) id 반환
        String loginId = loginUser.getUserId();
        vendorUserPortalService.addVendorUser(vendorUserRegisterDto, loginId);
        return ApiResponse.ok("사용자 승인 요청이 완료 되었습니다.");
    }

    /* 협력 업체 사용자 수정 */
    @PutMapping("/update")
    public ApiResponse updateVendorUser(
            @Valid @RequestBody VendorUserRegisterDto vendorUserRegisterDto,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
        vendorUserPortalService.updateVendorUser(vendorUserRegisterDto, loginUser);
        return ApiResponse.ok("사용자 수정 요청이 완료 되었습니다.");
    }

    /* 협력 업체 사용자 삭제 */
    @RequireRole({"VENDOR"})
    @DeleteMapping("/delete")
    public ApiResponse deleteVendorUser(
            @RequestBody VendorUserRegisterDto vendorUserRegisterDto,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
        vendorUserPortalService.deleteVendorUser(vendorUserRegisterDto, loginUser);
        return ApiResponse.ok("사용자 삭제 요청이 완료 되었습니다.");
    }

}
