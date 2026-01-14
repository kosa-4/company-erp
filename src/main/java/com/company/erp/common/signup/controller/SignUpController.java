package com.company.erp.common.signup.controller;

import com.company.erp.common.signup.dto.UserDto;
import com.company.erp.common.signup.service.SignUpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor // 불변성 보장
public class SignUpController {
    
    private final SignUpService signUpService;

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserDto userDto){
        // global exception이 있으므로 try-catch 사용 안해도 됨
        signUpService.registerUser(userDto);
        return ResponseEntity.ok("success");
    }

}
