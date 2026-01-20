package com.company.erp.master.item.controller;

import com.company.erp.common.docNum.dto.DocNumDTO;
import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.item.dto.ItemDetailDto;
import com.company.erp.master.item.dto.ItemDto;

import com.company.erp.master.item.dto.ItemResponseDto;
import com.company.erp.master.item.dto.ItemSearchDto;
import com.company.erp.master.item.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

//@CrossOrigin(origins = "http://localhost:3000")
@SessionIgnore
@RestController
@RequestMapping("/api/v1/items")
public class ItemController {
    @Autowired
    ItemService itemService;
    @Autowired
    DocNumService docNumService;

    // 품목 현황 조회 및 검색
    @GetMapping
    // ModelAttribute - get에서 사용 (url 파라미터 자동으로 mapping)
    public ResponseEntity<ItemResponseDto<ItemDetailDto>> getItemList(
            @ModelAttribute ItemSearchDto searchDto){
        try{
            // 검색 조건이 많을수록 dto가 유리
            ItemResponseDto<ItemDetailDto> items = itemService.getItemList(searchDto);

            return ResponseEntity.ok().body(items);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

//        ItemResponseDto<ItemDetailDto> items = itemService.getItemList(searchDto); => 추후 수정
//
//        return ApiResponse.ok(items);
    }

    // 상세 품목 조회
    @GetMapping("/{code}")
    public ResponseEntity<ItemDetailDto> getItemDetail(@PathVariable String code){
        try{
            ItemDetailDto item = itemService.getItemDetail(code);

            return ResponseEntity.ok().body(item);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 품목 저장
    @PostMapping("/new")
    public ApiResponse registerItem(
            @Valid @RequestBody ItemDetailDto itemDetailDto,
            @SessionAttribute(name = SessionConst.LOGIN_USER)SessionUser loginUser){
        itemService.registerItem(itemDetailDto, loginUser);
        return ApiResponse.ok("상품 등록이 완료되었습니다.");
    }

    // 품목 수정
    @PutMapping("/update")
    public ApiResponse updateItem(@RequestBody ItemDetailDto itemDetailDto){
        itemService.updateItem(itemDetailDto);
        return ApiResponse.ok("수정 완료");
    }

}
