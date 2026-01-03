package com.company.erp.master.item.controller;

import com.company.erp.master.item.dto.ItemListDto;
import com.company.erp.master.item.dto.ItemSearchDto;
import com.company.erp.master.item.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/master/item")
public class ItemController {
    @Autowired
    ItemService itemService;

    // 품목 현황 조회
    @GetMapping("")
    // 쿼리 파라미터 자동으로 mapping
    public ResponseEntity<List<ItemListDto>> getItemList(ItemSearchDto searchDto){
        try{
            List<ItemListDto> items = itemService.getItemList(searchDto);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
