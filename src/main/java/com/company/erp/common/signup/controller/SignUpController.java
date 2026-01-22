package com.company.erp.common.signup.controller;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.common.signup.dto.SignUpDto;
import com.company.erp.common.signup.service.SignUpService;
import com.company.erp.master.vendoruser.service.VendorUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor // 불변성 보장
public class SignUpController {

    @Autowired
    private final SignUpService signUpService;

    @Autowired
    private DocNumService docNumService;

    @Autowired
    private VendorUserService vendorUserService;

    @Autowired
    FileService fileService;

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@Valid @RequestBody SignUpDto signUpDto){
        // global exception이 있으므로 try-catch 사용 안해도 됨
        String vendorCode = signUpService.registerVendorWithManager(signUpDto);
        return ResponseEntity.ok(vendorCode);
    }
    // 4. 첨부 파일 저장
    @PostMapping("/signup/files/{vendorCode}")
    public ApiResponse registerFile(
            @PathVariable("vendorCode") String vendorCode,
            @RequestPart("file") List<MultipartFile> files) {

        if (files != null && !files.isEmpty()) {

            for (MultipartFile file : files) {
                String file_num = docNumService.generateDocNumStr(DocKey.FL);
                fileService.upload(file, "OV", file_num, vendorCode, null);
            }
        }

        return ApiResponse.ok(null);
    }

}
