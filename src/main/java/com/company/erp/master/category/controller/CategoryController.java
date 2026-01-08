package com.company.erp.master.category.controller;

import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/categories")
public class CategoryController {
    @Autowired
    CategoryService categoryService;

    /* class 조회 */
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getItemClassList(){
        try{
            List<CategoryDto> classes = categoryService.getItemClassList();
            return ResponseEntity.ok().body(classes);
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /* 카테고리 저장 */
    @PostMapping("/new")
    public ResponseEntity<String> registerCategory(@RequestBody List<CategoryDto> categoryDto){
        try{
//            System.out.println("response: " + categoryDto.getI);
            categoryService.registerCategory(categoryDto);
            return ResponseEntity.ok().body("카테고리 등록이 완료되었습니다.");
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
