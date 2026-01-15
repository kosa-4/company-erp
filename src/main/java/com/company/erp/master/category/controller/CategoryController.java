package com.company.erp.master.category.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.dto.CategoryListDto;
import com.company.erp.master.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:3000")
@SessionIgnore
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    @Autowired
    CategoryService categoryService;
    /* 전체 카테고리 조회 */
    @GetMapping("/all")
    public ResponseEntity<List<CategoryListDto>> getAllCategories() {
        try{
            List<CategoryListDto> categories = categoryService.getAllCategories();
            return ResponseEntity.ok().body(categories);
        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /* 선택한 대상의 자식 카테고리 조회 */
    @GetMapping
    public ResponseEntity<List<CategoryListDto>> getCategoryList(@ModelAttribute CategoryListDto  categoryListDto) {
        try{
            List<CategoryListDto> classes = categoryService.getCategoryList(categoryListDto);
            return ResponseEntity.ok().body(classes);
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /* 단일 카테고리 조회 */
    @GetMapping("/{itemCls}")
    public ResponseEntity<CategoryListDto> getCategoryByCode(@PathVariable("itemCls") String itemCls) {
        try{
            CategoryListDto category = categoryService.getCategoryByCode(itemCls);
            return ResponseEntity.ok().body(category);
        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /* 카테고리 저장 */
    @PostMapping("/new")
    public ResponseEntity<String> registerCategory(@RequestBody List<CategoryListDto> categoryListDto){
        try{
            categoryService.registerCategory(categoryListDto);
            return ResponseEntity.ok().body("카테고리 등록이 완료되었습니다.");
        } catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // delete
    @DeleteMapping("/{itemCls}")
    public ApiResponse deleteCategory(@PathVariable("itemCls") String itemCls) {
        categoryService.deleteCategory(itemCls);
        return ApiResponse.ok("카테고리가 삭제되었습니다.");
    }

}
