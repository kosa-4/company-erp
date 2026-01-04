package com.company.erp.master.item.controller;

import com.company.erp.master.item.dto.ItemListDto;
import com.company.erp.master.item.dto.ItemResponseDto;
import com.company.erp.master.item.dto.ItemSearchDto;
import com.company.erp.master.item.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/master/item")
public class ItemController {
    @Autowired
    ItemService itemService;

    // 품목 현황 조회
    @GetMapping
    // 쿼리 파라미터 자동으로 mapping
    public ResponseEntity<ItemResponseDto<ItemListDto>> getItemList(@ModelAttribute ItemSearchDto searchDto){
        try{
            System.out.println(searchDto);
            ItemResponseDto<ItemListDto> items = itemService.getItemPage(searchDto);
            // 검색 조건이 많을수록 dto가 유리
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
