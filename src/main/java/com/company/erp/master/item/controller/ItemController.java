package com.company.erp.master.item.controller;

import com.company.erp.master.item.dto.ItemDetailDto;
import com.company.erp.master.item.dto.ItemDto;

import com.company.erp.master.item.dto.ItemResponseDto;
import com.company.erp.master.item.dto.ItemSearchDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/items")
public class ItemController {
    @Autowired
    ItemService itemService;

    // 품목 현황 조회 및 검색
    @GetMapping
    // ModelAttribute - get에서 사용 (url 파라미터 자동으로 mapping)
    public ResponseEntity<ItemResponseDto<ItemDetailDto>> getItemList(@ModelAttribute ItemSearchDto searchDto){
        try{
//            System.out.println(searchDto);
            // 검색 조건이 많을수록 dto가 유리
            ItemResponseDto<ItemDetailDto> items = itemService.getItemList(searchDto);

            return ResponseEntity.ok().body(items);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 상세 품목 조회
    @GetMapping("/{code}")
    public ResponseEntity<ItemDto> getItemDetail(@PathVariable String code){
        try{
            ItemDto item = itemService.getItemDetail(code);

            return ResponseEntity.ok().body(item);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 품목 등록
    @PostMapping("/new")
    public ResponseEntity<String> registerItem(@RequestBody ItemDetailDto itemDetailDto){
        try{
            itemService.registerItem(itemDetailDto);
            return ResponseEntity.ok().body("상품 등록이 완료되었습니다.");
        }
        catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }
}
